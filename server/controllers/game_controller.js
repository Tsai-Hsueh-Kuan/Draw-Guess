require('dotenv').config();
const validator = require('validator');
const Game = require('../models/game_model');
const util = require('../../util/util');
const { TOKEN_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const cheerio = require('cheerio');

const getSingleGame = async (req, res) => {
  const gameData = await Game.getSingleGame(req.user.id, req.body.type);
  res.status(200).send(gameData);
};

const updateHistory = async (req, res) => {
  await Game.updateHistory(req.body.gameId, req.user.id, req.body.record);
  res.status(200).send('done');
};

const checkAnswer = async (req, res) => {
  const answer = await Game.checkAnswer(req.body.answerId, req.body.answerCheck);
  res.status(200).send(answer);
};

const getAnswer = async (req, res) => {
  const answer = await Game.getAnswer(req.body.answerId);
  res.status(200).send(answer);
};

const getcrawler = async (req, res) => {
  console.log('1');
  const request = require('request');
  for (let i = 1; i < 1000; i++) {
    const url = `https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=${i + 2000}&q=1`;

    request(url, (err, res, body) => {
      try {
        const $ = cheerio.load(body);
        const weathers = [];
        $('#idiomTab tbody tr td').each(function (i, elem) {
          weathers.push($(this).text().split('\n'));
        });

        if (weathers[0][0].length === 4) {
          console.log(weathers[0][0]);
          Game.getcrawler(weathers[0][0]);
        }

        return;
      } catch {
        return err;
      }
    });
  }

  res.status(200).send('done');
};

// const request = require('request');
//   const url = 'https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=549&q=1';
//   request(url, (err, res, body) => {
//     try {
//       const $ = cheerio.load(body);
//       const weathers = [];
//       $('#idiomTab tbody tr td').each(function (i, elem) {
//         weathers.push($(this).text().split('\n'));
//       });
//       console.log(weathers[0][0]);
//       res.status(200).send('123');
//       return;
//     } catch {
//       return err;
//     }
//   });

module.exports = {
  getSingleGame,
  updateHistory,
  checkAnswer,
  getAnswer,
  getcrawler

};
