const ratings = require('../data/ratings.json');

function getAllRatings({ series }) {
  if (series !== undefined) {
    return ratings.filter((rating) => rating.series === series);
  }
  return ratings;
}

function getRatingsByEpisode({ series, episodeNumber }) {
  return ratings.find(
    (rating) => rating.series === series && rating.episode === episodeNumber
  );
}

module.exports = {
  getAllRatings,
  getRatingsByEpisode,
};
