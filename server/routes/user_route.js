const router = require('express').Router();
const { upload } = require('../../util/util');
const cpUpload = upload.single('photo');
const {
  wrapAsync,
  verifyToken
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
  .post(cpUpload, wrapAsync(signUp));

router.route('/user/signin')
  .post(cpUpload, wrapAsync(signIn));

router.route('/user/profile')
  .get(verifyToken, wrapAsync(getUserProfile));

router.route('/user/replacePhoto')
  .post(verifyToken, cpUpload, wrapAsync(replacePhoto));

router.route('/user/uploadPhoto')
  .post(verifyToken, cpUpload, wrapAsync(uploadPhoto));

router.route('/user/testRate')
  .get(wrapAsync(testRate));

module.exports = router;
