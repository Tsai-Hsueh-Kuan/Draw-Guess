
const url = new URLSearchParams(window.location.search);
const protocol = window.location.protocol;
const urlhost = window.location.host;
const type = url.get('type');
const room = url.get('room');
const urlAll = protocol + '//' + urlhost + '/gamer.html?room=' + room + '&type=' + type;

const typeShow = document.getElementById('question');
if (type === 'english') {
  typeShow.textContent = '動物 單字';
} else if (type === 'idiom') {
  typeShow.textContent = '四字 成語';
}
let userId;
let userName;
let userPhoto;
let userScore;
let answerLimit = true;
let answerGet;
let limitTime;
let roomId = [];
let noChangeTime;
if (type === 'english') {
  limitTime = 60;
  noChangeTime = 60;
} else if (type === 'idiom') {
  limitTime = 60;
  noChangeTime = 60;
}
const token = localStorage.getItem('token');
const socket = io((''), {
  auth: {
    token: token,
    room: room,
    type: 'player',
    limitTime: limitTime
  },
  reconnect: true
});

const Toast2 = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timer: 1000
});

const Toast = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
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
let correctUserList = [];
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

    socket.on(`canvasUpdate${room}id${token}`, (msg) => {
      const timeCheck = msg.timeCheck;
      const canvasAll = msg.canvas;
      for (const i in canvasAll) {
        if (canvasAll[i].canvas_data !== '0') {
          const img = document.createElement('img');
          img.src = canvasAll[i].canvas_data;
          img.className = 'img';
          img.id = 'img' + i;
          canvasNum = parseInt(canvasAll[i].canvas_num) + 1;

          imgs.appendChild(img);
        } else if (canvasAll[i].canvas_undo !== '0') {
          const img = document.getElementsByClassName('img');
          const finalNum = img.length;
          img[finalNum - 1].remove();
        }
      }

      limitTime = limitTime - parseInt(timeCheck);
      gameStatus = 1;
      reportStatus = 1;
      countIndex = 1; // 倒數計時任務執行次數
      timeout = 1000; // 觸發倒數計時任務的時間間隙
      startTime = new Date().getTime();
      startCountdown(50);
      title.textContent = ('遊戲開始');
      title.className = 'timePlaying';
      gameDone = false;
      for (const i in msg.correctUserList) {
        if (correctUserList[0]) {
          correctUserList.push(msg.correctUserList[i]);
        } else {
          correctUserList[0] = msg.correctUserList[i];
        }
        const msgTdArea = document.getElementById(`msgTd${msg.correctUserList[i]}`);
        if (msgTdArea) {
          msgTdArea.className = 'msgTd correct';
        }

        if (msg.correctUserList[i] === userName) {
          gameStatus = 2;
        }
      }

      socket.emit('checkPlayerInGame', { userId: userId, room: room });
    });
    const info = document.getElementById('info');
    const name = document.createElement('td');
    name.textContent = `NAME: ${userName}`;
    name.className = 'userName hover';
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

function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if (countIndex < limitTime && !gameDone) {
      title.textContent = (`剩 ${limitTime - countIndex} 秒`);
      if ((limitTime - countIndex) === 5) {
        title.className = 'time5';
      }
      countIndex++;
      // 下一次倒數計時
      startCountdown(timeout - deviation);
    } else {
      reportStatus = 0;
      gameStatus = 0;
      title.className = 'time';
      limitTime = noChangeTime;
    }
  }, interval);
}
socket.on('answerGet', (msg) => {
  gameDone = true;
  answerData = msg.answer;
  title.textContent = ('等待開始下局遊戲');
  const msgTdHost = document.getElementById('msgTdHost');
  msgTdHost.innerHTML = '';
  Toast.fire({
    text: `正確答案:${answerData}`,
    width: '400px',
    padding: '30px'
  });
  const msgarea = document.getElementsByClassName('msg');

  for (const i in msgarea) {
    msgarea[i].textContent = '';
  }
  heartStatus = 0;
  const heart = document.getElementById('heart');
  heart.className = 'heart';
  const answerShow = document.getElementById('answerShow');
  answerShow.textContent = '';
});

const title = document.getElementById('title');
socket.on('answer', () => {
  const answerShow = document.getElementById('answerShow');
  answerShow.textContent = '';
  setTimeout(function () {
    $('.rankPart').removeClass('loaded');
  }, 500);
  const imgs = document.querySelector('#imgs');
  imgs.innerHTML = '';
  canvasNum = 0;
  gameStatus = 1;
  reportStatus = 1;
  countIndex = 1; // 倒數計時任務執行次數
  timeout = 1000; // 觸發倒數計時任務的時間間隙
  startTime = new Date().getTime();
  startCountdown(50);
  title.textContent = ('遊戲開始');

  for (const i in correctUserList) {
    const correctEle = document.getElementById(`msgTd${correctUserList[i]}`);
    const correctMsg = document.getElementById(`msg${correctUserList[i]}`);
    correctEle.className = 'msgTd';
    correctMsg.innerHTML = '';
  }
  correctUserList = [];

  title.className = 'timePlaying';
  gameDone = false;
  socket.emit('checkPlayerInGame', { userId: userId, room: room });
});

