require('dotenv').config();

const game = require('../models/admin_model');

const getGameInfo = async (req, res) => {
  const gameData = await game.getGameInfo(req.body.gameId);
  res.status(200).send(gameData);
};

const getPendingGame = async (req, res) => {
  const gameData = await game.getPendingGame();
  res.status(200).send(gameData);
};

const gameStatus = async (req, res) => {
  const data = await game.gameStatus(req.body.status, req.body.gameId);
  res.status(200).send({ data: data });
};

module.exports = {
  getGameInfo,
  gameStatus,
  getPendingGame
};
