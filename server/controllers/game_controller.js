require('dotenv').config();

const game = require('../models/game_model');
const cheerio = require('cheerio');

const getSingleGame = async (req, res) => {
  const gameData = await game.getSingleGame(req.user.id, req.body.type);
  res.status(200).send(gameData);
};

const getSingleGameTest = async (req, res) => {
  const gameData = await game.getSingleGameTest(req.user.id, req.body.gameId);
  res.status(200).send(gameData);
};

const getSingleGameNeedCheck = async (req, res) => {
  const gameData = await game.getSingleGameNeedCheck();
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

const gameCheck = async (req, res) => {
  const data = await game.gameCheck(req.body.status, req.body.gameId);
  res.status(200).send({ data: data });
};

const idiomCrawler = async (req, res) => {
  const count = 0;
  const request = require('request');
  for (let i = 1; i < count; i++) {
    const url = `https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=${i}&q=1`;

    request(url, (err, res, body) => {
      try {
        const $ = cheerio.load(body);
        const data = [];
        $('#idiomTab tbody tr td').each(function (i, elem) {
          DataTransfer.push($(this).text().split('\n'));
        });

        const idiom = data[0][0].split('(')[1].replace(')', '');
        if (idiom.length === 4) {
          game.getcrawler(idiom, 'idiom');
        }
        return;
      } catch {
        return err;
      }
    });
  }

  res.status(200).send('done');
};

const englishCrawler = async (req, res) => {
  const count = 5;
  const request = require('request');
  const url = 'https://lingokids.com/english-for-kids/animals';
  request(url, (err, res, body) => {
    try {
      const $ = cheerio.load(body);
      const data = [];
      $('.elementor-13514 .elementor-element.elementor-element-b3e5474').each(function (i, elem) {
        data.push($(this).text().split('\n'));
      });
      for (let i = 0; i < count; i++) {
        if (data[0][48 + (i)] && data[0][48 + (i)] !== ' ') {
          try {
            console.log(data[0][48 + (i)]);
            game.getcrawler(data[0][48 + (i)], 'english');
          } catch {
            console.log('err');
          }
        }
      }
    } catch {
      return err;
    }
  });
  res.status(200).send('done');
};

module.exports = {
  getSingleGame,
  getSingleGameTest,
  updateHistory,
  singleAnswerCheck,
  getSingleAnswer,
  idiomCrawler,
  englishCrawler,
  gameCheck,
  getSingleGameNeedCheck
};
