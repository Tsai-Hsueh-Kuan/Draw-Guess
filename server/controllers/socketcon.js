const {
  cache,
  getCache,
  setCache
} = require('../../util/cache.js');

const { getquestion, updateInuse, resetInuse, getGame, getHistory, updateHistory, updateScore, inputCanvas, verifyTokenSocket, getRank, getUser, checkGameCanvas, canvasUpdate, updateReport, updateHeart } = require('../models/socketcon_model');

cache.flushdb(function (err, ok) {
  if (err) {
    console.log(err);
    return err;
  }
  if (ok) {
    console.log(ok);
  }
});

function setCacheArr (name) {
  for (const i in name) {
    cache.set(name[i], JSON.stringify({ data: [] }), 'NX', function (err) {
      if (err) {
        console.log(err);
        console.log(`${name[i]} err`);
      }
    });
  }
}

setCacheArr(['timeCheck', 'question', 'questionId', 'canvas', 'hostId', 'gameId', 'gameTime', 'userId', 'roomUserId', 'hostDetail', 'roomUserData', 'correctUserList', 'roomType', 'hostDisconnect', 'roomList', 'userAll', 'startTime', 'heartCount']);

async function getCacheData (name) {
  const cacheGet = await getCache(`${name}`);
  const data = JSON.parse(cacheGet).data;
  return data;
}
async function setCacheData (name, data) {
  await setCache(`${name}`, JSON.stringify({ data: data }));
}

