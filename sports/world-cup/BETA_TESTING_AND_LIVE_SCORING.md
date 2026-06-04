# World Cup Pool Beta Testing And Live Scoring Runbook

This runbook covers the path from test entries to live group-play scoring. The goal is to prove that submissions, admin controls, scoring, tiebreakers, exports, and scoreboard behavior all work before real entries are locked.

## Current Pool Shape

- Pool stage: group play only.
- Entry: bracket name, email, Venmo handle, 12 group rankings, top eight third-place advancers, total group-play goals tiebreaker.
- Submission source: Supabase `pool_entries` and `pool_entry_picks`.
- Admin source: local admin server only.
- Scoreboard source during testing: simulated or manually keyed match results.

## Official Scoring

- Correct group winner: 4 points.
- Correct group 2nd place: 3 points.
- Correct group 3rd place: 2 points.
- Correct group 4th place: 1 point.
- Correct third-place team advancing to the knockout round: 2 additional points.

Maximum score:

- Group rankings: `12 x (4 + 3 + 2 + 1) = 120`
- Third-place advancers: `8 x 2 = 16`
- Total: `136`

Tiebreakers:

1. Number of groups picked perfectly from 1st through 4th.
2. Number of third-place knockout advancers picked correctly.
3. Closest absolute difference to total goals scored in group play.

## Beta Test Entry Plan

Create a small but varied batch of test entries. A useful test batch should include:

- Chalk entry: all W-Index favorites in order.
- Upset entry: several second-place teams picked to win groups.
- Chaos entry: a few low W-Index teams advancing.
- Duplicate-user entry: same email or Venmo with a different bracket name.
- Missing-payment scenario: leave at least one unpaid.
- Paid scenario: mark at least one entry paid in admin.
- Voided scenario: mark one entry voided.
- Test-delete scenario: mark one entry as test, then hard-delete it.

## Submission QA Checklist

For each test entry:

- Confirm entry writes to Supabase.
- Confirm entry code appears after submission.
- Confirm entry appears in local admin.
- Confirm picks appear in `pool_entry_picks`.
- Confirm copy CSV and export CSV still work.
- Confirm the Venmo memo copy is visible before submission.
- Confirm total group goals tiebreaker is required.
- Confirm submitted entries cannot be edited in the public flow.

## Admin QA Checklist

In `/sports/world-cup/admin/`, with the local admin server running:

- Confirm PIN protection works.
- Confirm entry count, paid count, pending count, and purse tally update.
- Mark an entry paid.
- Mark an entry pending again.
- Mark an entry test.
- Mark an entry voided.
- Delete only a test entry.
- Export entries CSV.
- Export picks CSV.

## Simulation QA Checklist

Use the scoreboard sandbox to simulate different tournament states:

- No matches completed: every entry should have 0 points.
- One group completed: only that group's exact-position points should score.
- Multiple groups completed: group scores should accumulate.
- All 72 group matches completed: third-place advancer bonus and goal tiebreak delta become active.
- Tied score entries: leaderboard should sort by perfect groups, then third-place advancers, then goal tiebreak delta.

Important scoring behavior:

- W-Index should never award official points by itself.
- Incomplete groups should not score based on projected or default W-Index order.
- Third-place advancer points should not score until all group-play matches are complete.

## Live Scoring Source Of Truth

Once the tournament starts, the scoreboard should stop relying on sandbox simulation for official standings. The recommended source of truth is a manually controlled score sheet that can be audited.

Recommended spreadsheet columns:

```text
match_number
group
home_team_id
away_team_id
home_score
away_score
status
source_note
updated_at
```

Recommended `status` values:

- `upcoming`
- `live`
- `completed`

The scoreboard should only score matches where `status = completed`.

## Live Handoff Process

Before kickoff:

1. Delete or void all test entries.
2. Confirm all real paid entries.
3. Disable public submission in the code or Supabase policy.
4. Export locked entries and picks from admin.
5. Commit a locked entry snapshot if a static fallback is needed.
6. Create or finalize the live scores spreadsheet.

During group play:

1. Enter final scores into the live scores spreadsheet.
2. Mark completed matches as `completed`.
3. Refresh or sync the scoreboard.
4. Spot-check group standings against FIFA/official standings.
5. Spot-check 2-3 entries after each match window.

After group play:

1. Confirm all 72 group matches are complete.
2. Confirm actual third-place advancers.
3. Confirm total group-play goals.
4. Verify final leaderboard and tiebreakers.
5. Export final standings CSV.
6. Calculate payouts from paid entries only.

## Payout Accounting

- Total purse: confirmed paid entries x `$50`.
- Organizer fee: `5%` of total purse.
- Net pool: `95%` of total purse.
- Winner: `70%` of net pool.
- Runner-up: `20%` of net pool.
- Third place: `10%` of net pool.

## Open Implementation Work

- Add a live-score import path for a spreadsheet or published CSV.
- Add a clear scoreboard mode indicator: `Sandbox` vs `Live`.
- Add a lock switch for public submissions.
- Add a final locked entries snapshot path.
- Add final payout display once paid entries are locked.
