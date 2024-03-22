const Game = require("./model");

module.exports.getGameById = async function (gameId) {
  const game = await Game.findById(gameId);
  return game;
}