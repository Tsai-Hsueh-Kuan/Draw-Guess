const router = require('express').Router();

// const cpUpload = upload.single('photo');
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
  replacePhoto,
  uploadPhoto,
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

router.route('/user/replacePhoto')
  .post(verifyToken, upload, wrapAsync(replacePhoto));

router.route('/user/uploadPhoto')
  .post(verifyToken, upload, wrapAsync(uploadPhoto));

router.route('/user/testRate')
  .get(wrapAsync(testRate));

module.exports = router;
