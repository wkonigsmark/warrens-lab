const OFFSET_HOURS = {
  "America/New_York": 4,
  "America/Chicago": 5,
  "America/Denver": 6,
  "America/Mexico_City": 6,
  "America/Los_Angeles": 7,
  "America/Vancouver": 7,
  "America/Toronto": 4,
};

export const sources = [
  {
    label: "FIFA match schedule, venues, dates and kickoff times",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/updated-fifa-world-cup-2026-match-schedule-now-available",
  },
  {
    label: "WorldCuply full fixture list, used as a structured cross-check",
    url: "https://worldcuply.com/schedule.html",
  },
];

export const tournament = {
  name: "FIFA World Cup 2026",
  hosts: ["Canada", "Mexico", "United States"],
  startDate: "2026-06-11",
  finalDate: "2026-07-19",
  teamsCount: 48,
  groupsCount: 12,
  matchesCount: 104,
  groupMatchesCount: 72,
  knockoutMatchesCount: 32,
  formatNotes: [
    "The top two teams from each of the 12 groups advance.",
    "The eight best third-place teams also advance to the Round of 32.",
    "The knockout stage is single elimination and includes a third-place match.",
  ],
};

export const teams = [
  { id: "MEX", name: "Mexico", group: "A", countryCode: "MX", confederation: "CONCACAF", role: "Host" },
  { id: "RSA", name: "South Africa", group: "A", countryCode: "ZA", confederation: "CAF" },
  { id: "KOR", name: "Korea Republic", shortName: "South Korea", group: "A", countryCode: "KR", confederation: "AFC" },
  { id: "CZE", name: "Czechia", shortName: "Czech Republic", group: "A", countryCode: "CZ", confederation: "UEFA" },
  { id: "CAN", name: "Canada", group: "B", countryCode: "CA", confederation: "CONCACAF", role: "Host" },
  { id: "SUI", name: "Switzerland", group: "B", countryCode: "CH", confederation: "UEFA" },
  { id: "QAT", name: "Qatar", group: "B", countryCode: "QA", confederation: "AFC" },
  { id: "BIH", name: "Bosnia and Herzegovina", group: "B", countryCode: "BA", confederation: "UEFA" },
  { id: "BRA", name: "Brazil", group: "C", countryCode: "BR", confederation: "CONMEBOL" },
  { id: "MAR", name: "Morocco", group: "C", countryCode: "MA", confederation: "CAF" },
  { id: "HAI", name: "Haiti", group: "C", countryCode: "HT", confederation: "CONCACAF" },
  { id: "SCO", name: "Scotland", group: "C", countryCode: "GB", confederation: "UEFA" },
  { id: "USA", name: "United States", group: "D", countryCode: "US", confederation: "CONCACAF", role: "Host" },
  { id: "PAR", name: "Paraguay", group: "D", countryCode: "PY", confederation: "CONMEBOL" },
  { id: "AUS", name: "Australia", group: "D", countryCode: "AU", confederation: "AFC" },
  { id: "TUR", name: "Turkiye", shortName: "Turkey", group: "D", countryCode: "TR", confederation: "UEFA" },
  { id: "GER", name: "Germany", group: "E", countryCode: "DE", confederation: "UEFA" },
  { id: "CUW", name: "Curacao", group: "E", countryCode: "CW", confederation: "CONCACAF" },
  { id: "CIV", name: "Ivory Coast", group: "E", countryCode: "CI", confederation: "CAF" },
  { id: "ECU", name: "Ecuador", group: "E", countryCode: "EC", confederation: "CONMEBOL" },
  { id: "NED", name: "Netherlands", group: "F", countryCode: "NL", confederation: "UEFA" },
  { id: "JPN", name: "Japan", group: "F", countryCode: "JP", confederation: "AFC" },
  { id: "TUN", name: "Tunisia", group: "F", countryCode: "TN", confederation: "CAF" },
  { id: "SWE", name: "Sweden", group: "F", countryCode: "SE", confederation: "UEFA" },
  { id: "BEL", name: "Belgium", group: "G", countryCode: "BE", confederation: "UEFA" },
  { id: "EGY", name: "Egypt", group: "G", countryCode: "EG", confederation: "CAF" },
  { id: "IRN", name: "Iran", group: "G", countryCode: "IR", confederation: "AFC" },
  { id: "NZL", name: "New Zealand", group: "G", countryCode: "NZ", confederation: "OFC" },
  { id: "ESP", name: "Spain", group: "H", countryCode: "ES", confederation: "UEFA" },
  { id: "CPV", name: "Cape Verde", group: "H", countryCode: "CV", confederation: "CAF" },
  { id: "KSA", name: "Saudi Arabia", group: "H", countryCode: "SA", confederation: "AFC" },
  { id: "URU", name: "Uruguay", group: "H", countryCode: "UY", confederation: "CONMEBOL" },
  { id: "FRA", name: "France", group: "I", countryCode: "FR", confederation: "UEFA" },
  { id: "SEN", name: "Senegal", group: "I", countryCode: "SN", confederation: "CAF" },
  { id: "NOR", name: "Norway", group: "I", countryCode: "NO", confederation: "UEFA" },
  { id: "IRQ", name: "Iraq", group: "I", countryCode: "IQ", confederation: "AFC" },
  { id: "ARG", name: "Argentina", group: "J", countryCode: "AR", confederation: "CONMEBOL" },
  { id: "ALG", name: "Algeria", group: "J", countryCode: "DZ", confederation: "CAF" },
  { id: "AUT", name: "Austria", group: "J", countryCode: "AT", confederation: "UEFA" },
  { id: "JOR", name: "Jordan", group: "J", countryCode: "JO", confederation: "AFC" },
  { id: "POR", name: "Portugal", group: "K", countryCode: "PT", confederation: "UEFA" },
  { id: "UZB", name: "Uzbekistan", group: "K", countryCode: "UZ", confederation: "AFC" },
  { id: "COL", name: "Colombia", group: "K", countryCode: "CO", confederation: "CONMEBOL" },
  { id: "COD", name: "DR Congo", group: "K", countryCode: "CD", confederation: "CAF" },
  { id: "ENG", name: "England", group: "L", countryCode: "GB", confederation: "UEFA" },
  { id: "CRO", name: "Croatia", group: "L", countryCode: "HR", confederation: "UEFA" },
  { id: "GHA", name: "Ghana", group: "L", countryCode: "GH", confederation: "CAF" },
  { id: "PAN", name: "Panama", group: "L", countryCode: "PA", confederation: "CONCACAF" },
];