socket.on('convasData', (msg) => {
  const img = document.createElement('img');
  img.src = msg;
  img.className = 'img';
  img.id = 'img' + canvasNum;
  canvasNum++;
  imgs.appendChild(img);
});

socket.on('undo msg', (msg) => {
  if (msg) {
    const myobj = document.getElementById(`img${canvasNum - 1}`);
    myobj.remove();
    canvasNum--;
  }
});

const answerCheckButton = document.getElementById('answerCheckButton');
answerCheckButton.addEventListener('click', function (ev) {
  const answerCheck = document.getElementById('answerCheck').value.toLowerCase();
  const answerElement = document.getElementById('answerCheck');
  answerElement.value = '';
  if (gameStatus === 1 && answerLimit) {
    const time = new Date();
    answerLimit = false;
    setTimeout(() => {
      answerLimit = true;
    }, 2000);
    socket.emit('answerCheck', { room: room, userId: userId, time: time, answerData: answerCheck, canvasNum: canvasNum });

    socket.on(`answerCorrect${room + 'and' + userId}`, (msg) => {
      if (msg.check) {
        Toast2.fire({
          icon: 'success',
          title: '答對了！',
          width: '400px',
          padding: '30px'
        });
        const audio = document.getElementById('mp3');
        audio.play();
        audio.volume = 0.7;
        const answerShow = document.getElementById('answerShow');
        answerShow.textContent = `ANS : ${answerCheck}`;
        answerGet = answerCheck;
        gameStatus = 2;
      } else {
        const audio = document.getElementById('wrongMp3');
        audio.play();
        audio.volume = 0.7;
        Toast2.fire({
          icon: 'error',
          title: '猜錯了！',
          width: '400px',
          padding: '30px'
        });
      }
    });
  } else if (!answerLimit) {
    Toast2.fire({
      icon: 'warning',
      title: '作答時間間隔太短',
      width: '400px',
      padding: '30px'
    });
  } else if (gameStatus === 0) {
    Toast2.fire({
      icon: 'warning',
      title: 'please wait for next game',
      width: '400px',
      padding: '30px'
    });
  } else if (gameStatus === 2) {
    Toast2.fire({
      icon: 'warning',
      title: '已經答對囉',
      width: '400px',
      padding: '30px'
    });
  }
  ev.preventDefault();
}, false);

$('#answerCheck').on('keypress', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const answerCheck = document.getElementById('answerCheck').value.toLowerCase();
    const answerElement = document.getElementById('answerCheck');
    answerElement.value = '';
    if (gameStatus === 1 && answerLimit) {
      const time = new Date();
      answerLimit = false;
      setTimeout(() => {
        answerLimit = true;
      }, 2000);
      socket.emit('answerCheck', { room: room, userId: userId, time: time, answerData: answerCheck, canvasNum: canvasNum });
      socket.on(`answerCorrect${'and' + userId}`, (msg) => {
        if (msg.check) {
          Toast2.fire({
            icon: 'success',
            title: '答對了！',
            width: '400px',
            padding: '30px'
          });
          const audio = document.getElementById('mp3');
          audio.play();
          audio.volume = 0.7;
          const answerShow = document.getElementById('answerShow');
          answerShow.textContent = `ANS : ${answerCheck}`;
          answerGet = answerCheck;
          gameStatus = 2;
        } else {
          const audio = document.getElementById('wrongMp3');
          audio.play();
          audio.volume = 0.7;
          Toast2.fire({
            icon: 'error',
            title: '猜錯了！',
            width: '400px',
            padding: '30px'
          });
        }
      });
    } else if (!answerLimit) {
      Toast2.fire({
        icon: 'warning',
        title: '作答時間間隔太短',
        width: '400px',
        padding: '30px'
      });
    } else if (gameStatus === 0) {
      Toast2.fire({
        icon: 'warning',
        title: 'please wait for next game',
        width: '400px',
        padding: '30px'
      });
    } else if (gameStatus === 2) {
      Toast2.fire({
        icon: 'warning',
        title: '已經猜對囉 請欣賞並等待下一局！',
        width: '400px',
        padding: '30px'
      });
    }
  }
});

