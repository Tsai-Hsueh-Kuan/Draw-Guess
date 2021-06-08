require('dotenv').config();
const { REDIS_HOST } = process.env;
const { promisify } = require('util');

const redis = require('redis');
const cache = redis.createClient(6379, REDIS_HOST, { no_ready_check: true });
cache.on('ready', () => {
  console.log('redis is ready');
});
cache.on('error', () => {
  console.log('redis is error');
});

const promisifyget = promisify(cache.get).bind(cache);
const promisifyset = promisify(cache.set).bind(cache);
const promisifydel = promisify(cache.del).bind(cache);

module.exports = {
  cache,
  promisifyget,
  promisifyset,
  promisifydel
};
