const url = new URLSearchParams(window.location.search);
const protocol = window.location.protocol;
const urlhost = window.location.host;

const type = url.get('type');
const room = url.get('room');
const urlAll = protocol + '//' + urlhost + '/gamer.html?room=' + room + '&type=' + type;

let userId;
let userName;
let userPhoto;
let userScore;
let limitTime;
let roomId = [];
if (type === 'english') {
  limitTime = 30;
} else if (type === 'idiom') {
  limitTime = 50;
}

const token = localStorage.getItem('token');
fetch('/api/1.0/user/profile', {
  method: 'GET',
  headers: { authorization: `Bearer ${token}` }
})
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 403) {
      localStorage.removeItem('token');
      Swal.fire('登入逾期！', '請重新登入', 'error')
        .then(() => {
          return window.location.assign('/');
        });
    } else if (response.status === 401) {
      localStorage.removeItem('token');
      Swal.fire('尚未登入！', '請先登入', 'error')
        .then(() => {
          return window.location.assign('/');
        });
    }
  }).then(data => {
    userId = data.data.id;
    userName = data.data.name;
    userPhoto = data.data.photo;
    userScore = data.data.score;
    const info = document.getElementById('info');
    const name = document.createElement('td');
    name.className = 'userName hover';
    name.textContent = `NAME: ${userName}`;
    info.appendChild(name);
    const photo = document.getElementById('userPhoto');
    if (userPhoto) {
      photo.setAttribute('src', `${userPhoto}`);
    }
    info.appendChild(photo);
  })
  .catch(function (err) {
    return err;
  });

// socket io
const socket = io((''), {
  auth: {
    token: token,
    room: room,
    type: 'host',
    roomType: type,
    limitTime: limitTime
  }
});

const canvasDiv = document.querySelector('#addCanvas');
const canvas = document.querySelector('.draw');
const ctx = [];
let canvasNum = 0;
ctx[canvasNum] = canvas.getContext('2d');

// 設置畫筆的粗度以及形狀
ctx[canvasNum].lineJoin = 'round';
ctx[canvasNum].lineCap = 'round';
ctx[canvasNum].lineWidth = 5;
// 設置flag以及起始座標
let isDrawing = false;
let lastX = 0;
let lastY = 0;
// 色彩設置
let hue = 0;
let colorNow = '#000000';
let lineWidthNow = 5;
let isRainbow = true;

const colorChoose = document.querySelector('#colorChoose');
const colorView = document.querySelector('#colorView');
colorChoose.addEventListener('change', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow color : OFF');
  ctx[canvasNum].strokeStyle = colorChoose.value;
  colorView.style.backgroundColor = colorChoose.value;
  colorNow = colorChoose.value;
});

const lineWidthRange = document.getElementById('lineWidthRange');
lineWidthRange.oninput = function () {
  ctx[canvasNum].lineWidth = this.value;
  lineWidthNow = this.value;
};

const rainbowColor = document.querySelector('#rainbowColor');
rainbowColor.addEventListener('click', function () {
  isRainbow = true;
  rainbowColor.textContent = ('rainbow color : ON');
});

const eraser = document.querySelector('#eraser');
eraser.addEventListener('click', function () {
  colorNow = 'white';
  isRainbow = false;
});

function draw (e) {
  if (!isDrawing) return;
  if (isRainbow) {
    ctx[canvasNum].strokeStyle = `hsl(${hue},100%,50%)`;
    colorView.style.backgroundColor = `hsl(${hue},100%,50%)`;
  } else {
    ctx[canvasNum].strokeStyle = colorNow;
  }
  ctx[canvasNum].beginPath();
  ctx[canvasNum].moveTo(lastX, lastY);
  ctx[canvasNum].lineTo(e.offsetX, e.offsetY);
  ctx[canvasNum].stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
  hue <= 360 ? hue++ : hue = 0;
}
const createCanvas = function () {
  canvasNum++;
  const canvas = document.createElement('canvas');
  canvas.className = 'draw';
  canvas.id = 'draw' + canvasNum;
  canvas.width = '640';
  canvas.height = '400';
  canvas.style.zIndex = canvasNum;
  ctx[canvasNum] = canvas.getContext('2d');
  canvasDiv.appendChild(canvas);
};

canvasDiv.addEventListener('mouseup', () => {
  if (isDrawing) {
    createCanvas();
  }
});

canvasDiv.addEventListener('mouseout', () => {
  if (isDrawing) {
    createCanvas();
  }
});

canvasDiv.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];

  if (isRainbow) {
    ctx[canvasNum].strokeStyle = `hsl(${hue},100%,50%)`;
    colorView.style.backgroundColor = `hsl(${hue},100%,50%)`;
  } else {
    ctx[canvasNum].strokeStyle = colorNow;
  }
  ctx[canvasNum].lineWidth = lineWidthNow;
  ctx[canvasNum].lineJoin = 'round';
  ctx[canvasNum].lineCap = 'round';
  ctx[canvasNum].beginPath();
  ctx[canvasNum].moveTo(lastX, lastY);
  ctx[canvasNum].lineTo(e.offsetX, e.offsetY);
  ctx[canvasNum].stroke();
  hue <= 360 ? hue++ : hue = 0;
});

