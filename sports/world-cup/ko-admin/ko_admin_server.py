#!/usr/bin/env python3
"""
Knockout Pool Admin Server — port 8788
Mirrors the group-pool admin_server.py pattern but talks to the
separate "World Cup Knockout Pool" Supabase project.

Usage:
  cd sports/world-cup/ko-admin
  python3 ko_admin_server.py

Endpoints:
  GET  /api/ko/results                  — all match results
  POST /api/ko/results/<match_number>   — upsert one result
  GET  /api/ko/entries                  — all entries (admin view)
  PATCH /api/ko/entries/<id>            — update paid/status/voided
"""

import json
import os
import re
import ssl
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

# ── SSL context ──────────────────────────────────────────────────────────────
# macOS system Python often ships without a usable CA bundle, so urllib's HTTPS
# calls to Supabase fail with CERTIFICATE_VERIFY_FAILED. Prefer certifi's bundle
# when available; fall back to the system default otherwise. Verification stays ON.
try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()

# ── Config ──────────────────────────────────────────────────────────────────
ENV_PATH = Path(__file__).parent / ".env"

def load_env():
    env = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    return env

env = load_env()
SUPABASE_URL  = env.get("KO_SUPABASE_URL", "").rstrip("/")
SERVICE_KEY   = env.get("KO_SERVICE_KEY", "")
ADMIN_PIN     = env.get("KO_ADMIN_PIN", "2019")
PORT          = int(env.get("KO_PORT", "8788"))

ALLOWED_ORIGINS = {"http://localhost:8095", "http://localhost:8096",
                   "http://127.0.0.1:8095", "http://127.0.0.1:8096",
                   "null"}

# ── Supabase helper ──────────────────────────────────────────────────────────
def supa_request(method, path, body=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = Request(url, data=data, method=method)
    req.add_header("apikey", SERVICE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation,resolution=merge-duplicates")
    try:
        with urlopen(req, timeout=8, context=SSL_CONTEXT) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw.strip() else []
    except URLError as e:
        raise RuntimeError(str(e))

# ── Request handler ──────────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[ko-admin] {self.address_string()} — {fmt % args}")

    # ── CORS ────────────────────────────────────────────────────────────────
    def _cors_headers(self):
        origin = self.headers.get("Origin", "")
        allowed = origin if origin in ALLOWED_ORIGINS else ""
        return {
            "Access-Control-Allow-Origin": allowed or "*",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Admin-Pin",
        }

    def do_OPTIONS(self):
        self._send(204, headers=self._cors_headers())

    # ── Auth ─────────────────────────────────────────────────────────────────
    def _check_pin(self):
        return self.headers.get("X-Admin-Pin", "") == ADMIN_PIN

    # ── Response helpers ─────────────────────────────────────────────────────
    def _send(self, code, body=None, headers=None):
        self.send_response(code)
        for k, v in (self._cors_headers() | (headers or {})).items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        if body is not None:
            self.wfile.write(json.dumps(body).encode())

    def _read_body(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n)) if n else {}

    # ── Routing ──────────────────────────────────────────────────────────────
    def do_GET(self):
        if self.path == "/api/ko/results":
            try:
                rows = supa_request("GET", "knockout_match_results?order=match_number")
                self._send(200, rows)
            except Exception as e:
                self._send(502, {"error": str(e)})

        elif self.path == "/api/ko/entries":
            if not self._check_pin():
                self._send(401, {"error": "Unauthorized"}); return
            try:
                rows = supa_request("GET", "knockout_entries?order=submitted_at")
                self._send(200, rows)
            except Exception as e:
                self._send(502, {"error": str(e)})
        else:
            self._send(404, {"error": "Not found"})

    def do_POST(self):
        m = re.match(r"^/api/ko/results/(\d+)$", self.path)
        if not m:
            self._send(404, {"error": "Not found"}); return
        if not self._check_pin():
            self._send(401, {"error": "Unauthorized"}); return

        match_number = int(m.group(1))
        body = self._read_body()
        body["match_number"] = match_number

        try:
            rows = supa_request(
                "POST",
                "knockout_match_results?on_conflict=match_number",
                body,
            )
            self._send(200, rows[0] if rows else body)
        except Exception as e:
            self._send(502, {"error": str(e)})

    def do_PATCH(self):
        m = re.match(r"^/api/ko/entries/([^/]+)$", self.path)
        if not m:
            self._send(404, {"error": "Not found"}); return
        if not self._check_pin():
            self._send(401, {"error": "Unauthorized"}); return

        entry_id = m.group(1)
        patch = self._read_body()
        try:
            rows = supa_request(
                "PATCH",
                f"knockout_entries?id=eq.{entry_id}",
                patch,
            )
            self._send(200, rows[0] if rows else patch)
        except Exception as e:
            self._send(502, {"error": str(e)})


if __name__ == "__main__":
    if not SERVICE_KEY or "PASTE" in SERVICE_KEY:
        print("⚠️  KO_SERVICE_KEY not set in ko-admin/.env — writes will fail.")
    print(f"🔑  KO Admin server → http://127.0.0.1:{PORT}")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
