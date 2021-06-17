require('dotenv').config();

const game = require('../models/game_model');

const getSingleGame = async (req, res) => {
  const gameData = await game.getSingleGame(req.user.id, req.body.type);
  res.status(200).send(gameData);
};

const updateHistory = async (req, res) => {
  const data = await game.updateHistory(req.body.gameId, req.user.id, req.body.record);
  res.status(200).send(data);
};

const singleAnswerCheck = async (req, res) => {
  const answer = await game.singleAnswerCheck(req.body.answerId, req.body.answerCheck);
  res.status(200).send(answer);
};

const getSingleAnswer = async (req, res) => {
  const answer = await game.getSingleAnswer(req.body.answerId);
  res.status(200).send(answer);
};

module.exports = {
  getSingleGame,
  updateHistory,
  singleAnswerCheck,
  getSingleAnswer
};