canvasDiv.addEventListener('mousemove', draw);
canvasDiv.addEventListener('mousedown', () => isDrawing = true);

const socketUrl = function () {
  if (isDrawing) {
    const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
    const _url = cavasNow.toDataURL();
    socket.emit('canvasData', { room: room, canvasNum: canvasNum - 1, url: _url });
  };
  isDrawing = false;
};

canvasDiv.addEventListener('mouseout', function () {
  socketUrl();
});
canvasDiv.addEventListener('mouseup', function () {
  socketUrl();
});

const getQuestion = document.getElementById('getQuestion');
let gameDone = true;
getQuestion.addEventListener('click', function () {
  if (!roomId[0]) {
    Swal.fire({
      title: '房內尚無其他玩家',
      html:
      '請稍作等待 或是邀請朋友加入 房間連結：' +
      `<input type="text" id="text" value=${urlAll} style="width: 200px;" >` +
    '<button id="copyButton" class="btn btn-outline-primary" onclick="copyUrl()">複製</button>',
      icon: 'error'
    });
  } else if (gameDone) {
    socket.emit('getQuestion', { room: room, type: type, hostId: userId });
  } else {
    Swal.fire({
      timer: 3000,
      title: '時間尚未結束',
      text: '試著讓您作品更豐富！',
      icon: 'warning'
    });
  }
});

let countIndex = 1; // 倒數計時任務執行次數
let timeout = 1000; // 觸發倒數計時任務的時間間隙
let startTime = new Date().getTime();

let questionSql;
const question = document.querySelector('#question');
socket.on(`question${room}`, (msg) => {
  countIndex = 1; // 倒數計時任務執行次數
  timeout = 1000; // 觸發倒數計時任務的時間間隙
  startTime = new Date().getTime();
  if (msg) {
    startCountdown(50);
    const canvasDiv = document.querySelector('#addCanvas');
    canvasDiv.innerHTML = '';
    canvasNum = 0;
    const canvas = document.createElement('canvas');
    canvas.className = 'draw';
    canvas.id = 'draw' + canvasNum;
    canvas.width = '640';
    canvas.height = '400';
    canvas.style.zIndex = canvasNum;
    ctx[canvasNum] = canvas.getContext('2d');
    canvasDiv.appendChild(canvas);
    gameDone = false;
    isDrawing = false;
    questionSql = msg;
    question.textContent = `question: ${questionSql}`;
    time.textContent = ('遊戲開始');
  }
});

const time = document.getElementById('time');
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if (countIndex < limitTime) {
      time.textContent = (`剩 ${limitTime - countIndex} 秒鐘！`);
      countIndex++;
      // 下一次倒數計時
      startCountdown(timeout - deviation);
    } else {
      gameDone = true;
      time.textContent = ('時間到');
    }
  }, interval);
}

const undo = function () {
  if (canvasNum > 0) {
    const myobjNow = document.getElementById(`draw${canvasNum}`);
    myobjNow.remove();
    const myobj = document.getElementById(`draw${canvasNum - 1}`);
    const c = myobj.getContext('2d');
    c.clearRect(0, 0, 640, 400);
    canvasNum--;
    socket.emit('undo', { room: room, canvasNum: canvasNum, data: 1 });
  }
};
const undoBottom = document.querySelector('#undo');
undoBottom.addEventListener('click', function () {
  undo();
});

function KeyPress () {
  const evtobj = window.event;
  const Mac = new RegExp('Mac');
  const Win = new RegExp('Win');
  const computerType = navigator.platform;
  if (Win.test(computerType)) {
    if (evtobj.keyCode === 90 && evtobj.ctrlKey && evtobj.shiftKey) {
      socket.emit('redo', { room: room, canvasNum: canvasNum });
    } else if (evtobj.keyCode === 90 && evtobj.ctrlKey) {
      undo();
    }
  } else if (Mac.test(computerType)) {
    if (evtobj.keyCode === 90 && evtobj.metaKey && evtobj.shiftKey) {
      socket.emit('redo', { room: room, canvasNum: canvasNum });
    } else if (evtobj.keyCode === 90 && evtobj.metaKey) {
      undo();
    }
  }
}

document.onkeydown = KeyPress;

const redoBotton = document.querySelector('#redo');
redoBotton.addEventListener('click', function () {
  socket.emit('redo', { room: room, canvasNum: canvasNum });
});

socket.on(`redo url${room}`, async (msg) => {
  const myobjNow = document.getElementById(`draw${canvasNum}`);
  const contextNow = myobjNow.getContext('2d');
  const img = new Image();
  img.src = msg;
  img.onload = function () {
    contextNow.drawImage(img, 0, 0);
    contextNow.stroke();
    createCanvas();
  };
});

socket.on(`answerShow${room}`, (msg) => {
  console.log('answerShow');
  console.log(msg);
});

