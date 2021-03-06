const User = require('../server/models/user_model');
const { TOKEN_SECRET } = process.env;
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
  }),
  limits: {
    fileSize: 1000000
  }
}).single('photo');

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.replace('Bearer ', '');
  if (token === 'null') {
    res.status(401).send({ error: 'please登入' });
  } else {
    jwt.verify(token, TOKEN_SECRET, async (err, result) => {
      if (err) {
        res.status(403).send({ error: 'wrong token' });
        return;
      };
      result = await User.getUserDetail(result.id);
      req.user = result;
      next();
    });
  }
};

const verifyTokenAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.replace('Bearer ', '');
  if (token === 'null') {
    res.status(401).send({ error: 'please登入' });
  } else {
    jwt.verify(token, TOKEN_SECRET, async (err, result) => {
      if (err) {
        res.status(403).send({ error: 'wrong token' });
        return;
      };
      result = await User.getUserDetail(result.id);
      if (result.name !== 'KUAN') {
        res.status(403).send({ error: 'not admin' });
        return;
      }
      req.user = result;
      next();
    });
  }
};

module.exports = {
  upload,
  wrapAsync,
  verifyToken,
  verifyTokenAdmin
};
