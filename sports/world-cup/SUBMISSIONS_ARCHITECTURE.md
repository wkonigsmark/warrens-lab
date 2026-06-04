# World Cup Pool Submission Architecture

This document defines the recommended workflow for collecting outside pool entries for Warren's World Cup Pool.

The first launch goal is simple: accept a modest number of bracket submissions, confirm Venmo payment manually, lock entries at kickoff, then export the data into a static file or working database for scoring.

## Scale Assumption

Expected volume:

- Normal case: 50 to 250 submissions.
- Stretch case: about 500 submissions.

This is comfortably small for Supabase Free. As of this planning pass, Supabase Free lists 500 MB database size, 5 GB egress, 50,000 monthly active users, and 500,000 monthly Edge Function invocations. A 500-entry pool should be tiny by those measures because each entry is only contact metadata plus JSON/row data for picks.

The real risk is not storage. The real risk is operational hygiene:

- Duplicate entries.
- Spam/bot submissions.
- Public exposure of emails, Venmo handles, or picks.
- Accidentally leaving submissions open after kickoff.
- Not having a clean export before scoring starts.

## Recommended V1 Workflow

1. User receives pool link.
2. User fills in bracket name, email, Venmo handle, group standings, and third-place ordering.
3. User clicks Submit.
4. Submission is written to Supabase.
5. User sees confirmation with entry id and payment instructions.
6. Commissioner dashboard/export is used to review entries.
7. Commissioner manually marks payment status after Venmo matching.
8. At lock time, submissions are disabled.
9. Entries are exported to CSV/JSON and committed or stored as the scoring baseline.

Important entry rules:

- One person may submit multiple brackets.
- Submissions are final. Users cannot edit after submission.
- The entry screen must say this clearly before the user starts.
- Payment does not block submission.
- Unpaid entries remain visible initially and should be highlighted in red to create payment pressure.
- About 24 hours after launch/submission collection, unpaid entries can be voided or deleted manually.
- Test entries can accumulate during development, but should be deleted before the live pool opens.

## Data Model

Use one parent entry table and one child pick table. This keeps admin review easy, avoids giant CSV blobs as the only source of truth, and still allows simple export later.

### `pool_entries`

Recommended columns:

```sql
create table public.pool_entries (
  id uuid primary key default gen_random_uuid(),
  entry_code text unique not null,
  bracket_name text not null,
  email text not null,
  venmo text not null,
  status text not null default 'pending_payment',
  paid boolean not null default false,
  test_entry boolean not null default false,
  voided boolean not null default false,
  submitted_at timestamptz not null default now(),
  user_agent text,
  source text default 'world-cup-pool',
  payload jsonb not null default '{}'::jsonb
);
```

`payload` should store the complete submission snapshot:

- Group picks.
- Third-place ordering.
- W-Index snapshot used at submission time.
- Bracket/R32 seed output if generated.
- App version or data version.

This makes every entry auditable even if the frontend data changes later.

Recommended `status` values:

- `pending_payment`
- `paid`
- `voided`
- `test`

`paid` is kept as a simple boolean for easy purse calculations and filtering. `status` is kept for clearer admin review.

### `pool_entry_picks`

Recommended columns:

```sql
create table public.pool_entry_picks (
  id bigint generated always as identity primary key,
  entry_id uuid not null references public.pool_entries(id) on delete cascade,
  section text not null,
  group_letter text,
  rank integer not null,
  team_id text not null,
  team_name text not null,
  w_index numeric,
  w_index_rank integer
);
```

Expected sections:

- `group_order`
- `third_place_order`

This mirrors the current CSV export from `pool/index.html`.

## Security Model

Never expose the Supabase service role key in the frontend.

Recommended V1:

- Use the public anon key in the static frontend.
- Enable Row Level Security.
- Allow anonymous `insert` into `pool_entries` and `pool_entry_picks`.
- Do not allow anonymous `select`, `update`, or `delete`.
- Read/export entries from Supabase Dashboard, SQL editor, or a private admin tool.

Baseline policy shape:

```sql
alter table public.pool_entries enable row level security;
alter table public.pool_entry_picks enable row level security;

create policy "public can submit entries"
on public.pool_entries
for insert
to anon
with check (true);

create policy "public can submit picks"
on public.pool_entry_picks
for insert
to anon
with check (true);
```

