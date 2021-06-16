const router = require('express').Router();
const {
  wrapAsync,
  verifyToken,
  verifyTokenAdmin
} = require('../../util/util');

const {
  getSingleGame,
  getSingleGameTest,
  updateHistory,
  getSingleAnswer,
  singleAnswerCheck,
  getcrawler,
  gameCheck,
  getSingleGameNeedCheck
} = require('../controllers/game_controller');

router.route('/game/single')
  .post(verifyToken, wrapAsync(getSingleGame));

router.route('/game/singleTest')
  .post(verifyToken, wrapAsync(getSingleGameTest));

router.route('/game/singleGameNeedCheck')
  .get(verifyToken, wrapAsync(getSingleGameNeedCheck));

router.route('/game/history')
  .post(verifyToken, wrapAsync(updateHistory));

router.route('/game/singleAnswerCheck')
  .post(verifyToken, wrapAsync(singleAnswerCheck));

router.route('/game/singleAnswer')
  .post(verifyToken, wrapAsync(getSingleAnswer));

router.route('/game/crawler')
  .get(wrapAsync(getcrawler));

router.route('/game/gameCheck')
  .post(verifyTokenAdmin, wrapAsync(gameCheck));

module.exports = router;
