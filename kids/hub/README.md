# Kids Hub — Architecture & User Guide

A family school dashboard that automatically extracts events, tasks, and curriculum updates from school emails and presents them in a shared, real-time web app.

**Live URL:** https://burnmarkproductions.com/kids/hub/

---

## How It Works (End to End)

```
Gmail (school emails)
    ↓  OAuth2 (headless refresh token)
scan.py
    ↓  Claude API (claude-sonnet-4-6) extracts structured JSON
Supabase (PostgreSQL)
    ↓  real-time subscription
index.html (static SPA on Netlify)
    ↑  served from burnmarkproductions.com/kids/hub/
```

**Schedule:** GitHub Actions runs `scan.py` twice daily — 7:00am and 4:00pm ET.  
**Real-time:** Any device with the page open sees mark-complete updates instantly via Supabase's postgres_changes subscription — no page reload needed.

---

## Files

```
kids/hub/
├── index.html              # The entire dashboard (single HTML file, no build step)
├── README.md               # This file
├── pipeline/
│   ├── scan.py             # Main pipeline: Gmail → Claude → Supabase
│   ├── requirements.txt    # Python dependencies
│   └── migrate.py          # One-time migration (already done, don't re-run)
└── data/                   # Legacy JSON files (no longer used)

.github/workflows/
└── kids-hub.yml            # GitHub Actions cron + manual trigger
```

---

## Secrets & Credentials

All stored as **GitHub Actions repository secrets** at:  
`github.com/wkonigsmark/warrens-lab → Settings → Secrets and variables → Actions`

| Secret | What it is |
|---|---|
| `GMAIL_CLIENT_ID` | GCP OAuth2 client ID (project: workout-app-alpha) |
| `GMAIL_CLIENT_SECRET` | GCP OAuth2 client secret |
| `GMAIL_REFRESH_TOKEN` | Long-lived refresh token (generated via `python scan.py --auth`) |
| `ANTHROPIC_API_KEY` | Anthropic Console API key |
| `SUPABASE_URL` | `https://fwchltustcyrwtslhqcr.supabase.co` |
| `SUPABASE_KEY` | Supabase **secret** key (sb_secret_...) |

The dashboard HTML also contains the **publishable** Supabase key (safe to be public):  
`sb_publishable_KPWlRz16vmG4XylKdH-7Hg_TFE-JysD`

---

## Supabase Database

**Project:** https://fwchltustcyrwtslhqcr.supabase.co  
**Table:** `items`

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | Deterministic hash: `{type[:3]}-{md5(type\|title\|date\|child)[:8]}` |
| `type` | text | `event`, `task`, `curriculum`, or `meta` |
| `title` | text | |
| `date` | date | YYYY-MM-DD |
| `time` | text | HH:MM |
| `description` | text | |
| `child` | text | `Ballard`, `Elle`, `Edie`, or `All` |
| `school` | text | `PS234`, `RSPrep`, or `All` |
| `subject` | text | For curriculum: Math, Reading, Science, etc. |
| `completed` | boolean | Never reset to false by pipeline — permanent |
| `completed_by` | text | Set to `'family'` when marked done |
| `completed_at` | timestamptz | |
| `source_email_subject` | text | |
| `raw` | jsonb | Full extracted JSON from Claude |

**Check constraint:** `type IN ('event', 'task', 'curriculum', 'meta')`

**Special row:** `id = 'meta-last-run'` (type: meta) stores the timestamp of the last successful pipeline run — shown in the dashboard header.

---

## Dashboard Features

- **Highlights bar** — top of page, shows Today / Overdue / Due Today / Tomorrow items with Done buttons
- **Child filter pills** — All / Ballard / Elle / Edie
- **Section filter pills** — All / Events / Tasks / Curriculum
- **Search** — filters across all sections live
- **Mark complete** — Done/Undo button on every item; syncs to Supabase instantly; both devices see it in real-time
- **Show completed** checkbox — completed items hidden by default (faded + strikethrough when shown)
- **Pipeline timestamp** — header shows when pipeline last ran

---

## Kids & Schools

