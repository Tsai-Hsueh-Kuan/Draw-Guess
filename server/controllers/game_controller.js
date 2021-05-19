require('dotenv').config();
const validator = require('validator');
const Game = require('../models/game_model');
const util = require('../../util/util');
const { TOKEN_SECRET } = process.env;
const jwt = require('jsonwebtoken');

const getSingleGame = async (req, res) => {
  const gameData = await Game.getSingleGame(req.user.id, req.body.type);
  res.status(200).send(gameData);
};

const updateHistory = async (req, res) => {
  await Game.updateHistory(req.body.gameId, req.user.id, req.body.record);
  res.status(200).send('done');
};

const getAnswer = async (req, res) => {
  console.log(req.body);
  const answer = await Game.getAnswer(req.body.answerId);
  res.status(200).send(answer);
};

module.exports = {
  getSingleGame,
  updateHistory,
  getAnswer
};
