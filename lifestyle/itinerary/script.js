const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnn-ryUB3WMrrfbKgYXl6Ux6zuONmPmdTAhmKyS2blsuxYW-Gbg-un9pB4OD0_l3rrZfCEBOwk3-bN/pub?gid=0&single=true&output=csv';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const HEADERS = ['Date', 'Time', 'Activities', 'Breakfast', 'Lunch', 'Dinner'];

let allDays = [];

async function fetchAndParse() {
  try {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';

    const response = await fetch(CSV_URL);
    const text = await response.text();
    const rows = parseCSV(text);

    // Parse rows into day objects
    const days = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] || row[0].trim() === '') continue; // Skip empty rows

      days.push({
        date: row[0].trim(),
        time: row[1] ? row[1].trim() : '',
        activities: row[2] ? row[2].trim() : '',
        breakfast: row[3] ? row[3].trim() : '',
        lunch: row[4] ? row[4].trim() : '',
        dinner: row[5] ? row[5].trim() : '',
      });
    }

    // Fill gaps with empty date rows
    allDays = fillDateGaps(days);

    // Render both views
    renderCardView();
    renderTableView();
    scrollToToday();

    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = 'Failed to load itinerary. Retrying...';
    document.getElementById('loading').style.display = 'none';
  }
}

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let insideQuotes = false;
  let currentField = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      }
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function fillDateGaps(days) {
  if (days.length === 0) return days;

  const filled = [days[0]];

  for (let i = 1; i < days.length; i++) {
    const prevDate = new Date(days[i - 1].date);
    const currDate = new Date(days[i].date);
    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    // Fill gaps
    for (let j = 1; j < daysDiff; j++) {
      const gapDate = new Date(prevDate);
      gapDate.setDate(gapDate.getDate() + j);
      filled.push({
        date: formatDateFromDate(gapDate),
        time: '',
        activities: '',
        breakfast: '',
        lunch: '',
        dinner: '',
      });
    }

    filled.push(days[i]);
  }

  return filled;
}

