require('dotenv').config();
const validator = require('validator');
const User = require('../models/game_model');
const util = require('../../util/util');
const { TOKEN_SECRET } = process.env;
const jwt = require('jsonwebtoken');

const getSingleGame = async (req, res) => {
  const gameData = await User.getSingleGame(req.user.id, req.body.type);
  res.status(200).send(gameData);
};

const updateHistory = async (req, res) => {
  await User.updateHistory(req.body.gameId, req.user.id, req.body.record);
  res.status(200).send('done');
};

module.exports = {
  getSingleGame,
  updateHistory
};
