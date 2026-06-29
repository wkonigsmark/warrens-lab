# Knockout Match Results Setup

This guide explains how to set up the knockout match results table in Supabase and wire it with the KO Match Center scoreboard.

## Step 1: Create the Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `migrations/001_create_match_results.sql`
5. Click **Run** to execute

This creates the `match_results` table with:
- `match_number` (1-104) - unique identifier for each match
- `home_score` / `away_score` - the final scores
- `winner_id` - the team that advanced (e.g., "CAN", "BRA")
- `shootout_winner_id` - only set if match was decided by penalties
- `status` - "upcoming", "live", or "completed"
- Timestamps for auditing

## Step 2: Verify Admin Server Config

Make sure your `.env` file in `admin/` has:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WORLD_CUP_ADMIN_PIN=2019
```

## Step 3: Test the Flow

1. Open the Scoreboard page at `http://127.0.0.1:8095/sports/world-cup/scoreboard/`
2. Click the "⚽ KO Match Center" tab
3. You should see: **RSA vs CAN (Match #73)**
4. Enter a score (e.g., 0 for RSA, 1 for CAN)
5. Click "✓ Save Result"
6. You should see: "✓ CAN advances!"
7. The next match (BRA vs JPN, Match #76) should auto-load

## API Endpoint

The admin server now handles knockout match results:

**POST** `/api/results/{matchNumber}`

Example payload:
```json
{
  "home_score": 0,
  "away_score": 1,
  "status": "completed",
  "winner_id": "CAN",
  "shootout_winner_id": null
}
```

Headers required:
```
X-Admin-Pin: 2019
Content-Type: application/json
```

## Auto-Progression

When a result is saved:
1. Data is written to Supabase `match_results` table
2. Admin server responds with success
3. Frontend calls `refreshOfficialResults()` which:
   - Fetches updated match data
   - Updates `actualMatches` array
   - Re-renders KO Pool standings
   - Auto-loads the next match

## Troubleshooting

**"Not found" error when saving?**
- Check that `match_results` table was created
- Verify the endpoint is `/api/results/{matchNumber}` (not `/api/match`)
- Confirm admin PIN is correct in `.env`

**Next match doesn't load?**
- Check browser console for errors
- Verify `refreshOfficialResults()` completes successfully
- Make sure `knockoutSchedule` is properly imported with correct team codes (JPN not JAP)

**Scores not syncing to KO Pool?**
- Check that the `actualMatches` array is being updated
- Verify the winner advancement logic in `calculateKoPoints()`
