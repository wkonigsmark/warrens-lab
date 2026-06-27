const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      activities: [],
      allActivities: [],
      loading: true,
      error: null,
      activeTab: 'ytd',
      filters: {
        type: '',
        limit: 20
      },
      charts: {
        ytdDistance: null,
        ytdCumulative: null,
        ytdActivities: null,
        paceTrend: null
      },
      triatlonTypes: ['Run', 'Swim', 'Ride'],
      disciplines: ['Run', 'Swim', 'Ride'],
      selectedDiscipline: 'Run',
      selectedRunSubtype: 'all', // 'all', 'regular', 'stroller'
      // Published Google Sheet CSV URL
      csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRQeJ7KYeuApFOqd5MhVQoIVqQaE5Nc9RmJuLzLAhpCEKEWKPCX2MzyLE-jzrpF41y7sDRKHLwmXxaP/pub?gid=766949107&single=true&output=csv'
    };
  },
  computed: {
    // Filter to triathlon types only
    triathlonActivities() {
      return this.activities.filter(a => this.triatlonTypes.includes(a.type));
    },
    // Total distance in meters (triathlon only)
    totalDistance() {
      return this.triathlonActivities.reduce((sum, a) => sum + a.distance, 0);
    },
    // Total moving time in seconds (triathlon only)
    totalMovingTime() {
      return this.triathlonActivities.reduce((sum, a) => sum + a.movingTime, 0);
    },
    // Unique activity types
    activityTypes() {
      return new Set(this.triathlonActivities.map(a => a.type));
    },
    // Statistics by activity type
    typeStats() {
      const stats = new Map();
      this.triathlonActivities.forEach(activity => {
        if (!stats.has(activity.type)) {
          stats.set(activity.type, { count: 0, totalDistance: 0 });
        }
        const s = stats.get(activity.type);
        s.count++;
        s.totalDistance += activity.distance;
      });
      return stats;
    },
    // Filter activities based on selected type and limit
    filteredActivities() {
      let filtered = this.triathlonActivities;
      if (this.filters.type) {
        filtered = filtered.filter(a => a.type === this.filters.type);
      }
      return filtered.slice(0, this.filters.limit);
    },
    // Last 30 days stats
    last30Days() {
      return this.getActivityStats(30);
    },
    // Last 90 days stats
    last90Days() {
      return this.getActivityStats(90);
    },
    // Last year stats
    lastYear() {
      return this.getActivityStats(365);
    },
    // Year-to-date stats
    ytdStats() {
      const stats = {};
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const daysSinceYearStart = (now - yearStart) / (1000 * 60 * 60 * 24);
      const daysInYear = (new Date(now.getFullYear() + 1, 0, 1) - yearStart) / (1000 * 60 * 60 * 24);

      this.triatlonTypes.forEach(type => {
        const typeActivities = this.triathlonActivities.filter(a => a.type === type && new Date(a.startDate) >= yearStart);
        const totalDistance = typeActivities.reduce((sum, a) => sum + a.distance, 0);
        const milesYTD = totalDistance / 1609.34;
        const avgMiles = typeActivities.length > 0 ? milesYTD / typeActivities.length : 0;
        const projectedMiles = (milesYTD / daysSinceYearStart) * daysInYear;

        stats[type] = {
          count: typeActivities.length,
          ytdMiles: milesYTD,
          avgMiles: avgMiles,
          projectedMiles: projectedMiles
        };
      });

      return stats;
    },
    // Activities for selected discipline
    selectedDisciplineActivities() {
      return this.triathlonActivities.filter(a => a.type === this.selectedDiscipline);
    },
    // Stroller runs (runs with "w/" in name)
    strollerRuns() {
      return this.selectedDisciplineActivities.filter(a => a.type === 'Run' && a.name.toLowerCase().includes('w/'));
    },
    // Stats for selected discipline
    selectedStats() {
      const activities = this.selectedDisciplineActivities;
      const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
      const totalTime = activities.reduce((sum, a) => sum + a.movingTime, 0);
      return {
        count: activities.length,
        miles: totalDistance / 1609.34,
        hours: totalTime / 3600
      };
    },
    // Milestones for selected discipline
    milestones() {
      const milestones = [];
      const discipline = this.selectedDiscipline;
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);

      // Helper function to get activities in a time range
      const getActivitiesInRange = (days) => {
        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.selectedDisciplineActivities.filter(a => new Date(a.startDate) >= cutoffDate);
      };

      // All-time milestone
      const allTimeMiles = this.selectedStats.miles;
      const allTimeRoundNumber = Math.ceil(allTimeMiles / 1000) * 1000;
      const milesShortstOfAllTime = allTimeRoundNumber - allTimeMiles;

      milestones.push({
        title: `All-time milestone`,
        description: `${milesShortstOfAllTime.toFixed(1)} more miles to hit ${allTimeRoundNumber.toLocaleString()}!`,
        miles: allTimeMiles,
        target: allTimeRoundNumber,
        type: 'alltime',
        priority: 1
      });

      // Year-to-date milestone
      const ytdActivities = this.selectedDisciplineActivities.filter(a => new Date(a.startDate) >= yearStart);
      const ytdMiles = ytdActivities.reduce((sum, a) => sum + a.distance, 0) / 1609.34;
      const ytdRoundNumber = Math.ceil(ytdMiles / 100) * 100;
      const milesShortOfYTD = ytdRoundNumber - ytdMiles;

      if (ytdRoundNumber <= 1000) {
        milestones.push({
          title: `${now.getFullYear()} milestone`,
          description: `${milesShortOfYTD.toFixed(1)} more miles for a ${ytdRoundNumber.toLocaleString()} mile year!`,
          miles: ytdMiles,
          target: ytdRoundNumber,
          type: 'ytd',
          priority: 2
        });
      }

      // Last 365 days milestone
      const last365Activities = getActivitiesInRange(365);
      const last365Miles = last365Activities.reduce((sum, a) => sum + a.distance, 0) / 1609.34;
      const last365RoundNumber = Math.ceil(last365Miles / 100) * 100;
      const milesShortOf365 = last365RoundNumber - last365Miles;

      if (last365RoundNumber > 0) {
        milestones.push({
          title: `Last 12 months`,
          description: `${milesShortOf365.toFixed(1)} more miles for a ${last365RoundNumber.toLocaleString()} mile year!`,
          miles: last365Miles,
          target: last365RoundNumber,
          type: 'last365',
          priority: 3
        });
      }

      // Last 90 days milestone
      const last90Activities = getActivitiesInRange(90);
      const last90Miles = last90Activities.reduce((sum, a) => sum + a.distance, 0) / 1609.34;
      const last90RoundNumber = Math.ceil(last90Miles / 50) * 50;
      const milesShortOf90 = last90RoundNumber - last90Miles;

      if (last90RoundNumber > 0) {
        milestones.push({
          title: `Last 90 days`,
          description: `${milesShortOf90.toFixed(1)} more miles for a ${last90RoundNumber.toLocaleString()} mile quarter!`,
          miles: last90Miles,
          target: last90RoundNumber,
          type: 'last90',
          priority: 4
        });
      }

      // Trending pace (projection based on last 90 days)
      if (last90Activities.length > 0) {
        const daysSinceFirstActivity = last90Activities.length > 1 ?
          (new Date(last90Activities[0].startDate) - new Date(last90Activities[last90Activities.length - 1].startDate)) / (1000 * 60 * 60 * 24) : 90;
        const projectedAnnualMiles = (last90Miles / Math.max(daysSinceFirstActivity, 1)) * 365;
        const projectedRoundNumber = Math.ceil(projectedAnnualMiles / 100) * 100;

        milestones.push({
          title: `Trending pace (projected)`,
          description: `At your current pace, you're on track for ${projectedRoundNumber.toLocaleString()} miles this year!`,
          miles: last90Miles,
          target: projectedRoundNumber * (last90Miles / projectedAnnualMiles),
          type: 'trending',
          priority: 5,
          secondary: true
        });
      }

      // Stroller run milestone (for runs only)
      if (discipline === 'Run' && this.strollerRuns.length > 0) {
        const strollerMiles = this.strollerRuns.reduce((sum, a) => sum + a.distance, 0) / 1609.34;
        const strollerTarget = Math.ceil(strollerMiles / 100) * 100;
        const milesShortOfStroller = strollerTarget - strollerMiles;

        milestones.push({
          title: `Stroller runs (w/)`,
          description: `${milesShortOfStroller.toFixed(1)} more miles to break ${strollerTarget.toLocaleString()}!`,
          miles: strollerMiles,
          target: strollerTarget,
          type: 'stroller',
          priority: 6,
          secondary: true
        });
      }

      // Sort by priority
      return milestones.sort((a, b) => a.priority - b.priority);
    },
    // Trend data for pace/speed chart
    paceTrendData() {
      const discipline = this.selectedDiscipline;
      let activities = this.selectedDisciplineActivities;

      // For Run discipline, further filter by subtype
      if (discipline === 'Run') {
        if (this.selectedRunSubtype === 'regular') {
          activities = activities.filter(a => !a.name.toLowerCase().includes('w/'));
        } else if (this.selectedRunSubtype === 'stroller') {
          activities = activities.filter(a => a.name.toLowerCase().includes('w/'));
        }
      }

      if (discipline === 'Run' || discipline === 'Swim') {
        return this.getMovingAverageTrendData(activities, discipline);
      } else if (discipline === 'Ride') {
        return this.getMovingAverageSpeedTrendData(activities);
      }
      return null;
    },

    // Tomorrow's Workout Recommendation
    tomorrowsRecommendation() {
      if (this.activities.length < 5) return null;

      const now = new Date();
      const last14Days = new Date(now);
      last14Days.setDate(last14Days.getDate() - 14);

      // Get activities from last 14 days
      const recentActivities = this.activities.filter(a => new Date(a.startDate) >= last14Days);

      if (recentActivities.length === 0) return null;

      // Count activities by discipline
      const disciplineCounts = {};
      const lastActivityDate = {};

      this.triatlonTypes.forEach(type => {
        disciplineCounts[type] = 0;
        lastActivityDate[type] = null;
      });

      recentActivities.forEach(a => {
        if (this.triatlonTypes.includes(a.type)) {
          disciplineCounts[a.type]++;
          if (!lastActivityDate[a.type]) {
            lastActivityDate[a.type] = new Date(a.startDate);
          }
        }
      });

      // Calculate days since last activity
      const daysSinceLast = {};
      this.triatlonTypes.forEach(type => {
        if (lastActivityDate[type]) {
          daysSinceLast[type] = Math.floor((now - lastActivityDate[type]) / (1000 * 60 * 60 * 24));
        } else {
          daysSinceLast[type] = 999; // Never done
        }
      });

      // Find most overdue discipline
      const mostOverdue = Object.keys(daysSinceLast).reduce((prev, curr) =>
        daysSinceLast[curr] > daysSinceLast[prev] ? curr : prev
      );

      // Get averages for recommended discipline
      const disciplineActivities = this.triathlonActivities.filter(a => a.type === mostOverdue);
      const avgDistance = disciplineActivities.length > 0 ?
        (disciplineActivities.reduce((sum, a) => sum + a.distance, 0) / disciplineActivities.length) : 0;

      let suggestedDistance = avgDistance;
      let intensity = 'moderate';

      // Determine intensity based on recent pattern
      const recentIntensity = recentActivities.length > 0 ?
        recentActivities.slice(0, 3).reduce((sum, a) => sum + a.movingTime, 0) / 3 : 0;

      if (daysSinceLast[mostOverdue] > 7) {
        intensity = 'moderate'; // They're due for it, don't go too hard
      } else if (recentIntensity > 3600) {
        intensity = 'easy'; // They've been working hard, take it easy
      } else {
        intensity = 'moderate';
      }

      // Format distance based on type
      let distanceDisplay = '';
      let distanceReason = '';

      if (mostOverdue === 'Run') {
        const miles = suggestedDistance / 1609.34;
        distanceDisplay = `${miles.toFixed(1)} miles`;
        const avgMilesPerRun = (disciplineActivities.reduce((sum, a) => sum + a.distance, 0) / 1609.34) / (disciplineActivities.length || 1);
        distanceReason = `Based on your recent average of ${avgMilesPerRun.toFixed(1)} mi/run`;
      } else if (mostOverdue === 'Swim') {
        const miles = suggestedDistance / 1609.34;
        distanceDisplay = `${miles.toFixed(1)} miles`;
        distanceReason = `Your consistent swim distance`;
      } else if (mostOverdue === 'Ride') {
        const miles = suggestedDistance / 1609.34;
        distanceDisplay = `${miles.toFixed(1)} miles`;
        distanceReason = `Based on your typical ride distance`;
      }

      return {
        discipline: mostOverdue,
        distance: suggestedDistance,
        distanceDisplay: distanceDisplay,
        distanceReason: distanceReason,
        intensity: intensity,
        daysSinceLast: daysSinceLast[mostOverdue],
        emoji: this.getDisciplineEmoji(mostOverdue),
        reason: this.getRecommendationReason(mostOverdue, daysSinceLast[mostOverdue], intensity)
      };
    },

    // Get a friendly reason for the recommendation
    getRecommendationReason(discipline, daysSinceLast, intensity) {
      if (daysSinceLast > 10) {
        return `You haven't done ${discipline} in ${daysSinceLast} days — time to get back to it!`;
      } else if (daysSinceLast > 6) {
        return `Good time for ${discipline} — ${daysSinceLast} days since your last one`;
      } else if (intensity === 'easy') {
        return `Keep it easy today — you've been pushing hard lately`;
      } else {
        return `Well-balanced — this completes your weekly mix`;
      }
    },

    // Pace/Speed metrics for selected discipline
    paceMetrics() {
      const discipline = this.selectedDiscipline;
      let activities = this.selectedDisciplineActivities;

      // For Run discipline, further filter by subtype
      if (discipline === 'Run') {
        if (this.selectedRunSubtype === 'regular') {
          activities = activities.filter(a => !a.name.toLowerCase().includes('w/'));
        } else if (this.selectedRunSubtype === 'stroller') {
          activities = activities.filter(a => a.name.toLowerCase().includes('w/'));
        }
        // 'all' includes both
      }

      if (activities.length === 0) {
        return null;
      }

      if (discipline === 'Run') {
        // Calculate 6-month moving averages
        const current6mAvg = this.calculateMovingAverage(activities, 'Run', 6);
        const best6mAvg = this.findBestMovingAverage(activities, 'Run', 6);
        const trend = this.calculateTrend(current6mAvg, best6mAvg);

        return {
          type: 'pace',
          current: current6mAvg ? this.formatPaceSeconds(current6mAvg, 'Run') : 'N/A',
          currentSeconds: current6mAvg,
          best: best6mAvg ? this.formatPaceSeconds(best6mAvg, 'Run') : 'N/A',
          bestSeconds: best6mAvg,
          label: '6-Month Avg Pace',
          trend: trend,
          trendEmoji: trend === 'faster' ? '⚡' : trend === 'slower' ? '📉' : '→'
        };
      } else if (discipline === 'Ride') {
        // Calculate 6-month moving averages
        const current6mAvg = this.calculateMovingAverageSpeed(activities, 6);
        const best6mAvg = this.findBestMovingAverageSpeed(activities, 6);
        const trend = this.calculateTrend(current6mAvg, best6mAvg);

        return {
          type: 'speed',
          current: current6mAvg ? `${current6mAvg.toFixed(1)} mph` : 'N/A',
          currentMPH: current6mAvg,
          best: best6mAvg ? `${best6mAvg.toFixed(1)} mph` : 'N/A',
          bestMPH: best6mAvg,
          label: '6-Month Avg Speed',
          trend: trend,
          trendEmoji: trend === 'faster' ? '⚡' : trend === 'slower' ? '📉' : '→'
        };
      } else if (discipline === 'Swim') {
        // Calculate 6-month moving averages
        const current6mAvg = this.calculateMovingAverage(activities, 'Swim', 6);
        const best6mAvg = this.findBestMovingAverage(activities, 'Swim', 6);
        const trend = this.calculateTrend(current6mAvg, best6mAvg);

        return {
          type: 'pace',
          current: current6mAvg ? this.formatPaceSeconds(current6mAvg, 'Swim') : 'N/A',
          currentSeconds: current6mAvg,
          best: best6mAvg ? this.formatPaceSeconds(best6mAvg, 'Swim') : 'N/A',
          bestSeconds: best6mAvg,
          label: '6-Month Avg Pace',
          trend: trend,
          trendEmoji: trend === 'faster' ? '⚡' : trend === 'slower' ? '📉' : '→'
        };
      }

      return null;
    }
  },
  methods: {
    async fetchAndParseData() {
      try {
        this.loading = true;
        this.error = null;

        // Fetch CSV from Google Sheets
        const response = await fetch(this.csvUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();

        // Parse CSV
        this.allActivities = this.parseCSV(csvText);

        if (this.allActivities.length === 0) {
          // Fallback to mock data if parsing fails
          this.allActivities = this.getMockData();
          this.error = 'Using sample data. Please check that the Google Sheet is publicly accessible.';
        }

        // Filter to triathlon types
        this.activities = this.allActivities.filter(a => this.triatlonTypes.includes(a.type));

        // Sort by date, most recent first
        this.activities.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        this.loading = false;
      } catch (err) {
        // Use mock data on error
        this.activities = this.getMockData();
        this.error = 'Using sample data. Check the Google Sheet URL and ensure it\'s publicly shared.';
        this.loading = false;
        console.error('Data fetch error:', err);
      }
    },

    parseCSV(csvText) {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return [];

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim());

      // Find column indices
      const idIdx = headers.findIndex(h => h === 'ID');
      const nameIdx = headers.findIndex(h => h === 'Name');
      const typeIdx = headers.findIndex(h => h === 'Type');
      const distanceIdx = headers.findIndex(h => h.includes('Distance'));
      const timeIdx = headers.findIndex(h => h.includes('Moving Time'));
      const elevIdx = headers.findIndex(h => h.includes('Elev'));
      const dateIdx = headers.findIndex(h => h.includes('Start Date'));

      const activities = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted fields in CSV
        const fields = this.parseCSVLine(line);

        if (idIdx >= 0 && fields[idIdx]) {
          activities.push({
            id: fields[idIdx],
            name: fields[nameIdx] || 'Activity',
            type: fields[typeIdx] || 'Unknown',
            distance: parseFloat(fields[distanceIdx]) || 0,
            movingTime: parseFloat(fields[timeIdx]) || 0,
            elevationGain: parseFloat(fields[elevIdx]) || 0,
            startDate: fields[dateIdx] || new Date().toISOString()
          });
        }
      }

      return activities;
    },

    parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    },

    getMockData() {
      return [
        {
          id: '472465439',
          name: 'Morning Run',
          type: 'Run',
          distance: 11411.7,
          movingTime: 4443,
          elevationGain: 32.5,
          startDate: '2016-01-17T14:39:02Z'
        },
        {
          id: '480748378',
          name: 'Afternoon Run',
          type: 'Run',
          distance: 10126.5,
          movingTime: 3388,
          elevationGain: 28.6,
          startDate: '2016-01-28T21:05:26Z'
        },
        {
          id: '482762077',
          name: 'Morning Run',
          type: 'Run',
          distance: 10145.5,
          movingTime: 3172,
          elevationGain: 28.9,
          startDate: '2016-01-31T13:47:07Z'
        },
        {
          id: '487100910',
          name: 'Morning Run',
          type: 'Run',
          distance: 12896.3,
          movingTime: 4152,
          elevationGain: 40.8,
          startDate: '2016-02-06T11:47:56Z'
        },
        {
          id: '497793623',
          name: 'Morning Run',
          type: 'Run',
          distance: 10128.7,
          movingTime: 3190,
          elevationGain: 28,
          startDate: '2016-02-20T12:51:42Z'
        }
      ];
    },



    getActivityStats(days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filtered = this.activities.filter(a => {
        const actDate = new Date(a.startDate);
        return actDate >= cutoffDate;
      });

      return {
        count: filtered.length,
        distance: filtered.reduce((sum, a) => sum + a.distance, 0)
      };
    },

    getDisciplineEmoji(discipline) {
      const emojis = {
        Run: '🏃',
        Swim: '🏊',
        Ride: '🚴'
      };
      return emojis[discipline] || '⚽';
    },

    // Calculate pace in seconds for an activity
    calculateActivityPace(activity, discipline) {
      if (discipline === 'Run' || discipline === 'Swim') {
        const miles = discipline === 'Run' ?
          activity.distance / 1609.34 :
          (activity.distance / 0.9144) / 100; // yards to 100-yard increments
        return activity.movingTime / miles;
      }
      return null;
    },

    // Detect outliers using IQR method
    detectOutliers(paces) {
      if (paces.length < 4) return []; // Need at least 4 points for quartiles

      const sorted = [...paces].sort((a, b) => a - b);
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);

      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      const iqr = q3 - q1;

      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      return paces.filter(pace => pace < lowerBound || pace > upperBound);
    },

    // Get activities with outliers removed
    getActivitiesWithoutOutliers(activities, discipline) {
      const paces = activities.map(a => this.calculateActivityPace(a, discipline)).filter(p => p !== null);
      const outliers = this.detectOutliers(paces);

      if (outliers.length === 0) return activities;

      return activities.filter(a => {
        const pace = this.calculateActivityPace(a, discipline);
        return !outliers.includes(pace);
      });
    },

    // Calculate moving average over last N months
    calculateMovingAverage(activities, discipline, months = 6) {
      if (activities.length === 0) return null;

      // Remove outliers for moving average calculation
      const cleanActivities = this.getActivitiesWithoutOutliers(activities, discipline);
      if (cleanActivities.length === 0) return null;

      // Sort by date
      const sorted = [...cleanActivities].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      const now = new Date();
      const cutoffDate = new Date(now);
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const recentActivities = sorted.filter(a => new Date(a.startDate) >= cutoffDate);

      if (recentActivities.length === 0) return null;

      const totalSeconds = recentActivities.reduce((sum, a) => sum + a.movingTime, 0);
      let totalUnits = 0;

      if (discipline === 'Run') {
        totalUnits = recentActivities.reduce((sum, a) => sum + (a.distance / 1609.34), 0);
      } else if (discipline === 'Swim') {
        totalUnits = recentActivities.reduce((sum, a) => sum + ((a.distance / 0.9144) / 100), 0);
      }

      return totalUnits > 0 ? totalSeconds / totalUnits : null;
    },

    // Find the best (fastest) N-month average ever
    findBestMovingAverage(activities, discipline, months = 6) {
      if (activities.length === 0) return null;

      const cleanActivities = this.getActivitiesWithoutOutliers(activities, discipline);
      if (cleanActivities.length === 0) return null;

      const sorted = [...cleanActivities].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      let bestAverage = Infinity;
      const windowMs = months * 30 * 24 * 60 * 60 * 1000; // Approximate month length

      for (let i = 0; i < sorted.length; i++) {
        const windowStart = new Date(sorted[i].startDate);
        const windowEnd = new Date(windowStart);
        windowEnd.setMonth(windowEnd.getMonth() + months);

        const windowActivities = sorted.filter(a => {
          const date = new Date(a.startDate);
          return date >= windowStart && date <= windowEnd;
        });

        if (windowActivities.length > 0) {
          const totalSeconds = windowActivities.reduce((sum, a) => sum + a.movingTime, 0);
          let totalUnits = 0;

          if (discipline === 'Run') {
            totalUnits = windowActivities.reduce((sum, a) => sum + (a.distance / 1609.34), 0);
          } else if (discipline === 'Swim') {
            totalUnits = windowActivities.reduce((sum, a) => sum + ((a.distance / 0.9144) / 100), 0);
          }

          if (totalUnits > 0) {
            const average = totalSeconds / totalUnits;
            bestAverage = Math.min(bestAverage, average);
          }
        }
      }

      return bestAverage !== Infinity ? bestAverage : null;
    },

    // Format pace seconds to string
    formatPaceSeconds(seconds, discipline) {
      if (discipline === 'Run') {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}/mi`;
      } else if (discipline === 'Swim') {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}/100yd`;
      }
      return '';
    },

    // Determine trend (faster or slower)
    calculateTrend(current, best) {
      if (!current || !best) return null;
      const improvement = ((best - current) / best) * 100;
      if (Math.abs(improvement) < 1) return 'stable';
      return improvement > 0 ? 'slower' : 'faster';
    },

    // Get moving average trend data for charting
    getMovingAverageTrendData(activities, discipline) {
      if (activities.length < 12) return null; // Need at least 12 activities to show trend

      const cleanActivities = this.getActivitiesWithoutOutliers(activities, discipline);
      if (cleanActivities.length === 0) return null;

      const sorted = [...cleanActivities].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      const trendData = [];
      const now = new Date();

      // Calculate 6-month average for each month going back
      for (let monthsBack = 0; monthsBack < 24; monthsBack++) {
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() - monthsBack);

        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 6);

        const windowActivities = sorted.filter(a => {
          const date = new Date(a.startDate);
          return date >= startDate && date <= endDate;
        });

        if (windowActivities.length > 0) {
          const totalSeconds = windowActivities.reduce((sum, a) => sum + a.movingTime, 0);
          let totalUnits = 0;

          if (discipline === 'Run') {
            totalUnits = windowActivities.reduce((sum, a) => sum + (a.distance / 1609.34), 0);
          } else if (discipline === 'Swim') {
            totalUnits = windowActivities.reduce((sum, a) => sum + ((a.distance / 0.9144) / 100), 0);
          }

          if (totalUnits > 0) {
            const avgPaceSeconds = totalSeconds / totalUnits;
            const monthLabel = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            trendData.unshift({
              month: monthLabel,
              pace: avgPaceSeconds,
              paceFormatted: this.formatPaceSeconds(avgPaceSeconds, discipline)
            });
          }
        }
      }

      return trendData.length > 0 ? trendData : null;
    },

    // Get moving average speed trend data for Bike (in mph)
    getMovingAverageSpeedTrendData(activities) {
      if (activities.length < 5) return null;

      const trendData = [];
      const now = new Date();

      // Calculate average speed for each month going back
      for (let monthsBack = 0; monthsBack < 24; monthsBack++) {
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() - monthsBack);

        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 6);

        const windowActivities = activities.filter(a => {
          const date = new Date(a.startDate);
          return date >= startDate && date <= endDate;
        });

        if (windowActivities.length > 0) {
          const totalMiles = windowActivities.reduce((sum, a) => sum + (a.distance / 1609.34), 0);
          const totalHours = windowActivities.reduce((sum, a) => sum + (a.movingTime / 3600), 0);
          const avgSpeed = totalMiles / totalHours;
          const monthLabel = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          trendData.unshift({
            month: monthLabel,
            speed: avgSpeed,
            speedFormatted: `${avgSpeed.toFixed(1)} mph`
          });
        }
      }

      return trendData.length > 0 ? trendData : null;
    },

    // Calculate moving average speed for Bike (last N months)
    calculateMovingAverageSpeed(activities, months = 6) {
      if (activities.length === 0) return null;

      const now = new Date();
      const cutoffDate = new Date(now);
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const recentActivities = activities.filter(a => new Date(a.startDate) >= cutoffDate);

      if (recentActivities.length === 0) return null;

      const totalMiles = recentActivities.reduce((sum, a) => sum + (a.distance / 1609.34), 0);
      const totalHours = recentActivities.reduce((sum, a) => sum + (a.movingTime / 3600), 0);

      return totalHours > 0 ? totalMiles / totalHours : null;
    },

    // Find the best (fastest) N-month average speed ever
    findBestMovingAverageSpeed(activities, months = 6) {
      if (activities.length === 0) return null;

      const sorted = [...activities].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      let bestSpeed = 0;

      for (let i = 0; i < sorted.length; i++) {
        const windowStart = new Date(sorted[i].startDate);
        const windowEnd = new Date(windowStart);
        windowEnd.setMonth(windowEnd.getMonth() + months);

        const windowActivities = sorted.filter(a => {
          const date = new Date(a.startDate);
          return date >= windowStart && date <= windowEnd;
        });

        if (windowActivities.length > 0) {
          const totalMiles = windowActivities.reduce((sum, a) => sum + (a.distance / 1609.34), 0);
          const totalHours = windowActivities.reduce((sum, a) => sum + (a.movingTime / 3600), 0);

          if (totalHours > 0) {
            const speed = totalMiles / totalHours;
            bestSpeed = Math.max(bestSpeed, speed);
          }
        }
      }

      return bestSpeed > 0 ? bestSpeed : null;
    },

    formatTabName(tab) {
      const names = {
        recent: '📅 Recent',
        ytd: '📈 YTD Progress',
        trends: '📊 Trends',
        goals: '🎯 Goals'
      };
      return names[tab] || tab;
    },

    formatRunSubtype(subtype) {
      const names = {
        all: 'All Runs',
        regular: 'Regular Runs',
        stroller: 'Stroller Runs (w/)'
      };
      return names[subtype] || subtype;
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    formatSeconds(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    },

    formatHours(seconds) {
      const hours = seconds / 3600;
      return `${hours.toFixed(1)}h`;
    },

    calculatePace(distance, movingTime) {
      if (distance === 0 || movingTime === 0) return '0:00/mi';
      const miles = distance / 1609.34;
      const paceSeconds = (movingTime / miles);
      const minutes = Math.floor(paceSeconds / 60);
      const seconds = Math.floor(paceSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}/mi`;
    },

    metersToMiles(meters) {
      return (meters / 1609.34).toFixed(2);
    },

    renderYTDCharts() {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);

      // Get YTD activities for each type
      const ytdByType = {};
      this.triatlonTypes.forEach(type => {
        ytdByType[type] = this.triathlonActivities.filter(a =>
          a.type === type && new Date(a.startDate) >= yearStart
        );
      });

      // Chart 1: Distance by Discipline (Bar chart)
      this.renderDistanceChart(ytdByType);

      // Chart 2: Cumulative Distance Over Time (Line chart)
      this.renderCumulativeChart(ytdByType);

      // Chart 3: Activities by Discipline (Bar chart)
      this.renderActivitiesChart(ytdByType);
    },

    renderDistanceChart(ytdByType) {
      const ctx = document.getElementById('ytd-distance-chart');
      if (!ctx) return;

      const labels = this.triatlonTypes;
      const ytdMiles = labels.map(type => {
        const distance = ytdByType[type].reduce((sum, a) => sum + a.distance, 0);
        return (distance / 1609.34);
      });
      const projectedMiles = labels.map(type => {
        const stat = this.ytdStats[type];
        return stat.projectedMiles;
      });

      if (this.charts.ytdDistance) this.charts.ytdDistance.destroy();

      this.charts.ytdDistance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Year-to-Date (mi)',
              data: ytdMiles,
              backgroundColor: '#fc5200',
              borderRadius: 4
            },
            {
              label: 'Projected Year-End (mi)',
              data: projectedMiles,
              backgroundColor: '#ffb3a0',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value + ' mi';
                }
              }
            }
          }
        }
      });
    },

    renderCumulativeChart(ytdByType) {
      const ctx = document.getElementById('ytd-cumulative-chart');
      if (!ctx) return;

      // Get all YTD activities sorted by date
      const ytdActivities = this.triathlonActivities.filter(a => {
        const actDate = new Date(a.startDate);
        return actDate >= new Date(new Date().getFullYear(), 0, 1);
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      // Build cumulative data by type
      const cumulativeByType = {};
      this.triatlonTypes.forEach(type => {
        cumulativeByType[type] = [];
      });

      let cumulativeByTypeTotal = {};
      this.triatlonTypes.forEach(type => {
        cumulativeByTypeTotal[type] = 0;
      });

      ytdActivities.forEach(activity => {
        cumulativeByTypeTotal[activity.type] += activity.distance / 1609.34;
        const date = new Date(activity.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        cumulativeByType[activity.type].push({
          date,
          cumulative: cumulativeByTypeTotal[activity.type]
        });
      });

      // Get all unique dates
      const allDates = [...new Set(ytdActivities.map(a => new Date(a.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))];

      // Build datasets
      const datasets = [];
      const colors = { Run: '#fc5200', Swim: '#2196F3', Ride: '#4CAF50' };

      this.triatlonTypes.forEach(type => {
        const dataPoints = allDates.map(date => {
          const entry = cumulativeByType[type].find(d => d.date === date);
          return entry ? entry.cumulative : null;
        });

        // Fill in missing values (forward fill)
        let lastValue = 0;
        for (let i = 0; i < dataPoints.length; i++) {
          if (dataPoints[i] !== null) {
            lastValue = dataPoints[i];
          } else {
            dataPoints[i] = lastValue;
          }
        }

        datasets.push({
          label: type,
          data: dataPoints,
          borderColor: colors[type],
          backgroundColor: colors[type] + '20',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        });
      });

      if (this.charts.ytdCumulative) this.charts.ytdCumulative.destroy();

      this.charts.ytdCumulative = new Chart(ctx, {
        type: 'line',
        data: {
          labels: allDates,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value + ' mi';
                }
              }
            }
          }
        }
      });
    },

    renderActivitiesChart(ytdByType) {
      const ctx = document.getElementById('ytd-activities-chart');
      if (!ctx) return;

      const labels = this.triatlonTypes;
      const activityCounts = labels.map(type => ytdByType[type].length);
      const colors = { Run: '#fc5200', Swim: '#2196F3', Ride: '#4CAF50' };

      if (this.charts.ytdActivities) this.charts.ytdActivities.destroy();

      this.charts.ytdActivities = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Activity Count',
              data: activityCounts,
              backgroundColor: labels.map(type => colors[type]),
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    },

    renderPaceTrendChart() {
      const ctx = document.getElementById('pace-trend-chart');
      if (!ctx || !this.paceTrendData) return;

      const trendData = this.paceTrendData;
      const labels = trendData.map(d => d.month);
      const discipline = this.selectedDiscipline;

      if (this.charts.paceTrend) this.charts.paceTrend.destroy();

      if (discipline === 'Ride') {
        // Speed chart for Bike
        const speeds = trendData.map(d => d.speed);

        this.charts.paceTrend = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: '6-Month Average Speed',
                data: speeds,
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF50' + '20',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  callback: function(value) {
                    return `${value.toFixed(1)} mph`;
                  }
                }
              }
            }
          }
        });
      } else {
        // Pace chart for Run/Swim
        const paces = trendData.map(d => d.pace);
        const paceMinutes = paces.map(p => p / 60);

        this.charts.paceTrend = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: '6-Month Average Pace',
                data: paceMinutes,
                borderColor: '#fc5200',
                backgroundColor: '#fc5200' + '20',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fc5200',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  callback: function(value) {
                    const min = Math.floor(value);
                    const sec = Math.round((value - min) * 60);
                    return `${min}:${sec.toString().padStart(2, '0')}`;
                  }
                }
              }
            }
          }
        });
      }
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'ytd') {
        this.$nextTick(() => {
          this.renderYTDCharts();
        });
      }
    },
    selectedDiscipline() {
      this.$nextTick(() => {
        this.renderPaceTrendChart();
      });
    },
    selectedRunSubtype() {
      this.$nextTick(() => {
        this.renderPaceTrendChart();
      });
    }
  },
  mounted() {
    this.fetchAndParseData();
  },

  updated() {
    if (this.activeTab === 'ytd' && this.activities.length > 0) {
      this.renderYTDCharts();
    }
    // Pace trend chart renders via watch, not updated hook to avoid infinite loops
  }
});

app.mount('#app');
