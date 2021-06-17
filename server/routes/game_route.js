const router = require('express').Router();
const {
  wrapAsync,
  verifyToken
} = require('../../util/util');

const {
  getSingleGame,
  updateHistory,
  getSingleAnswer,
  singleAnswerCheck
} = require('../controllers/game_controller');

router.route('/game/single')
  .post(verifyToken, wrapAsync(getSingleGame));

router.route('/game/history')
  .post(verifyToken, wrapAsync(updateHistory));

router.route('/game/singleAnswerCheck')
  .post(verifyToken, wrapAsync(singleAnswerCheck));

router.route('/game/singleAnswer')
  .post(verifyToken, wrapAsync(getSingleAnswer));

module.exports = router;
