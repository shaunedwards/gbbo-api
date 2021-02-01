const fs = require('fs');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const sanitizeHtml = require('sanitize-html');
const tableToMatrix = require('../utils/tableToMatrix');
const resultKeys = require('../utils/resultKeys');
const filterResultsByEpisodeAndKey = require('../utils/filterResults');

let currentSeries = 1;
const startUrl =
  'https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_1)';

const episodes = [];

async function getEpisodes(url) {
  console.log(`Fetching episodes for series ${currentSeries}...`);
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  // get all tables on page, skip first 2 as they're not needed here
  const tables = [
    ...document.querySelectorAll('#mw-content-text > div > table'),
  ].slice(2);
  const resultsTable = tables.shift();
  const numEpisodes = Number(
    document.querySelector('table.infobox > tbody > tr:nth-child(5) > td')
      .textContent
  );
  const episodeSelectors = [
    ...document.querySelectorAll(
      'div#toc > ul > li.tocsection-3 > ul > li > a'
    ),
  ]
    .splice(0, numEpisodes)
    .map((a) => decodeURIComponent(a.hash));
  const episodeHeadings = episodeSelectors.map(
    (selector) => document.getElementById(selector.substr(1)).parentNode
  );
  const episodeTitles = episodeHeadings.map(
    (heading) =>
      heading.querySelector('span.mw-headline').textContent.split(': ')[1]
  );
  const episodeSynopses = episodeHeadings.map((heading) =>
    sanitizeHtml(heading.nextElementSibling.innerHTML, {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/ *\[[^\]]*]/g, '') // remove square brackets
      .replace(/\t|\n|\r/g, ' ') // remove linebreak characters
      .replace(/&amp;/g, '&') // unescape HTML ampersand entities
      .replace(/\s+/g, ' ') // remove whitespace in middle
      .trim()
  );
  const episodeTables = tables.slice(0, episodeSelectors.length);
  let bakersRemaining = [...resultsTable.rows].slice(2).length;
  episodeTables.forEach((table, index) => {
    // get results for each episode
    const results = tableToMatrix(resultsTable).slice(2);
    const episode = index + 1;
    const eliminated = filterResultsByEpisodeAndKey(
      results,
      episode,
      resultKeys.ELIMINATED
    );
    const starBaker = filterResultsByEpisodeAndKey(
      results,
      episode,
      resultKeys.STAR_BAKER
    );
    bakersRemaining -= eliminated.length;
    const rows = [...table.querySelectorAll('tbody > tr + tr')];
    const rowCells = rows.map((row) => [...row.querySelectorAll('td')]);
    const cellValues = rowCells.map((row) =>
      row.map((cell) => cell.textContent.trim())
    );
    const participants = cellValues.map((row) => row[0]);
    const technicalWinner = cellValues
      .filter((cell) => cell.includes(resultKeys.TECHNICAL_WINNER))
      .map((row) => row[0]);
    episodes.push({
      series: currentSeries,
      episode,
      theme: episodeTitles[index],
      synopsis: episodeSynopses[index],
      eliminated,
      starBaker,
      technicalWinner,
      bakersRemaining,
      participants,
    });
  });
  console.log(episodes);
  const nextSeries = document.querySelectorAll('tr.noprint div a')[1];
  if (nextSeries || currentSeries === 1) {
    currentSeries += 1;
    return setTimeout(
      () =>
        getEpisodes(
          `https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_${currentSeries})`
        ),
      1000
    );
  }
  fs.writeFileSync('data/episodes.json', JSON.stringify(episodes, null, 2));
}

getEpisodes(startUrl);