let reportStatus = 0;
const report = document.getElementById('report');
report.addEventListener('click', async function (ev) {
  if (reportStatus === 1) {
    Swal.fire({
      title: '請告訴我們檢舉原因',
      input: 'select',
      inputOptions: {
        writeAnswer: '畫布上寫答案',
        publishAnser: '訊息洩漏答案',
        noAction: '消極作畫',
        indecent: '不雅繪圖',
        other: '其他'
      },
      inputPlaceholder: '選擇違規事由',
      showCancelButton: true
    }).then(function (result) {
      if (result.value) {
        Swal.fire({
          timer: 2000,
          title: '已收到您的檢舉',
          text: '系統將做相應處理',
          icon: 'success',
          showConfirmButton: false
        });
        reportStatus = 2;
        socket.emit('report', { room: room, userId: userId, reason: result.value });
      } else {
        Swal.fire({
          timer: 2000,
          title: '未選擇事由！',
          icon: 'warning',
          showConfirmButton: false
        });
      }
    });
  } else if (reportStatus === 0) {
    Swal.fire({
      title: '遊戲尚未開始',
      text: '遊戲中才能檢舉！',
      icon: 'warning',
      confirmButtonText: '瞭解',
      showConfirmButton: false
    });
  } else if (reportStatus === 2) {
    Swal.fire({
      timer: 2000,
      title: '已收到您檢舉！',
      icon: 'warning',
      showConfirmButton: false
    });
  }
  ev.preventDefault();
}, false);

socket.on('answerShow', (msg) => {
  const msgArea = document.getElementById(`msg${msg.userData[0].name}`);
  msgArea.textContent = `${msg.data}`;
  const msgTdArea = document.getElementById(`msgTd${msg.userData[0].name}`);
  msgTdArea.className = 'inCorrect';
  setTimeout(() => {
    msgTdArea.classList.remove('inCorrect');
  }, 2000);
});

socket.on('userCorrect', (msg) => {
  if (correctUserList[0]) {
    correctUserList.push(msg.userData[0].name);
  } else {
    correctUserList[0] = msg.userData[0].name;
  }
  const updateId = document.getElementById(`score${msg.userData[0].name}`);
  updateId.textContent = `${msg.userData[0].score + msg.score}`;
  const msgArea = document.getElementById(`msg${msg.userData[0].name}`);
  msgArea.textContent = `答對! 加${msg.score}分`;
  const msgTdArea = document.getElementById(`msgTd${msg.userData[0].name}`);
  msgTdArea.className = 'userinfo correct';
  const updateHost = document.getElementById('hostScore');
  updateHost.textContent = `${(parseInt(updateHost.textContent) + parseInt(msg.hostScore))}`;
});

socket.on('reportOk', (msg) => {
  Swal.fire({
    timer: 3000,
    title: '過半玩家提出檢舉！',
    text: '已通知房主要求改進！',
    icon: 'warning'
  });
});

socket.on('heartShow', (msg) => {
  const count = msg.data;
  const msgTd = document.getElementsByClassName('msgTd');
  msgTd[0].innerHTML = '';
  for (let i = 0; i < count; i++) {
    const gameMsg = document.createElement('p');
    gameMsg.className = 'msg fas fa-heart';
    msgTd[0].appendChild(gameMsg);
  }
});

socket.on('allCorrect', (msg) => {
  if (msg.data) {
    setTimeout(function () {
      $('.rankPart').addClass('loaded');
    }, 500);
  }
});

socket.on('closeRoom', () => {
  Swal.fire({
    timer: 3000,
    title: '房主已離開房間！',
    text: '將回到首頁 請重新選擇遊戲',
    icon: 'info'
  }).then(() => {
    return window.location.assign('/');
  });
});

function copyUrl () {
  const input = document.getElementById('text');
  input.select();
  document.execCommand('copy');
}