export const venues = {
  AZT: { name: "Estadio Azteca", city: "Mexico City", country: "Mexico", timeZone: "America/Mexico_City" },
  AKR: { name: "Estadio Akron", city: "Guadalajara", country: "Mexico", timeZone: "America/Mexico_City" },
  BBVA: { name: "Estadio BBVA", city: "Monterrey", country: "Mexico", timeZone: "America/Mexico_City" },
  BMO: { name: "BMO Field", city: "Toronto", country: "Canada", timeZone: "America/Toronto" },
  BC: { name: "BC Place", city: "Vancouver", country: "Canada", timeZone: "America/Vancouver" },
  SOFI: { name: "SoFi Stadium", city: "Los Angeles", country: "United States", timeZone: "America/Los_Angeles" },
  LEVIS: { name: "Levi's Stadium", city: "San Francisco Bay Area", country: "United States", timeZone: "America/Los_Angeles" },
  LUMEN: { name: "Lumen Field", city: "Seattle", country: "United States", timeZone: "America/Los_Angeles" },
  MET: { name: "MetLife Stadium", city: "New York / New Jersey", country: "United States", timeZone: "America/New_York" },
  GIL: { name: "Gillette Stadium", city: "Boston", country: "United States", timeZone: "America/New_York" },
  LINC: { name: "Lincoln Financial Field", city: "Philadelphia", country: "United States", timeZone: "America/New_York" },
  MBS: { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "United States", timeZone: "America/New_York" },
  HARD: { name: "Hard Rock Stadium", city: "Miami", country: "United States", timeZone: "America/New_York" },
  NRG: { name: "NRG Stadium", city: "Houston", country: "United States", timeZone: "America/Chicago" },
  ATT: { name: "AT&T Stadium", city: "Dallas", country: "United States", timeZone: "America/Chicago" },
  ARR: { name: "Arrowhead Stadium", city: "Kansas City", country: "United States", timeZone: "America/Chicago" },
};

