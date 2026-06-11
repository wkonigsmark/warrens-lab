# World Cup Pool Lock And Backup Runbook

This is the manual launch procedure for closing group-play pool submissions.
Nothing in this runbook runs automatically.

## What The Backup Contains

The read-only backup utility captures every row, including paid, pending,
test, and voided entries:

- Supabase UUID and public entry code
- Bracket name, email, and Venmo handle
- Submitted timestamp and payment/status fields
- Total group-play goals tiebreaker
- All 48 group-position picks
- All eight third-place advancer picks
- Original JSON payload, including the W-Index snapshot and predicted R32
- A validation report and SHA-256 checksums

Backups are written to `admin/backups/<UTC timestamp>/`. This directory is
git-ignored because it contains private contestant information.

## Take A Backup While Entries Remain Open

From the repository root:

```bash
python3 sports/world-cup/admin/backup_submissions.py
```

Confirm the command reports:

- The expected number of entries
- 56 picks per complete entry
- `Validation issues: 0`
- `Orphan picks: 0`

Open the new backup directory and retain all six files. For an additional
off-machine copy, duplicate the timestamped folder to a private cloud drive
or external disk. Do not put it in the public GitHub repository.

## Cutoff Sequence

Use this order at the official cutoff.

1. Note the exact cutoff time in Eastern Time.
2. Run `backup_submissions.py` for a pre-lock snapshot.
3. In Supabase SQL Editor, run `supabase/lock-submissions.sql`.
4. Test the public pool page in a private/incognito window. A submission
   attempt must fail; do not use a real contestant's bracket for this test.
5. Replace the public entry call-to-action with a clear "Entries Closed"
   message and deploy that small frontend update.
6. Run `backup_submissions.py` again for the definitive post-lock snapshot.
7. Compare the post-lock entry count with the admin page and Supabase table.
8. Preserve the post-lock folder as the official source-of-truth snapshot.

The database lock comes before the webpage update so a cached or already-open
entry page cannot submit after the cutoff.

## Supabase Lock

The lock SQL only removes anonymous insert access from:

- `public.pool_entries`
- `public.pool_entry_picks`
- `public.pool_entry_picks_id_seq`

It does not delete or edit entries. It does not disable the public scoreboard,
purse summary, or local admin server.

## Emergency Reopen

If the lock was applied too early or a legitimate exception is approved, run:

`supabase/unlock-submissions.sql`

Then verify a test submission works before telling anyone entries are open.

## Final Integrity Checks

Before scoring begins:

1. No validation failures in `validation-report.csv`.
2. Every live entry has 48 group picks and eight third-place picks.
3. Every live entry has a numeric goals tiebreaker.
4. Entry count matches Supabase, the admin page, and `manifest.json`.
5. Test and voided entries remain identifiable; do not silently delete them
   from the historical backup.
6. Keep the original post-lock snapshot unchanged. Make working copies for
   payment cleanup, scoring, and analysis.
