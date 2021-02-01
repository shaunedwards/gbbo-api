const fs = require('fs');
const axios = require('axios');
const { JSDOM } = require('jsdom');

let currentSeries = 1;
const startUrl =
  'https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_1)';

const keys = ['name', 'age', 'occupation', 'hometown'];

const bakers = [];

async function getBakers(url) {
  console.log(`Fetching bakers for series ${currentSeries}...`);
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  const table = document.querySelectorAll('#mw-content-text > div > table')[1];
  const rows = table.querySelectorAll('tbody > tr + tr');
  rows.forEach((row) => {
    const cols = [...row.querySelectorAll('td')];
    // remove the extra links column if exists
    if (cols.length > keys.length) {
      cols.pop();
    }
    const baker = {};
    cols.forEach((col, index) => {
      const key = keys[index];
      baker[key] = Number(col.textContent) || col.textContent.trim();
    });
    const [forename, aliasOrSurname, surname] = baker.name.split(' ');
    baker.forename = forename;
    baker.surname = surname || aliasOrSurname;
    if (aliasOrSurname && aliasOrSurname.includes('"')) {
      const alias = aliasOrSurname.split('"')[1];
      baker.alias = alias;
    }
    baker.series = currentSeries;
    bakers.push(baker);
  });
  const nextSeries = document.querySelectorAll('tr.noprint div a')[1];
  if (nextSeries || currentSeries === 1) {
    currentSeries += 1;
    return setTimeout(
      () =>
        getBakers(
          `https://en.wikipedia.org/wiki/The_Great_British_Bake_Off_(series_${currentSeries})`
        ),
      1000
    );
  }
  fs.writeFileSync('data/bakers.json', JSON.stringify(bakers, null, 2));
}

getBakers(startUrl);