If spam becomes a concern, move submission through a Supabase Edge Function or another lightweight API layer so validation and rate limits can live server-side.

For the initial build, a simple local/private admin workflow is acceptable. The admin tool can be run from Warren's machine against Supabase using private credentials or the Supabase dashboard. This does not need public authentication in V1.

## Submission Lock

The simplest lock is operational:

1. At first match kickoff, manually disable the frontend Submit button/code path.
2. Push the lock update to GitHub/deployment.
3. Remove or pause the anonymous insert policies in Supabase.
4. Export entries immediately after lock.

A more polished version can use a `pool_settings` table:

```sql
create table public.pool_settings (
  key text primary key,
  value jsonb not null
);
```

Then an Edge Function can reject submissions when `submissions_open` is false.

For V1, manual policy disablement is acceptable because this is a short-lived event with a clear lock time.

The pool should not depend on a fully automated lock job. Manual lock is preferred for V1 because it keeps the failure surface small.

## Validation

Frontend should validate:

- Bracket name is present.
- Email is present and shaped like an email.
- Venmo handle is present.
- All 12 groups have four ranked teams.
- Third-place list has exactly 8 teams.
- No duplicate team within a group.
- Submission payload includes a data version.
- Total group-play goals tiebreaker is present and numeric.

Database or server-side validation should eventually verify:

- Required fields are not blank.
- Email length is reasonable.
- Venmo length is reasonable.
- Entry payload contains all required groups.
- Entry code is unique.

## Entry Code

Every submitted bracket needs a human-readable unique identifier in addition to the database UUID.

Recommended format:

```text
WC26-K7Q9-M2XA
```

Generation approach:

- Generate client-side with cryptographically strong random values where available.
- Also enforce `unique` in Supabase.
- If insert fails due to collision, generate a new code and retry.

Collision risk is effectively negligible with an 8-character base-32/base-36 code plus the `WC26` prefix, but the database unique constraint is the final authority.

## Payment Workflow

Payment should not block submission in V1.

Recommended approach:

- User submits entry first.
- Confirmation screen shows entry code and Venmo instruction.
- Commissioner exports/reviews entries.
- Commissioner manually marks `paid = true`.
- Unpaid entries remain visible and are highlighted red.
- After roughly 24 hours, unpaid entries can be voided or deleted.
- Suspicious entries can be set `voided = true`.

This keeps the user flow fast and avoids building payment automation before it is necessary.

## Scoring And Tiebreakers

Group-play pool scoring:

- Correct group winner: 4 points
- Correct 2nd place team: 3 points
- Correct 3rd place team: 2 points
- Correct 4th place team: 1 point
- Correct third-place team advancing to the knockout round: 2 additional points

Maximum score:

- Group rankings: `12 groups x (4 + 3 + 2 + 1) = 120`
- Advancing third-place teams: `8 x 2 = 16`
- Total: `136`

Official tiebreakers:

1. Perfect groups.
2. Third-place knockout advancers picked correctly.
3. Total goals scored in group play.

Perfect groups is not a user input. It is computed after group play by counting how many groups the user ranked exactly 1 through 4.

Third-place knockout advancers are computed from the user's top eight third-place selections.

Total group-play goals is a user input. The scoring tiebreaker is closest absolute difference from the actual total, whether the submitted number is above or below the final value.

Recommended `pool_entries.payload` shape:

```json
{
  "tiebreakers": {
    "totalGroupGoals": 120
  }
}
```

Recommended entry-screen copy:

```text
Tiebreakers: perfect groups and third-place advancers are calculated from your picks. Enter your prediction for total goals scored across group play.
```

## Payouts

Payout accounting:

- Total purse: `confirmed_paid_entries * 50`
- Organizer fee: `total_purse * 0.05`
- Net pool: `total_purse * 0.95`
- Winner: `net_pool * 0.70`
- Runner-up: `net_pool * 0.20`
- Third place: `net_pool * 0.10`

## Homepage Purse Tally

The homepage should show a clear purse tally:

- Total entries: `entry_count * 50`
- Paid purse: `paid_entry_count * 50`

Recommended display:

```text
Total submitted: 84 entries / $4,200
Paid and confirmed: 71 entries / $3,550
```

