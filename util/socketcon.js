const {
  cache,
  promisifyget,
  promisifyset
} = require('./cache.js');

const { getquestion, updateInuse, resetInuse, getGame, getHistory, updateHistory, updateScore, inputCanvas, verifyTokenSocket, getRank, getUser, checkGameCanvas, canvasUpdate, updateReport, updateHeart } = require('../server/models/socketcon_model');

cache.flushdb(function (err, ok) {
  if (err) {
    console.log(err);
    return err;
  }
  if (ok) {
    console.log(ok);
  }
});

cache.set('timeCheck', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('timeCheck err');
  }
});
cache.set('question', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('question err');
  }
});

cache.set('questionId', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('questionId err');
  }
});

cache.set('canvas', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('canvas err');
  }
});

cache.set('hostId', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('hostId err');
  }
});

cache.set('gameId', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('gameId err');
  }
});

cache.set('gameTime', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('gameTime err');
  }
});

cache.set('userId', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('userId err');
  }
});

cache.set('roomUserId', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('roomUserId err');
  }
});

cache.set('hostDetail', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('hostDetail err');
  }
});

cache.set('roomUserData', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('roomUserData err');
  }
});

cache.set('disconnectTime', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('disconnectTime err');
  }
});

cache.set('correctUserList', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('correctUserList err');
  }
});

cache.set('roomType', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('roomType err');
  }
});

cache.set('hostDisconnect', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('hostDisconnect err');
  }
});

cache.set('roomList', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('roomList err');
  }
});

cache.set('userAll', JSON.stringify({ data: [] }), 'NX', function (err) {
  if (err) {
    console.log(err);
    console.log('userAll err');
  }
});

// const userAll = new Set();
// const question = [];
// const questionId = [];
// const canvas = [];
// const hostId = [];
// const gameId = [];
// const gameTime = [];
// const userId = [];
// const roomUserId = [];
// const hostDetail = [];
// const roomUserData = [];
// const disconnectTime = [];
// const correctUserList = [];
// const roomType = [];
// const hostDisconnect = [];
// let roomList = [];

