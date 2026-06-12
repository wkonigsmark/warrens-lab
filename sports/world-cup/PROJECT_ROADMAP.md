# Warren's World Cup Project Roadmap

Last updated: June 11, 2026

## Current State

Warren's World Cup Pool has progressed from experimental bracket prototypes into a live group-play pool platform.

Current operational state:

- Group-play entries are locked.
- 102 final submissions were backed up and validated.
- Public submissions are stored in Supabase.
- The local admin tool manages payments, statuses, exports, and official results.
- The public scoreboard loads real submitted brackets.
- Pool scoring, projections, tiebreakers, and comparison views are implemented.
- Manual official score entry is implemented in code.
- Automated score ingestion remains the next major operational milestone.

## Product Definition

The 2026 pool is split into two independent experiences:

1. Group-play pool
   - Rank all 12 groups from first through fourth.
   - Select the eight third-place teams that advance.
   - Predict total group-play goals.
2. Future knockout pool
   - Launch after group play concludes.
   - Use the actual Round of 32 bracket.
   - Pick every knockout winner, including the third-place match.

The live product currently covers the group-play pool.

## Completed Milestones

### 1. Prototype And Tournament Logic

- Built early World Cup simulation and bracket experiments.
- Implemented 48-team, 12-group tournament structure.
- Added third-place advancement and Round of 32 mapping logic.
- Preserved early versions under `archive/`.
- Separated group-play pool thinking from a future knockout pool.

### 2. Central Tournament Data

- Created canonical team, group, fixture, venue, and knockout data.
- Added searchable fixture pages with browser-local kickoff times.
- Added reusable team IDs and graphical flags.
- Consolidated active tournament logic into `data/world-cup-2026.js`.
- Retained human-readable CSV and Markdown audit files.

### 3. W-Index

- Connected the proprietary published W-Index CSV.
- Added a local 48-team baseline to prevent slow-load blank states.
- Built the flagship ranking page.
- Added graphical flags, mobile cards, group-path context, and path-adjusted metrics.
- Added role labels for favorite, runner-up, third, and last.
- Added W-Index ticker and team/group modal behavior on the homepage.

### 4. Group Analysis

- Built aggregate group strength and parity calculations.
- Added pairwise matchup differences and close-game counts.
- Added group-role and favorite-path analysis.
- Added picks-versus-path storytelling.
- Created desktop tables and mobile tile layouts.
- Added searchable and visual group analysis.

### 5. Homepage And Design System

- Established the shared visual language in `shared/world-cup.css`.
- Built the particle-text homepage identity.
- Added host-country flags and the World Cup eagle asset.
- Added purse, fee, net-pool, and projected payout displays.
- Added direct paths to the pool, scoreboard, fixtures, analysis, and simulator.
- Removed the abandoned autoplay music experience.
- Made the site responsive across mobile and desktop.

### 6. Pool Entry Experience

- Built a mobile-first, one-thumb group-ranking flow.
- Auto-filled the fourth team after three selections.
- Added keyboard progression with Enter/Return.
- Added drag-and-drop reordering for desktop and touch devices.
- Added W-Index and group context during selection.
- Added top-eight third-place selection.
- Added bracket name, email, Venmo handle, and total-goals tiebreaker.
- Added review, CSV export, clipboard copy, and projected Round of 32 display.
- Added leave-page warnings before submission.
- Added strict completion validation before submission.
- Added clear Venmo instructions and final submission confirmation.

### 7. Scoring Rules

- Correct first place: 4 points.
- Correct second place: 3 points.
- Correct third place: 2 points.
- Correct fourth place: 1 point.
- Correct third-place knockout advancer: 2 additional points.
- Maximum score: 136 points.

Tiebreakers:

1. Perfectly predicted groups.
2. Correct third-place advancers.
3. Closest absolute difference to total group-play goals.

Scoring behavior:

- During group play, displayed scores are projections.
- Official group-position points are awarded only when a group finishes all six matches.
- Third-place advancer points become official after all 72 group matches.
- Ordering the selected eight third-place teams does not affect points.

### 8. Supabase Submission System

- Created `pool_entries` and `pool_entry_picks`.
- Added unique entry codes.
- Added public insert policies with restricted read access.
- Added server-side public scoreboard RPC.
- Added purse-summary RPC.
- Added payment, test-entry, void, and submission status fields.
- Added manual lock and emergency unlock scripts.
- Locked submissions at the tournament cutoff.

### 9. Admin Operations

- Built a PIN-protected local admin page.
- Kept the service-role key in a local `.env`.
- Added entry, paid, pending, and purse summaries.
- Added payment confirmation and status controls.
- Restricted hard deletion to test entries.
- Added entry and pick CSV exports.
- Added a local Python admin API.

### 10. Backup And Launch

- Created a repeatable full-backup script.
- Exported entries, normalized picks, complete JSON, validation reports, and checksums.
- Created a final 102-entry backup.
- Validated all 102 entries.
- Confirmed 5,712 normalized picks and zero orphan picks.
- Created a participant-friendly final XLSX export.
- Documented lock, backup, and emergency reopening procedures.

### 11. Scoreboard