Unpaid amount can be implied or shown as:

```text
Pending payment: 13 entries / $650
```

Data source:

- During testing: read from Supabase or a local fixture.
- After lock: read from the exported static snapshot.

Important: unpaid entries should remain visible in public views before the 24-hour cleanup window, ideally with red highlighting, so contestants can see who still needs to settle up.

## Admin Workflow

V1 can use a simple local/private admin page or script. It does not need production-grade authentication yet.

Admin needs:

- View all entries.
- Filter by `pending_payment`, `paid`, `voided`, and `test`.
- Mark payment confirmed.
- Mark entry voided.
- Delete test entries.
- Export entries and picks.
- See purse counters.
- See duplicate signals by email, Venmo, and bracket name.

Recommended behavior:

- Real entries should usually be voided rather than hard-deleted.
- Test entries can be hard-deleted before launch.
- The admin screen should make unpaid entries visually loud, ideally red.

## Export And Static Fallback

After submissions lock:

1. Export `pool_entries` and `pool_entry_picks` as CSV.
2. Save a JSON snapshot for app scoring.
3. Commit the locked snapshot into the repo, likely under `world-cup/data/submissions/`.
4. Scoring/scoreboard can run from the static snapshot if needed.

Suggested files:

- `data/submissions/pool-entries-locked.json`
- `data/submissions/pool-picks-locked.csv`
- `data/submissions/payment-status.csv`

This gives a clean escape hatch if live Supabase is no longer needed after kickoff.

## Failure Modes

### Supabase unavailable

Keep the existing Copy CSV / Export CSV buttons as emergency fallback. If Submit fails, the app can ask the user to export or copy their entry and send it manually.

### Duplicate submissions

Allow multiple brackets per person. Do not enforce unique email or Venmo. Review duplicates by email, Venmo, and bracket name only as an admin signal.

### Bad actor/spam

Add honeypot field first. If needed, add Turnstile or move inserts behind an Edge Function with basic rate limiting.

### Data changes after submission

Store full submission payload, including W-Index snapshot/data version, so each entry can be reconstructed exactly as submitted.

## Launch Checklist

- Use `BETA_TESTING_AND_LIVE_SCORING.md` for the full beta-entry, simulation, and live-score handoff process.
- Create Supabase tables.
- Enable RLS.
- Add insert-only policies.
- Add environment/config file for Supabase URL and anon key.
- Add entry-code generator.
- Add total group goals tiebreaker input.
- Add final-submission/no-edit warning.
- Wire Submit button.
- Confirm a test entry writes successfully.
- Confirm anonymous users cannot read entries.
- Build local/private admin page or script.
- Confirm payment marking works.
- Confirm unpaid entries render red.
- Confirm purse tally works.
- Export a test CSV.
- Test failed submission fallback to CSV export.
- Delete test entries before public launch.
- Set final lock time.
- At kickoff, disable submit and remove insert policy.
- Export locked entries.

## Local Setup Files

Current implementation files:

- `supabase/schema.sql`: run this in the Supabase SQL editor.
- `data/supabase-config.js`: local/public frontend config for submit and purse tally.
- `data/supabase-admin-config.js`: local admin config with service role key.
- `data/supabase-config.example.js`: committed example.
- `data/supabase-admin-config.example.js`: committed example.
- `admin/index.html`: private/local admin console.
- `pool/index.html`: public entry flow with Supabase submit.

The real config files are ignored by git:

```text
sports/world-cup/data/supabase-config.js
sports/world-cup/data/supabase-admin-config.js
```

Public config should use the Supabase anon key. Admin config should use the service role key and should never be deployed publicly.

Setup order:

1. Open Supabase SQL editor.
2. Run `sports/world-cup/supabase/schema.sql`.
3. Add project URL and anon key to `data/supabase-config.js`.
4. Add project URL and service role key to `data/supabase-admin-config.js`.
5. Submit one test entry from `/world-cup/pool/`.
6. Open `/world-cup/admin/`.
7. Mark the test entry paid, pending, test, voided, and deleted to confirm admin control.
8. Confirm homepage purse tally updates.

## Sources

- Supabase pricing and Free plan limits: https://supabase.com/pricing
- Supabase Row Level Security docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JavaScript client docs: https://supabase.com/docs/reference/javascript
