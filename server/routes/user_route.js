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
  .put(verifyToken, upload, wrapAsync(photoReplace));

router.route('/user/photoUpload')
  .post(verifyToken, upload, wrapAsync(photoUpload));

router.route('/user/testRate')
  .get(wrapAsync(testRate));

module.exports = router;
