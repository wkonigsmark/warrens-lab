// World Cup champions by year — powers both the Study Sheets page and the
// auto-generated "who won / how many titles / who hosted" quiz questions.
// Flag codes are flagcdn slugs (gb-eng for England). West Germany uses the
// modern German flag (de) for display, with a note.

window.WC_QUIZ_WINNERS = [
  { year: 1930, winner: "Uruguay", winnerCode: "uy", host: "Uruguay", hostCode: "uy", runnerUp: "Argentina", runnerUpCode: "ar" },
  { year: 1934, winner: "Italy", winnerCode: "it", host: "Italy", hostCode: "it", runnerUp: "Czechoslovakia", runnerUpCode: "cz" },
  { year: 1938, winner: "Italy", winnerCode: "it", host: "France", hostCode: "fr", runnerUp: "Hungary", runnerUpCode: "hu" },
  { year: 1942, cancelled: true, note: "Cancelled — World War II" },
  { year: 1946, cancelled: true, note: "Cancelled — World War II" },
  { year: 1950, winner: "Uruguay", winnerCode: "uy", host: "Brazil", hostCode: "br", runnerUp: "Brazil", runnerUpCode: "br" },
  { year: 1954, winner: "West Germany", winnerCode: "de", host: "Switzerland", hostCode: "ch", runnerUp: "Hungary", runnerUpCode: "hu" },
  { year: 1958, winner: "Brazil", winnerCode: "br", host: "Sweden", hostCode: "se", runnerUp: "Sweden", runnerUpCode: "se" },
  { year: 1962, winner: "Brazil", winnerCode: "br", host: "Chile", hostCode: "cl", runnerUp: "Czechoslovakia", runnerUpCode: "cz" },
  { year: 1966, winner: "England", winnerCode: "gb-eng", host: "England", hostCode: "gb-eng", runnerUp: "West Germany", runnerUpCode: "de" },
  { year: 1970, winner: "Brazil", winnerCode: "br", host: "Mexico", hostCode: "mx", runnerUp: "Italy", runnerUpCode: "it" },
  { year: 1974, winner: "West Germany", winnerCode: "de", host: "West Germany", hostCode: "de", runnerUp: "Netherlands", runnerUpCode: "nl" },
  { year: 1978, winner: "Argentina", winnerCode: "ar", host: "Argentina", hostCode: "ar", runnerUp: "Netherlands", runnerUpCode: "nl" },
  { year: 1982, winner: "Italy", winnerCode: "it", host: "Spain", hostCode: "es", runnerUp: "West Germany", runnerUpCode: "de" },
  { year: 1986, winner: "Argentina", winnerCode: "ar", host: "Mexico", hostCode: "mx", runnerUp: "West Germany", runnerUpCode: "de" },
  { year: 1990, winner: "West Germany", winnerCode: "de", host: "Italy", hostCode: "it", runnerUp: "Argentina", runnerUpCode: "ar" },
  { year: 1994, winner: "Brazil", winnerCode: "br", host: "United States", hostCode: "us", runnerUp: "Italy", runnerUpCode: "it" },
  { year: 1998, winner: "France", winnerCode: "fr", host: "France", hostCode: "fr", runnerUp: "Brazil", runnerUpCode: "br" },
  { year: 2002, winner: "Brazil", winnerCode: "br", host: "South Korea & Japan", hostCode: "kr", runnerUp: "Germany", runnerUpCode: "de" },
  { year: 2006, winner: "Italy", winnerCode: "it", host: "Germany", hostCode: "de", runnerUp: "France", runnerUpCode: "fr" },
  { year: 2010, winner: "Spain", winnerCode: "es", host: "South Africa", hostCode: "za", runnerUp: "Netherlands", runnerUpCode: "nl" },
  { year: 2014, winner: "Germany", winnerCode: "de", host: "Brazil", hostCode: "br", runnerUp: "Argentina", runnerUpCode: "ar" },
  { year: 2018, winner: "France", winnerCode: "fr", host: "Russia", hostCode: "ru", runnerUp: "Croatia", runnerUpCode: "hr" },
  { year: 2022, winner: "Argentina", winnerCode: "ar", host: "Qatar", hostCode: "qa", runnerUp: "France", runnerUpCode: "fr" },
];

// Title counts (West Germany counts toward Germany).
window.WC_QUIZ_TITLES = [
  { nation: "Brazil", code: "br", titles: 5, years: "1958, 1962, 1970, 1994, 2002" },
  { nation: "Germany", code: "de", titles: 4, years: "1954, 1974, 1990, 2014", note: "Includes West Germany" },
  { nation: "Italy", code: "it", titles: 4, years: "1934, 1938, 1982, 2006" },
  { nation: "Argentina", code: "ar", titles: 3, years: "1978, 1986, 2022" },
  { nation: "Uruguay", code: "uy", titles: 2, years: "1930, 1950" },
  { nation: "France", code: "fr", titles: 2, years: "1998, 2018" },
  { nation: "England", code: "gb-eng", titles: 1, years: "1966" },
  { nation: "Spain", code: "es", titles: 1, years: "2010" },
];
