const {
  cache,
  promisifyget,
  promisifyset,
  promisifydel
} = require('./cache.js');
const { core, query, transaction, commit, rollback, end } = require('./mysqlcon.js');

const { getquestion, updateInuse, resetInuse, getGame, getHistory, updateHistory } = require('../server/models/socketcon_model');
const { use } = require('../server/routes/user_route.js');
const timeCheck = [];
const question = [];
const questionId = [];
const userId = [];
const canvas = [];
const hostId = [];
const gameId = [];
const gameTime = [];
const socketCon = (io) => {
  io.on('connection', (socket) => {
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
        // console.log('question_id: ' + questionData[0].id);
        userId[msg.room] = '';
        socket.broadcast.emit(`answer${msg.room}`, question[msg.room]);
        socket.emit(`question${msg.room}`, question[msg.room]);
        gameId[msg.room] = await getGame(questionId[msg.room], hostId[msg.room]);
        getHistory(gameId[msg.room], userId[msg.room], 'fail');
        userId[msg.room] = '';
        gameTime[msg.room] = 1; // 倒數計時任務執行次數
        const timeout = 1000; // 觸發倒數計時任務的時間間隙
        const startTime = new Date().getTime();
        timeCheck[msg.room] = true;

        function startCountdown (interval) {
          setTimeout(() => {
            const endTime = new Date().getTime();
            const deviation = endTime - (startTime + gameTime[msg.room] * timeout);
            if (gameTime[msg.room] < 10) {
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

      socket.on('answerCheck', (msg) => {
        if (timeCheck[msg.room]) {
          if (msg.answerData === question[msg.room]) {
            updateHistory(gameId[msg.room], msg.userId, msg.canvasNum);
            socket.emit(`answerCorrect${msg.userId}`, { check: true, answer: '' });

            socket.emit(`userCorrect${msg.room}`, { userId: msg.userId, canvasNum: msg.canvasNum, time: gameTime[msg.room] });
            socket.broadcast.emit(`userCorrect${msg.room}`, { userId: msg.userId, canvasNum: msg.canvasNum, time: gameTime[msg.room] });
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
          await promisifyset(msg.room + msg.canvasNum, msg.url, 'Ex', 180);
          const a = { canvasNum: msg.canvasNum, url: msg.url };
          aaa.push(a);
          // console.log(aaa);
          socket.broadcast.emit(`convasData${msg.room}`, msg.url);
        }
        // console.log(hostId[msg.room])
        // console.log(msg.room);
        // console.log(msg.canvasNum);
      });
      socket.on('undo', (msg) => {
        socket.broadcast.emit(`undo msg${msg.room}`, msg.data);
      });
      socket.on('redo', async (msg) => {
        if (cache.ready) {
          const redoUrl = await promisifyget(msg.room + msg.canvasNum);
          if (redoUrl) {
            socket.broadcast.emit(`convasData${msg.room}`, redoUrl);
            socket.emit(`redo url${msg.room}`, redoUrl);
          }
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