- Replaced seeded dummy entries with real Supabase submissions.
- Added public bracket search.
- Added projected standings during incomplete group play.
- Added official scoring gates for completed groups.
- Added third-place advancer scoring.
- Added all three tiebreakers.
- Added rank movement.
- Added bracket detail expansion.
- Added picks-versus-actual group tables.
- Added actual third-place advancer comparison.
- Added actual goals, guessed goals, and absolute difference.
- Added matchup rooting guidance for each bracket.
- Removed misleading participant avatar flags.

### 12. Commissioner Sandbox

- Added match-by-match simulation.
- Added stochastic simulation controls.
- Added manual sandbox score overrides.
- Added reset and progress feedback.
- Protected commissioner controls with PIN `2019`.
- Kept sandbox state separate from official results.

### 13. Simulation Visualizations

- Added Monte Carlo tournament simulation.
- Added stochasticity controls.
- Added stage-reach distributions for all 48 teams.
- Added Fate Field scatter visualization.
- Improved favorite behavior and knockout progression logic.
- Reduced chart dead space and flag collisions.
- Kept simulation isolated from pool submissions and official scoring.

### 14. Official Match Results Foundation

- Added the `match_results` Supabase schema.
- Added a public read RPC for live and completed results.
- Added protected local admin result endpoints.
- Added `Save Official Final Result` to the commissioner workflow.
- Prevented sandbox simulation from overwriting official matches.
- Added 30-second public result polling.
- Preserved source and source-reference fields for future automation.

## Immediate Operational Priorities

### Priority 0: Activate Official Results

1. Run `supabase/live-match-results.sql` in Supabase if it has not already been installed.
2. Confirm `/api/results` returns successfully from the local admin server.
3. Enter Match 1's final score through the commissioner panel.
4. Confirm the public scoreboard receives it within 30 seconds.
5. Verify the group table and projections against the official standings.

### Priority 1: Daily Score Workflow

For every completed match:

1. Confirm the result from an official source.
2. Save the final score through the commissioner panel.
3. Confirm the match is marked `completed`.
4. Spot-check the affected group table.
5. Spot-check at least three bracket projections.
6. Record any corrections with a short result note.

### Priority 2: Automated Score Feed

Target architecture:

```text
licensed score API
        ↓
scheduled server-side importer
        ↓
canonical match-number validation
        ↓
Supabase match_results
        ↓
public scoreboard
```

Requirements:

- Never expose provider secrets in browser code.
- Map provider fixtures to canonical match numbers.
- Publish only final results as `completed`.
- Keep the manual commissioner path as an emergency correction tool.
- Alert on unmapped teams, duplicate matches, or changed final scores.
- Preserve provider source IDs for auditing.

### Priority 3: Official Mode Clarity

- Add a highly visible `Official Results` versus `Sandbox` state.
- Show last result sync time.
- Show the result source.
- Add an admin warning when a sandbox action is attempted on an official match.
- Add a compact audit list of recently updated official scores.

### Priority 4: Live Operations And Reliability

- Copy the final backup to two secure external locations.
- Keep backups outside the publicly deployed tree.
- Add a lightweight daily database backup during group play.
- Add a scoreboard health check for Supabase RPC failures.
- Add a manual static-results fallback for emergencies.
- Document the exact final-score correction procedure.

## Post-Group-Play Work

### Final Group Scoring

- Confirm all 72 group matches are complete.
- Verify all 12 official group tables.
- Verify the eight actual third-place advancers.
- Enter the official total group-play goals.
- Freeze the final leaderboard.
- Export and archive final standings.
- Calculate payouts from eligible paid entries.

### Knockout Pool

- Create a separate Supabase project or clearly separated tables.
- Load actual Round of 32 matchups.
- Reuse the mobile selection patterns from the group pool.
- Include winner selection through the final.
- Include the semifinal-loser third-place match.
- Define a separate scoring and tiebreak structure.

## Product Expansion Backlog

These ideas are valuable but should remain behind live pool reliability:

- Automated fixtures and live scores
- Team and squad database
- News feed
- Editorial publishing
- Odds integration
- Participant email confirmations with PDF and CSV attachments
- Public bracket permalink pages
- Historical pool archive
- Mobile push or email alerts
- Expanded match-level rooting scenarios

## Technical Cleanup Roadmap

1. Move `bracket_lookup.js` out of the old archive.
2. Remove old prototypes from the deployed directory.
3. Remove unused audio and generated cache files.
4. Archive or remove the paused squad data.
5. Remove placeholder navigation links and pages that are no longer planned.
6. Consolidate duplicate tournament CSV and JS data generation.
7. Rename the beta runbook to reflect live operations.
8. Keep the final 102-entry backup outside Git and outside public hosting.

See `DIRECTORY_REVIEW.md` for the file-by-file cleanup assessment.

## Definition Of Success

The group-play pool is successful when:

- Every locked submission remains immutable and recoverable.
- Every official match result has an auditable source.
- The public scoreboard updates reliably.
- Projected and official scoring are clearly distinguished.
- Final group scores and tiebreakers reproduce correctly from the locked picks.
- The final standings can be independently verified from exported data.
- Cleanup and future features never place the live pool data at risk.