const playerList = document.getElementById('playerList');
const host = document.getElementById('host');
socket.on('roomUserId', (msg) => {
  playerList.innerHTML = '';
  if (msg.roomUserData && msg.roomUserData[0]) {
    for (const i in msg.roomUserData) {
      const gamerName = msg.roomUserData[i][0].name;
      const gamerPhoto = msg.roomUserData[i][0].photo;
      const gamerScore = msg.roomUserData[i][0].score;
      const userinfo = document.createElement('tr');
      userinfo.id = 'userinfo' + gamerName;
      playerList.appendChild(userinfo);

      const photoTd = document.createElement('td');
      photoTd.className = 'gamerPhotoTd';
      userinfo.appendChild(photoTd);

      const photo = document.createElement('img');
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
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
      gameMsgTd.id = 'msgTd' + gamerName;
      gameMsgTd.className = 'msgTd';
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
    hostinfo.className = 'userinfo';
    hostinfo.id = 'userinfoHost';
    host.appendChild(hostinfo);

    const photoTd = document.createElement('td');
    photoTd.className = 'gamerPhotoTd';
    hostinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
    }
    photo.className = 'hostPhoto';
    photoTd.appendChild(photo);

    const name = document.createElement('td');
    name.textContent = `${hostName}`;
    name.className = 'gamerNameHost';
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

  } else if (roomMsg.length < 30) {
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

    } else if (roomMsg.length < 30) {
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

const invite = document.getElementById('invite');
invite.addEventListener('click', function () {
  const i = Math.floor(Math.random() * 6);
  Swal.fire({
    title: '邀請朋友加入',
    imageUrl: `https://d3cek75nx38k91.cloudfront.net/draw/${imgsAll[i]}.jpeg`,
    imageWidth: 200,
    imageHeight: 200,
    imageAlt: 'image',
    html:
    ' 房間連結：' +
    `<input type="text" id="text" value=${urlAll} style="width: 200px;" >` +
  '<button id="copyButton" class="btn btn-outline-primary" onclick="copyUrl()">複製</button>'
  });
});

const chat = document.getElementById('chat');
socket.on('roomMsgShow', (msg) => {
  if (msg.err) {
    if (msg.userName === userName) {
      Swal.fire({
        title: '不要在聊天室透露答案！',
        text: '良好的遊戲體驗需要您我共能維護',
        icon: 'warning',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        confirmButtonText: '我會改進'
      });
    }
  } else {
    if (msg.userName !== userName) {
      const accordion = document.getElementById('accordion');
      accordion.className = 'panel-heading panel-heading-msg';
      setTimeout(() => {
        accordion.className = 'panel-heading';
      }, 2000);
    }
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
      img.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
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
    let mins = newDate.getMinutes();

    if (mins < 10) {
      mins = '0' + mins;
    }
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
    panel[0].scrollTo(0, panel[0].scrollHeight);
  }
});

const leave = document.getElementById('leave');
leave.addEventListener('click', function () {
  Swal.fire({
    title: '確定要離開房間嗎？',
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

let heartStatus = 0;
const heartButton = document.getElementById('heart');
heartButton.addEventListener('click', function () {
  if (heartStatus === 0 && gameDone === false) {
    heartStatus = 1;
    $(this).toggleClass('is-active');
    document.cookie = `heart${room}=1; max-age=${limitTime - countIndex}`;
    socket.emit('giveHeart', { heart: true, room: room });
  }
});

function parseCookie () {
  const cookieObj = {};
  const cookieAry = document.cookie.split(';');
  let cookie;
  for (let i = 0, l = cookieAry.length; i < l; ++i) {
    cookie = jQuery.trim(cookieAry[i]);
    cookie = cookie.split('=');
    cookieObj[cookie[0]] = cookie[1];
  }
  return cookieObj;
}

function getCookieByName (name) {
  let value = parseCookie()[name];
  if (value) {
    value = decodeURIComponent(value);
  }
  return value;
}

if (getCookieByName(`heart${room}`)) {
  heartStatus = 1;
  $('#heart').toggleClass('is-active');
}

socket.emit('onlineUser', 'get');
socket.on('onlineUserShow', async (msg) => {
  const onlineUser = msg.userAll.filter(function (element, index, arr) {
    return arr.indexOf(element) === index;
  });
  const onlineCount = onlineUser.length;
  const onlineUserCount = document.getElementById('onlineUserCount');
  onlineUserCount.textContent = '在線人數：' + onlineCount + '人';
});

socket.on('repeat', (msg) => {
  setTimeout(() => {
    if (msg.id === userId) {
      Swal.fire({
        timer: 3000,
        title: '您已是房主！',
        text: '將回到首頁 請勿重複加入',
        icon: 'error'
      }).then(() => {
        return window.location.assign('/');
      });
    }
  }, 1000);
});

socket.on('repeatUser', (msg) => {
  setTimeout(() => {
    if (msg.id === userId) {
      Swal.fire({
        timer: 3000,
        title: '您已在房間！',
        text: '請勿重複加入 ' +
        '良好遊戲風氣 需大家共同維護',
        icon: 'error'
      }).then(() => {
        return window.location.assign('/');
      });
    }
  }, 3000);
});

const imgsAll = ['chipmunk', 'cow', 'dog', 'elephant', 'hippo', 'rabbit'];
const randomNumber = Math.floor(Math.random() * 6);
Swal.fire({
  title: '歡迎加入遊戲',
  imageUrl: `https://d3cek75nx38k91.cloudfront.net/draw/${imgsAll[randomNumber]}.jpeg`,
  imageWidth: 200,
  imageHeight: 200,
  imageAlt: 'image',
  html: '請盡量回答 來獲得更多分數！' +
  '</br>' +
   '回答得越快 分數越高喔～'
});
