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
  getAnswer,
  checkAnswer,
  getcrawler,
  checkGame
} = require('../controllers/game_controller');

router.route('/game/single')
  .post(verifyToken, wrapAsync(getSingleGame));

router.route('/game/singleTest')
  .post(verifyToken, wrapAsync(getSingleGameTest));

router.route('/game/history')
  .post(verifyToken, wrapAsync(updateHistory));

router.route('/game/answer')
  .post(verifyToken, wrapAsync(checkAnswer));

router.route('/game/done')
  .post(verifyToken, wrapAsync(getAnswer));

router.route('/game/crawler')
  .get(wrapAsync(getcrawler));

router.route('/game/checkGame')
  .post(verifyTokenAdmin, wrapAsync(checkGame));

module.exports = router;
