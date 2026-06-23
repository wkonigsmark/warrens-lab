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
        ytdActivities: null
      },
      triatlonTypes: ['Run', 'Swim', 'Ride'],
      disciplines: ['Run', 'Swim', 'Ride'],
      selectedDiscipline: 'Run',
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

      // All-time milestone
      const allTimeMiles = this.selectedStats.miles;
      const allTimeRoundNumber = Math.ceil(allTimeMiles / 1000) * 1000;
      const milesShortstOfAllTime = allTimeRoundNumber - allTimeMiles;

      milestones.push({
        title: `All-time milestone`,
        description: `${milesShortstOfAllTime.toFixed(1)} more miles to hit ${allTimeRoundNumber.toLocaleString()}!`,
        miles: allTimeMiles,
        target: allTimeRoundNumber,
        type: 'alltime'
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
          type: 'ytd'
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
          secondary: true
        });
      }

      return milestones;
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

    formatTabName(tab) {
      const names = {
        recent: '📅 Recent',
        ytd: '📈 YTD Progress',
        trends: '📊 Trends',
        goals: '🎯 Goals'
      };
      return names[tab] || tab;
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
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'ytd') {
        this.$nextTick(() => {
          this.renderYTDCharts();
        });
      }
    }
  },
  mounted() {
    this.fetchAndParseData();
  },

  updated() {
    if (this.activeTab === 'ytd' && this.activities.length > 0) {
      this.renderYTDCharts();
    }
  }
});

app.mount('#app');
