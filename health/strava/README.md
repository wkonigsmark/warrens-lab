# Strava Exercise Trends Tracker

A Vue.js-based web tool for tracking and analyzing exercise data from your Strava activities. Framework for Phase 1 (trends analysis) with planned Phase 2 (goal tracking).

## Features (Phase 1)

- **Recent Activities Tab** - Browse recent exercises with filtering by activity type
- **Trends Tab** - Visualize exercise patterns:
  - Activities by type with distance totals
  - Time-period breakdowns (30-day, 90-day, 1-year, all-time)
- **Summary Stats** - Quick overview: total activities, distance, moving time, activity types
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Vue.js 3 (CDN)
- **Styling**: Custom CSS with Strava-inspired orange color scheme
- **Data Source**: Google Sheets (published publicly)
- **Server**: Python http.server on port 9016

## Setup

### 1. Configure Your Data Source

The app fetches exercise data as CSV from your published Google Sheet. Update the `csvUrl` in `app.js`:

```javascript
csvUrl: 'https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?gid=YOUR_SHEET_ID&single=true&output=csv'
```

**Required columns in your sheet:**
- ID
- Name
- Type (e.g., "Run", "Bike", "Swim")
- Distance (m)
- Moving Time (s)
- Elapsed Time
- Elev Gain
- Start Date (ISO format: YYYY-MM-DDTHH:MM:SSZ)

### 2. Publish Your Sheet

1. Open your Google Sheet
2. Go to **File → Share**
3. Click **Share** and set to "Anyone with the link can view"
4. Go to **File → Publish to the web**
5. Select your sheet tab and publish as **HTML**
6. Copy the published URL and update `app.js`

### 3. Run Locally

Start the development server:

```bash
cd /Users/warren/labs/warrens-lab-main/health/strava
python3 -m http.server 9016
```

Then open: **http://localhost:9016**

**Note:** The app includes fallback mock data if it can't fetch from the sheet, so you can test the UI immediately.

## File Structure

```
health/strava/
├── index.html       # Vue app template and UI
├── app.js          # Vue logic, data fetching, calculations
├── styles.css      # Styling (Strava orange theme)
└── README.md       # This file
```

## Data Flow

1. App loads → fetches CSV from published Google Sheet
2. Parses CSV line-by-line with proper quote handling
3. Falls back to mock data if sheet is unavailable
4. Sorts activities by date (newest first)
5. Computes stats: totals, type breakdowns, time-period filters
6. User can filter by type and browse recent activities
7. Trends tab shows distribution and time-period comparisons

## Planned Features (Phase 2)

- ✅ **Goal Tracking**
  - Set distance, frequency, or speed goals
  - Track progress with visual indicators
  - Deep-link to sibling tools for practice
- ✅ **Enhanced Analytics**
  - Charts and graphs (weekly/monthly trends)
  - Personal records and milestones
  - Streak tracking
- ✅ **Data Export**
  - Export filtered activities as CSV
  - Generate activity reports

## Troubleshooting

### App shows "Using sample data" error
- Check that your Google Sheet is **published to the web** (File → Publish to the web)
- Verify the `sheetsUrl` in `app.js` is correct
- Ensure the sheet has all required columns
- Check browser console for CORS errors (may need sheet to be fully public)

### No activities showing
- Verify your sheet has data rows (besides headers)
- Check column names match exactly (case-sensitive)
- Look at browser console for parsing errors

### Port 9016 already in use
- Change port in launch.json or use: `python3 -m http.server 9017`

## Architecture Notes

- **Vue 3 (CDN)**: Lightweight, reactive framework for UI updates
- **DOMParser**: Used to parse HTML table from published sheets (CORS-friendly alternative to CSV export)
- **Computed properties**: Auto-recalculate stats when activities change
- **Responsive grid**: CSS Grid for stats and trends layouts

## Next Steps

1. Update `sheetsUrl` with your published Google Sheet
2. Start the server and test with mock data
3. Once verified, swap in your real data
4. In Phase 2, add goal tracking and analytics features

---

*Built for tracking exercise trends at `/health/strava`, port 9016*
