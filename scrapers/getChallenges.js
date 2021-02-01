const fs = require('fs');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const sanitizeHtml = require('sanitize-html');

let currentSeries = 1;
const startUrl =
  'https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_1)';

function sanitise(str) {
  return (
    str &&
    sanitizeHtml(str, {
      allowedTags: ['br'], // keep the linebreaks so we can logically replace them later
      allowedAttributes: {},
    })
      .replace(/(?<!(with|and))\s?<br[^>]*>(?!\s?(with|and|\())/gi, '; ')
      .replace(/(\n|<br[^>]*>)/gi, ' ') // remove the remaining linebreaks
      .replace(/&amp;/g, '&') // unescape HTML ampersand entities
      .replace(/ *\[[^\]]*]/, '') // remove square brackets
      .replace(/\s+/g, ' ') // remove whitespace
      .trim()
  );
}

const challenges = [];

async function getChallenges(url) {
  console.log(`Fetching challenges for series ${currentSeries}...`);
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  const tables = [
    ...document.querySelectorAll('#mw-content-text > div > table'),
  ].slice(3);
  const numEpisodes = Number(
    document.querySelector('table.infobox > tbody > tr:nth-child(5) > td')
      .textContent
  );
  const episodeSelectors = [
    ...document.querySelectorAll(
      'div#toc > ul > li.tocsection-3 > ul > li > a'
    ),
  ].splice(0, numEpisodes);
  const episodeTables = tables.slice(0, episodeSelectors.length);
  episodeTables.forEach((table, index) => {
    // get challenge names
    const tasks = [...table.querySelectorAll('th > small')].map((task) => {
      task = task.textContent.trim().replace(/\s+/g, ' ');
      return task.startsWith('(') ? task.slice(1, -1) : task;
    });
    let [signature, technical, showstopper] = tasks;
    if (!showstopper) {
      showstopper = technical;
      technical = '';
    }
    // get challenge submissions
    const rows = [...table.querySelectorAll('tbody > tr + tr')];
    const rowCells = rows.map((row) => [...row.querySelectorAll('td')]);
    const bakes = rowCells.map((row) => row.map((cell) => cell.innerHTML));
    const submissions = bakes.map((row) => {
      let [baker, signatureBake, technicalBake, showstopperBake] = row;
      if (!showstopperBake) {
        showstopperBake = technicalBake || '';
        technicalBake = '';
      }
      return {
        signature: {
          baker: sanitise(baker),
          submission: sanitise(signatureBake),
        },
        technical: {
          baker: sanitise(baker),
          submission: sanitise(technicalBake),
        },
        showstopper: {
          baker: sanitise(baker),
          submission: sanitise(showstopperBake),
        },
      };
    });
    challenges.push({
      series: currentSeries,
      episode: index + 1,
      signature: {
        challenge: signature,
        bakes: submissions.map((submission) => submission.signature),
      },
      technical: {
        challenge: technical,
        bakes: submissions.map((submission) => submission.technical),
      },
      showstopper: {
        challenge: showstopper,
        bakes: submissions.map((submission) => submission.showstopper),
      },
    });
  });
  console.log(challenges);
  const nextSeries = document.querySelectorAll('tr.noprint div a')[1];
  if (nextSeries || currentSeries === 1) {
    currentSeries += 1;
    return setTimeout(
      () =>
        getChallenges(
          `https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_${currentSeries})`
        ),
      1000
    );
  }
  fs.writeFileSync('data/challenges.json', JSON.stringify(challenges, null, 2));
}

getChallenges(startUrl);