| Child | Grade | School | Teacher |
|---|---|---|---|
| Ballard | 1st grade | PS234 | Ms. Molly Waterman (mwaterman@ps234.org) |
| Elle | Kindergarten | PS234 | Ms. Francine Cornelius (fcornelius@ps234.org) |
| Edie | Preschool | RSPrep | Cindy and Estephanie |

**School email domains watched:** `ps234.org`, `rsprep.com`

---

## Running the Pipeline Manually

**From GitHub UI (easiest):**  
Actions → Kids Hub Pipeline → Run workflow

**From terminal (for testing):**
```bash
cd ~/labs/warrens-lab-main

# Set env vars first (copy from GitHub secrets or a local .env)
export GMAIL_CLIENT_ID=...
export GMAIL_CLIENT_SECRET=...
export GMAIL_REFRESH_TOKEN=...
export ANTHROPIC_API_KEY=...
export SUPABASE_URL=https://fwchltustcyrwtslhqcr.supabase.co
export SUPABASE_KEY=sb_secret_...

pip3 install -r kids/hub/pipeline/requirements.txt
python3 kids/hub/pipeline/scan.py
```

---

## Re-generating the Gmail Refresh Token

The refresh token rarely expires, but if it does:

```bash
export GMAIL_CLIENT_ID=...
export GMAIL_CLIENT_SECRET=...
python3 kids/hub/pipeline/scan.py --auth
```

Follow the printed URL, approve in browser, copy the printed `GMAIL_REFRESH_TOKEN` value, and update the GitHub Actions secret.

The GCP project is **workout-app-alpha** (not the college football one). You may need to add yourself as a test user under OAuth consent screen if access is blocked.

---

## Deploying Changes

The dashboard is a single static file served by Netlify from the `main` branch.  
Any push to `main` that touches `kids/hub/` deploys automatically — no CI/CD config needed.

```bash
cd ~/labs/warrens-lab-main
git add kids/hub/index.html
git commit -m "your message"
git push   # Netlify picks it up in ~30 seconds
```

---

## Key Design Decisions

**Deterministic IDs** — item IDs are MD5 hashes of `type|title|date|child`, not Claude's generated IDs. This means the same item always gets the same ID across pipeline runs, so `completed=true` is never overwritten.

**Completed status is permanent** — the pipeline fetches existing completed IDs before upserting and removes the `completed` field from those rows, so Postgres never touches it.

**Within-batch and cross-batch dedup** — items are deduplicated by composite key (`title+date+child`) within each batch, and by `id` before the Supabase upsert, to prevent the `ON CONFLICT DO UPDATE cannot affect row a second time` Postgres error.

**Real-time via Supabase** — the dashboard subscribes to `postgres_changes` on the items table. When one person marks something done, the other person's page updates in under a second.

---

## Troubleshooting

**Pipeline fails with `ON CONFLICT DO UPDATE cannot affect row a second time`**  
Claude generated duplicate IDs in the same batch. The dedup-by-id step in `upsert_to_supabase` should prevent this — check that the latest `scan.py` is deployed.

**Pipeline fails with `check constraint "items_type_check"`**  
The `type` value isn't in the allowed list. Run in Supabase SQL editor:
```sql
ALTER TABLE items DROP CONSTRAINT items_type_check;
ALTER TABLE items ADD CONSTRAINT items_type_check
  CHECK (type IN ('event', 'task', 'curriculum', 'meta'));
```

**Dashboard shows "Pipeline run time unknown"**  
The `meta-last-run` row hasn't been written yet. Trigger a manual pipeline run.

**Gmail OAuth error / token expired**  
Re-run the auth flow (see above) and update the `GMAIL_REFRESH_TOKEN` secret in GitHub.

**Duplicate items appearing in dashboard**  
After the switch to deterministic IDs, old rows with old IDs may coexist with new rows. Clean up with:
```sql
-- Remove rows with old-style IDs (non-deterministic hashes)
-- First inspect: SELECT id, title, type FROM items ORDER BY id;
-- Then delete specific old duplicates by ID
DELETE FROM items WHERE id = 'evt-a3f2';  -- example
```
