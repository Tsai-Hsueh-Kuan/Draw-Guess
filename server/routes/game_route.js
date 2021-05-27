const router = require('express').Router();
const { upload } = require('../../util/util');
const cpUpload = upload.single('photo');
const {
  wrapAsync,
  verifyToken
} = require('../../util/util');

const {
  getSingleGame,
  updateHistory,
  getAnswer,
  checkAnswer,
  getcrawler,
  del
} = require('../controllers/game_controller');

router.route('/game/single')
  .post(verifyToken, wrapAsync(getSingleGame));

router.route('/game/history')
  .post(verifyToken, wrapAsync(updateHistory));

router.route('/game/answer')
  .post(verifyToken, wrapAsync(checkAnswer));

router.route('/game/done')
  .post(verifyToken, wrapAsync(getAnswer));

router.route('/game/crawler')
  .get(wrapAsync(getcrawler));

module.exports = router;