socket.on(`userCorrect${room}`, (msg) => {
  const updateId = document.getElementById(`score${msg.userData[0].name}`);
  updateId.textContent = `SCORE: ${msg.userData[0].score + msg.score}`;
  const msgArea = document.getElementById(`msg${msg.userData[0].name}`);
  msgArea.textContent = '答對摟！';
  const userinfoArea = document.getElementById(`userinfo${msg.userData[0].name}`);
  userinfoArea.className = 'correct';
  setTimeout(() => {
    userinfoArea.classList.remove('correct');
  }, (limitTime - countIndex) * 1000);
});

socket.on(`reportOk${room}`, (msg) => {
  Swal.fire({
    title: '過半玩家檢舉了您！',
    text: '良好的遊戲體驗需要您我共能維護',
    icon: 'warning',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    confirmButtonText: '我會改進'
  });
});

const playerList = document.getElementById('playerList');
const host = document.getElementById('host');
socket.on(`roomUserId${room}`, (msg) => {
  playerList.innerHTML = '';
  if (msg.roomUserData && msg.roomUserData[0]) {
    for (const i in msg.roomUserData) {
      const gamerName = msg.roomUserData[i][0].name;
      const gamerPhoto = msg.roomUserData[i][0].photo;
      const gamerScore = msg.roomUserData[i][0].score;
      const userinfo = document.createElement('tr');
      userinfo.className = 'userinfo';
      userinfo.id = `userinfo${gamerName}`;
      playerList.appendChild(userinfo);

      const name = document.createElement('td');
      name.textContent = `${gamerName}`;
      userinfo.appendChild(name);

      const score = document.createElement('td');
      score.textContent = `${gamerScore}`;
      score.id = 'score' + gamerName;
      userinfo.appendChild(score);
      const photoTd = document.createElement('td');
      userinfo.appendChild(photoTd);
      const photo = document.createElement('img');
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', './images/member.png');
      }
      photo.className = 'gamerPhoto';
      photoTd.appendChild(photo);

      const gameMsg = document.createElement('td');
      gameMsg.className = 'msg';
      gameMsg.id = 'msg' + gamerName;
      userinfo.appendChild(gameMsg);
    }
  }

  host.innerHTML = '';
  if (msg.hostDetail) {
    const hostName = msg.hostDetail[0].name;
    const hostPhoto = msg.hostDetail[0].photo;
    const hostinfo = document.createElement('tr');
    hostinfo.className = 'userinfo';
    hostinfo.id = `userinfo${hostName}`;
    host.appendChild(hostinfo);
    const name = document.createElement('td');
    name.textContent = `${hostName}`;
    hostinfo.appendChild(name);

    const photoTd = document.createElement('td');
    hostinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    if (userPhoto) {
      photo.setAttribute('src', `${userPhoto}`);
    }
    photo.className = 'hostPhoto';
    photoTd.appendChild(photo);

    const gameMsg = document.createElement('td');
    gameMsg.className = 'msg';
    gameMsg.id = 'msg' + hostName;
    hostinfo.appendChild(gameMsg);
  }
  if (msg.roomUserId) {
    roomId = msg.roomUserId;
  }
});

const roomElement = document.getElementById('roomMsg');
const roomMsgButton = document.getElementById('roomMsgButton');
roomMsgButton.addEventListener('click', function (ev) {
  const roomMsg = document.getElementById('roomMsg').value;

  roomElement.value = '';
  if (roomMsg.length === 0) {

  } else if (roomMsg.length < 3) {
    socket.emit('roomMsg', { room: room, userName: userName, roomMsg: roomMsg });
  } else {
    Swal.fire({
      timer: 2000,
      title: '輸入太多字',
      icon: 'error',
      showConfirmButton: false
    });
  }
  ev.preventDefault();
}, false);

$('#roomMsg').on('keypress', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const roomMsg = document.getElementById('roomMsg').value;
    const roomElement = document.getElementById('roomMsg');
    roomElement.value = '';
    if (roomMsg.length === 0) {

    } else if (roomMsg.length < 3) {
      socket.emit('roomMsg', { room: room, userName: userName, roomMsg: roomMsg });
    } else {
      Swal.fire({
        timer: 2000,
        title: '輸入太多字',
        icon: 'error',
        showConfirmButton: false
      });
    }
  }
});

socket.on(`roomMsgShow${room}`, (msg) => {
  const msgArea = document.getElementById(`msg${msg.userName}`);
  const userinfoArea = document.getElementById(`userinfo${msg.userName}`);
  msgArea.textContent = msg.roomMsg;
  userinfoArea.style.backgroundColor = '#ccffff';
  setTimeout(() => {
    userinfoArea.style.backgroundColor = '';
  }, 2000);
});

const leave = document.getElementById('leave');
leave.addEventListener('click', function () {
  Swal.fire({
    title: '確定要離開嗎？',
    text: `親愛的 ${userName} 玩家`,
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: '繼續遊戲',
    confirmButtonText: '確認離開'
  })
    .then((result) => {
      if (result.isConfirmed) {
        return window.location.assign('/');
      }
    });
});
