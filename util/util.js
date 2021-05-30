// const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');
// const port = process.env.PORT;
const User = require('../server/models/user_model');
const { TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const s3 = new aws.S3({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'kuans3/draw',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Get the auth header value
  const token = authHeader.replace('Bearer ', '');
  if (token === 'null') {
    console.log('please登入');
    res.sendStatus(401);
  } else {
    jwt.verify(token, TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log('wrong token');
        return res.sendStatus(403);
      };
      result = await User.getUserDetail(result.id);
      req.user = result;
      next();
    });
  }
};

module.exports = {
  upload,
  wrapAsync,
  verifyToken
};
