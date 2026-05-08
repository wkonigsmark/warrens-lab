"""
scan.py — Gmail → Claude API → JSON pipeline for kids school hub.

Setup (one-time):
  1. Create a GCP project, enable Gmail API, create OAuth2 Desktop credentials.
  2. Run: python scan.py --auth
     Follow the printed URL, paste the code back, and a refresh token is printed.
  3. Store secrets in GitHub Actions (or a local .env for testing):
       GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, ANTHROPIC_API_KEY

Headless runs (CI):
  python scan.py
"""

import argparse
import base64
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

SCHOOL_SENDERS = [
    "ps234.org",
    "rsprep.com",
]

KIDS = [
    {
        "name": "Ballard",
        "grade": "1st grade",
        "school": "PS234",
        "teacher": "Ms. Molly Waterman",
        "teacher_email": "mwaterman@ps234.org",
    },
    {
        "name": "Elle",
        "grade": "Kindergarten",
        "school": "PS234",
        "teacher": "Ms. Francine Cornelius",
        "teacher_email": "fcornelius@ps234.org",
    },
    {
        "name": "Edie",
        "grade": "Preschool",
        "school": "Reade Street Prep (RSPrep)",
        "teacher": "Cindy and Estephanie",
        "teacher_email": None,
    },
]

DATA_DIR = Path(__file__).parent.parent / "data"

CLAUDE_MODEL = "claude-sonnet-4-6"

EXTRACTION_SYSTEM_PROMPT = """\
You extract structured information from school emails for a family dashboard.
The family has three children at PS234 and RSPrep:
- Ballard (1st grade, PS234, teacher Ms. Molly Waterman)
- Elle (Kindergarten, PS234, teacher Ms. Francine Cornelius)
- Edie (Preschool, RSPrep, teachers Cindy and Estephanie)

Respond ONLY with a JSON object with these three keys (arrays may be empty):
{
  "events": [
    {
      "id": "<sha1-ish unique id based on title+date>",
      "title": "...",
      "date": "YYYY-MM-DD or null",
      "time": "HH:MM or null",
      "description": "...",
      "child": "Ballard|Elle|Edie|All",
      "school": "PS234|RSPrep|All",
      "source_email_subject": "..."
    }
  ],
  "tasks": [
    {
      "id": "<unique id>",
      "title": "...",
      "due_date": "YYYY-MM-DD or null",
      "description": "...",
      "child": "Ballard|Elle|Edie|All",
      "school": "PS234|RSPrep|All",
      "completed": false,
      "source_email_subject": "..."
    }
  ],
  "curriculum": [
    {
      "id": "<unique id>",
      "topic": "...",
      "subject": "Math|Reading|Science|Social Studies|Art|Music|PE|Other",
      "description": "...",
      "child": "Ballard|Elle|Edie|All",
      "school": "PS234|RSPrep|All",
      "source_email_subject": "..."
    }
  ]
}

Rules:
- Extract ONLY concrete, actionable items. Skip generic newsletters.
- Dates must be absolute (YYYY-MM-DD). Use today's year if year is missing.
- If an item applies to multiple children at the same school, use child="All".
- Generate IDs using a short hash-like string based on title+date (e.g. "evt-a3f2").
- Return valid JSON only, no markdown fences.
"""

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------


def _creds_from_env() -> Credentials:
    """Build Credentials from env vars (headless / CI mode)."""
    required = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN"]
    missing = [v for v in required if not os.environ.get(v)]
    if missing:
        sys.exit(f"Missing env vars: {', '.join(missing)}")

    return Credentials(
        token=None,
        refresh_token=os.environ["GMAIL_REFRESH_TOKEN"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ["GMAIL_CLIENT_ID"],
        client_secret=os.environ["GMAIL_CLIENT_SECRET"],
        scopes=SCOPES,
    )


def run_auth_flow():
    """Interactive one-time OAuth flow. Prints refresh token to stdout."""
    client_id = os.environ.get("GMAIL_CLIENT_ID") or input("Client ID: ").strip()
    client_secret = os.environ.get("GMAIL_CLIENT_SECRET") or input("Client Secret: ").strip()

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
        }
    }

    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
    # run_local_server attempts to open a browser; falls back to console prompt
    creds = flow.run_local_server(port=0)

    print("\n=== OAuth complete ===")
    print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")
    print("\nStore this as a GitHub Actions secret (or in your .env file).")


# ---------------------------------------------------------------------------
# Gmail helpers
# ---------------------------------------------------------------------------


def build_gmail_service(creds: Credentials):
    return build("gmail", "v1", credentials=creds)


def _sender_domain(headers: list[dict]) -> str:
    for h in headers:
        if h["name"].lower() == "from":
            return h["value"]
    return ""


def _header(headers: list[dict], name: str) -> str:
    for h in headers:
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""


def _decode_body(data: str) -> str:
    """Base64url → utf-8 string."""
    padded = data + "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(padded).decode("utf-8", errors="replace")


