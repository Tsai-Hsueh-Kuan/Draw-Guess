const url = new URLSearchParams(window.location.search);
const type = url.get('type');
const game = url.get('game');
let userId;
let userName;
let userPhoto;
let userScore;
let canvasAll;
let i = 0;
let gameStatus = 0;
let gameDone = true;
const answerLimit = true;
let getAnswerId;
let gameId;
let getAnswer;
const token = localStorage.getItem('token');

fetch('/api/1.0/user/profileAdmin', {
  method: 'GET',
  headers: { authorization: `Bearer ${token}` }
}).then(function (response) {
  if (response.status === 200) {
    return response.json();
  } else if (response.status === 403) {
    localStorage.removeItem('token');
    Swal.fire('not admin！', '請重新登入', 'error')
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

  const name = document.createElement('div');
  name.textContent = `NAME: ${userName}`;
  name.className = 'userName hover';
  info.appendChild(name);
  const photo = document.getElementById('userPhoto');
  if (userPhoto) {
    photo.setAttribute('src', `${userPhoto}`);
  }
  info.appendChild(photo);
}).catch(function (err) {
  return err;
});

const start = document.getElementById('start');
const checkGame = document.getElementById('checkOk');
checkGame.addEventListener('click', function () {
  const gameInput = document.getElementById('gameInput').value;
  const typeData = {
    gameId: gameInput,
    status: 0
  };
  fetch('/api/1.0/game/gameCheck', {
    method: 'post',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json(); // 內建promise , send type need json
      } else if (response.status === 403) {
        alert('not admin');
        // 內建promise , send type need json
      }
    }).then(data => {
      document.getElementById('gameInput').value = '';
      console.log(data);
    });
});

const checkGame1 = document.getElementById('checkNot');
checkGame1.addEventListener('click', function () {
  const gameInput = document.getElementById('gameInput').value;
  const typeData = {
    gameId: gameInput,
    status: 1
  };
  fetch('/api/1.0/game/gameCheck', {
    method: 'post',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json(); // 內建promise , send type need json
      } else if (response.status === 403) {
        alert('not admin');
        // 內建promise , send type need json
      }
    }).then(data => {
      document.getElementById('gameInput').value = '';
      console.log(data);
    });
});

const imgs = document.getElementById('imgs');
start.addEventListener('click', function () {
  if (!gameDone) {
    Swal.fire({
      timer: 3000,
      icon: 'warning',
      title: '這題還沒答對呢！',
      showConfirmButton: false
    });
    return;
  }
  gameDone = false;
  const gameInput = document.getElementById('gameInput').value;
  const typeData = {
    gameId: gameInput
  };
  fetch('/api/1.0/game/singleTest', {
    method: 'post',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json(); // 內建promise , send type need json
      }
    }).then(data => {
      if (!data.data.game[0]) {
        Swal.fire({
          timer: 5000,
          title: '沒這個題目！',
          icon: 'warning'
        });
        gameDone = true;
      }
      if (data.error) {
        Swal.fire({
          timer: 5000,
          title: '已無更多題目！',
          text: '何不試試連線模式？',
          icon: 'warning'
        }).then(() => {
          return window.location.assign('/');
        });
      } else {
        canvasAll = data.data.game;
        gameId = canvasAll[0].game_id;
        if (canvasAll[0].canvas_data) {
          getAnswerId = canvasAll[0].question_id;
          imgs.innerHTML = '';
          startTime = new Date().getTime();
          startCountdown(50);
        } else {
          gameDone = true;
          return;
        }
        gameStatus = 1;
        const recordDiv = document.getElementById('record');
        recordDiv.innerHTML = '';
        for (const i in data.data.history) {
          const recordName = data.data.history[i].name;
          const recordPhoto = data.data.history[i].photo;
          const recordRecord = data.data.history[i].record;
          const recordInfo = document.createElement('tr');
          recordInfo.className = 'recordInfo';
          recordDiv.appendChild(recordInfo);

          const photo = document.createElement('img');
          if (recordPhoto) {
            photo.setAttribute('src', `${recordPhoto}`);
          } else {
            photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
          }
          photo.className = 'singleGamerPhoto';
          recordInfo.appendChild(photo);

          const name = document.createElement('td');
          name.textContent = `${recordName}`;
          recordInfo.appendChild(name);

          const record = document.createElement('td');
          record.textContent = `${recordRecord}`;
          recordInfo.appendChild(record);
        }
      }
    })
    .catch(function (err) {
      return err;
    });
});
const get = document.getElementById('get');
get.addEventListener('click', function () {
  fetch('/api/1.0/game/singleGameNeedCheck', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json(); // 內建promise , send type need json
      }
    }).then(data => {
      if (!data.data.game[0]) {
        Swal.fire({
          timer: 5000,
          title: '沒這個題目！',
          icon: 'warning'
        });
        gameDone = true;
      }
      if (data.error) {
        Swal.fire({
          timer: 5000,
          title: '已無更多題目！',
          text: '何不試試連線模式？',
          icon: 'warning'
        }).then(() => {
          return window.location.assign('/');
        });
      } else {
        canvasAll = data.data.game;
        console.log(data.data);
        gameId = canvasAll[0].game_id;
        document.getElementById('gameInput').value = gameId;
      }
    })
    .catch(function (err) {
      return err;
    });
});

const timeout = 1; // 觸發倒數計時任務的時間間隙
let countIndex = 1; // 倒數計時任務執行次數
const limitTime = 60;
let startTime;
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if ((countIndex < limitTime) && canvasAll[i]) {
      if (canvasAll[i].canvas_data !== '0') {
        const img = document.createElement('img');
        img.src = canvasAll[i].canvas_data;
        img.className = 'img';
        img.id = 'img' + i;
        imgs.appendChild(img);
      } else if (canvasAll[i].canvas_undo !== '0') {
        const img = document.getElementsByClassName('img');
        const finalNum = img.length;
        img[finalNum - 1].remove();
      }
      // 下一次倒數計時
      i++;
      countIndex++;
      startCountdown(timeout - deviation);
    } else {
      gameStatus = 0;
      i = 0;
      countIndex = 1;
      const data = {
        answerId: getAnswerId
      };
      fetch('/api/1.0/game/singleAnswer', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
      }).then(function (response) {
        if (response.status === 200) {
          return response.json(); // 內建promise , send type need json
        }
      }).then((data) => {
        getAnswer = data.answer[0].question;
        const roomAnsDiv = document.getElementById('roomAnsDiv');
        roomAnsDiv.textContent = getAnswer;

        gameDone = true;
      });
    }
  }, interval);
}

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

// const Toast2 = Swal.mixin({
//   toast: true,
//   showConfirmButton: false,
//   timer: 5000
// });

// const Toast = Swal.mixin({
//   toast: true,
//   showConfirmButton: false,
//   timer: 8000,
//   timerProgressBar: true,
//   didOpen: (toast) => {
//     toast.addEventListener('mouseenter', Swal.stopTimer);
//     toast.addEventListener('mouseleave', Swal.resumeTimer);
//   }
// });
