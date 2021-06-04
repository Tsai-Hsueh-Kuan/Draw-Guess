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
let correctUserList = [];
if (type === 'english') {
  limitTime = 60;
} else if (type === 'idiom') {
  limitTime = 60;
}

const token = localStorage.getItem('token');
// socket io
const socket = io((''), {
  auth: {
    token: token,
    room: room,
    type: 'host',
    roomType: type,
    limitTime: limitTime
  },
  reconnect: true
});

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

const lineWidthRange = document.getElementById('lineWidthRange');
lineWidthRange.oninput = function () {
  ctx[canvasNum].lineWidth = this.value;
  lineWidthNow = this.value;
};

const red = document.querySelector('#red');
red.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'red';
  rainbowColor.style.backgroundColor = 'red';
  colorNow = 'red';
});

const orange = document.querySelector('#orange');
orange.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'orange';
  rainbowColor.style.backgroundColor = 'orange';
  colorNow = 'orange';
});

const yellow = document.querySelector('#yellow');
yellow.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'yellow';
  rainbowColor.style.backgroundColor = 'yellow';
  colorNow = 'yellow';
});

const green = document.querySelector('#green');
green.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'green';
  rainbowColor.style.backgroundColor = 'green';
  colorNow = 'green';
});

const blue = document.querySelector('#blue');
blue.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'blue';
  rainbowColor.style.backgroundColor = 'blue';
  colorNow = 'blue';
});

const purple = document.querySelector('#purple');
purple.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'purple';
  rainbowColor.style.backgroundColor = 'purple';
  colorNow = 'purple';
});

const black = document.querySelector('#black');
black.addEventListener('click', function () {
  isRainbow = 0;
  rainbowColor.textContent = ('rainbow:OFF');
  rainbowColor.className = 'rainbowOff';
  ctx[canvasNum].strokeStyle = 'black';
  rainbowColor.style.backgroundColor = 'black';
  colorNow = 'black';
});

const rainbowColor = document.querySelector('#rainbowColor');
rainbowColor.addEventListener('click', function () {
  isRainbow = true;
  rainbowColor.textContent = ('rainbow:ON');
  rainbowColor.className = 'rainbow';
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
    rainbowColor.style.backgroundColor = `hsl(${hue},100%,50%)`;
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
  canvas.width = '700';
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
    rainbowColor.style.backgroundColor = `hsl(${hue},100%,50%)`;
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

const invite = document.getElementById('invite');
invite.addEventListener('click', function () {
  const imgs = ['chipmunk', 'cow', 'dog', 'elephant', 'hippo', 'rabbit'];
  const i = Math.floor(Math.random() * 6);
  Swal.fire({
    title: '邀請朋友加入',
    imageUrl: `./images/${imgs[i]}.jpeg`,
    imageWidth: 200,
    imageHeight: 200,
    imageAlt: 'image',
    html:
    ' 房間連結：' +
    `<input type="text" id="text" value=${urlAll} style="width: 200px;" >` +
  '<button id="copyButton" class="btn btn-outline-primary" onclick="copyUrl()">複製</button>'
  });
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
    socket.emit(`getQuestion${room}`, { room: room, type: type, hostId: userId });
    correctUserList = [];
    const correctEle = document.getElementsByClassName('correct');
    for (const i in correctEle) {
      correctEle[i].className = 'msgTd';
    }
    const msg = document.getElementsByClassName('msg');
    for (const i in msg) {
      msg[i].textContent = '';
    }
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
    canvas.width = '700';
    canvas.height = '400';
    canvas.style.zIndex = canvasNum;
    ctx[canvasNum] = canvas.getContext('2d');
    canvasDiv.appendChild(canvas);
    gameDone = false;
    isDrawing = false;
    questionSql = msg;
    question.textContent = `${questionSql}`;
    time.className = 'timePlaying';
    // getQuestion.textContent = ('PLAYING');
  }
});

const time = document.getElementById('time');
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if (countIndex < limitTime) {
      time.textContent = (`剩 ${limitTime - countIndex} 秒`);
      // 下一次倒數計時
      if ((limitTime - countIndex) === 5) {
        time.className = 'time5';
      }
      countIndex++;
      startCountdown(timeout - deviation);
    } else {
      const msg = document.getElementsByClassName('msg');
      for (const i in msg) {
        msg[i].textContent = '';
      }
      const msgTdHost = document.getElementById('msgTdHost');
      msgTdHost.innerHTML = '';
      gameDone = true;
      time.textContent = ('請按START開始遊戲');
      time.className = 'time';
      getQuestion.textContent = ('START');

      Toast.fire({
        // icon: 'info',
        title: '時間到',
        text: '休息一下 準備下一題',
        width: '400px',
        padding: '30px'
      });
    }
  }, interval);
}

