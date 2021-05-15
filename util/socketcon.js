const {
  cache,
  promisifyget,
  promisifyset,
  promisifydel
} = require('./cache.js');
const { core, query, transaction, commit, rollback, end } = require('./mysqlcon.js');

const { getquestion, updateInuse, resetInuse, getGame, getHistory, updateHistory, updateScore, inputCanvas, verifyTokenSocket, getRank } = require('../server/models/socketcon_model');
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
const limitTime = 20;
const socketCon = (io) => {
  io.on('connection', async (socket) => {
    const inToken = socket.handshake.auth.token;
    const inRoom = socket.handshake.auth.room;
    const intype = socket.handshake.auth.type;
    if (inToken) {
      const verifyHost = await verifyTokenSocket(inToken);
      if (`${intype}` === 'host') {
        hostId[inRoom] = verifyHost.id;
        socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], roomUserId: roomUserId[inRoom] });
        socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], roomUserId: roomUserId[inRoom] });
      } else if (`${intype}` === 'player') {
        if (roomUserId[inRoom]) {
          roomUserId[inRoom].push(verifyHost.id);
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], roomUserId: roomUserId[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], roomUserId: roomUserId[inRoom] });
        } else {
          roomUserId[inRoom] = [verifyHost.id];
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], roomUserId: roomUserId[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], roomUserId: roomUserId[inRoom] });
        }
      }
    }
    socket.on('disconnect', async function () {
      const outToken = socket.handshake.auth.token;
      const outRoom = socket.handshake.auth.room;
      const outtype = socket.handshake.auth.type;
      if (outToken) {
        const verifyHost = await verifyTokenSocket(outToken);
        if (`${outtype}` === 'host') {
          hostId[outRoom] = verifyHost.id;
        } else if (`${outtype}` === 'player') {
          if (roomUserId[outRoom]) {
            roomUserId[outRoom].pop();
            socket.emit(`roomUserId${outRoom}`, { roomUserId: roomUserId[outRoom] });
            socket.broadcast.emit(`roomUserId${outRoom}`, { roomUserId: roomUserId[outRoom] });
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
        });

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
        startCountdown(startTime);
      });

      socket.on('answerCheck', async (msg) => {
        if (timeCheck[msg.room]) {
          if (msg.answerData === question[msg.room]) {
            updateHistory(gameId[msg.room], msg.userId, msg.canvasNum);
            updateScore((limitTime - gameTime[msg.room]), msg.userId);
            const rankData = await getRank();
            socket.broadcast.emit('getRank', { data: rankData });
            socket.emit(`answerCorrect${msg.userId}`, { check: true, answer: '' });
            socket.emit(`userCorrect${msg.room}`, { userId: msg.userId, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: (limitTime - gameTime[msg.room]) });
            socket.broadcast.emit(`userCorrect${msg.room}`, { userId: msg.userId, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: (limitTime - gameTime[msg.room]) });
          } else {
            socket.emit(`answerCorrect${msg.userId}`, { check: false, answer: '' });
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

      const aaa = [];
      socket.on('canvasData', async (msg) => {
        if (cache.ready) {
          if (gameId[msg.room]) {
            await promisifyset(gameId[msg.room] + msg.canvasNum, msg.url, 'Ex', 300);
          } else {
            await promisifyset(msg.room + msg.canvasNum, msg.url, 'Ex', 300);
          }

          const a = { canvasNum: msg.canvasNum, url: msg.url };
          aaa.push(a);
          // console.log(aaa);
          socket.broadcast.emit(`convasData${msg.room}`, msg.url);
        }
        if (timeCheck[msg.room]) {
          inputCanvas(gameId[msg.room], msg.canvasNum, msg.url, 0);
        }

        // console.log(hostId[msg.room])
        // console.log(msg.room);
        // console.log(msg.canvasNum);
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
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = {
  socketCon
};
