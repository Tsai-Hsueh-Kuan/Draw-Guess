require('dotenv').config();
const { NODE_ENV, PORT_TEST } = process.env;
const server = require('../app');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;
server.listen(PORT_TEST, function () { console.log(`start test server at port ${PORT_TEST}`); });
const requester = chai.request(server).keepOpen();

const { createFakeRedis } = require('./fake_data_generator.js');
beforeEach(async () => {
  if (NODE_ENV !== 'test') {
    throw 'Not in test env';
  }
  await createFakeRedis();
});

module.exports = {
  assert,
  requester
};
