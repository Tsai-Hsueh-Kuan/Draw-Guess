const router = require('express').Router();
const { upload } = require('../../util/util');
const cpUpload = upload.single('photo');
const {
  wrapAsync,
  verifyToken
} = require('../../util/util');

const {
  getSingleGame,
  updateHistory
} = require('../controllers/game_controller');

router.route('/game/single')
  .post(verifyToken, wrapAsync(getSingleGame));

router.route('/game/history')
  .post(verifyToken, wrapAsync(updateHistory));

module.exports = router;
