const series = require('../data/series.json');
const bakers = require('../data/bakers.json');
const episodes = require('../data/episodes.json');
const ratings = require('../data/ratings.json');
const { createBakerObject } = require('./bakers');
const { createEpisodeObject } = require('./episodes');

function formResponseObject(s) {
  const seriesRatings = ratings.filter(
    (episode) => episode.series === s.series
  );
  const episodesWithRatings = seriesRatings.filter(
    (episode) => episode.overSevenDays || episode.overTwentyEightDays
  );
  const premiereDate = seriesRatings[0].airdate;
  const finalEpisode = seriesRatings[s.numEpisodes - 1];
  const finaleDate = finalEpisode && finalEpisode.airdate;
  const avgViewerCount = Number(
    episodesWithRatings.reduce(
      (acc, episode) =>
        acc + (episode.overTwentyEightDays || episode.overSevenDays),
      0
    ) / episodesWithRatings.length
  ).toFixed(2);
  return {
    ...s,
    premiereDate,
    finaleDate,
    avgViewerCount,
    winner:
      s.winner &&
      createBakerObject(
        bakers.find(
          (baker) =>
            (s.winner.includes(baker.alias) ||
              s.winner.includes(baker.forename)) &&
            baker.series === s.series
        )
      ),
    runnersUp: bakers
      .filter(
        (baker) =>
          (s.runnersUp.includes(baker.alias) ||
            s.runnersUp.includes(baker.forename)) &&
          baker.series === s.series
      )
      .map((baker) => createBakerObject(baker)),
    bakers: bakers
      .filter((baker) => baker.series === s.series)
      .map((baker) => createBakerObject(baker)),
    episodes: episodes
      .filter((episode) => episode.series === s.series)
      .map((episode) => createEpisodeObject(episode)),
  };
}

function getAllSeries() {
  return series.map((s) => formResponseObject(s));
}

function getSeriesByNumber({ seriesNumber }) {
  const requestedSeries = series.find((s) => s.series === seriesNumber);
  if (requestedSeries) {
    return formResponseObject(requestedSeries);
  }
}

module.exports = {
  getAllSeries,
  getSeriesByNumber,
};
