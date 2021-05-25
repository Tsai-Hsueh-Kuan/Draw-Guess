
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
  limitTime = 40;
} else if (type === 'idiom') {
  limitTime = 50;
}

// Swal.fire({
//   title: 'Submit your Github username',
//   input: 'text',
//   inputAttributes: {
//     autocapitalize: 'off'
//   },
//   showCancelButton: true,
//   confirmButtonText: 'Look up',
//   showLoaderOnConfirm: true,
//   preConfirm: (login) => {
//     return fetch(`//api.github.com/users/${login}`)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(response.statusText);
//         }
//         return response.json();
//       })
//       .catch(error => {
//         Swal.showValidationMessage(
//           `Request failed: ${error}`
//         );
//       });
//   },
//   allowOutsideClick: () => !Swal.isLoading()
// }).then((result) => {
//   if (result.isConfirmed) {
//     Swal.fire({
//       title: `${result.value.login}'s avatar`,
//       imageUrl: result.value.avatar_url
//     });
//     console.log(result.value);
//   }
// });
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
      message.textContent = '請等待下一局';
    }
  }, interval);
}
socket.on(`answerGet${room}`, (msg) => {
  gameDone = true;
  answerData = msg.answer;
  title.textContent = ('等待開始下局遊戲');
  message.textContent = `時間到 正確答案:${answerData}`;
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
  title.className = 'timePlaying';
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

const answerCheckButton = document.getElementById('answerCheckButton');

const message = document.getElementById('message');
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
        console.log(result);
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
    timer: 3000,
    title: '過半玩家提出檢舉！',
    text: '已通知房主要求改進！',
    icon: 'warning'
  });
});

socket.on(`closeRoom${room}`, () => {
  Swal.fire({
    timer: 3000,
    title: '房主已離開房間！',
    text: '將回到首頁 請重新選擇遊戲',
    icon: 'info'
  }).then(() => {
    return window.location.assign('/');
  });
});
socket.on(`repeat${room}`, (msg) => {
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
        photo.setAttribute('src', './images/member2.png');
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
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', './images/member2.png');
    }
    photo.className = 'hostPhoto';
    photoTd.appendChild(photo);
    const gameMsg = document.createElement('td');
    gameMsg.className = 'msg';
    gameMsg.id = 'msg' + hostName;
    hostinfo.appendChild(gameMsg);
  }
});

const roomElement = document.getElementById('roomMsg');
const roomMsgButton = document.getElementById('roomMsgButton');
roomMsgButton.addEventListener('click', function (ev) {
  const roomMsg = document.getElementById('roomMsg').value;
  roomElement.value = '';
  if (roomMsg.length === 0) {

  } else if (roomMsg.length < 30) {
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

    } else if (roomMsg.length < 30) {
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