export const groups = Object.fromEntries(
  "ABCDEFGHIJKL".split("").map((group) => [
    group,
    teams.filter((team) => team.group === group).map((team) => team.id),
  ])
);

const rawMatches = [
  [1, "Group A", "2026-06-11", "13:00", "AZT", "MEX", "RSA"],
  [2, "Group A", "2026-06-11", "20:00", "AKR", "KOR", "CZE"],
  [3, "Group B", "2026-06-12", "15:00", "BMO", "CAN", "BIH"],
  [4, "Group D", "2026-06-12", "18:00", "SOFI", "USA", "PAR"],
  [5, "Group C", "2026-06-13", "21:00", "GIL", "HAI", "SCO"],
  [6, "Group D", "2026-06-13", "21:00", "BC", "AUS", "TUR"],
  [7, "Group C", "2026-06-13", "18:00", "MET", "BRA", "MAR"],
  [8, "Group B", "2026-06-13", "12:00", "LEVIS", "QAT", "SUI"],
  [9, "Group E", "2026-06-14", "19:00", "LINC", "CIV", "ECU"],
  [10, "Group E", "2026-06-14", "12:00", "NRG", "GER", "CUW"],
  [11, "Group F", "2026-06-14", "15:00", "ATT", "NED", "JPN"],
  [12, "Group F", "2026-06-14", "20:00", "BBVA", "SWE", "TUN"],
  [13, "Group H", "2026-06-15", "18:00", "HARD", "KSA", "URU"],
  [14, "Group H", "2026-06-15", "12:00", "MBS", "ESP", "CPV"],
  [15, "Group G", "2026-06-15", "18:00", "SOFI", "IRN", "NZL"],
  [16, "Group G", "2026-06-15", "12:00", "LUMEN", "BEL", "EGY"],
  [17, "Group I", "2026-06-16", "15:00", "MET", "FRA", "SEN"],
  [18, "Group I", "2026-06-16", "18:00", "GIL", "IRQ", "NOR"],
  [19, "Group J", "2026-06-16", "20:00", "ARR", "ARG", "ALG"],
  [20, "Group J", "2026-06-16", "21:00", "LEVIS", "AUT", "JOR"],
  [21, "Group L", "2026-06-17", "19:00", "BMO", "GHA", "PAN"],
  [22, "Group L", "2026-06-17", "15:00", "ATT", "ENG", "CRO"],
  [23, "Group K", "2026-06-17", "12:00", "NRG", "POR", "COD"],
  [24, "Group K", "2026-06-17", "20:00", "AZT", "UZB", "COL"],
  [25, "Group A", "2026-06-18", "12:00", "MBS", "CZE", "RSA"],
  [26, "Group B", "2026-06-18", "12:00", "SOFI", "SUI", "BIH"],
  [27, "Group B", "2026-06-18", "15:00", "BC", "CAN", "QAT"],
  [28, "Group A", "2026-06-18", "19:00", "AKR", "MEX", "KOR"],
  [29, "Group C", "2026-06-19", "21:00", "LINC", "BRA", "HAI"],
  [30, "Group C", "2026-06-19", "18:00", "GIL", "SCO", "MAR"],
  [31, "Group D", "2026-06-19", "20:00", "LEVIS", "TUR", "PAR"],
  [32, "Group D", "2026-06-19", "12:00", "LUMEN", "USA", "AUS"],
  [33, "Group E", "2026-06-20", "16:00", "BMO", "GER", "CIV"],
  [34, "Group E", "2026-06-20", "19:00", "ARR", "ECU", "CUW"],
  [35, "Group F", "2026-06-20", "12:00", "NRG", "NED", "SWE"],
  [36, "Group F", "2026-06-20", "22:00", "BBVA", "TUN", "JPN"],
  [37, "Group H", "2026-06-21", "18:00", "HARD", "URU", "CPV"],
  [38, "Group H", "2026-06-21", "12:00", "MBS", "ESP", "KSA"],
  [39, "Group G", "2026-06-21", "12:00", "SOFI", "BEL", "IRN"],
  [40, "Group G", "2026-06-21", "18:00", "BC", "NZL", "EGY"],
  [41, "Group I", "2026-06-22", "20:00", "MET", "NOR", "SEN"],
  [42, "Group I", "2026-06-22", "17:00", "LINC", "FRA", "IRQ"],
  [43, "Group J", "2026-06-22", "12:00", "ATT", "ARG", "AUT"],
  [44, "Group J", "2026-06-22", "20:00", "LEVIS", "JOR", "ALG"],
  [45, "Group L", "2026-06-23", "16:00", "GIL", "ENG", "GHA"],
  [46, "Group L", "2026-06-23", "19:00", "BMO", "PAN", "CRO"],
  [47, "Group K", "2026-06-23", "12:00", "NRG", "POR", "UZB"],
  [48, "Group K", "2026-06-23", "20:00", "AKR", "COL", "COD"],
  [49, "Group C", "2026-06-24", "18:00", "HARD", "SCO", "BRA"],
  [50, "Group C", "2026-06-24", "18:00", "MBS", "MAR", "HAI"],
  [51, "Group B", "2026-06-24", "12:00", "BC", "SUI", "CAN"],
  [52, "Group B", "2026-06-24", "12:00", "LUMEN", "BIH", "QAT"],
  [53, "Group A", "2026-06-24", "19:00", "AZT", "CZE", "MEX"],
  [54, "Group A", "2026-06-24", "19:00", "BBVA", "RSA", "KOR"],
  [55, "Group E", "2026-06-25", "16:00", "LINC", "CUW", "CIV"],
  [56, "Group E", "2026-06-25", "16:00", "MET", "ECU", "GER"],
  [57, "Group F", "2026-06-25", "18:00", "ATT", "JPN", "SWE"],
  [58, "Group F", "2026-06-25", "18:00", "ARR", "TUN", "NED"],
  [59, "Group D", "2026-06-25", "19:00", "SOFI", "TUR", "USA"],
  [60, "Group D", "2026-06-25", "19:00", "LEVIS", "PAR", "AUS"],
  [61, "Group I", "2026-06-26", "15:00", "GIL", "NOR", "FRA"],
  [62, "Group I", "2026-06-26", "15:00", "BMO", "SEN", "IRQ"],
  [63, "Group G", "2026-06-26", "20:00", "LUMEN", "EGY", "IRN"],
  [64, "Group G", "2026-06-26", "20:00", "BC", "NZL", "BEL"],
  [65, "Group H", "2026-06-26", "19:00", "NRG", "CPV", "KSA"],
  [66, "Group H", "2026-06-26", "18:00", "AKR", "URU", "ESP"],
  [67, "Group L", "2026-06-27", "17:00", "MET", "PAN", "ENG"],
  [68, "Group L", "2026-06-27", "17:00", "LINC", "CRO", "GHA"],
  [69, "Group J", "2026-06-27", "21:00", "ARR", "ALG", "AUT"],
  [70, "Group J", "2026-06-27", "21:00", "ATT", "JOR", "ARG"],
  [71, "Group K", "2026-06-27", "19:30", "HARD", "COL", "POR"],
  [72, "Group K", "2026-06-27", "19:30", "MBS", "COD", "UZB"],
  [73, "Round of 32", "2026-06-28", "12:00", "SOFI", "Group A runners-up", "Group B runners-up"],
  [74, "Round of 32", "2026-06-29", "16:30", "GIL", "Group E winners", "Group A/B/C/D/F third place"],
  [75, "Round of 32", "2026-06-29", "19:00", "BBVA", "Group F winners", "Group C runners-up"],
  [76, "Round of 32", "2026-06-29", "12:00", "NRG", "Group C winners", "Group F runners-up"],
  [77, "Round of 32", "2026-06-30", "17:00", "MET", "Group I winners", "Group C/D/F/G/H third place"],
  [78, "Round of 32", "2026-06-30", "12:00", "ATT", "Group E runners-up", "Group I runners-up"],
  [79, "Round of 32", "2026-06-30", "19:00", "AZT", "Group A winners", "Group C/E/F/H/I third place"],
  [80, "Round of 32", "2026-07-01", "12:00", "MBS", "Group L winners", "Group E/H/I/J/K third place"],
  [81, "Round of 32", "2026-07-01", "17:00", "LEVIS", "Group D winners", "Group B/E/F/I/J third place"],
  [82, "Round of 32", "2026-07-01", "13:00", "LUMEN", "Group G winners", "Group A/E/H/I/J third place"],
  [83, "Round of 32", "2026-07-02", "19:00", "BMO", "Group K runners-up", "Group L runners-up"],
  [84, "Round of 32", "2026-07-02", "12:00", "SOFI", "Group H winners", "Group J runners-up"],
  [85, "Round of 32", "2026-07-02", "20:00", "BC", "Group B winners", "Group E/F/G/I/J third place"],
  [86, "Round of 32", "2026-07-03", "18:00", "HARD", "Group J winners", "Group H runners-up"],
  [87, "Round of 32", "2026-07-03", "20:30", "ARR", "Group K winners", "Group D/E/I/J/L third place"],
  [88, "Round of 32", "2026-07-03", "13:00", "ATT", "Group D runners-up", "Group G runners-up"],
  [89, "Round of 16", "2026-07-04", "17:00", "LINC", "Winner Match 74", "Winner Match 77"],
  [90, "Round of 16", "2026-07-04", "12:00", "NRG", "Winner Match 73", "Winner Match 75"],
  [91, "Round of 16", "2026-07-05", "16:00", "MET", "Winner Match 76", "Winner Match 78"],
  [92, "Round of 16", "2026-07-05", "18:00", "AZT", "Winner Match 79", "Winner Match 80"],
  [93, "Round of 16", "2026-07-06", "14:00", "ATT", "Winner Match 83", "Winner Match 84"],
  [94, "Round of 16", "2026-07-06", "17:00", "LUMEN", "Winner Match 81", "Winner Match 82"],
  [95, "Round of 16", "2026-07-07", "12:00", "MBS", "Winner Match 86", "Winner Match 88"],
  [96, "Round of 16", "2026-07-07", "13:00", "BC", "Winner Match 85", "Winner Match 87"],
  [97, "Quarter-final", "2026-07-09", "16:00", "GIL", "Winner Match 89", "Winner Match 90"],
  [98, "Quarter-final", "2026-07-10", "12:00", "SOFI", "Winner Match 93", "Winner Match 94"],
  [99, "Quarter-final", "2026-07-11", "17:00", "HARD", "Winner Match 91", "Winner Match 92"],
  [100, "Quarter-final", "2026-07-11", "20:00", "ARR", "Winner Match 95", "Winner Match 96"],
  [101, "Semi-final", "2026-07-14", "14:00", "ATT", "Winner Match 97", "Winner Match 98"],
  [102, "Semi-final", "2026-07-15", "15:00", "MBS", "Winner Match 99", "Winner Match 100"],
  [103, "Third place", "2026-07-18", "17:00", "HARD", "Loser Match 101", "Loser Match 102"],
  [104, "Final", "2026-07-19", "15:00", "MET", "Winner Match 101", "Winner Match 102"],
];

