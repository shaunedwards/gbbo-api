const fs = require('fs');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const tableToMatrix = require('../utils/tableToMatrix');
const resultKeys = require('../utils/resultKeys');
const filterResultsByEpisodeAndKey = require('../utils/filterResults');

let currentSeries = 1;
const startUrl =
  'https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_1)';

const series = [];

async function getSeries(url) {
  console.log(`Fetching data for series ${currentSeries}...`);
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  const resultsTable = document.querySelectorAll(
    '#mw-content-text > div > table'
  )[2];
  const numEpisodes = Number(
    document.querySelector('table.infobox > tbody > tr:nth-child(5) > td')
      .textContent
  );
  const network = document.querySelector(
    'table.infobox > tbody > tr:nth-child(7) > td'
  ).textContent;
  const results = tableToMatrix(resultsTable).slice(2);
  const [winner] = filterResultsByEpisodeAndKey(
    results,
    numEpisodes,
    resultKeys.SERIES_WINNER
  );
  const runnersUp = filterResultsByEpisodeAndKey(
    results,
    numEpisodes,
    resultKeys.RUNNER_UP
  );
  series.push({
    series: currentSeries,
    numEpisodes,
    network,
    winner: winner || null,
    runnersUp,
  });
  console.log(series);
  const nextSeries = document.querySelectorAll('tr.noprint div a')[1];
  if (nextSeries || currentSeries === 1) {
    currentSeries += 1;
    return setTimeout(
      () =>
        getSeries(
          `https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_${currentSeries})`
        ),
      1000
    );
  }
  fs.writeFileSync('data/series.json', JSON.stringify(series, null, 2));
}

getSeries(startUrl);
