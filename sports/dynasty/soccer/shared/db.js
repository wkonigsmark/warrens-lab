// Dynasty Soccer — tiny Supabase REST helper shared by every page.
import { supabaseConfig } from '../data/supabase-config.js';

const base = supabaseConfig.url.replace(/\/$/, '');
const headers = {
  apikey: supabaseConfig.anonKey,
  Authorization: `Bearer ${supabaseConfig.anonKey}`,
};

export const isConfigured =
  !!supabaseConfig.url &&
  !supabaseConfig.url.includes('YOUR-PROJECT-REF') &&
  !supabaseConfig.anonKey.includes('REPLACE_ME');

/** GET /rest/v1/<path> and return parsed JSON. Throws on non-2xx. */
export async function sb(path) {
  const res = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`);
  }
  return res.json();
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function setStatus(el, text, cls) {
  el.textContent = text;
  el.className = `status ${cls || ''}`;
}

/** Sort key for season strings like "Fall 2026" — newest first when sorted desc. */
export function seasonRank(season) {
  const m = /(spring|summer|fall|winter)\s+(\d{4})/i.exec(season || '');
  if (!m) return 0;
  const order = { winter: 0, spring: 1, summer: 2, fall: 3 };
  return Number(m[2]) * 10 + order[m[1].toLowerCase()];
}

/** POST /rest/v1/rpc/<name>. Throws Error(message) with .code on failure (e.g. 'invalid_pin'). */
export async function rpc(name, args = {}) {
  const res = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`, code = String(res.status);
    try { const j = JSON.parse(text); msg = j.message || msg; code = j.code || code; } catch {}
    const err = new Error(msg); err.code = code; throw err;
  }
  return text ? JSON.parse(text) : null;
}

/** 'arsenal-fall-2026' -> 'arsenal' (club key used for theming). */
export function clubKey(slug) {
  return (slug || '').replace(/-(spring|summer|fall|winter)-\d{4}$/i, '');
}
/** Apply a club theme to the page body. */
export function applyClub(slug) {
  const key = clubKey(slug);
  if (key) document.body.dataset.club = key;
  return key;
}
