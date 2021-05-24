const {
  cache,
  promisifyget,
  promisifyset,
  promisifydel
} = require('./cache.js');

const { getquestion, updateInuse, resetInuse, getGame, getHistory, updateHistory, updateScore, inputCanvas, verifyTokenSocket, getRank, getUser, checkGameCanvas, canvasUpdate, updateReport } = require('../server/models/socketcon_model');

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

const roomType = [];
let roomList = [];
let hostDisconnect;
const socketCon = (io) => {
  io.on('connection', async (socket) => {
    const inToken = socket.handshake.auth.token;
    const inRoom = socket.handshake.auth.room;
    const intype = socket.handshake.auth.type;
    const inRoomType = socket.handshake.auth.roomType;
    const limitTime = socket.handshake.auth.limitTime;
    if (inToken) {
      const verifyHost = await verifyTokenSocket(inToken);
      if (`${intype}` === 'host') {
        if (!roomList[0]) {
          roomList[0] = inRoom;
        } else {
          roomList.push(inRoom);
        }
        roomType[inRoom] = inRoomType;
        hostDisconnect = false;
        hostId[inRoom] = verifyHost.id;
        hostDetail[inRoom] = await getUser(verifyHost.id);
        socket.broadcast.emit('roomList', { roomList: roomList });
        socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: intype, roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
      } else if (`${intype}` === 'player') {
        if (verifyHost.id === hostId[inRoom]) {
          socket.emit(`repeat${inRoom}`, { id: verifyHost.id });
          socket.broadcast.emit(`repeat${inRoom}`, { id: verifyHost.id });
        }
        if (!userId[inRoom]) {
          userId[inRoom] = [verifyHost.id];
        } else {
          userId[inRoom].push(verifyHost.id);
        }

        if (roomUserId[inRoom]) {
          roomUserId[inRoom].push(verifyHost.id);
          const userDetail = await getUser(verifyHost.id);
          roomUserData[inRoom].push(userDetail);
          socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: intype, roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        } else {
          roomUserId[inRoom] = [verifyHost.id];
          roomUserData[inRoom] = [];
          const userDetail = await getUser(verifyHost.id);
          roomUserData[inRoom] = [userDetail];
          socket.broadcast.emit('mainPageView', { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: intype, roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
          socket.broadcast.emit(`roomUserId${inRoom}`, { hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomUserId: roomUserId[inRoom], roomUserData: roomUserData[inRoom] });
        }
      }
    }

    if (timeCheck[inRoom]) {
      const canvasUpate = await canvasUpdate(gameId[inRoom]);
      socket.emit(`canvasUpdate${inRoom}id${inToken}`, { canvas: canvasUpate });
    }

    socket.on('disconnect', async function () {
      const outToken = socket.handshake.auth.token;
      const outRoom = socket.handshake.auth.room;
      const outtype = socket.handshake.auth.type;
      const outRoomType = socket.handshake.auth.roomType;
      const verifyHost = await verifyTokenSocket(outToken);
      if (outToken) {
        if (`${outtype}` === 'host') {
          hostDisconnect = true;
          roomList = roomList.filter(function (item) {
            return item !== outRoom;
          });
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
                  socket.broadcast.emit('mainPageViewClose', { room: outRoom });
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
                  roomType[outRoom] = '';
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
            socket.broadcast.emit('mainPageView', { roomId: outRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: outtype, roomUserId: roomUserId[outRoom], roomUserData: roomUserData[outRoom] });
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
        gameId[msg.room] = '';
        if (!gameId[msg.room]) {
          gameId[msg.room] = await getGame(questionId[msg.room], hostId[msg.room]);
        }
        socket.broadcast.emit(`answer${msg.room}`, question[msg.room]);
        socket.emit(`question${msg.room}`, question[msg.room]);

        getHistory(gameId[msg.room], roomUserId[inRoom], 'fail');
        userId[msg.room] = '';
        gameTime[msg.room] = 1; // 倒數計時任務執行次數
        const timeout = 1000; // 觸發倒數計時任務的時間間隙
        const startTime = new Date().getTime();
        timeCheck[msg.room] = true;
        socket.broadcast.emit('mainPageCanvasClear', { room: msg.room });
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
              checkGameCanvas(gameId[msg.room]);
              socket.broadcast.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
              socket.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
            }
          }, interval);
        }
        startCountdown(10);
      });

      // socket.on('checkPlayerInGame', async (msg) => {
      //   getHistory(gameId[msg.room], roomUserId[inRoom], 'fail');
      //   userId[msg.room] = '';
      //   gameTime[msg.room] = 1; // 倒數計時任務執行次數
      //   const timeout = 1000; // 觸發倒數計時任務的時間間隙
      //   const startTime = new Date().getTime();
      //   timeCheck[msg.room] = true;
      //   socket.broadcast.emit('mainPageCanvasClear', { room: msg.room });
      //   function startCountdown (interval) {
      //     setTimeout(() => {
      //       const endTime = new Date().getTime();
      //       const deviation = endTime - (startTime + gameTime[msg.room] * timeout);
      //       if (gameTime[msg.room] < limitTime) {
      //         gameTime[msg.room]++;
      //         startCountdown(timeout - deviation);
      //       } else {
      //         timeCheck[msg.room] = false;
      //         if (userId[msg.room]) {
      //           getHistory(gameId[msg.room], userId[msg.room], 'only view');
      //         }
      //         checkGameCanvas(gameId[msg.room]);
      //         socket.broadcast.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
      //         socket.emit(`answerGet${msg.room}`, { answer: question[msg.room] });
      //       }
      //     }, interval);
      //   }
      //   startCountdown(10);
      // });

      socket.on('answerCheck', async (msg) => {
        const userData = await getUser(msg.userId);
        if (timeCheck[msg.room]) {
          if (msg.answerData === question[msg.room]) {
            const checktime = limitTime - gameTime[msg.room];
            updateHistory(gameId[msg.room], msg.userId, msg.canvasNum);
            updateScore(checktime, msg.userId);
            const rankData = await getRank();
            socket.broadcast.emit('getRank', { data: rankData });
            socket.emit(`answerCorrect${msg.room + 'and' + msg.userId}`, { check: true, answer: '' });
            socket.emit(`userCorrect${msg.room}`, { userData: userData, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: checktime });
            socket.broadcast.emit(`userCorrect${msg.room}`, { userData: userData, canvasNum: msg.canvasNum, time: gameTime[msg.room], score: checktime });
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
        const report = await updateReport(gameId[msg.room], msg.reason, msg.userId);
        if (report) {
          socket.emit(`reportOk${msg.room}`, { reason: msg.reason });
          socket.broadcast.emit(`reportOk${msg.room}`, { reason: msg.reason });
        }
      });

      socket.on('roomMsg', async (msg) => {
        socket.emit(`roomMsgShow${msg.room}`, msg);
        socket.broadcast.emit(`roomMsgShow${msg.room}`, msg);
      //  { room: room, userName: userName, roomMsg: roomMsg }
      });

      socket.on('canvasData', async (msg) => {
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
      socket.on('undo', (msg) => {
        socket.broadcast.emit('mainPageUndo', { room: msg.room, data: msg.data });
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

      socket.on('roomData', async (msg) => {
        socket.emit('roomList', { roomList: roomList });
        for (const i in roomList) {
          socket.emit('mainPageView', { roomId: roomList[i], hostId: hostId[roomList[i]], hostDetail: hostDetail[roomList[i]], roomType: roomType[roomList[i]], roomUserId: roomUserId[roomList[i]], roomUserData: roomUserData[roomList[i]] });
        }
      });

      socket.on('closeRoom', async (msg) => {
        socket.broadcast.emit(`closeRoom${msg.room}`, { newHostId: roomUserId[msg.room][0] });
      });
      if (intype === 'homePage') {
        for (const i in roomList) {
          if (timeCheck[parseInt(roomList[i])]) {
            const canvasUpate = await canvasUpdate(gameId[parseInt(roomList[i])]);
            if (canvasUpate[0]) {
              socket.emit('canvasUpdate', { room: parseInt(roomList[i]), canvas: canvasUpate, game: true });
            } else {
              console.log('no canvas');
            }
          } else {
            // no
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = {
  socketCon
};
