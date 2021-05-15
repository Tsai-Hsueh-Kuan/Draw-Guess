const url = new URLSearchParams(window.location.search);
const type = 'idiom';// url.get('type');
const room = url.get('room');
const password = url.get('password');
let userId;
let userName;
let userPhoto;
let userScore;
let roomId;

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

// socket io
const socket = io((''), {
  auth: {
    token: token,
    room: room,
    type: 'host'
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

// $('.color input').change(function () {
//   r = $('#red').val();
//   g = $('#green').val();
//   b = $('#blue').val();
//   RB = 0;
//   eraserOn = 0;
//   changeColor(r, g, b);
//   // 取出input中的數值
// });
// const colorView = document.querySelector('#color_view');
// function changeColor (r, g, b) {
//   const colors = {
//     red: r,
//     green: g,
//     blue: b
//   };
//   $.each(colors, function (_color, _value) {
//     $('#v' + _color).val(_value);
//   });
//   ctx[canvasNum].strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
//   colorNow = 'rgb(' + r + ',' + g + ',' + b + ')';
//   RB = 0;
//   eraserOn = 0;
//   colorView.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
// };

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
  canvas.width = '800';
  canvas.height = '500';
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

// $('#save').on('click', function () {
//   const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
//   const _url = cavasNow.toDataURL();
//   this.href = _url;
//   save.setAttribute('download', 'draw_test.png');
// });
const socketUrl = function () {
  if (isDrawing) {
    const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
    const _url = cavasNow.toDataURL();
    // this.href = _url;
    // 再把href載入上面的Data:image
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
  if (!roomId) {
    alert('你也等一下人吧');
  } else if (gameDone) {
    socket.emit('getQuestion', { room: room, type: type, hostId: userId });
  } else {
    sweetAlert('這場遊戲尚未結束！', '試著 讓作品更豐富', 'error', { button: { text: '繼續畫！!' } });
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
    startCountdown(timeout);
    const canvasDiv = document.querySelector('#addCanvas');
    canvasDiv.innerHTML = '';
    canvasNum = 0;
    const canvas = document.createElement('canvas');
    canvas.className = 'draw';
    canvas.id = 'draw' + canvasNum;
    canvas.width = '800';
    canvas.height = '500';
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
const limitTime = 20;
const time = document.getElementById('time');
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if (countIndex < limitTime) {
      // console.log(`${10 - countIndex}: 偏差${deviation}ms`);
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
    c.clearRect(0, 0, 800, 500);
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
  console.log('answerShow' + msg);
});

socket.on(`userCorrect${room}`, (msg) => {
  console.log('userCorrect:');
  console.log(msg);
});

const playerList = document.getElementById('playerList');
const host = document.getElementById('host');
socket.on(`roomUserId${room}`, (msg) => {
  host.textContent = 'host id: ' + msg.hostId;
  playerList.textContent = 'player list: ' + msg.roomUserId;
  roomId = msg.roomUserId;
});
