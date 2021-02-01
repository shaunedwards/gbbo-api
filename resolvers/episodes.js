const bakers = require('../data/bakers.json');
const ratings = require('../data/ratings.json');
const episodes = require('../data/episodes.json');
const challenges = require('../data/challenges.json');
const { createBakerObject } = require('./bakers');
const { createChallengeObject } = require('./challenges');

function getBakersByEpisodeAndKey(episode, key) {
  const result = bakers.filter(
    (baker) =>
      (episode[key].includes(baker.alias) ||
        episode[key].includes(baker.forename)) &&
      baker.series === episode.series
  );
  return result.map((baker) => createBakerObject(baker));
}

function formResponseObject(episode) {
  return {
    ...episode,
    starBaker: getBakersByEpisodeAndKey(episode, 'starBaker'),
    eliminated: getBakersByEpisodeAndKey(episode, 'eliminated'),
    technicalWinner: getBakersByEpisodeAndKey(episode, 'technicalWinner'),
    participants: getBakersByEpisodeAndKey(episode, 'participants'),
    ratings: ratings.find(
      (rating) =>
        rating.series === episode.series && rating.episode === episode.episode
    ),
    challenges: createChallengeObject(
      challenges.find(
        (challenge) =>
          challenge.series === episode.series &&
          challenge.episode === episode.episode
      )
    ),
  };
}

function getAllEpisodes({ series }) {
  if (series !== undefined) {
    return episodes
      .filter((episode) => episode.series === series)
      .map((episode) => formResponseObject(episode));
  }
  return episodes.map((episode) => formResponseObject(episode));
}

function getEpisodeByNumber({ series, episodeNumber }) {
  const requestedEpisode = episodes.find(
    (episode) => episode.series === series && episode.episode === episodeNumber
  );
  if (requestedEpisode) {
    return formResponseObject(requestedEpisode);
  }
}

module.exports = {
  getAllEpisodes,
  getEpisodeByNumber,
  createEpisodeObject: formResponseObject,
};