const teamById = Object.fromEntries(teams.map((team) => [team.id, team]));

function toUtcIso(localDate, localTime, timeZone) {
  const [year, month, day] = localDate.split("-").map(Number);
  const [hour, minute] = localTime.split(":").map(Number);
  const offset = OFFSET_HOURS[timeZone];
  return new Date(Date.UTC(year, month - 1, day, hour + offset, minute)).toISOString();
}

function nameFor(entry) {
  return teamById[entry]?.name || entry;
}

export const matches = rawMatches.map(([matchNumber, stage, localDate, localTime, venueId, home, away]) => {
  const venue = venues[venueId];
  return {
    matchNumber,
    stage,
    group: stage.startsWith("Group ") ? stage.replace("Group ", "") : null,
    localDate,
    localTime,
    venueId,
    venue,
    home,
    away,
    homeName: nameFor(home),
    awayName: nameFor(away),
    utc: toUtcIso(localDate, localTime, venue.timeZone),
  };
});

export const groupStageMatches = matches.filter((match) => match.matchNumber <= 72);
export const knockoutMatches = matches.filter((match) => match.matchNumber > 72);
export const teamsById = teamById;

// Knockout schedule — SOURCE OF TRUTH for the bracket order of play.
// `seq` is the chronological play order (1-32). `matchNumber` is the official
// FIFA bracket match id (used to look up entered results). For Round of 32,
// team1/team2 are concrete team ids. For later rounds the matchup is conditional
// (pipe-separated possible advancers) until results resolve it; `teamsKnown`
// flags whether the two teams are concrete yet.
export const knockoutSchedule = [
  // Round of 32 (seq 1-16)
  { seq: 1,  matchNumber: 73,  date: "2026-06-28", time: "15:00", round: "R32", teamsKnown: true,  team1: "RSA", team2: "CAN" },
  { seq: 2,  matchNumber: 76,  date: "2026-06-29", time: "13:00", round: "R32", teamsKnown: true,  team1: "BRA", team2: "JPN" },
  { seq: 3,  matchNumber: 74,  date: "2026-06-29", time: "16:30", round: "R32", teamsKnown: true,  team1: "GER", team2: "PAR" },
  { seq: 4,  matchNumber: 75,  date: "2026-06-29", time: "21:00", round: "R32", teamsKnown: true,  team1: "NED", team2: "MAR" },
  { seq: 5,  matchNumber: 78,  date: "2026-06-30", time: "13:00", round: "R32", teamsKnown: true,  team1: "CIV", team2: "NOR" },
  { seq: 6,  matchNumber: 77,  date: "2026-06-30", time: "17:00", round: "R32", teamsKnown: true,  team1: "FRA", team2: "SWE" },
  { seq: 7,  matchNumber: 79,  date: "2026-06-30", time: "21:00", round: "R32", teamsKnown: true,  team1: "MEX", team2: "ECU" },
  { seq: 8,  matchNumber: 80,  date: "2026-07-01", time: "12:00", round: "R32", teamsKnown: true,  team1: "ENG", team2: "COD" },
  { seq: 9,  matchNumber: 82,  date: "2026-07-01", time: "16:00", round: "R32", teamsKnown: true,  team1: "BEL", team2: "SEN" },
  { seq: 10, matchNumber: 81,  date: "2026-07-01", time: "20:00", round: "R32", teamsKnown: true,  team1: "USA", team2: "BIH" },
  { seq: 11, matchNumber: 84,  date: "2026-07-02", time: "15:00", round: "R32", teamsKnown: true,  team1: "ESP", team2: "AUT" },
  { seq: 12, matchNumber: 83,  date: "2026-07-02", time: "19:00", round: "R32", teamsKnown: true,  team1: "POR", team2: "CRO" },
  { seq: 13, matchNumber: 85,  date: "2026-07-02", time: "23:00", round: "R32", teamsKnown: true,  team1: "SUI", team2: "ALG" },
  { seq: 14, matchNumber: 88,  date: "2026-07-03", time: "14:00", round: "R32", teamsKnown: true,  team1: "AUS", team2: "EGY" },
  { seq: 15, matchNumber: 86,  date: "2026-07-03", time: "18:00", round: "R32", teamsKnown: true,  team1: "ARG", team2: "CPV" },
  { seq: 16, matchNumber: 87,  date: "2026-07-03", time: "21:30", round: "R32", teamsKnown: true,  team1: "COL", team2: "GHA" },
  // Round of 16 (seq 17-24)
  { seq: 17, matchNumber: 90,  date: "2026-07-04", time: "13:00", round: "R16", teamsKnown: false, team1: "RSA|CAN", team2: "NED|MAR" },
  { seq: 18, matchNumber: 89,  date: "2026-07-04", time: "17:00", round: "R16", teamsKnown: false, team1: "GER|PAR", team2: "FRA|SWE" },
  { seq: 19, matchNumber: 91,  date: "2026-07-05", time: "16:00", round: "R16", teamsKnown: false, team1: "BRA|JPN", team2: "CIV|NOR" },
  { seq: 20, matchNumber: 92,  date: "2026-07-05", time: "20:00", round: "R16", teamsKnown: false, team1: "MEX|ECU", team2: "ENG|COD" },
  { seq: 21, matchNumber: 93,  date: "2026-07-06", time: "15:00", round: "R16", teamsKnown: false, team1: "POR|CRO", team2: "ESP|AUT" },
  { seq: 22, matchNumber: 94,  date: "2026-07-06", time: "20:00", round: "R16", teamsKnown: false, team1: "USA|BIH", team2: "BEL|SEN" },
  { seq: 23, matchNumber: 95,  date: "2026-07-07", time: "12:00", round: "R16", teamsKnown: false, team1: "ARG|CPV", team2: "AUS|EGY" },
  { seq: 24, matchNumber: 96,  date: "2026-07-07", time: "16:00", round: "R16", teamsKnown: false, team1: "SUI|ALG", team2: "COL|GHA" },
  // Quarter-finals (seq 25-28)
  { seq: 25, matchNumber: 97,  date: "2026-07-09", time: "16:00", round: "QF",  teamsKnown: false, team1: "GER|PAR|FRA|SWE", team2: "RSA|CAN|NED|MAR" },
  { seq: 26, matchNumber: 98,  date: "2026-07-10", time: "15:00", round: "QF",  teamsKnown: false, team1: "POR|CRO|ESP|AUT", team2: "USA|BIH|BEL|SEN" },
  { seq: 27, matchNumber: 99,  date: "2026-07-11", time: "17:00", round: "QF",  teamsKnown: false, team1: "BRA|JPN|CIV|NOR", team2: "MEX|ECU|ENG|COD" },
  { seq: 28, matchNumber: 100, date: "2026-07-11", time: "21:00", round: "QF",  teamsKnown: false, team1: "ARG|CPV|AUS|EGY", team2: "SUI|ALG|COL|GHA" },
  // Semi-finals (seq 29-30)
  { seq: 29, matchNumber: 101, date: "2026-07-14", time: "15:00", round: "SF",  teamsKnown: false, team1: "GER|PAR|FRA|SWE|RSA|CAN|NED|MAR", team2: "POR|CRO|ESP|AUT|USA|BIH|BEL|SEN" },
  { seq: 30, matchNumber: 102, date: "2026-07-15", time: "15:00", round: "SF",  teamsKnown: false, team1: "BRA|JPN|CIV|NOR|MEX|ECU|ENG|COD", team2: "ARG|CPV|AUS|EGY|SUI|ALG|COL|GHA" },
  // Third-place match (seq 31)
  { seq: 31, matchNumber: 103, date: "2026-07-18", time: "17:00", round: "3P",  teamsKnown: false, team1: "Loser 101", team2: "Loser 102" },
  // Final (seq 32)
  { seq: 32, matchNumber: 104, date: "2026-07-19", time: "15:00", round: "F",   teamsKnown: false, team1: "Winner 101", team2: "Winner 102" },
];

// Back-compat alias: the Round of 32 slice (concrete matchups).
export const r32Schedule = knockoutSchedule.filter(m => m.round === "R32");