const socketCon = (io) => {
  io.on('connection', async (socket) => {
    const inToken = socket.handshake.auth.token;
    const inRoom = socket.handshake.auth.room;
    const intype = socket.handshake.auth.type;
    const inRoomType = socket.handshake.auth.roomType;
    const limitTime = socket.handshake.auth.limitTime;
    const timeCheckGET = await promisifyget('timeCheck');
    const timeCheck = JSON.parse(timeCheckGET).data;
    const questionGET = await promisifyget('question');
    const question = JSON.parse(questionGET).data;
    const questionIdGET = await promisifyget('questionId');
    const questionId = JSON.parse(questionIdGET).data;
    const canvasGET = await promisifyget('canvas');
    const canvas = JSON.parse(canvasGET).data;
    const hostIdGET = await promisifyget('hostId');
    const hostId = JSON.parse(hostIdGET).data;
    const gameIdGET = await promisifyget('gameId');
    const gameId = JSON.parse(gameIdGET).data;
    const gameTimeGET = await promisifyget('gameTime');
    const gameTime = JSON.parse(gameTimeGET).data;
    const userIdGET = await promisifyget('userId');
    const userId = JSON.parse(userIdGET).data;
    const roomUserIdGET = await promisifyget('roomUserId');
    const roomUserId = JSON.parse(roomUserIdGET).data;
    const hostDetailGET = await promisifyget('hostDetail');
    const hostDetail = JSON.parse(hostDetailGET).data;
    const roomUserDataGET = await promisifyget('roomUserData');
    const roomUserData = JSON.parse(roomUserDataGET).data;
    const disconnectTimeGET = await promisifyget('disconnectTime');
    const disconnectTime = JSON.parse(disconnectTimeGET).data;
    const correctUserListGET = await promisifyget('correctUserList');
    const correctUserList = JSON.parse(correctUserListGET).data;
    const roomTypeGET = await promisifyget('roomType');
    const roomType = JSON.parse(roomTypeGET).data;
    const hostDisconnectGET = await promisifyget('hostDisconnect');
    const hostDisconnect = JSON.parse(hostDisconnectGET).data;
    const roomListGET = await promisifyget('roomList');
    const roomList = JSON.parse(roomListGET).data;
    const userAllGET = await promisifyget('userAll');
    const userAll = JSON.parse(userAllGET).data;

    if (inToken) {
      const verifyHost = await verifyTokenSocket(inToken);
      if (verifyHost.err) {
        return;
      } else {
        const userAllGET = await promisifyget('userAll');
        const userAll = JSON.parse(userAllGET).data;

        if (!userAll[0]) {
          userAll[0] = verifyHost.id;
        } else {
          userAll.push(verifyHost.id);
        }

        await promisifyset('userAll', JSON.stringify({ data: userAll }));

        socket.on('onlineUser', async (msg) => {
          socket.broadcast.emit('onlineUserShow', { userAll: userAll });
          socket.emit('onlineUserShow', { userAll: userAll });
        });
        if (`${intype}` === 'host') {
          const roomListGET = await promisifyget('roomList');
          const roomList = JSON.parse(roomListGET).data;
          if (!roomList[0]) {
            roomList[0] = inRoom;
            await promisifyset('roomList', JSON.stringify({ data: roomList }));
          } else {
            roomList.push(inRoom);
            await promisifyset('roomList', JSON.stringify({ data: roomList }));
          }

          roomType[inRoom] = inRoomType;
          await promisifyset('roomType', JSON.stringify({ data: roomType }));
          hostDisconnect[inRoom] = false;
          await promisifyset('hostDisconnect', JSON.stringify({ data: hostDisconnect }));
          hostId[inRoom] = verifyHost.id;
          await promisifyset('hostId', JSON.stringify({ data: hostId }));
          hostDetail[inRoom] = await getUser(verifyHost.id);
          await promisifyset('hostDetail', JSON.stringify({ data: hostDetail }));
          const roomUserIdGET = await promisifyget('roomUserId');
          const roomUserId = JSON.parse(roomUserIdGET).data;
          const roomUserDataGET = await promisifyget('roomUserData');
          const roomUserData = JSON.parse(roomUserDataGET).data;

          socket.broadcast.emit('roomList', { roomList: roomList });
          socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        } else if (`${intype}` === 'player') {
          const hostIdGET = await promisifyget('hostId');
          const hostId = JSON.parse(hostIdGET).data;
          const roomUserIdGET = await promisifyget('roomUserId');
          const roomUserId = JSON.parse(roomUserIdGET).data;
          if (verifyHost.id === hostId[inRoom]) {
            socket.emit(`repeat${inRoom}`, { id: verifyHost.id });
            socket.broadcast.emit(`repeat${inRoom}`, { id: verifyHost.id });
          }

          for (const i in roomUserId[inRoom]) {
            if (roomUserId[inRoom][i] === verifyHost.id) {
              socket.emit(`repeatUser${inRoom}`, { id: verifyHost.id });
              return;
            }
          }
          const userIdGET = await promisifyget('userId');
          const userId = JSON.parse(userIdGET).data;
          if (!userId[inRoom]) {
            userId[inRoom] = [verifyHost.id];
            await promisifyset('userId', JSON.stringify({ data: userId }));
          } else {
            userId[inRoom].push(verifyHost.id);
            await promisifyset('userId', JSON.stringify({ data: userId }));
          }

          if (roomUserId[inRoom]) {
            roomUserId[inRoom].push(verifyHost.id);
            await promisifyset('roomUserId', JSON.stringify({ data: roomUserId }));
            const userDetail = await getUser(verifyHost.id);
            roomUserData[inRoom].push(userDetail);
            await promisifyset('roomUserData', JSON.stringify({ data: roomUserData }));
            const hostIdGET = await promisifyget('hostId');
            const hostId = JSON.parse(hostIdGET).data;
            const hostDetailGET = await promisifyget('hostDetail');
            const hostDetail = JSON.parse(hostDetailGET).data;
            const roomTypeGET = await promisifyget('roomType');
            const roomType = JSON.parse(roomTypeGET).data;
            socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          } else {
            roomUserId[inRoom] = [verifyHost.id];
            await promisifyset('roomUserId', JSON.stringify({ data: roomUserId }));
            roomUserData[inRoom] = [];
            await promisifyset('roomUserData', JSON.stringify({ data: roomUserData }));
            const userDetail = await getUser(verifyHost.id);
            roomUserData[inRoom] = [userDetail];
            await promisifyset('roomUserData', JSON.stringify({ data: roomUserData }));
            const hostIdGET = await promisifyget('hostId');
            const hostId = JSON.parse(hostIdGET).data;
            const hostDetailGET = await promisifyget('hostDetail');
            const hostDetail = JSON.parse(hostDetailGET).data;
            const roomTypeGET = await promisifyget('roomType');
            const roomType = JSON.parse(roomTypeGET).data;
            socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
            socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          }
        }
      }
    }

    if (timeCheck[inRoom]) {
      const gameIdGET = await promisifyget('gameId');
      const gameId = JSON.parse(gameIdGET).data;
      const canvasUpate = await canvasUpdate(gameId[inRoom]);
      const gameTimeGET = await promisifyget('gameTime');
      const gameTime = JSON.parse(gameTimeGET).data;
      const userIdGET = await promisifyget('userId');
      const userId = JSON.parse(userIdGET).data;
      const correctUserListGET = await promisifyget('correctUserList');
      const correctUserList = JSON.parse(correctUserListGET).data;
      socket.emit(`canvasUpdate${inRoom}id${inToken}`, { canvas: canvasUpate, timeCheck: gameTime[inRoom], correctUserList: correctUserList[inRoom] });
      await getHistory(gameId[inRoom], userId[inRoom], 'fail');
      userId[inRoom] = '';
      await promisifyset('userId', JSON.stringify({ data: userId }));
    }

    socket.on('disconnect', async function () {
      const outToken = socket.handshake.auth.token;
      const outRoom = socket.handshake.auth.room;
      const outtype = socket.handshake.auth.type;
      const outRoomType = socket.handshake.auth.roomType;

      if (outToken) {
        const verifyHost = await verifyTokenSocket(outToken);
        const userAllGET = await promisifyget('userAll');
        const userAll = JSON.parse(userAllGET).data;

        for (const i in userAll) {
          if (userAll[i] === verifyHost.id) {
            userAll.splice(i, 1);
          }
        }
        await promisifyset('userAll', JSON.stringify({ data: userAll }));
        socket.broadcast.emit('onlineUserShow', { userAll: userAll });
        socket.emit('onlineUserShow', { userAll: userAll });

        if (`${outtype}` === 'host') {
          const hostDisconnectGET = await promisifyget('hostDisconnect');
          const hostDisconnect = JSON.parse(hostDisconnectGET).data;
          const roomListGET = await promisifyget('roomList');
          let roomList = JSON.parse(roomListGET).data;
          hostDisconnect[outRoom] = true;
          await promisifyset('hostDisconnect', JSON.stringify({ data: hostDisconnect }));
          roomList = roomList.filter(function (item) {
            return item !== outRoom;
          });
          await promisifyset('roomList', JSON.stringify({ data: roomList }));
          disconnectTime[outRoom] = 1; // 倒數計時任務執行次數
          await promisifyset('disconnectTime', JSON.stringify({ data: disconnectTime }));
          const timeout = 1000; // 觸發倒數計時任務的時間間隙
          const startTime = new Date().getTime();
          function startCountdown (interval) {
            setTimeout(async () => {
              const endTime = new Date().getTime();
              const deviation = endTime - (startTime + disconnectTime[outRoom] * timeout);
              if (disconnectTime[outRoom] < 2) {
                disconnectTime[outRoom]++;
                await promisifyset('disconnectTime', JSON.stringify({ data: disconnectTime }));
                startCountdown(timeout - deviation);
              } else {
                if (hostDisconnect[outRoom] === true) {
                  socket.broadcast.emit('mainPageViewClose', { room: outRoom });
                  socket.emit(`closeRoom${outRoom}`);
                  socket.broadcast.emit(`closeRoom${outRoom}`);
                  timeCheck[outRoom] = '';
                  await promisifyset('timeCheck', JSON.stringify({ data: timeCheck }));
                  question[outRoom] = '';
                  await promisifyset('question', JSON.stringify({ data: question }));
                  questionId[outRoom] = '';
                  await promisifyset('questionId', JSON.stringify({ data: questionId }));
                  canvas[outRoom] = '';
                  await promisifyset('canvas', JSON.stringify({ data: canvas }));
                  hostId[outRoom] = '';
                  await promisifyset('hostId', JSON.stringify({ data: hostId }));
                  gameId[outRoom] = '';
                  await promisifyset('gameId', JSON.stringify({ data: gameId }));
                  gameTime[outRoom] = '';
                  await promisifyset('gameTime', JSON.stringify({ data: gameTime }));
                  userId[outRoom] = '';
                  await promisifyset('userId', JSON.stringify({ data: userId }));
                  roomUserId[outRoom] = '';
                  await promisifyset('roomUserId', JSON.stringify({ data: roomUserId }));
                  hostDetail[outRoom] = '';
                  await promisifyset('hostDetail', JSON.stringify({ data: hostDetail }));
                  roomUserData[outRoom] = '';
                  await promisifyset('roomUserData', JSON.stringify({ data: roomUserData }));
                  correctUserList[outRoom] = '';
                  await promisifyset('correctUserList', JSON.stringify({ data: correctUserList }));
                  roomType[outRoom] = '';
                  await promisifyset('roomType', JSON.stringify({ data: roomType }));
                }
              }
            }, interval);
          }
          startCountdown(50);
        } else if (`${outtype}` === 'player') {
          const roomUserIdGET = await promisifyget('roomUserId');
          const roomUserId = JSON.parse(roomUserIdGET).data;

          if (roomUserId[outRoom][0]) {
            roomUserId[outRoom] = roomUserId[outRoom].filter(function (item) {
              return item !== verifyHost.id;
            });
            await promisifyset('roomUserId', JSON.stringify({ data: roomUserId }));

            roomUserData[outRoom] = [];
            for (const i in roomUserId[outRoom]) {
              const userDetail = await getUser(roomUserId[outRoom][i]);
              if (i === 0) {
                roomUserData[outRoom] = [userDetail];
              } else {
                roomUserData[outRoom].push(userDetail);
              }
            }
            await promisifyset('roomUserData', JSON.stringify({ data: roomUserData }));
            const hostIdGET = await promisifyget('hostId');
            const hostId = JSON.parse(hostIdGET).data;
            const hostDetailGET = await promisifyget('hostDetail');
            const hostDetail = JSON.parse(hostDetailGET).data;
            const roomTypeGET = await promisifyget('roomType');
            const roomType = JSON.parse(roomTypeGET).data;
            socket.broadcast.emit('mainPageView', { roomId: outRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: roomType[outRoom], roomUserId: roomUserId[outRoom], roomUserData: roomUserData[outRoom] });
            socket.emit(`roomUserId${outRoom}`, { roomUserId: roomUserId[outRoom], roomUserData: roomUserData[outRoom] });
            socket.broadcast.emit(`roomUserId${outRoom}`, { hostDetail: hostDetail[inRoom], roomUserId: roomUserId[outRoom], roomUserData: roomUserData[outRoom] });
          } else {
            console.log('不可能啊');
          }
        }
      }
    });
    try {
      socket.on('getQuestion', async (msg) => {
        hostId[msg.room] = msg.hostId;
        await promisifyset('hostId', JSON.stringify({ data: hostId }));
        let questionData = await getquestion(msg.type);
        if (!questionData[0]) {
          await updateInuse(msg.type);
          questionData = await getquestion(msg.type);
        }
        await resetInuse(questionData[0].id);
        question[msg.room] = questionData[0].question;
        await promisifyset('question', JSON.stringify({ data: question }));
        questionId[msg.room] = questionData[0].id;
        await promisifyset('questionId', JSON.stringify({ data: questionId }));
        userId[msg.room] = '';
        await promisifyset('userId', JSON.stringify({ data: userId }));
        gameId[msg.room] = '';
        await promisifyset('gameId', JSON.stringify({ data: gameId }));
        correctUserList[msg.room] = '';
        await promisifyset('correctUserList', JSON.stringify({ data: correctUserList }));
        const roomUserIdGET = await promisifyget('roomUserId');
        const roomUserId = JSON.parse(roomUserIdGET).data;
        if (!gameId[msg.room]) {
          const hostIdGET = await promisifyget('hostId');
          const hostId = JSON.parse(hostIdGET).data;
          gameId[msg.room] = await getGame(questionId[msg.room], hostId[msg.room]);
          await promisifyset('gameId', JSON.stringify({ data: gameId }));
        }
        socket.broadcast.emit(`answer${msg.room}`, question[msg.room]);
        socket.emit(`question${msg.room}`, question[msg.room]);
        getHistory(gameId[msg.room], roomUserId[inRoom], 'fail');
        userId[msg.room] = '';
        await promisifyset('userId', JSON.stringify({ data: userId }));
        gameTime[msg.room] = 1; // 倒數計時任務執行次數
        await promisifyset('gameTime', JSON.stringify({ data: gameTime }));
        const timeout = 1000; // 觸發倒數計時任務的時間間隙
        const startTime = new Date().getTime();

        timeCheck[msg.room] = 1;
        await promisifyset('timeCheck', JSON.stringify({ data: timeCheck }));
        socket.broadcast.emit('mainPageCanvasClear', { room: msg.room });
        function startCountdown (interval) {
          setTimeout(async () => {
            const endTime = new Date().getTime();
            const gameTimeGET = await promisifyget('gameTime');
            const gameTime = JSON.parse(gameTimeGET).data;
            const deviation = endTime - (startTime + gameTime[msg.room] * timeout);
            if (gameTime[msg.room] < limitTime) {
              gameTime[msg.room] = gameTime[msg.room] + 1;
              await promisifyset('gameTime', JSON.stringify({ data: gameTime }));
              startCountdown(timeout - deviation);
            } else {
              timeCheck[msg.room] = 0;
              await promisifyset('timeCheck', JSON.stringify({ data: timeCheck }));
              const gameIdGET = await promisifyget('gameId');
              const gameId = JSON.parse(gameIdGET).data;
              checkGameCanvas(gameId[msg.room]);
              const questionGET = await promisifyget('question');
              const question = JSON.parse(questionGET).data;
              socket.broadcast.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
              socket.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
            }
          }, interval);
        }
        startCountdown(10);
      });

      socket.on('answerCheck', async (msg) => {
        const userData = await getUser(msg.userId);
        const timeCheckGET = await promisifyget('timeCheck');
        const timeCheck = JSON.parse(timeCheckGET).data;
        const gameTimeGET = await promisifyget('gameTime');
        const gameTime = JSON.parse(gameTimeGET).data;
        if (timeCheck[msg.room]) {
          const questionGET = await promisifyget('question');
          const question = JSON.parse(questionGET).data;
          if (msg.answerData === question[msg.room]) {
            const gameIdGET = await promisifyget('gameId');
            const gameId = JSON.parse(gameIdGET).data;
            const checktime = limitTime - gameTime[msg.room];
            updateHistory(gameId[msg.room], msg.userId, msg.canvasNum);
            const hostIdGET = await promisifyget('hostId');
            const hostId = JSON.parse(hostIdGET).data;
            const hostScore = await updateScore(checktime, msg.userId, hostId[msg.room], gameId[msg.room]);
            const rankData = await getRank();
            const correctUserListGET = await promisifyget('correctUserList');
            const correctUserList = JSON.parse(correctUserListGET).data;
            if (!correctUserList[msg.room]) {
              correctUserList[msg.room] = [userData[0].name];
              await promisifyset('correctUserList', JSON.stringify({ data: correctUserList }));
            } else {
              correctUserList[msg.room].push(userData[0].name);
              await promisifyset('correctUserList', JSON.stringify({ data: correctUserList }));
            }
            socket.broadcast.emit('getRank', { data: rankData });
            socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: true, answer: '' });
            socket.emit(`userCorrect${msg.room}`, { userData: userData, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: checktime, hostScore: hostScore });
            socket.broadcast.emit(`userCorrect${msg.room}`, { userData: userData, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: checktime, hostScore: hostScore });
          } else {
            socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: false, answer: '' });
            socket.emit(`answerShow${msg.room}`, { data: msg.answerData, userData: userData });
            socket.broadcast.emit(`answerShow${msg.room}`, { data: msg.answerData, userData: userData });
          }
        } else {
          console.log('timeout');
        }
      });

      socket.on('report', async (msg) => {
        const gameIdGET = await promisifyget('gameId');
        const gameId = JSON.parse(gameIdGET).data;
        const report = await updateReport(gameId[msg.room], msg.reason, msg.userId);
        if (report) {
          socket.emit(`reportOk${msg.room}`, { reason: msg.reason });
          socket.broadcast.emit(`reportOk${msg.room}`, { reason: msg.reason });
        }
      });

      socket.on('giveHeart', async (msg) => {
        const hostIdGET = await promisifyget('hostId');
        const hostId = JSON.parse(hostIdGET).data;
        const heartCount = await updateHeart(hostId[msg.room]);
        socket.emit(`heartShow${msg.room}`, { data: heartCount });
        socket.broadcast.emit(`heartShow${msg.room}`, { data: heartCount });
      });

      socket.on('roomMsg', async (msg) => {
        socket.emit(`roomMsgShow${msg.room}`, msg);
        socket.broadcast.emit(`roomMsgShow${msg.room}`, msg);
      //  { room: room, userName: userName, roomMsg: roomMsg }
      });

      socket.on('canvasData', async (msg) => {
        const timeCheckGET = await promisifyget('timeCheck');
        const timeCheck = JSON.parse(timeCheckGET).data;
        const gameIdGET = await promisifyget('gameId');
        const gameId = JSON.parse(gameIdGET).data;
        if (cache.ready) {
          if (gameId[msg.room]) {
            await promisifyset(gameId[msg.room] + msg.canvasNum, msg.url, 'Ex', 300);
          } else {
            await promisifyset(msg.room + msg.canvasNum, msg.url, 'Ex', 300);
          }
          socket.broadcast.emit('mainPageConvasData', { room: msg.room, url: msg.url });
          socket.broadcast.emit(`convasData${msg.room}`, msg.url);
        }
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, msg.url, 0);
        }
      });
      socket.on('undo', async (msg) => {
        const gameIdGET = await promisifyget('gameId');
        const gameId = JSON.parse(gameIdGET).data;
        const timeCheckGET = await promisifyget('timeCheck');
        const timeCheck = JSON.parse(timeCheckGET).data;
        socket.broadcast.emit('mainPageUndo', { room: msg.room, data: msg.data });
        socket.broadcast.emit(`undo msg${msg.room}`, msg.data);
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, 0, msg.data);
        }
      });
      socket.on('redo', async (msg) => {
        const gameIdGET = await promisifyget('gameId');
        const gameId = JSON.parse(gameIdGET).data;
        let redoUrl;
        if (cache.ready) {
          if (gameId[msg.room]) {
            redoUrl = await promisifyget(gameId[msg.room] + msg.canvasNum);
            if (redoUrl) {
              socket.broadcast.emit('mainPageConvasData', { room: msg.room, url: redoUrl });
              socket.broadcast.emit(`convasData${msg.room}`, redoUrl);
              socket.emit(`redo url${msg.room}`, redoUrl);
            }
          } else {
            redoUrl = await promisifyget(msg.room + msg.canvasNum);
            if (redoUrl) {
              socket.broadcast.emit('mainPageConvasData', { room: msg.room, url: redoUrl });
              socket.broadcast.emit(`convasData${msg.room}`, redoUrl);
              socket.emit(`redo url${msg.room}`, redoUrl);
            }
          }
        }
        const timeCheckGET = await promisifyget('timeCheck');
        const timeCheck = JSON.parse(timeCheckGET).data;
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, redoUrl, 0);
        }
      });

      socket.on('homeRank', async (msg) => {
        if (msg.homeTime) {
          const rankData = await getRank();
          socket.broadcast.emit(`getRank${msg.homeTime}`, { data: rankData });
          socket.emit(`getRank${msg.homeTime}`, { data: rankData });
        }
      });

      socket.on('roomData', async (msg) => {
        const hostIdGET = await promisifyget('hostId');
        const hostId = JSON.parse(hostIdGET).data;
        const hostDetailGET = await promisifyget('hostDetail');
        const hostDetail = JSON.parse(hostDetailGET).data;
        const roomTypeGET = await promisifyget('roomType');
        const roomType = JSON.parse(roomTypeGET).data;
        const roomListGET = await promisifyget('roomList');
        const roomList = JSON.parse(roomListGET).data;
        socket.emit('roomList', { roomList: roomList });
        for (const i in roomList) {
          socket.emit('mainPageView', { roomId: roomList[i], hostId: hostId[parseInt(roomList[i])], hostDetail: hostDetail[parseInt(roomList[i])], roomType: roomType[parseInt(roomList[i])], roomUserId: roomUserId[parseInt(roomList[i])], roomUserData: roomUserData[parseInt(roomList[i])] });
        }
      });

      socket.on('closeRoom', async (msg) => {
        const roomUserIdGET = await promisifyget('roomUserId');
        const roomUserId = JSON.parse(roomUserIdGET).data;
        socket.broadcast.emit(`closeRoom${msg.room}`, { newHostId: roomUserId[msg.room][0] });
      });
      const timeCheckGET = await promisifyget('timeCheck');
      const timeCheck = JSON.parse(timeCheckGET).data;
      const gameIdGET = await promisifyget('gameId');
      const gameId = JSON.parse(gameIdGET).data;
      const roomListGET = await promisifyget('roomList');
      const roomList = JSON.parse(roomListGET).data;
      if (intype === 'homePage') {
        for (const i in roomList) {
          if (timeCheck[parseInt(roomList[i])]) {
            const canvasUpate = await canvasUpdate(gameId[parseInt(roomList[i])]);
            if (canvasUpate[0]) {
              socket.emit('canvasUpdate', { room: parseInt(roomList[i]), canvas: canvasUpate, game: true });
            } else {
              console.log('no canvas');
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  });
};

module.exports = {
  socketCon
};
