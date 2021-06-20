const { setCache } = require('../util/cache.js');
async function setCacheData (name, data) {
  await setCache(`${name}`, JSON.stringify({ data: data }));
}
async function createFakeRedis () {
  const question = [];
  question[100] = 'apple';
  await setCacheData('question', question);
  const timeCheck = [];
  timeCheck[100] = 1;
  await setCacheData('timeCheck', timeCheck);
};

module.exports = {
  createFakeRedis
};
