
const url = new URLSearchParams(window.location.search);
const type = url.get('type');
const room = url.get('room');
let userId;
let userName;
let userPhoto;
let userScore;
let answerLimit = true;
let answerGet;
const token = localStorage.getItem('token');

fetch('/api/1.0/user/profile', {
  method: 'GET',
  headers: { authorization: `Bearer ${token}` }
})
  .then(function (response) {
    if (response.status === 200) {
      return response.json(); // 內建promise , send type need json
    } else if (response.status === 403) {
      localStorage.removeItem('token');
      sweetAlert('登入逾期！', '請重新登入', 'error', { button: { text: 'Click Me!' } })
        .then(() => {
          return window.location.assign('/');
        });
    } else if (response.status === 401) {
      localStorage.removeItem('token');
      sweetAlert('尚未登入！', '請先登入', 'error', { button: { text: 'Click Me!' } })
        .then(() => {
          return window.location.assign('/');
        });
    }
  }).then(data => {
    userId = data.data.id;
    userName = data.data.name;
    userPhoto = data.data.photo;
    userScore = data.data.score;
    socket.emit('checkPlayer', { userId: userId, room: room });
    const info = document.getElementById('info');

    const name = document.createElement('div');
    name.textContent = `NAME: ${userName}`;
    info.appendChild(name);

    const photo = document.createElement('img');
    if (userPhoto) {
      photo.setAttribute('src', `${userPhoto}`);
    } else {
      photo.setAttribute('src', './images/member.png');
    }
    photo.style.width = '5%';
    info.appendChild(photo);
  })
  .catch(function (err) {
    return err;
  });

const socket = io((''), {
  auth: {
    token: token,
    room: room,
    type: 'player'
  }
});
const imgs = document.querySelector('#imgs');
let canvasNum = 0;
let gameStatus = 0;
let answerData;
let gameDone = true;
let countIndex = 1; // 倒數計時任務執行次數
let timeout = 1000; // 觸發倒數計時任務的時間間隙
let startTime = new Date().getTime();
const limitTime = 20;
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if (countIndex < limitTime && !gameDone) {
      // console.log(`${10 - countIndex}: 偏差${deviation}ms`);
      title.textContent = (`剩 ${limitTime - countIndex} 秒鐘！`);
      countIndex++;

      // 下一次倒數計時
      startCountdown(timeout - deviation);
    } else {
      gameStatus = 0;
      message.textContent = '請等待下一局';
    }
  }, interval);
}
socket.on(`answerGet${room}`, (msg) => {
  gameDone = true;
  answerData = msg.answer;
  title.textContent = (`時間到 正確答案:${answerData}`);
});
const title = document.getElementById('title');
socket.on(`answer${room}`, (msg) => {
  const imgs = document.querySelector('#imgs');
  imgs.innerHTML = '';
  canvasNum = 0;
  gameStatus = 1;
  countIndex = 1; // 倒數計時任務執行次數
  timeout = 1000; // 觸發倒數計時任務的時間間隙
  startTime = new Date().getTime();
  startCountdown(timeout);
  title.textContent = ('遊戲開始');
  gameDone = false;
  message.textContent = '請開始作答';
  socket.emit('checkPlayerInGame', { userId: userId, room: room });
});

socket.on(`convasData${room}`, (msg) => {
  const img = document.createElement('img');
  img.src = msg;
  img.className = 'img';
  img.id = 'img' + canvasNum;
  canvasNum++;
  imgs.appendChild(img);
});

socket.on(`undo msg${room}`, (msg) => {
  if (msg) {
    const myobj = document.getElementById(`img${canvasNum - 1}`);
    myobj.remove();
    canvasNum--;
  }
});

const answer = document.getElementById('answer');
const message = document.getElementById('message');
answer.addEventListener('submit', function (ev) {
  const answerCheck = document.getElementById('answerCheck').value;
  if (gameStatus === 1 && answerLimit) {
    const time = new Date();
    answerLimit = false;
    setTimeout(() => {
      answerLimit = true;
    }, 2000);
    socket.emit('answerCheck', { room: room, userId: userId, time: time, answerData: answerCheck, canvasNum: canvasNum });

    socket.on(`answerCorrect${userId}`, (msg) => {
      if (msg.check) {
        message.textContent = `正確答案！ ${answerCheck}`;
        answerGet = answerCheck;
        gameStatus = 2;
      } else {
        message.textContent = `再亂猜啊！ 才不是${answerCheck}`;
      }
    });
  } else if (!answerLimit) {
    message.textContent = '作答時間間隔太短';
  } else if (gameStatus === 0) {
    message.textContent = 'please wait next game';
  } else if (gameStatus === 2) {
    message.textContent = `您已答對 答案就是${answerGet} please wait next game`;
  }

  ev.preventDefault();
}, false);

socket.on(`answerShow${room}`, (msg) => {
  console.log(msg);
});

socket.on(`userCorrect${room}`, (msg) => {
  console.log(msg);
});

// window.addEventListener('load', function () {
//   socket.emit('checkPlayer', { userId: userId, room: room });
// });
const playerList = document.getElementById('playerList');
const host = document.getElementById('host');
socket.on(`roomUserId${room}`, (msg) => {
  host.textContent = 'host id: ' + msg.hostId;
  playerList.textContent = 'player list: ' + msg.roomUserId;
});
