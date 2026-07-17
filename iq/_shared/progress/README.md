# iq-progress — shared Supabase progress tracking

Cloud progress tracking for the /iq suite. Local-first: tools keep writing
to localStorage exactly as before; this module mirrors each saved session
into an outbox and syncs it to Supabase whenever the network allows.

Wired so far: **Ants & Angles**, **Ants & Algebra 2** (tool_id
`ants-algebra-v2` — its local payload still says `ants-algebra` internally,
harmless, the outbox row's `tool_id` is what matters), **Ants & Axes**,
**Ants & Apples** (vanilla JS, see "Non-Vite tools" below). The cross-tool
report lives in **Ants & Assessment** (`?admin`), which reads Supabase
directly — see "Cross-tool report" below.

## One-time Supabase setup (dashboard)

1. **Pause kids-hub** — dashboard → select the *kids-hub* project
   (ref `fwchltustcyrwtslhqcr`) → ⚙️ Project Settings → General →
   **Pause project**. Data is kept; `/kids/hub` will error until restored
   (Restore is one click). Do NOT touch the World Cup projects
   (`btqkavnkidmcceubaqbf`, `klbmdvbujapgovaxhyio`).
2. **Create `iq-progress`** — New project → name `iq-progress` → generate &
   save the DB password → nearest region → Free plan. Data API on,
   "Automatically expose new tables" off (schema.sql grants access
   explicitly), automatic RLS on (fine — redundant with the schema's own
   `ENABLE ROW LEVEL SECURITY`, doesn't conflict).
3. **Run the schema** — SQL Editor → paste all of `schema.sql` → Run.
4. **Set real PINs** — Table Editor → `students` → replace the placeholder
   PINs (Ruby L. is already `2036`; Guest stays `0000` and is never prompted).
5. **Fill `config.js`** — Project Settings → API Keys → copy the Project URL
   and the **Publishable key** (`sb_publishable_...`) into `config.js` here.
   That key is meant to be public (Supabase's own UI says so) and is
   committed to the repo, same as World Cup's `supabase-config.js`. Never
   put the **Secret key** (`sb_secret_...`) here or anywhere client-side —
   it isn't needed until/unless a server-side admin script exists, at which
   point it goes in a local, gitignored `iq/_shared/progress/admin/.env`.

## Security model (deliberately kid-scale)

- Threat model: a sibling or friend playing under the wrong name — not the
  internet. PINs are checked server-side via the `verify_pin` RPC; the
  publishable key cannot read the `students` table at all, and can only
  insert/read `progress_sessions` (never update/delete).
- Sessions use a **sliding 30-minute idle timeout** (`SESSION_IDLE_MINUTES`):
  active play never interrupts, but a walked-away tablet re-prompts for the
  PIN. Switching user always re-prompts.
- Verified PINs are cached hashed per device so re-verification works
  offline; sessions recorded during offline verification carry
  `verified: false` in the DB.

## Wiring a tool (copy this exactly — see ants-angles for a worked example)

1. Copy `PinGate.jsx` into the tool's `src/components/` (imports
   `../../../_shared/progress/index.js` — same depth as `src/lib/`).
2. `App.jsx` — wrap the post-user-picker render in
   `<PinGate key={user} user={user} onCancel={switchUser}>…</PinGate>`, and
   call `signOut()` (from the shared module) inside `switchUser` alongside
   `clearStoredUser()`.
3. `src/lib/sessions.js` — inside `saveSession`, after the localStorage
   write: `enqueueSession(TOOL_ID, user, session)`.
4. App startup (`main.jsx`) — `startAutoFlush()` then
   `backfillFromLocal(TOOL_ID, TRACKED_USERS.map(u => u.id), getSessions)`
   (one-time import of existing local history; flagged so it never re-runs).
5. `vite.config.js` — add `server: { fs: { allow: ['..'] } }` so the dev
   server can serve `_shared/progress` from outside the tool's own root.
6. Add the tool to `TOOL_CATALOG` in `toolCatalog.js` (name/emoji/color/url)
   so it shows up labeled in the Ants & Assessment report automatically.

## Data shape

One row in `progress_sessions` per completed quiz/climb session. Common
fields (`level_id`, `topic_id`, `score`, `total`, `ts`) are extracted into
columns for the admin console; the full client session object is preserved
untouched in `payload` (jsonb), so tool-specific fields are never lost.
Sync retries are idempotent via `unique (student_id, tool_id, client_id)`.

Every tool already writes a human-readable `levelTitle`/`tierLabel`/
`topicId` into its own session object before calling `saveSession`, so
`toolCatalog.js`'s `describeSession(row)` needs no per-level mapping —
it just reads those fields back out of `payload` for display.

## Non-Vite tools (no bundler)

A tool with no build step (plain HTML/CSS/JS, like Ants & Apples) can't
`import` across `../_shared/` at runtime — that path won't exist once the
tool is deployed on its own. Instead: vendor a copy of `config.js`,
`client.js`, `auth.js`, `queue.js` into the tool's own directory (e.g.
`iq/ants-apples/progress/`), plus a `roster.js` (same id/name/emoji/color
list as every other tool's `users.js`, no PINs). Load the tool's main script
as `<script type="module">` so it can `import` the vendored files, and build
a plain-DOM picker/PIN screen (see `iq/ants-apples/gate.js`) instead of
`PinGate.jsx`. Keep vendored copies in sync by hand if the canonical
versions change — there's no build step to do it for you.

## Cross-tool report

`ants-assessment`'s `ProgressAdminView` (`?admin`) queries
`progress_sessions` directly via `selectSessions()`, groups by student
(live roster from `selectRoster()` — the `student_roster` view: id/name/
emoji/color plus derived `age` and `gender`, never the pin or raw birthdate)
then by tool (via `TOOL_CATALOG`), and shows
per-tool totals plus a session table. Every roster entry shows up even with
zero sessions ("No sessions yet"), and adding a row to `students` in
Supabase makes a new kid appear here with no code change. It's
by-tool, not folded into Assessment's own 6 competencies — some tools
(e.g. Axes' coordinate geometry) don't map onto any of those cleanly.
