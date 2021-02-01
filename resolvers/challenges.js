const challenges = require('../data/challenges.json');
const { getBakerByNameAndSeries } = require('./bakers');

function sortByRanking(a, b) {
  a = parseInt(a.submission);
  b = parseInt(b.submission);
  if (Number.isFinite(a - b)) {
    return a - b;
  }
  return Number.isFinite(a) ? -1 : 1;
}

function formResponseObject(challenge) {
  return {
    ...challenge,
    signature: {
      ...challenge.signature,
      bakes: challenge.signature.bakes.map((bake) => ({
        ...bake,
        baker: getBakerByNameAndSeries({
          name: bake.baker,
          series: challenge.series,
        }),
      })),
    },
    technical: {
      ...challenge.technical,
      bakes: challenge.technical.bakes
        .map((bake) => ({
          ...bake,
          baker: getBakerByNameAndSeries({
            name: bake.baker,
            series: challenge.series,
          }),
        }))
        .sort(sortByRanking),
    },
    showstopper: {
      ...challenge.showstopper,
      bakes: challenge.showstopper.bakes.map((bake) => ({
        ...bake,
        baker: getBakerByNameAndSeries({
          name: bake.baker,
          series: challenge.series,
        }),
      })),
    },
  };
}

function getAllChallenges({ series }) {
  if (series !== undefined) {
    return challenges
      .filter((challenge) => challenge.series === series)
      .map((challenge) => formResponseObject(challenge));
  }
  return challenges.map((challenge) => formResponseObject(challenge));
}

function getChallengesByEpisode({ series, episodeNumber }) {
  const requestedChallenge = challenges.find(
    (challenge) =>
      challenge.series === series && challenge.episode === episodeNumber
  );
  if (requestedChallenge) {
    return formResponseObject(requestedChallenge);
  }
}

module.exports = {
  getAllChallenges,
  getChallengesByEpisode,
  createChallengeObject: formResponseObject,
};
