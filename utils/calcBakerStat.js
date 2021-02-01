const episodes = require('../data/episodes.json');

function calcBakerStat(baker, key) {
  return episodes
    .filter((episode) => episode.series === baker.series)
    .reduce((acc, episode) => {
      if (
        episode[key].includes(baker.alias) ||
        episode[key].includes(baker.forename)
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
}

module.exports = calcBakerStat;
