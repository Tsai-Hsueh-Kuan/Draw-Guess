require('dotenv').config();
const { NODE_ENV, RATE_LIMIT_WINDOW, RATE_LIMIT_COUNT } = process.env;
const Cache = require('./cache');
// const QUOTA = (NODE_ENV === 'test' ? 10000 : (RATE_LIMIT_COUNT || 10));
const QUOTA = 100000000000;
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
        if (reqCount > QUOTA) {
          resolve({ status: 429, message: `Quota of ${QUOTA} per ${WINDOW}sec exceeded` });
        }
        resolve({ status: 200, message: 'OK' });
      });
  });
}

const rateLimiterRoute = async (req, res, next) => {
  if (!Cache.cache.ready) { // when redis not connected
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
