const fs = require('fs');
const axios = require('axios');
const { JSDOM } = require('jsdom');

let currentSeries = 1;
const startUrl =
  'https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_1)';

const keys = [
  {
    name: 'episode',
    isPresent: [4, 5, 6, 7],
  },
  {
    name: 'airdate',
    isPresent: [4, 5, 6, 7],
  },
  {
    name: 'overSevenDays',
    isPresent: [4, 5, 6, 7],
  },
  {
    name: 'overTwentyEightDays',
    isPresent: [6, 7],
  },
  {
    name: 'networkWeeklyRanking',
    isPresent: [4, 5, 6, 7],
  },
  {
    name: 'allChannelsWeeklyRanking',
    isPresent: [5, 6, 7],
  },
];

const ratings = [];

function nullifyValue(text) {
  const stringsToConvert = ['N/A', 'TBA'];
  text = text.split('(')[0].trim();
  if (!text || stringsToConvert.includes(text)) {
    return null;
  }
  return text;
}

function addRowEntry(cols) {
  const rating = {};
  let currentKey = 0;
  rating.series = currentSeries;
  cols.forEach((col) => {
    let key = keys[currentKey];
    while (!key.isPresent.includes(cols.length)) {
      currentKey += 1;
      key = keys[currentKey];
    }
    currentKey += 1;
    rating[key.name] = Number(col.textContent) || nullifyValue(col.textContent);
  });
  ratings.push(rating);
}

async function getRatings(url) {
  console.log(`Fetching ratings for series ${currentSeries}...`);
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  // get the last few tables on the page to account for optional extras
  const tables = [
    ...document.querySelectorAll('#mw-content-text > div > table'),
  ].splice(-3);
  const seriesLength = Number(
    document.querySelector('table.infobox > tbody > tr:nth-child(5) > td')
      .textContent
  );
  const episodes = [
    ...document.querySelectorAll(
      'div#toc > ul > li.tocsection-3 > ul > li > a > span.toctext'
    ),
  ]
    .map((ep) => ep.textContent.split(': ')[1])
    .splice(0, seriesLength);
  const filteredTables = tables.filter((table) => {
    const numRows = table.querySelectorAll('tbody > tr + tr').length;
    const headings = [...table.querySelectorAll('th')];
    const secondHeader = headings[1].textContent.trim();
    return (
      headings.every((heading) => !heading.getAttribute('colspan')) &&
      (numRows === episodes.length || secondHeader === 'Airdate')
    );
  });
  console.log('filtered', filteredTables.length);
  // get the final table on page with equal number of rows to episodes
  const ratingsTable = filteredTables.pop();
  const rows = ratingsTable.querySelectorAll('tbody > tr + tr');
  rows.forEach((row) => {
    const cols = [...row.querySelectorAll('td')];
    if (cols.length === 7) {
      cols.pop();
    }
    addRowEntry(cols);
  });
  console.log(ratings);
  const nextSeries = document.querySelectorAll('tr.noprint div a')[1];
  if (nextSeries || currentSeries === 1) {
    currentSeries += 1;
    return setTimeout(
      () =>
        getRatings(
          `https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_${currentSeries})`
        ),
      1000
    );
  }
  fs.writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2));
}

getRatings(startUrl);