const undo = function () {
  if (canvasNum > 0) {
    const myobjNow = document.getElementById(`draw${canvasNum}`);
    myobjNow.remove();
    const myobj = document.getElementById(`draw${canvasNum - 1}`);
    const c = myobj.getContext('2d');
    c.clearRect(0, 0, 700, 400);
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
  const msgArea = document.getElementById(`msg${msg.userData[0].name}`);
  msgArea.textContent = `${msg.data}`;
  const msgTdArea = document.getElementById(`msgTd${msg.userData[0].name}`);
  msgTdArea.className = 'inCorrect';
  setTimeout(() => {
    msgTdArea.classList.remove('inCorrect');
  }, 2000);
});

socket.on(`userCorrect${room}`, (msg) => {
  if (correctUserList[0]) {
    correctUserList.push(msg.userData[0].name);
  } else {
    correctUserList[0] = msg.userData[0].name;
  }

  const updateId = document.getElementById(`score${msg.userData[0].name}`);
  updateId.textContent = `${msg.userData[0].score + msg.score}`;
  const msgArea = document.getElementById(`msg${msg.userData[0].name}`);
  msgArea.textContent = `答對！ 加${msg.score}分`;
  setTimeout(() => {
    msgArea.textContent = '答對！';
  }, 3000);
  const msgTdArea = document.getElementById(`msgTd${msg.userData[0].name}`);
  msgTdArea.className = 'msgTd correct';
  // setTimeout(() => {
  //   msgTdArea.classList.remove('correct');
  // }, (limitTime - countIndex) * 1000);
  const updateHost = document.getElementById('hostScore');
  updateHost.textContent = `${(parseInt(updateHost.textContent) + parseInt(msg.hostScore))}`;
  // const msgArea = document.getElementById(`msg${msg.userData[0].name}`);
  // msgArea.textContent = `答對摟！ 加${msg.score}分`;
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

socket.on(`heartShow${room}`, () => {
  const msgTd = document.getElementsByClassName('msgTd');
  const gameMsg = document.createElement('p');
  gameMsg.className = 'msg fas fa-heart';
  msgTd[0].appendChild(gameMsg);
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

      const photoTd = document.createElement('td');
      photoTd.className = 'gamerPhotoTd';
      userinfo.appendChild(photoTd);

      const photo = document.createElement('img');
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', './images/member2.png');
      }
      photo.className = 'gamerPhoto';
      photoTd.appendChild(photo);

      const name = document.createElement('td');
      name.textContent = `${gamerName}`;
      name.className = 'gamerName';
      userinfo.appendChild(name);

      const score = document.createElement('td');
      score.textContent = `${gamerScore}`;
      score.id = 'score' + gamerName;
      score.className = 'gamerScore';
      userinfo.appendChild(score);

      const gameMsgTd = document.createElement('td');
      gameMsgTd.className = 'msgTd';
      gameMsgTd.id = 'msgTd' + gamerName;
      userinfo.appendChild(gameMsgTd);

      const gameMsg = document.createElement('p');
      gameMsg.className = 'msg';
      gameMsg.id = 'msg' + gamerName;
      gameMsgTd.appendChild(gameMsg);

      for (const i in correctUserList) {
        if (gamerName === correctUserList[i]) {
          gameMsgTd.className = 'msgTd correct';
          gameMsg.textContent = '答對摟！';
        }
      }
    }
  }

  host.innerHTML = '';
  if (msg.hostDetail) {
    const hostName = msg.hostDetail[0].name;
    const hostPhoto = msg.hostDetail[0].photo;
    const hostScore = msg.hostDetail[0].score;

    const hostinfo = document.createElement('tr');
    // hostinfo.className = 'userinfo';
    hostinfo.id = 'userinfoHost';
    hostinfo.className = 'userinfo';
    host.appendChild(hostinfo);

    const photoTd = document.createElement('td');
    photoTd.className = 'gamerPhotoTd';
    hostinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', './images/member2.png');
    }
    photo.className = 'hostPhoto';
    photoTd.appendChild(photo);

    const name = document.createElement('td');
    name.textContent = `${hostName}`;
    hostinfo.appendChild(name);

    const score = document.createElement('td');
    score.textContent = `${hostScore}`;
    score.id = 'hostScore';
    score.className = 'gamerScore';
    hostinfo.appendChild(score);

    const gameMsgTd = document.createElement('td');
    gameMsgTd.className = 'msgTd';
    gameMsgTd.id = 'msgTdHost';
    hostinfo.appendChild(gameMsgTd);

    // const gameMsg = document.createElement('p');
    // gameMsg.className = 'msg fas fa-heart';
    // gameMsg.id = 'msg' + hostName;
    // gameMsgTd.appendChild(gameMsg);
  }
  if (msg.roomUserId) {
    roomId = msg.roomUserId;
  }
});

