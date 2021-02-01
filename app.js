const express = require('express');
const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const {
  getAllChallenges,
  getChallengesByEpisode,
} = require('./resolvers/challenges');
const { getAllEpisodes, getEpisodeByNumber } = require('./resolvers/episodes');
const { getAllBakers, getBakerByNameAndSeries } = require('./resolvers/bakers');
const { getAllRatings, getRatingsByEpisode } = require('./resolvers/ratings');
const { getAllSeries, getSeriesByNumber } = require('./resolvers/series');

const schema = buildSchema(`
  type Query {
    allBakers(series: Int): [Baker]
    baker(name: String!, series: Int!): Baker
    allEpisodes(series: Int): [Episode]
    episode(series: Int!, episodeNumber: Int!): Episode
    allSeries: [Series]
    series(seriesNumber: Int!): Series
    allRatings(series: Int): [Ratings]
    ratings(series: Int!, episodeNumber: Int!): Ratings
    allChallenges(series: Int): [Challenges]
    challenges(series: Int!, episodeNumber: Int!): Challenges
  }

  type Baker {
    series: Int
    name: String
    age: Int
    occupation: String
    hometown: String
    forename: String
    surname: String
    alias: String
    technicalWins: Int
    starBakerAwards: Int
    numAppearances: Int
  }

  type Episode {
    series: Int
    episode: Int
    theme: String
    bakersRemaining: Int
    starBaker: [Baker]
    eliminated: [Baker]
    technicalWinner: [Baker]
    challenges: Challenges
    ratings: Ratings
    participants: [Baker]
    synopsis: String
  }

  type Challenges {
    series: Int
    episode: Int
    signature: Challenge
    technical: Challenge
    showstopper: Challenge
  }

  type Challenge {
    challenge: String
    bakes: [BakerChallenge]
  }

  type BakerChallenge {
    baker: Baker
    submission: String
  }

  type Series {
    series: Int
    numEpisodes: Int
    premiereDate: String
    finaleDate: String
    winner: Baker
    runnersUp: [Baker]
    episodes: [Episode]
    bakers: [Baker]
    network: String
    avgViewerCount: Float
  }

  type Ratings {
    series: Int
    episode: Int
    airdate: String
    overSevenDays: Float
    overTwentyEightDays: Float
    networkWeeklyRanking: Int
    allChannelsWeeklyRanking: Int
  }
`);

const root = {
  allBakers: getAllBakers,
  baker: getBakerByNameAndSeries,
  allEpisodes: getAllEpisodes,
  episode: getEpisodeByNumber,
  allRatings: getAllRatings,
  ratings: getRatingsByEpisode,
  allSeries: getAllSeries,
  series: getSeriesByNumber,
  allChallenges: getAllChallenges,
  challenges: getChallengesByEpisode,
};

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
