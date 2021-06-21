require('dotenv').config();
const { NODE_ENV, RATE_LIMIT_WINDOW, RATE_LIMIT_COUNT, RATE_LIMIT_COUNT_DEVELOPMENT, RATE_LIMIT_COUNT_TEST } = process.env;
const Cache = require('./cache');
const env = NODE_ENV;
const QUOTA = {
  production: RATE_LIMIT_COUNT,
  development: RATE_LIMIT_COUNT_DEVELOPMENT,
  test: RATE_LIMIT_COUNT_TEST
};
const WINDOW = (RATE_LIMIT_WINDOW || 1);
function rateLimiter (token) {
  return new Promise((resolve, reject) => {
    Cache.cache
      .multi()
      .set([token, 0, 'EX', WINDOW, 'NX'])
      .incr(token)
      .exec((err, replies) => {
        if (err) {
          resolve({ status: 500, message: 'Internal Server Error' });
        }
        const reqCount = replies[1];
        if (reqCount > QUOTA[env]) {
          resolve({ status: 429, message: `Quota of ${QUOTA[env]} per ${WINDOW}sec exceeded` });
        }
        resolve({ status: 200, message: 'OK' });
      });
  });
}

const rateLimiterRoute = async (req, res, next) => {
  if (!Cache.cache.ready) {
    return next();
  } else {
    try {
      const token = req.ip;
      const result = await rateLimiter(token);
      if (result.status === 200) {
        return next();
      } else {
        res.status(result.status).send(result.message);
        return;
      }
    } catch {
      return next();
    }
  }
};

module.exports = { rateLimiterRoute };
