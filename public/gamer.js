
const url = new URLSearchParams(window.location.search);

const protocol = window.location.protocol;
const urlhost = window.location.host;
const type = url.get('type');
const room = url.get('room');
const urlGamer = protocol + '//' + urlhost + '/gamer.html?room=' + room + '&type=' + type;
const urlDraw = protocol + '//' + urlhost + '/draw.html?room=' + room + '&type=' + type;
let userId;
let userName;
let userPhoto;
let userScore;
let answerLimit = true;
let answerGet;
let limitTime;
if (type === 'english') {
  limitTime = 30;
} else if (type === 'idiom') {
  limitTime = 50;
}

const imgs = document.querySelector('#imgs');

const token = localStorage.getItem('token');
const socket = io((''), {
  auth: {
    token: token,
    room: room,
    type: 'player',
    limitTime: limitTime
  }
});

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

    socket.on(`canvasUpdate${room}id${token}`, (msg) => {
      const canvasAll = msg.canvas;
      for (const i in canvasAll) {
        if (canvasAll[i].canvas_data !== '0') {
          const img = document.createElement('img');
          img.src = canvasAll[i].canvas_data;
          img.className = 'img';
          img.id = 'img' + i;
          canvasNum = canvasAll[i].canvas_num - 1;
          imgs.appendChild(img);
        } else if (canvasAll[i].canvas_undo !== '0') {
          const img = document.getElementsByClassName('img');

          const finalNum = img.length;

          img[finalNum - 1].remove();
        }
      }
    });
    const info = document.getElementById('info');
    const name = document.createElement('td');
    name.textContent = `NAME: ${userName}`;
    name.className = 'userName';
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

let canvasNum = 0;
let gameStatus = 0;
let answerData;
let gameDone = true;
let countIndex = 1; // 倒數計時任務執行次數
let timeout = 1000; // 觸發倒數計時任務的時間間隙
let startTime = new Date().getTime();

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
      reportStatus = 0;
      gameStatus = 0;
      message.textContent = '請等待下一局';
    }
  }, interval);
}
socket.on(`answerGet${room}`, (msg) => {
  gameDone = true;
  answerData = msg.answer;
  title.textContent = (`時間到 正確答案:${answerData}`);
  // const userinfoArea = document.getElementById(`userinfo${msg.userData[0].name}`);
  // userinfoArea.removeClass('correct');
});
const title = document.getElementById('title');
socket.on(`answer${room}`, (msg) => {
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
  const answerCheck = document.getElementById('answerCheck').value.toLowerCase();
  if (gameStatus === 1 && answerLimit) {
    const time = new Date();
    answerLimit = false;
    setTimeout(() => {
      answerLimit = true;
    }, 2000);
    socket.emit('answerCheck', { room: room, userId: userId, time: time, answerData: answerCheck, canvasNum: canvasNum });

    socket.on(`answerCorrect${room + 'and' + userId}`, (msg) => {
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
    message.textContent = 'please wait for next game';
  } else if (gameStatus === 2) {
    message.textContent = '您已答對 please wait for next game';
  }

  ev.preventDefault();
}, false);

const roomMsgButton = document.getElementById('roomMsgButton');
roomMsgButton.addEventListener('click', function (ev) {
  const roomMsg = document.getElementById('roomMsg').value;
  if (roomMsg.length < 15) {
    socket.emit('roomMsg', { room: room, userName: userName, roomMsg: roomMsg });
  } else {
    alert('別打太多字啊');
  }

  ev.preventDefault();
}, false);

socket.on(`roomMsgShow${room}`, (msg) => {
  const msgArea = document.getElementById(`msg${msg.userName}`);
  const userinfoArea = document.getElementById(`userinfo${msg.userName}`);
  msgArea.textContent = msg.roomMsg;
  userinfoArea.style.backgroundColor = '#ccffff';
  setTimeout(() => {
    userinfoArea.style.backgroundColor = '';
  }, 2000);

  // userinfoArea.style.backgroundColor = '#ccffff';
});

let reportStatus = 0;
const report = document.getElementById('report');
report.addEventListener('click', function (ev) {
  if (reportStatus === 1) {
    reportStatus = 2;
    alert('收到您檢舉 系統將作相應處理...');
    socket.emit('report', { room: room, userId: userId });
  } else if (reportStatus === 0) {
    alert('還沒開始就檢舉人家不好吧...');
  } else if (reportStatus === 2) {
    alert('檢舉過了 那你還按屁啊...');
  }
  ev.preventDefault();
}, false);

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
  alert('收到過半玩家檢舉 請房主注意');
});

socket.on(`closeRoom${room}`, () => {
  sweetAlert('房主已離開房間！', '將回到首頁 請重新選擇房間', 'info', {
    buttons: {
      confirm: {
        text: 'click me',
        visible: true,
        value: 'check'
      }
    }
  }).then(() => {
    return window.location.assign('/');
  });
});

// socket.on(`repeat${room}`, (msg) => {
//   setTimeout(() => {
//     if (msg.id === userId) {
//       sweetAlert('你已是房主了！', '將跳轉回到首頁', 'error', {
//         buttons: {
//           error: {
//             text: 'ok',
//             visible: true,
//             value: 'check'
//           }
//         },
//         timer: 3000
//       }).then(() => {
//         return window.location.assign('/');
//       });
//     }
//   }, 1000);
// });

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
      userinfo.id = 'userinfo' + gamerName;
      playerList.appendChild(userinfo);

      const name = document.createElement('td');
      name.textContent = `NAME: ${gamerName}`;
      userinfo.appendChild(name);

      const score = document.createElement('td');
      score.textContent = `SCORE: ${gamerScore}`;
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
    name.textContent = `NAME: ${hostName}`;
    hostinfo.appendChild(name);
    const photoTd = document.createElement('td');
    hostinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', './images/member.png');
    }
    photo.className = 'hostPhoto';
    photoTd.appendChild(photo);
    const gameMsg = document.createElement('td');
    gameMsg.className = 'msg';
    gameMsg.id = 'msg' + hostName;
    hostinfo.appendChild(gameMsg);
  }
});

const leave = document.getElementById('leave');
leave.addEventListener('click', function () {
  sweetAlert('確定要離開嗎？', `親愛的 ${userName} 玩家`, 'warning', {
    buttons: {
      cancel: {
        text: '取消',
        visible: true,
        value: 'cancel'
      },
      confirm: {
        text: 'Confirm',
        visible: true,
        value: 'check'
      }
    }
  }).then((value) => {
    if (value === 'check') {
      return window.location.assign('/');
    }
  });
});
