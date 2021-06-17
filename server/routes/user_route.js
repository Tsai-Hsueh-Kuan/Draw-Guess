const router = require('express').Router();

const {
  wrapAsync,
  verifyToken,
  verifyTokenAdmin,
  upload
} = require('../../util/util');

const {
  signUp,
  signIn,
  getUserProfile,
  photoReplace,
  photoUpload,
  testRate
} = require('../controllers/user_controller');

router.route('/user/signup')
  .post(upload, wrapAsync(signUp));

router.route('/user/signin')
  .post(upload, wrapAsync(signIn));

router.route('/user/profile')
  .get(verifyToken, wrapAsync(getUserProfile));

router.route('/user/profileAdmin')
  .get(verifyTokenAdmin, wrapAsync(getUserProfile));

router.route('/user/photoReplace')
  .patch(verifyToken, upload, wrapAsync(photoReplace));

router.route('/user/photoUpload')
  .patch(verifyToken, upload, wrapAsync(photoUpload));

router.route('/user/testRate')
  .get(verifyTokenAdmin, wrapAsync(testRate));

module.exports = router;