function formatDateFromDate(date) {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function parseDate(dateStr) {
  // Handle "Saturday, Jun 27" format - add current year
  const currentYear = new Date().getFullYear();
  return new Date(dateStr + ', ' + currentYear);
}

function isToday(dateStr) {
  const date = parseDate(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isPast(dateStr) {
  const date = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function renderCardView() {
  const upcomingContainer = document.getElementById('upcomingDates');
  upcomingContainer.innerHTML = '';

  const futureDays = allDays.filter(day => !isPast(day.date));

  futureDays.forEach(day => {
    upcomingContainer.appendChild(createDayCard(day, false));
  });
}

function createDayCard(day, isPastDate) {
  const card = document.createElement('div');
  card.className = 'day-card';
  if (isPastDate) card.classList.add('past');
  if (isToday(day.date)) card.classList.add('today');
  if (isToday(day.date)) card.id = 'today-card';

  card.innerHTML = `
    <div class="card-date">${day.date}</div>
    ${day.time ? `<div class="card-section"><div class="card-section-label">Time</div><div class="card-section-content">${day.time}</div></div>` : ''}
    ${day.activities ? `<div class="card-section"><div class="card-section-label">Activities</div><div class="card-section-content">${day.activities}</div></div>` : ''}
    ${day.breakfast ? `<div class="card-section"><div class="card-section-label">Breakfast</div><div class="card-section-content">${day.breakfast}</div></div>` : ''}
    ${day.lunch ? `<div class="card-section"><div class="card-section-label">Lunch</div><div class="card-section-content">${day.lunch}</div></div>` : ''}
    ${day.dinner ? `<div class="card-section"><div class="card-section-label">Dinner</div><div class="card-section-content">${day.dinner}</div></div>` : ''}
  `;

  return card;
}

function renderTableView() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  const futureDays = allDays.filter(day => !isPast(day.date));

  futureDays.forEach(day => {
    const row = document.createElement('tr');
    if (isToday(day.date)) {
      row.classList.add('today');
      row.id = 'today-row';
    }

    row.innerHTML = `
      <td>${day.date}</td>
      <td>${day.time || ''}</td>
      <td>${day.activities || ''}</td>
      <td>${day.breakfast || ''}</td>
      <td>${day.lunch || ''}</td>
      <td>${day.dinner || ''}</td>
    `;

    tbody.appendChild(row);
  });
}

function scrollToToday() {
  const todayCard = document.getElementById('today-card') || document.getElementById('today-row');
  if (todayCard) {
    setTimeout(() => {
      todayCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

// Toggle view
document.getElementById('toggleView').addEventListener('click', () => {
  const cardView = document.getElementById('cardView');
  const tableView = document.getElementById('tableView');
  const btn = document.getElementById('toggleView');

  cardView.classList.toggle('active');
  tableView.classList.toggle('active');

  btn.textContent = cardView.classList.contains('active') ? 'Switch to Table' : 'Switch to Cards';
});

// Activities Guide
const activitiesGuide = {
  summary: `The Hudson Valley around Rhinebeck and Staatsburg is a treasure trove of family-friendly activities perfect for a multi-generational vacation. From outdoor adventures like fly fishing lessons and scenic parks to charming local eateries and farmers markets, this region offers something for everyone. Kids will love the playgrounds, ice cream shops, and farm visits, while the famous local restaurants, cultural venues, and July 4th celebrations create memorable experiences for the whole family. Whether you're exploring hiking trails, attending outdoor festivals, or simply enjoying local farm-to-table dining, the Hudson Valley provides an ideal backdrop for a relaxing yet enriching family getaway.`,

  categories: [
    {
      name: "Fishing & Outdoor Adventures",
      activities: [
        {
          name: "Catskill Fly Fishing Center & Museum - Youth Programs",
          details: "<strong>Location:</strong> Catskill region, Hudson Valley<br><strong>What:</strong> Free after-school fly fishing clinics for ages 8-12 and 13-17. Learn casting, bug identification, safe wading, and catch fish.<br><strong>Hours:</strong> Programs offered June-July 2026, Mon & Fri afternoons<br><strong>Cost:</strong> Free<br><strong>Website:</strong> cffcm.com"
        },
        {
          name: "Wulff School of Fly Fishing",
          details: "<strong>Location:</strong> Beaverkill Valley, Catskills<br><strong>What:</strong> Beginner-friendly fly fishing instruction in the birthplace of American dry fly fishing<br><strong>Contact:</strong> wulffschool.com for current rates and availability"
        },
        {
          name: "Ray Brooks Memorial Youth Fishing Derby",
          details: "<strong>Date:</strong> June 13, 2026<br><strong>Location:</strong> Historic Catskill Point<br><strong>Ages:</strong> 5-15<br><strong>Time:</strong> Registration at 9am, fishing 10am-1pm<br><strong>Cost:</strong> Free (includes free bait and food)"
        }
      ]
    },
    {
      name: "Playgrounds & Parks",
      activities: [
        {
          name: "Rhinebeck Lion's Club Mini Park",
          details: "<strong>Address:</strong> 29 N Park Rd, Rhinebeck, NY<br><strong>Features:</strong> Regular swings, baby swings, big kid area, gated toddler section, pavilion, picnic areas<br><strong>Best for:</strong> All ages"
        },
        {
          name: "Starr Playground",
          details: "<strong>Address:</strong> 40 Traveler Lane, Rhinebeck (Library Complex)<br><strong>Features:</strong> Large suburban playground with swings, slides, multiple play structures<br><strong>Best for:</strong> School-age children"
        },
        {
          name: "Dinsmore Park",
          details: "<strong>Location:</strong> Staatsburg, NY<br><strong>Features:</strong> Two playgrounds, basketball courts, multi-purpose fields, gazebos, grills<br><strong>Best for:</strong> All ages"
        },
        {
          name: "Mills Norrie State Park",
          details: "<strong>Location:</strong> Staatsburg, NY<br><strong>Features:</strong> Hudson River views, wooded walking paths, scenic areas<br><strong>Best for:</strong> Nature walks and riverside picnics"
        }
      ]
    },
    {
      name: "Ice Cream & Sweet Treats",
      activities: [
        {
          name: "Del's Roadside",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>Specialty:</strong> Farm-made ice cream with unique flavors like peanut butter dark chocolate, lavender honey blueberry, and maple snickerdoodle<br><strong>Best for:</strong> Family favorite with unique local flavors"
        },
        {
          name: "Fortune's Ice Cream",
          details: "<strong>Location:</strong> Tivoli, NY<br><strong>Notable:</strong> Named 'Best Ice Cream in New York' by Food and Wine<br><strong>Specialty:</strong> Fresh ice cream made from scratch with Hudson Valley dairy. Seasonal flavors include chamomile raspberry and malted milk chocolate pretzel<br><strong>Owned by:</strong> Two Bard College alumni"
        },
        {
          name: "Zoe's",
          details: "<strong>Location:</strong> Hudson Valley<br><strong>Specialty:</strong> Cow-to-cone service in 3 days using Hudson Valley dairy. Fresh waffle cones made daily<br><strong>Owned by:</strong> CIA (Culinary Institute of America) graduate"
        }
      ]
    },
    {
      name: "Family Dining Restaurants",
      activities: [
        {
          name: "Pizzeria Posto",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>Cuisine:</strong> Wood-fired Italian pizza<br><strong>Chef:</strong> Patrick Amedeo<br><strong>Specialty:</strong> Laser-focused menu on terrific wood-fired pizzas<br><strong>Best for:</strong> Family-friendly casual dining"
        },
        {
          name: "Gigi",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>Cuisine:</strong> Mediterranean<br><strong>Specialty:</strong> Skizza flatbread pizzas, locally-produced items<br><strong>Dietary Options:</strong> Extensive vegan, vegetarian, and gluten-free selections<br><strong>Best for:</strong> Families with diverse dietary needs"
        },
        {
          name: "Terrapin",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>Setting:</strong> Giant old church with airy dining room<br><strong>Menu:</strong> Tapas, quesadillas, pastas<br><strong>Best for:</strong> Large family groups"
        },
        {
          name: "Cinnamon",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>Cuisine:</strong> Indian<br><strong>Specialty:</strong> Lamb shank rogan josh, tandoori shrimp kebabs<br><strong>Seating:</strong> Individual tables and large communal table ideal for groups"
        }
      ]
    },
    {
      name: "Farmers Markets & Local Events",
      activities: [
        {
          name: "Rhinebeck Farmers' Market",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>Season:</strong> May through December<br><strong>Hours:</strong> Sundays 10am-2pm<br><strong>July 2026 Dates:</strong> July 12 & 26<br><strong>Vendors:</strong> 30+ vendors with farm-fresh produce showcasing Hudson Valley<br><strong>Special Events:</strong> Chef demonstrations, free tastings, seasonal recipes, children's activities, live music<br><strong>Website:</strong> rhinebeckfarmersmarket.com"
        },
        {
          name: "Dutchess County Fair",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>When:</strong> August (check dates for 2026)<br><strong>What:</strong> Second largest county fair in New York State<br><strong>Features:</strong> Livestock competitions, carnival rides, racing pigs, petting zoo, roving robot, agricultural exhibits, horticultural displays<br><strong>Best for:</strong> Full day of family fun"
        },
        {
          name: "Sheep and Wool Festival",
          details: "<strong>Location:</strong> Rhinebeck area<br><strong>What:</strong> Annual festival where families can meet animals, watch demonstrations, participate in wool-related workshops<br><strong>Best for:</strong> Kids interested in farm animals and crafts"
        }
      ]
    },
    {
      name: "Museums & Cultural Attractions",
      activities: [
        {
          name: "Mid-Hudson Discovery Museum",
          details: "<strong>Location:</strong> Poughkeepsie, NY (waterfront)<br><strong>Focus:</strong> Interactive and educational exhibits on early literacy, art, STEM, health, and local community<br><strong>Age Range:</strong> Young children and families<br><strong>Features:</strong> Science, math, music, community-focused learning"
        },
        {
          name: "Old Rhinebeck Aerodrome",
          details: "<strong>Location:</strong> Rhinebeck, NY<br><strong>What:</strong> Vintage aircraft museum with WWI and early aviation planes<br><strong>Best for:</strong> Kids interested in aviation history"
        },
        {
          name: "Trevor Zoo",
          details: "<strong>Location:</strong> Millbrook, NY<br><strong>Unique:</strong> Only zoo located in a high school in the United States<br><strong>Animals:</strong> 180+ exotic and indigenous animals, 80 species, 9 endangered species<br><strong>Best for:</strong> Interactive animal experiences"
        }
      ]
    },
    {
      name: "Farm Activities & Picking",
      activities: [
        {
          name: "Kelder's Farm",
          details: "<strong>Location:</strong> Hudson Valley<br><strong>What:</strong> U-pick flowers, fruits, and vegetables with 30+ farm attractions<br><strong>Summer Events:</strong> Summer Harvest Days, Sunflower Extravaganza<br><strong>Fall Activities:</strong> Apple and pumpkin picking<br><strong>Best for:</strong> Full day family farm experience"
        }
      ]
    },
    {
      name: "July 4th & Seasonal Celebrations",
      activities: [
        {
          name: "Hudson Valley July 4th Events",
          details: "<strong>What to Expect:</strong> Multiple communities host 250th anniversary celebrations with fireworks, parades, and festivals<br><strong>Popular Activities:</strong> Marching bands, floats, community groups, kids' decorated bikes, games, bouncy houses, face painting, magicians<br><strong>Fireworks:</strong> Extended performances across the valley (typically 10pm)<br><strong>Note:</strong> Check local event calendars for specific times and locations in your area"
        }
      ]
    },
    {
      name: "Scenic & Outdoor Recreation",
      activities: [
        {
          name: "Walkway Over the Hudson",
          details: "<strong>Location:</strong> Connects Highland to Poughkeepsie<br><strong>What:</strong> 1.28 mile scenic linear park<br><strong>Best for:</strong> Walking, biking, scenic Hudson River views<br><strong>Great for:</strong> All ages"
        }
      ]
    }
  ]
};

function renderActivitiesGuide() {
  const summaryEl = document.getElementById('guideSummary');
  const categoriesEl = document.getElementById('guideCategories');

  summaryEl.innerHTML = activitiesGuide.summary;

  categoriesEl.innerHTML = activitiesGuide.categories.map(category => `
    <div class="guide-category">
      <h3>${category.name}</h3>
      ${category.activities.map(activity => `
        <div class="activity-item">
          <div class="activity-name">${activity.name}</div>
          <div class="activity-details">${activity.details}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// Jump to activities guide
document.getElementById('jumpToActivities').addEventListener('click', () => {
  document.getElementById('activitiesGuide').scrollIntoView({ behavior: 'smooth' });
});

// Initial load and refresh
fetchAndParse();
renderActivitiesGuide();
setInterval(fetchAndParse, REFRESH_INTERVAL);
