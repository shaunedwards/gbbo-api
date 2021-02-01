function filterResultsByEpisodeAndKey(results, episode, key) {
  return results.filter((result) => result[episode] === key).map((e) => e[0]);
}

module.exports = filterResultsByEpisodeAndKey;