def extract_text_from_parts(parts: list[dict], depth: int = 0) -> str:
    """Recursively pull text/plain from MIME parts."""
    if depth > 5:
        return ""
    text = []
    for part in parts:
        mime = part.get("mimeType", "")
        if mime == "text/plain":
            data = part.get("body", {}).get("data", "")
            if data:
                text.append(_decode_body(data))
        elif mime.startswith("multipart/"):
            text.append(extract_text_from_parts(part.get("parts", []), depth + 1))
    return "\n".join(text)


def fetch_school_emails(service, max_results: int = 50) -> list[dict]:
    """Return list of dicts: {subject, from, date, body, message_id}."""
    query_parts = [f"from:{domain}" for domain in SCHOOL_SENDERS]
    query = "(" + " OR ".join(query_parts) + ")"

    result = service.users().messages().list(
        userId="me", q=query, maxResults=max_results
    ).execute()

    messages = result.get("messages", [])
    emails = []

    for msg_ref in messages:
        msg = service.users().messages().get(
            userId="me", id=msg_ref["id"], format="full"
        ).execute()

        payload = msg.get("payload", {})
        headers = payload.get("headers", [])
        subject = _header(headers, "subject") or "(no subject)"
        sender = _header(headers, "from")
        date_str = _header(headers, "date")

        # Extract plain text body
        if payload.get("mimeType", "").startswith("multipart/"):
            body = extract_text_from_parts(payload.get("parts", []))
        else:
            body = _decode_body(payload.get("body", {}).get("data", ""))

        # Truncate very long bodies to keep Claude prompt reasonable
        if len(body) > 8000:
            body = body[:8000] + "\n[... truncated ...]"

        emails.append(
            {
                "message_id": msg_ref["id"],
                "subject": subject,
                "from": sender,
                "date": date_str,
                "body": body,
            }
        )

    print(f"Fetched {len(emails)} school emails.")
    return emails


# ---------------------------------------------------------------------------
# Claude extraction
# ---------------------------------------------------------------------------


def extract_with_claude(email: dict, client: anthropic.Anthropic) -> dict:
    """Send one email to Claude and return parsed extraction dict."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    user_content = f"""\
Today's date: {today}

Email from: {email['from']}
Date: {email['date']}
Subject: {email['subject']}

---
{email['body']}
"""

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=2048,
        system=EXTRACTION_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = response.content[0].text.strip()

    # Strip markdown code fences if Claude adds them despite instructions
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"  JSON parse error for '{email['subject']}': {e}")
        return {"events": [], "tasks": [], "curriculum": []}


EXTRACTION_PROMPT = EXTRACTION_SYSTEM_PROMPT  # alias used inside extract_with_claude


# ---------------------------------------------------------------------------
# Merge & dedup
# ---------------------------------------------------------------------------


def _normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def _item_key(item: dict) -> str:
    """Composite dedup key: normalized title + date (if present) + child."""
    title = _normalize(item.get("title") or item.get("topic") or "")
    date  = _normalize(item.get("date") or item.get("due_date") or "")
    child = _normalize(item.get("child") or "")
    return f"{title}|{date}|{child}"


def _dedup_list(items: list[dict]) -> list[dict]:
    """Remove duplicates within a single list."""
    seen: set[str] = set()
    out = []
    for item in items:
        k = _item_key(item)
        if k not in seen:
            seen.add(k)
            out.append(item)
    return out


def _dedup(existing: list[dict], new_items: list[dict]) -> tuple[list[dict], int]:
    """Merge deduped new_items into existing, skipping any already present."""
    seen = {_item_key(item) for item in existing}
    merged = list(existing)
    added = 0
    for item in _dedup_list(new_items):
        k = _item_key(item)
        if k not in seen:
            merged.append(item)
            seen.add(k)
            added += 1
    return merged, added


def load_json(path: Path) -> list:
    if path.exists():
        return json.loads(path.read_text())
    return []


def save_json(path: Path, data: list):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main(auth: bool = False):
    if auth:
        run_auth_flow()
        return

    creds = _creds_from_env()
    gmail = build_gmail_service(creds)
    claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    emails = fetch_school_emails(gmail)

    all_events: list[dict] = []
    all_tasks: list[dict] = []
    all_curriculum: list[dict] = []

    for i, email in enumerate(emails, 1):
        print(f"[{i}/{len(emails)}] Processing: {email['subject'][:60]}")
        extracted = extract_with_claude(email, claude)
        all_events.extend(extracted.get("events", []))
        all_tasks.extend(extracted.get("tasks", []))
        all_curriculum.extend(extracted.get("curriculum", []))

    # Merge with existing data (dedup by id)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    for filename, new_items in [
        ("events.json", all_events),
        ("tasks.json", all_tasks),
        ("curriculum.json", all_curriculum),
    ]:
        path = DATA_DIR / filename
        existing = load_json(path)
        merged, added = _dedup(existing, new_items)
        save_json(path, merged)
        print(f"  {filename}: +{added} new items (total {len(merged)})")

    print("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--auth",
        action="store_true",
        help="Run interactive OAuth flow to generate a refresh token",
    )
    args = parser.parse_args()
    main(auth=args.auth)
