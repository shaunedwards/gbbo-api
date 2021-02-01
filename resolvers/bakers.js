const bakers = require('../data/bakers.json');
const calcBakerStat = require('../utils/calcBakerStat');

function formResponseObject(baker) {
  return {
    ...baker,
    starBakerAwards: calcBakerStat(baker, 'starBaker'),
    technicalWins: calcBakerStat(baker, 'technicalWinner'),
    numAppearances: calcBakerStat(baker, 'participants'),
  };
}

function getAllBakers({ series }) {
  if (series !== undefined) {
    return bakers
      .filter((baker) => baker.series === series)
      .map((baker) => formResponseObject(baker));
  }
  return bakers.map((baker) => formResponseObject(baker));
}

function getBakerByNameAndSeries({ name, series }) {
  const requestedBaker = bakers.find(
    (baker) => baker.name.includes(name) && baker.series === series
  );
  if (requestedBaker) {
    return formResponseObject(requestedBaker);
  }
}

module.exports = {
  getAllBakers,
  getBakerByNameAndSeries,
  createBakerObject: formResponseObject,
};
