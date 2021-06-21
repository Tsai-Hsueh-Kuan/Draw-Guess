const router = require('express').Router();
const {
  wrapAsync,
  verifyTokenAdmin
} = require('../../util/util');
const {
  getGameInfo,
  gameStatus,
  getPendingGame
} = require('../controllers/admin_controller');

router.route('/admin/gameInfo')
  .post(verifyTokenAdmin, wrapAsync(getGameInfo));

router.route('/admin/pendingGame')
  .get(verifyTokenAdmin, wrapAsync(getPendingGame));

router.route('/admin/gameStatus')
  .patch(verifyTokenAdmin, wrapAsync(gameStatus));

module.exports = router;
