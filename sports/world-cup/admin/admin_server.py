#!/usr/bin/env python3
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
PORT = int(os.environ.get("WORLD_CUP_ADMIN_PORT", "8787"))
ADMIN_PIN = os.environ.get("WORLD_CUP_ADMIN_PIN", "2019")


def load_env_file():
    if not ENV_PATH.exists():
        return
    for raw_line in ENV_PATH.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def build_ssl_context():
    try:
      import certifi
      return ssl.create_default_context(cafile=certifi.where())
    except Exception:
      # Local-only admin tool fallback for Python installs without a configured CA store.
      return ssl._create_unverified_context()


SSL_CONTEXT = build_ssl_context()


def require_config():
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Create sports/world-cup/admin/.env from .env.example."
        )


def supabase_request(path, method="GET", body=None, prefer=None):
    require_config()
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    request = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=data,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=20, context=SSL_CONTEXT) as response:
            text = response.read().decode("utf-8")
            return json.loads(text) if text else None
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8") or str(error)
        raise RuntimeError(message) from error


def entry_path(entry_id):
    return f"pool_entries?id=eq.{urllib.parse.quote(entry_id, safe='')}"


class AdminHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Pin")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        try:
            if self.path == "/api/status":
                self.respond({"ok": True, "supabaseConfigured": bool(SUPABASE_URL and SERVICE_ROLE_KEY)})
                return
            if self.path == "/api/entries":
                self.require_pin()
                entries = supabase_request("pool_entries?select=*&order=submitted_at.desc")
                picks = supabase_request("pool_entry_picks?select=*&order=entry_id.asc,section.asc,group_letter.asc,rank.asc")
                self.respond({"entries": entries or [], "picks": picks or []})
                return
            self.respond({"error": "Not found"}, status=404)
        except Exception as error:
            self.respond_error(error)

    def do_PATCH(self):
        try:
            entry_id = self.extract_entry_id()
            if not entry_id:
                self.respond({"error": "Not found"}, status=404)
                return
            self.require_pin()
            patch = self.read_json()
            supabase_request(entry_path(entry_id), method="PATCH", body=patch, prefer="return=minimal")
            self.respond({"ok": True})
        except Exception as error:
            self.respond_error(error)

    def do_DELETE(self):
        try:
            entry_id = self.extract_entry_id()
            if not entry_id:
                self.respond({"error": "Not found"}, status=404)
                return
            self.require_pin()
            rows = supabase_request(f"{entry_path(entry_id)}&select=id,entry_code,test_entry")
            if not rows:
                self.respond({"error": "Entry not found"}, status=404)
                return
            if not rows[0].get("test_entry"):
                self.respond({"error": "Only test entries can be hard-deleted"}, status=400)
                return
            supabase_request(entry_path(entry_id), method="DELETE", prefer="return=minimal")
            self.respond({"ok": True})
        except Exception as error:
            self.respond_error(error)

    def extract_entry_id(self):
        prefix = "/api/entries/"
        if not self.path.startswith(prefix):
            return ""
        return urllib.parse.unquote(self.path[len(prefix):].split("?", 1)[0])

    def require_pin(self):
        if self.headers.get("X-Admin-Pin") == ADMIN_PIN:
            return
        raise PermissionError("Invalid or missing admin PIN")

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def respond(self, payload, status=200):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def respond_error(self, error):
        self.respond({"error": str(error)}, status=500)

    def log_message(self, format, *args):
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), format % args))


if __name__ == "__main__":
    print(f"World Cup admin server listening on http://127.0.0.1:{PORT}")
    print(f"Config file: {ENV_PATH}")
    ThreadingHTTPServer(("127.0.0.1", PORT), AdminHandler).serve_forever()
