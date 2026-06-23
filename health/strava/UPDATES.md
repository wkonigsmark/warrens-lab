# Strava Tracker Updates

## Latest Changes

### 1. ✅ Triathlon Disciplines Only
- App now filters to **Run, Swim, Bike** only
- Other activity types are hidden from all views
- All stats focus on these 3 primary sports

### 2. ✅ Miles & Pace Conversion
- All distances converted from meters → **miles**
- Pace converted from `/km` → **`/mi`** format
- Examples:
  - 10,000m = 6.21 miles
  - Pace: 5:30/mi

### 3. ✅ New "YTD Progress" Tab
Major new feature with 3 compelling visual charts:

**Chart 1: Distance by Discipline**
- Bar chart showing year-to-date miles for each discipline
- Comparison: actual YTD vs. **projected year-end** based on current pace
- Example: If you've run 500 mi YTD on pace for 1000 mi projected year-end

**Chart 2: Cumulative Distance Over Time**
- Line chart showing running total for each discipline
- Tracks progress through the year
- Helps identify trends and patterns

**Chart 3: Activities by Discipline**
- Bar chart showing activity count per discipline
- Includes average distance per activity
- Shows consistency across sports

### 4. ✅ YTD Statistics
Below each chart, stats cards show:
- **Run/Swim/Bike** (labeled by discipline)
- **YTD**: Year-to-date total
- **Projected**: End-of-year projection
- **Count**: Number of activities
- **Avg Distance**: Average distance per activity

### 5. ✅ Automatic Chart Rendering
- Charts render automatically when YTD tab is selected
- Charts update when data changes
- Responsive design works on all screen sizes

## Technical Details

### Dependencies Added
- Chart.js (via CDN) for visualization

### Data Processing
- Filters all activities to triathlon types (Run, Swim, Bike)
- Calculates YTD stats: count, distance, average, projections
- Projects year-end totals using: `(YTD miles / days elapsed) × 365`

### New Computed Properties
- `triathlonActivities` - filtered activities
- `ytdStats` - year-to-date breakdown by discipline

### New Methods
- `renderYTDCharts()` - main chart orchestrator
- `renderDistanceChart()` - YTD vs projected bar chart
- `renderCumulativeChart()` - cumulative line chart
- `renderActivitiesChart()` - activity count chart

## How to Use

1. **Go to YTD Progress tab** (📈 YTD Progress button)
2. **See your year-to-date numbers** for each discipline
3. **Check projections** to see where you're headed by year-end
4. **Monitor progress** with cumulative distance chart
5. **Compare activity counts** to stay balanced across sports

## Example Data

If your Strava shows:
- 50 runs, 500 miles YTD
- 20 swims, 50 miles YTD  
- 30 bikes, 450 miles YTD

The charts will display:
- Each discipline's progress visually
- Projected totals (run 1000mi, swim 100mi, bike 900mi by year-end)
- How each discipline has grown over the year

## Next Phase

Future enhancements could include:
- Goal setting (set a target, track vs goal)
- Week-over-week comparisons
- Personal records by discipline
- Streak tracking
- Export reports

---

**To test:** Open http://localhost:9016 and click the "📈 YTD Progress" tab
