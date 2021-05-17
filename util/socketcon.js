const {
  cache,
  promisifyget,
  promisifyset,
  promisifydel
} = require('./cache.js');
const { core, query, transaction, commit, rollback, end } = require('./mysqlcon.js');

const { getquestion, updateInuse, resetInuse, getGame, getHistory, updateHistory, updateScore, inputCanvas, verifyTokenSocket, getRank, getUser } = require('../server/models/socketcon_model');
const { use } = require('../server/routes/user_route.js');
const timeCheck = [];
const question = [];
const questionId = [];
const canvas = [];
const hostId = [];
const gameId = [];
const gameTime = [];
const userId = [];
const roomUserId = [];
const hostDetail = [];
const roomUserData = [];
const disconnectTime = [];
const limitTime = 20;
let hostDisconnect;
const socketCon = (io) => {
  io.on('connection', async (socket) => {
    const inToken = socket.handshake.auth.token;
    const inRoom = socket.handshake.auth.room;
    const intype = socket.handshake.auth.type;
    if (inToken) {
      const verifyHost = await verifyTokenSocket(inToken);
      if (`${intype}` === 'host') {
        hostDisconnect = false;
        hostId[inRoom] = verifyHost.id;
        hostDetail[inRoom] = await getUser(verifyHost.id);
        socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
      } else if (`${intype}` === 'player') {
        if (roomUserId[inRoom]) {
          roomUserId[inRoom].push(verifyHost.id);
          const userDetail = await getUser(verifyHost.id);
          roomUserData[inRoom].push(userDetail);
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        } else {
          roomUserId[inRoom] = [verifyHost.id];
          roomUserData[inRoom] = [];
          const userDetail = await getUser(verifyHost.id);
          roomUserData[inRoom] = [userDetail];
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        }
      }
    }
    socket.on('disconnect', async function () {
      const outToken = socket.handshake.auth.token;
      const outRoom = socket.handshake.auth.room;
      const outtype = socket.handshake.auth.type;
      const verifyHost = await verifyTokenSocket(outToken);
      if (outToken) {
        if (`${outtype}` === 'host') {
          hostDisconnect = true;
          disconnectTime[outRoom] = 1; // 倒數計時任務執行次數
          const timeout = 1000; // 觸發倒數計時任務的時間間隙
          const startTime = new Date().getTime();
          function startCountdown (interval) {
            setTimeout(() => {
              const endTime = new Date().getTime();
              const deviation = endTime - (startTime + disconnectTime[outRoom] * timeout);
              if (disconnectTime[outRoom] < 5) {
                disconnectTime[outRoom]++;
                startCountdown(timeout - deviation);
              } else {
                if (hostDisconnect === true) {
                  socket.emit(`closeRoom${outRoom}`);
                  socket.broadcast.emit(`closeRoom${outRoom}`);
                  timeCheck[outRoom] = '';
                  question[outRoom] = '';
                  questionId[outRoom] = '';
                  canvas[outRoom] = '';
                  hostId[outRoom] = '';
                  gameId[outRoom] = '';
                  gameTime[outRoom] = '';
                  userId[outRoom] = '';
                  roomUserId[outRoom] = '';
                  hostDetail[outRoom] = '';
                  roomUserData[outRoom] = '';
                }
              }
            }, interval);
          }
          startCountdown(50);
        } else if (`${outtype}` === 'player') {
          if (roomUserId[outRoom][0]) {
            roomUserId[outRoom] = roomUserId[outRoom].filter(function (item) {
              return item !== verifyHost.id;
            });
            roomUserData[outRoom] = [];
            for (const i in roomUserId[outRoom]) {
              const userDetail = await getUser(roomUserId[outRoom][i]);
              if (i === 0) {
                roomUserData[outRoom] = [userDetail];
              } else {
                roomUserData[outRoom].push(userDetail);
              }
            }
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

        let questionData = await getquestion(msg.type);
        if (!questionData[0]) {
          await updateInuse(msg.type);
          questionData = await getquestion(msg.type);
        }
        await resetInuse(questionData[0].id);
        question[msg.room] = questionData[0].question;
        questionId[msg.room] = questionData[0].id;
        userId[msg.room] = '';
        socket.broadcast.emit(`answer${msg.room}`, question[msg.room]);
        socket.emit(`question${msg.room}`, question[msg.room]);
      });

      socket.on('checkPlayerInGame', async (msg) => {
        if (!userId[msg.room]) {
          userId[msg.room] = [msg.userId];
          gameId[msg.room] = await getGame(questionId[msg.room], hostId[msg.room]);
          getHistory(gameId[msg.room], userId[msg.room], 'fail');
        } else {
          userId[msg.room].push(msg.userId);
          gameId[msg.room] = await getGame(questionId[msg.room], hostId[msg.room]);
          getHistory(gameId[msg.room], userId[msg.room], 'fail');
        }
        userId[msg.room] = '';
        gameTime[msg.room] = 1; // 倒數計時任務執行次數
        const timeout = 1000; // 觸發倒數計時任務的時間間隙
        const startTime = new Date().getTime();
        timeCheck[msg.room] = true;

        function startCountdown (interval) {
          setTimeout(() => {
            const endTime = new Date().getTime();
            const deviation = endTime - (startTime + gameTime[msg.room] * timeout);
            if (gameTime[msg.room] < limitTime) {
              gameTime[msg.room]++;
              startCountdown(timeout - deviation);
            } else {
              timeCheck[msg.room] = false;
              if (userId[msg.room]) {
                getHistory(gameId[msg.room], userId[msg.room], 'only view');
              }

              socket.broadcast.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
              socket.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
            }
          }, interval);
        }
        startCountdown(50);
      });

      socket.on('answerCheck', async (msg) => {
        const userData = await getUser(msg.userId);
        if (timeCheck[msg.room]) {
          if (msg.answerData === question[msg.room]) {
            updateHistory(gameId[msg.room], msg.userId, msg.canvasNum);
            updateScore((limitTime - gameTime[msg.room]), msg.userId);
            const rankData = await getRank();
            socket.broadcast.emit('getRank', { data: rankData });
            socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: true, answer: '' });
            socket.emit(`userCorrect${msg.room}`, { userData: userData, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: (limitTime - gameTime[msg.room]) });
            socket.broadcast.emit(`userCorrect${msg.room}`, { userData: userData, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: (limitTime - gameTime[msg.room]) });
          } else {
            socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: false, answer: '' });
            socket.emit(`answerShow${msg.room}`, msg);
            socket.broadcast.emit(`answerShow${msg.room}`, msg);
          }
        } else {
          console.log('timeout');
        }
      });

      socket.on('checkPlayer', async (msg) => {
        if (!userId[msg.room]) {
          userId[msg.room] = [msg.userId];
        } else {
          userId[msg.room].push(msg.userId);
        }
      });

      socket.on('canvasData', async (msg) => {
        if (cache.ready) {
          if (gameId[msg.room]) {
            await promisifyset(gameId[msg.room] + msg.canvasNum, msg.url, 'Ex', 300);
          } else {
            await promisifyset(msg.room + msg.canvasNum, msg.url, 'Ex', 300);
          }
          socket.broadcast.emit(`convasData${msg.room}`, msg.url);
        }
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, msg.url, 0);
        }
      });
      socket.on('undo', (msg) => {
        socket.broadcast.emit(`undo msg${msg.room}`, msg.data);
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, 0, msg.data);
        }
      });
      socket.on('redo', async (msg) => {
        let redoUrl;
        if (cache.ready) {
          if (gameId[msg.room]) {
            redoUrl = await promisifyget(gameId[msg.room] + msg.canvasNum);
            if (redoUrl) {
              socket.broadcast.emit(`convasData${msg.room}`, redoUrl);
              socket.emit(`redo url${msg.room}`, redoUrl);
            }
          } else {
            redoUrl = await promisifyget(msg.room + msg.canvasNum);
            if (redoUrl) {
              socket.broadcast.emit(`convasData${msg.room}`, redoUrl);
              socket.emit(`redo url${msg.room}`, redoUrl);
            }
          }
        }
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, redoUrl, 0);
        }
      });

      socket.on('homeRank', async (msg) => {
        if (msg) {
          const rankData = await getRank();
          socket.broadcast.emit('getRank', { data: rankData });
          socket.emit('getRank', { data: rankData });
        }
      });

      socket.on('closeRoom', async (msg) => {
        socket.broadcast.emit(`closeRoom${msg.room}`, { newHostId: roomUserId[msg.room][0] });
      });
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = {
  socketCon
};