const roomElement = document.getElementById('btn-input');
const roomMsgButton = document.getElementById('btn-chat');
roomMsgButton.addEventListener('click', function (ev) {
  const roomMsg = document.getElementById('btn-input').value;

  roomElement.value = '';
  if (roomMsg.length === 0) {

  } else if (roomMsg.length < 31) {
    socket.emit('roomMsg', { room: room, userName: userName, userPhoto: userPhoto, roomMsg: roomMsg });
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

$('#btn-input').on('keypress', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const roomMsg = document.getElementById('btn-input').value;
    const roomElement = document.getElementById('btn-input');
    roomElement.value = '';
    if (roomMsg.length === 0) {

    } else if (roomMsg.length < 31) {
      socket.emit('roomMsg', { room: room, userName: userName, userPhoto: userPhoto, roomMsg: roomMsg });
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
const chat = document.getElementById('chat');
socket.on(`roomMsgShow${room}`, (msg) => {
  const li = document.createElement('li');
  li.className = 'left clearfix';
  chat.appendChild(li);

  const span = document.createElement('span');
  span.className = 'chat-img pull-left';
  li.appendChild(span);

  const img = document.createElement('img');
  img.className = 'img-circle';
  img.alt = 'User Img';
  if (msg.userPhoto) {
    img.setAttribute('src', `${msg.userPhoto}`);
  } else {
    img.setAttribute('src', './images/member2.png');
  }
  span.appendChild(img);

  const divChatBody = document.createElement('div');
  divChatBody.className = 'chat-body clearfix';
  li.appendChild(divChatBody);

  const headerDiv = document.createElement('div');
  headerDiv.className = 'header';
  divChatBody.appendChild(headerDiv);

  const strong = document.createElement('strong');
  strong.textContent = msg.userName;
  strong.className = 'primary-font';
  headerDiv.appendChild(strong);

  const newDate = new Date();
  const hour = newDate.getHours();
  const mins = newDate.getMinutes();

  const small = document.createElement('small');

  small.textContent = hour + ':' + mins;
  small.className = 'pull-right text-muted';
  headerDiv.appendChild(small);

  const spanTime = document.createElement('span');
  spanTime.className = 'glyphicon glyphicon-time';
  small.appendChild(spanTime);

  const p = document.createElement('p');
  p.textContent = msg.roomMsg;
  divChatBody.appendChild(p);

  const panel = document.getElementsByClassName('panel-body');
  panel[0].scrollTo(0, 999999999);
});

const Toast = Swal.mixin({
  toast: true,
  // position: 'top-end',
  showConfirmButton: false,
  timer: 8000,

  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

socket.emit('onlineUser', 'get');
socket.on('onlineUserShow', async (msg) => {
  const onlineUser = msg.userAll.filter(function (element, index, arr) {
    return arr.indexOf(element) === index;
  });
  const onlineCount = onlineUser.length;
  const onlineUserCount = document.getElementById('onlineUserCount');
  onlineUserCount.textContent = '在線人數：' + onlineCount + '人';
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

const imgsAll = ['chipmunk', 'cow', 'dog', 'elephant', 'hippo', 'rabbit'];
const randomNumber = Math.floor(Math.random() * 6);
Swal.fire({
  title: '歡迎加入遊戲',
  imageUrl: `./images/${imgsAll[randomNumber]}.jpeg`,
  imageWidth: 200,
  imageHeight: 200,
  imageAlt: 'image',
  html: '請盡量畫圖 來獲得更多分數！' +
  '</br>' +
   '大家猜得越快 分數越高喔～' +
   '</br>' +
   '但請勿直接寫答案 這是犯規的喔～'
});
