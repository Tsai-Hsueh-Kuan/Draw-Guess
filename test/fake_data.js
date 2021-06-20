require('dotenv').config();
const { KUAN_TOKEN, TEST_TOKEN, PORT_TEST } = process.env;
const options1 = {
  auth: {
    token: KUAN_TOKEN,
    room: 1,
    type: 'host',
    roomType: 'english',
    limitTime: 60
  },
  transports: ['websocket'],
  'force new connection': true
};

const options2 = {
  auth: {
    token: TEST_TOKEN,
    room: 1,
    type: 'player',
    roomType: 'english'
  },
  transports: ['websocket'],
  'force new connection': true
};

const options3 = {
  auth: {
    token: TEST_TOKEN,
    room: 'homePage',
    type: 'homePage'
  },
  transports: ['websocket'],
  'force new connection': true
};
const socketURL = `http://localhost:${PORT_TEST}`;

module.exports = {
  options1,
  options2,
  options3,
  socketURL
};