const socketCon = (io) => {
  io.on('connection', async (socket) => {
    const inToken = socket.handshake.auth.token;
    const inRoom = socket.handshake.auth.room;
    const intype = socket.handshake.auth.type;
    const inRoomType = socket.handshake.auth.roomType;
    const limitTime = socket.handshake.auth.limitTime;

    const timeCheck = await getCacheData('timeCheck');
    const roomUserId = await getCacheData('roomUserId');
    const roomUserData = await getCacheData('roomUserData');
    socket.join(inRoom);
    if (inToken) {
      const verifyHost = await verifyTokenSocket(inToken);
      if (verifyHost.err) {
        return;
      } else {
        const userAll = await getCacheData('userAll');
        if (!userAll[0]) {
          userAll[0] = verifyHost.id;
        } else {
          userAll.push(verifyHost.id);
        }
        await setCacheData('userAll', userAll);
        socket.on('onlineUser', async (msg) => {
          socket.emit('onlineUserShow', { userAll: userAll });
          socket.broadcast.emit('onlineUserShow', { userAll: userAll });
        });
        if (`${intype}` === 'host') {
          const roomList = await getCacheData('roomList');
          if (!roomList[0]) {
            roomList[0] = inRoom;
          } else {
            roomList.push(inRoom);
          }
          await setCacheData('roomList', roomList);

          const roomType = await getCacheData('roomType');
          roomType[inRoom] = inRoomType;
          await setCacheData('roomType', roomType);

          const hostDisconnect = await getCacheData('hostDisconnect');
          hostDisconnect[inRoom] = false;
          await setCacheData('hostDisconnect', hostDisconnect);

          const hostId = await getCacheData('hostId');
          hostId[inRoom] = verifyHost.id;
          await setCacheData('hostId', hostId);

          const hostDetail = getCacheData('hostDetail');
          hostDetail[inRoom] = await getUser(verifyHost.id);
          await setCacheData('hostDetail', hostDetail);

          const roomUserId = await getCacheData('roomUserId');
          const roomUserData = await getCacheData('roomUserData');

          const heartCount = await getCacheData('heartCount');
          heartCount[inRoom] = 0;
          await setCacheData('heartCount', heartCount);

          socket.broadcast.emit('roomList', { roomList: roomList });
          socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          io.to(inRoom).emit('roomUserId', { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        } else if (`${intype}` === 'player') {
          const hostId = await getCacheData('hostId');
          if (verifyHost.id === hostId[inRoom]) {
            socket.emit('repeat', { id: verifyHost.id });/// ///
            return;
          } else {
            const roomUserId = await getCacheData('roomUserId');
            if (roomUserId[inRoom]) {
              if (roomUserId[inRoom].indexOf(verifyHost.id) !== -1) {
                socket.emit('repeatUser', { id: verifyHost.id });/// ///
                return;
              }
            }
            const userId = await getCacheData('userId');
            if (userId[inRoom]) {
              userId[inRoom].push(verifyHost.id);
            } else {
              userId[inRoom] = [verifyHost.id];
            }
            await setCacheData('userId', userId);

            const roomUserData = await getCacheData('roomUserData');
            const userDetail = await getUser(verifyHost.id);
            if (roomUserId[inRoom]) {
              roomUserId[inRoom].push(verifyHost.id);
              roomUserData[inRoom].push(userDetail);
            } else {
              roomUserId[inRoom] = [verifyHost.id];
              roomUserData[inRoom] = [userDetail];
            }
            await setCacheData('roomUserId', roomUserId);
            await setCacheData('roomUserData', roomUserData);
            const hostId = await getCacheData('hostId');
            const hostDetail = await getCacheData('hostDetail');
            const roomType = await getCacheData('roomType');
            socket.broadcast.emit('mainPageViewPlayerChange', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            io.to(inRoom).emit('roomUserId', { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            setTimeout(async () => {
              const heartCount = await getCacheData('heartCount');
              io.to(inRoom).emit('heartShow', { data: heartCount[inRoom] });
            }, 500);
          }
        }
      }
    }

    if (timeCheck[inRoom]) {
      const gameId = await getCacheData('gameId');
      const canvasUpate = await canvasUpdate(gameId[inRoom]);
      const now = new Date().getTime();
      const startTime = await getCacheData('startTime');
      const timeDev = Math.ceil((now - startTime[inRoom]) / 1000);
      const userId = await getCacheData('userId');
      const correctUserList = await getCacheData('correctUserList');
      socket.emit(`canvasUpdate${inRoom}id${inToken}`, { canvas: canvasUpate, timeCheck: timeDev, correctUserList: correctUserList[inRoom] });
      await getHistory(gameId[inRoom], userId[inRoom], '999');
      userId[inRoom] = '';
      await setCacheData('userId', userId);
    }

    socket.on('disconnect', async function () {
      if (inToken) {
        const verifyHost = await verifyTokenSocket(inToken);
        const userAll = await getCacheData('userAll');
        for (const i in userAll) {
          if (userAll[i] === verifyHost.id) {
            userAll.splice(i, 1);
          }
        }
        await setCacheData('userAll', userAll);
        socket.broadcast.emit('onlineUserShow', { userAll: userAll });
        socket.emit('onlineUserShow', { userAll: userAll });

        if (`${intype}` === 'host') {
          const hostDisconnect = await getCacheData('hostDisconnect');
          let roomList = await getCacheData('roomList');
          hostDisconnect[inRoom] = true;
          await setCacheData('hostDisconnect', hostDisconnect);
          roomList = roomList.filter(function (item) {
            return item !== inRoom;
          });
          await setCacheData('roomList', roomList);

          setTimeout(async () => {
            const hostDisconnect = await getCacheData('hostDisconnect');
            if (hostDisconnect[inRoom] === true) {
              socket.broadcast.emit('mainPageViewClose', { room: inRoom });
              io.to(inRoom).emit('closeRoom');
              const timeCheck = await getCacheData('timeCheck');
              timeCheck[inRoom] = '';
              await setCacheData('timeCheck', timeCheck);
              const question = await getCacheData('question');
              question[inRoom] = '';
              await setCacheData('question', question);
              const questionId = await getCacheData('questionId');
              questionId[inRoom] = '';
              await setCacheData('questionId', questionId);
              const canvas = await getCacheData('canvas');
              canvas[inRoom] = '';
              await setCacheData('canvas', canvas);
              const hostId = await getCacheData('hostId');
              hostId[inRoom] = '';
              await setCacheData('hostId', hostId);
              const gameId = await getCacheData('gameId');
              gameId[inRoom] = '';
              await setCacheData('gameId', gameId);
              const userId = await getCacheData('userId');
              userId[inRoom] = '';
              await setCacheData('userId', userId);
              const roomUserId = await getCacheData('roomUserId');
              roomUserId[inRoom] = '';
              await setCacheData('roomUserId', roomUserId);
              const hostDetail = await getCacheData('hostDetail');
              hostDetail[inRoom] = '';
              await setCacheData('hostDetail', hostDetail);
              const roomUserData = await getCacheData('roomUserData');
              roomUserData[inRoom] = '';
              await setCacheData('roomUserData', roomUserData);
              const correctUserList = await getCacheData('correctUserList');
              correctUserList[inRoom] = '';
              await setCacheData('correctUserList', correctUserList);
              const roomType = await getCacheData('roomType');
              roomType[inRoom] = '';
              await setCacheData('roomType', roomType);
              const heartCount = await getCacheData('heartCount');
              heartCount[inRoom] = 0;
              await setCacheData('heartCount', heartCount);
            }
          }, 2000);
        } else if (`${intype}` === 'player') {
          const roomUserId = await getCacheData('roomUserId');
          if (roomUserId[inRoom][0]) {
            roomUserId[inRoom] = roomUserId[inRoom].filter(function (item) {
              return item !== verifyHost.id;
            });
            await setCacheData('roomUserId', roomUserId);
            const roomUserData = await getCacheData('roomUserData');
            roomUserData[inRoom] = [];
            for (const i in roomUserId[inRoom]) {
              const userDetail = await getUser(roomUserId[inRoom][i]);
              if (i === 0) {
                roomUserData[inRoom] = [userDetail];
              } else {
                roomUserData[inRoom].push(userDetail);
              }
            }
            await setCacheData('roomUserData', roomUserData);
            const hostId = await getCacheData('hostId');
            const hostDetail = await getCacheData('hostDetail');
            const roomType = await getCacheData('roomType');
            socket.broadcast.emit('mainPageViewPlayerChange', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            io.to(inRoom).emit('roomUserId', { hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          }
        }
      }
    });
    try {
      socket.on('getQuestion', async (msg) => {
        const getPassword = msg.getPassword;
        const timeCheck = await getCacheData('timeCheck');
        if (timeCheck[msg.room]) {
          console.log('repeat get');
        } else {
          const hostId = await getCacheData('hostId');
          hostId[msg.room] = msg.hostId;
          await setCacheData('hostId', hostId);
          let questionData = await getquestion(msg.type);
          if (!questionData[0]) {
            await updateInuse(msg.type);
            questionData = await getquestion(msg.type);
          }
          await resetInuse(questionData[0].id);
          const question = await getCacheData('question');
          question[msg.room] = questionData[0].question;
          await setCacheData('question', question);
          const questionId = await getCacheData('questionId');
          questionId[msg.room] = questionData[0].id;
          await setCacheData('questionId', questionId);
          const userId = await getCacheData('userId');
          userId[msg.room] = '';
          await setCacheData('userId', userId);
          const gameId = await getCacheData('gameId');
          gameId[msg.room] = '';
          await setCacheData('gameId', gameId);
          const correctUserList = await getCacheData('correctUserList');
          correctUserList[msg.room] = '';
          await setCacheData('correctUserList', correctUserList);
          const heartCount = await getCacheData('heartCount');
          heartCount[msg.room] = 0;
          await setCacheData('heartCount', heartCount);
          const roomUserId = await getCacheData('roomUserId');
          if (!gameId[msg.room]) {
            const hostId = await getCacheData('hostId');
            gameId[msg.room] = await getGame(questionId[msg.room], hostId[msg.room]);
            await setCacheData('gameId', gameId);
          }
          socket.to(inRoom).emit('answer', '');
          socket.emit(`question${msg.room}${getPassword}`, question[msg.room]);

          getHistory(gameId[msg.room], roomUserId[inRoom], '999');
          userId[msg.room] = '';
          await setCacheData('userId', userId);
          const gameTime = await getCacheData('gameTime');
          gameTime[msg.room] = 1;// countdown task execution times
          await setCacheData('gameTime', gameTime);
          const timeout = 1000; // time gap
          const startTime = await getCacheData('startTime');
          startTime[msg.room] = new Date().getTime();
          await setCacheData('startTime', startTime);
          const timeCheck = await getCacheData('timeCheck');
          timeCheck[inRoom] = 1;
          await setCacheData('timeCheck', timeCheck);
          socket.broadcast.emit('mainPageCanvasClear', { room: msg.room });
          async function startCountdown (interval) {
            setTimeout(async () => {
              const endTime = new Date().getTime();
              const gameTime = await getCacheData('gameTime');
              const deviation = endTime - (startTime[msg.room] + gameTime[msg.room] * timeout);
              if (gameTime[msg.room] < limitTime) {
                gameTime[msg.room] = gameTime[msg.room] + 1;
                await setCacheData('gameTime', gameTime);
                startCountdown(timeout - deviation);
              } else {
                const timeCheck = await getCacheData('timeCheck');
                timeCheck[msg.room] = 0;
                await setCacheData('timeCheck', timeCheck);
                const gameId = await getCacheData('gameId');
                const correctUserList = await getCacheData('correctUserList');
                correctUserList[msg.room] = '';
                await setCacheData('correctUserList', correctUserList);
                checkGameCanvas(gameId[msg.room]);
                const question = await getCacheData('question');
                io.to(inRoom).emit('answerGet', { answer: question[msg.room] });
              }
            }, interval);
          }
          startCountdown(10000);/// /////
        }
      });

      socket.on('answerCheck', async (msg) => {
        const hostId = await getCacheData('hostId');
        if (msg.userId === hostId[msg.room]) {
          hostId[msg.room] = '';
          await setCacheData('hostId', hostId);
          io.to(inRoom).emit('repeat', { id: msg.userId });
        } else {
          const userData = await getUser(msg.userId);
          const timeCheck = await getCacheData('timeCheck');
          if (timeCheck[msg.room]) {
            const question = await getCacheData('question');
            if (msg.answerData === question[msg.room]) {
              const gameId = await getCacheData('gameId');
              const now = new Date().getTime();
              const startTime = await getCacheData('startTime');
              const timeDev = Math.ceil((now - startTime[inRoom]) / 1000);
              const checktime = limitTime - timeDev;
              updateHistory(gameId[msg.room], msg.userId, msg.canvasNum);
              const hostId = await getCacheData('hostId');
              const hostScore = await updateScore(checktime, msg.userId, hostId[msg.room], gameId[msg.room]);
              const rankData = await getRank();
              const correctUserList = await getCacheData('correctUserList');
              if (correctUserList[msg.room].includes(userData[0].name)) {
                return;
              }
              if (!correctUserList[msg.room]) {
                correctUserList[msg.room] = [userData[0].name];
              } else {
                correctUserList[msg.room].push(userData[0].name);
              }
              await setCacheData('correctUserList', correctUserList);

              socket.broadcast.emit('getRank', { data: rankData });
              socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: true, answer: '' });
              io.to(inRoom).emit('userCorrect', { userData: userData, canvasNum: msg.canvasNum, time: timeDev, score: checktime, hostScore: hostScore });
              const roomUserData = await getCacheData('roomUserData');
              let roomUserName = [];
              roomUserName = roomUserData[msg.room].map(item => item[0].name);
              if ((correctUserList[msg.room].sort().toString() === roomUserName.sort().toString())) {
                setTimeout(async () => {
                  const gameTime = await getCacheData('gameTime');
                  gameTime[msg.room] = 60;
                  await setCacheData('gameTime', gameTime);
                  io.to(inRoom).emit('allCorrect', { data: 'ok' });
                }, 1000);
              }
            } else {
              socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: false, answer: '' });
              io.to(inRoom).emit('answerShow', { data: msg.answerData, userData: userData });
            }
          } else if (timeCheck[msg.room] === 0) {
            console.log('timeout');
          }
        }
      });

      socket.on('report', async (msg) => {
        const gameId = await getCacheData('gameId');
        const report = await updateReport(gameId[msg.room], msg.reason, msg.userId);
        if (report) {
          io.to(inRoom).emit('reportOk', { reason: msg.reason });
        }
      });

      socket.on('homeRank', async (msg) => {
        const rankData = await getRank();
        socket.emit('getRank', { data: rankData });
      });

      socket.on('giveHeart', async (msg) => {
        const hostId = await getCacheData('hostId');
        await updateHeart(hostId[msg.room]);
        const heartCount = await getCacheData('heartCount');
        heartCount[msg.room]++;
        await setCacheData('heartCount', heartCount);
        io.to(inRoom).emit('heartShow', { data: heartCount[msg.room] });
      });

      socket.on('roomMsg', async (msg) => {
        const question = await getCacheData('question');
        const questionText = new RegExp(`${question[msg.room]}`);
        const timeCheck = await getCacheData('timeCheck');
        const msgLength = msg.roomMsg.length;
        if (timeCheck[msg.room] && questionText.test(msg.roomMsg) === true) {
          io.to(inRoom).emit('roomMsgShow', { err: 'err', userName: msg.userName });
        } else {
          if (msgLength < 31) {
            io.to(inRoom).emit('roomMsgShow', msg);
          }
        }
      });

      socket.on('canvasData', async (msg) => {
        const gameId = await getCacheData('gameId');
        await setCache(gameId[msg.room] + msg.canvasNum, msg.url, 'Ex', 300);
        socket.broadcast.emit('mainPageConvasData', { room: msg.room, url: msg.url });
        socket.to(inRoom).emit('convasData', msg.url);
        await inputCanvas(gameId[msg.room], msg.canvasNum, msg.url, 0);
      });

      socket.on('undo', async (msg) => {
        const gameId = await getCacheData('gameId');
        socket.broadcast.emit('mainPageUndo', { room: msg.room, data: msg.data });
        socket.to(inRoom).emit('undo msg', msg.data);
        await inputCanvas(gameId[msg.room], msg.canvasNum, 0, msg.data);
      });

      socket.on('redo', async (msg) => {
        const gameId = await getCacheData('gameId');
        const redoUrl = await getCache(gameId[msg.room] + msg.canvasNum);
        if (redoUrl) {
          socket.broadcast.emit('mainPageConvasData', { room: msg.room, url: redoUrl });
          socket.to(inRoom).emit('convasData', redoUrl);
          socket.emit('redo url', redoUrl);
        }
        await inputCanvas(gameId[msg.room], msg.canvasNum, redoUrl, 0);
      });

      socket.on('roomData', async (msg) => {
        const hostId = await getCacheData('hostId');
        const hostDetail = await getCacheData('hostDetail');
        const roomType = await getCacheData('roomType');
        const roomList = await getCacheData('roomList');
        socket.emit('roomList', { roomList: roomList });
        for (const i in roomList) {
          socket.emit('mainPageView', { roomId: roomList[i], hostId: hostId[parseInt(roomList[i])], hostDetail: hostDetail[parseInt(roomList[i])], roomType: roomType[parseInt(roomList[i])], roomUserId: roomUserId[parseInt(roomList[i])], roomUserData: roomUserData[parseInt(roomList[i])] });
        }
      });

      socket.on('closeRoom', async (msg) => {
        socket.to(inRoom).emit('closeRoom', { data: 'close' });
      });

      socket.on('homePageRoomTab', async (msg) => {
        const timeCheck = await getCacheData('timeCheck');
        const gameId = await getCacheData('gameId');
        const roomList = await getCacheData('roomList');
        const result = roomList.filter(function (element, index, arr) {
          return arr.indexOf(element) === index;
        });
        for (const i in result) {
          if (timeCheck[parseInt(result[i])]) {
            const canvasUpate = await canvasUpdate(gameId[parseInt(result[i])]);
            if (canvasUpate[0]) {
              socket.emit('canvasUpdate', { room: parseInt(result[i]), canvas: canvasUpate, game: true });
            } else {
              console.log('no canvas');
            }
          }
        }
      });
    } catch (err) {
      console.log(err);
      return err;
    }
  });
};

module.exports = {
  socketCon
};
