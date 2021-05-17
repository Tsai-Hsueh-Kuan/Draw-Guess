const router = require('express').Router();
const { upload } = require('../../util/util');
const cpUpload = upload.single('photo');
const {
  wrapAsync,
  verifyToken
} = require('../../util/util');

const {
  getSingleGame
} = require('../controllers/game_controller');

router.route('/game/single')
  .post(verifyToken, wrapAsync(getSingleGame));

module.exports = router;
