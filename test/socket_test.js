require('dotenv').config();
const { assert } = require('./set_up.js');
const { options1, options2, options3, socketURL } = require('./fake_data');
const io = require('socket.io-client');
describe('socket server test', async function () {
  let client1;
  let client2;
  let client3;
  beforeEach(function (done) {
    client1 = io.connect(socketURL, options1);
    client2 = io.connect(socketURL, options2);
    client3 = io.connect(socketURL, options3);
    setTimeout(done, 100);
  });

  afterEach(function (done) {
    client1.disconnect();
    client2.disconnect();
    client3.disconnect();
    done();
  });
  it('onlineUser', function (done) {
    client1.on('onlineUserShow', function (msg) {
      assert.deepEqual(msg.userAll, [78]);
    });

    client2.on('onlineUserShow', function (msg) {
      assert.deepEqual(msg.userAll, [78]);
      done();
    });
    client1.emit('onlineUser', '');
  });

  it('roomMsg msg ok', function (done) {
    client2.on('roomMsgShow', function (msg) {
      assert.equal(msg.room, '100');
      assert.equal(msg.roomMsg, 'hello');
      assert.equal(msg.userName, 'test');
      done();
    });
    client1.emit('roomMsg', { room: '100', roomMsg: 'hello', userName: 'test' });
  });

  it('roomMsg msg include answer', function (done) {
    client2.on('roomMsgShow', function (msg) {
      assert.equal(msg.err, 'err');
      assert.equal(msg.userName, 'test');
      done();
    });

    client1.emit('roomMsg', { room: '100', roomMsg: 'hi apple!', userName: 'test' });
  });

  it('roomData', function (done) {
    client3.on('roomList', function (msg) {
      assert.equal(msg.roomList[0], '1');
    });

    client3.on('mainPageView', function (msg) {
      assert.equal(msg.roomId, 1);
      assert.equal(msg.hostId, 78);
      assert.deepEqual(msg.hostDetail[0], {
        id: 78,
        name: 'KUAN',
        photo: 'https://d3cek75nx38k91.cloudfront.net/draw/handsome.jpg',
        score: 3655
      });
      assert.equal(msg.roomType, 'english');
      assert.equal(msg.roomUserId[0], 76);
      assert.deepEqual(msg.roomUserData[0][0], {
        id: 76,
        name: 'test',
        photo: 'https://d3cek75nx38k91.cloudfront.net/draw/github.png',
        score: 4776
      });
      done();
    });

    client3.emit('roomData', '');
  });

  it('home rank', function (done) {
    client1.on('getRank', function (msg) {
      assert.deepEqual(msg.data,
        [
          {
            id: 76,
            name: 'test',
            photo: 'https://d3cek75nx38k91.cloudfront.net/draw/github.png',
            score: 4776
          },
          {
            id: 78,
            name: 'KUAN',
            photo: 'https://d3cek75nx38k91.cloudfront.net/draw/handsome.jpg',
            score: 3655
          }
        ]
      );
      done();
    });
    client1.emit('homeRank', '');
  });
});
