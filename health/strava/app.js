const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      activities: [],
      loading: true,
      error: null,
      activeTab: 'recent',
      filters: {
        type: '',
        limit: 20
      },
      // Published Google Sheet URL
      sheetsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRQeJ7KYeuApFOqd5MhVQoIVqQaE5Nc9RmJuLzLAhpCEKEWKPCX2MzyLE-jzrpF41y7sDRKHLwmXxaP/pubhtml?gid=766949107&single=true'
    };
  },
  computed: {
    // Total distance in meters
    totalDistance() {
      return this.activities.reduce((sum, a) => sum + a.distance, 0);
    },
    // Total moving time in seconds
    totalMovingTime() {
      return this.activities.reduce((sum, a) => sum + a.movingTime, 0);
    },
    // Unique activity types
    activityTypes() {
      return new Set(this.activities.map(a => a.type));
    },
    // Statistics by activity type
    typeStats() {
      const stats = new Map();
      this.activities.forEach(activity => {
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
      let filtered = this.activities;
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
    }
  },
  methods: {
    async fetchAndParseData() {
      try {
        this.loading = true;
        this.error = null;

        // Try to fetch from Google Sheets
        const response = await fetch(this.sheetsUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlText = await response.text();

        // Parse HTML table
        this.activities = this.parseHTMLTable(htmlText);

        if (this.activities.length === 0) {
          // Fallback to mock data if parsing fails
          this.activities = this.getMockData();
          this.error = 'Using sample data. Please check that the Google Sheet is publicly accessible.';
        }

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

    parseHTMLTable(htmlText) {
      // Parse the HTML table from Google Sheets published page
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const activities = [];

      // Try to find the table
      const table = doc.querySelector('table');
      if (!table) {
        console.warn('No table found in HTML');
        return activities;
      }

      const rows = table.querySelectorAll('tr');
      if (rows.length < 2) return activities;

      // Parse header row
      const headerCells = rows[0].querySelectorAll('th, td');
      const headers = Array.from(headerCells).map(cell => cell.textContent.trim());

      // Find column indices
      const idIdx = headers.findIndex(h => h === 'ID');
      const nameIdx = headers.findIndex(h => h === 'Name');
      const typeIdx = headers.findIndex(h => h === 'Type');
      const distanceIdx = headers.findIndex(h => h.includes('Distance'));
      const timeIdx = headers.findIndex(h => h.includes('Moving Time'));
      const elevIdx = headers.findIndex(h => h.includes('Elev'));
      const dateIdx = headers.findIndex(h => h.includes('Start Date'));

      // Parse data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length === 0) continue;

        const row = Array.from(cells).map(cell => cell.textContent.trim());

        if (idIdx >= 0 && row[idIdx]) {
          activities.push({
            id: row[idIdx],
            name: row[nameIdx] || 'Activity',
            type: row[typeIdx] || 'Unknown',
            distance: parseFloat(row[distanceIdx]) || 0,
            movingTime: parseFloat(row[timeIdx]) || 0,
            elevationGain: parseFloat(row[elevIdx]) || 0,
            startDate: row[dateIdx] || new Date().toISOString()
          });
        }
      }

      return activities;
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

    formatTabName(tab) {
      const names = {
        recent: '📅 Recent',
        trends: '📈 Trends',
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
      if (distance === 0 || movingTime === 0) return '0m/km';
      const paceSeconds = (movingTime / distance) * 1000;
      const minutes = Math.floor(paceSeconds / 60);
      const seconds = Math.floor(paceSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    }
  },
  mounted() {
    this.fetchAndParseData();
  }
});

app.mount('#app');
