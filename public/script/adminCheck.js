let userName;
let userPhoto;
let canvasAll;
let i = 0;
let getAnswerId;
let gameId;
let getAnswer;
const token = localStorage.getItem('token');

fetch('/api/1.0/user/profileAdmin', {
  method: 'GET',
  headers: { authorization: `Bearer ${token}` }
}).then(async function (response) {
  if (response.status === 200) {
    return response.json();
  } else if (response.status === 403) {
    const data = await response.json();
    localStorage.removeItem('token');
    Swal.fire(data.error, '請重新登入', 'error')
      .then(() => {
        return window.location.assign('/');
      });
  } else if (response.status === 401) {
    localStorage.removeItem('token');
    Swal.fire('尚未登入！', '請先登入', 'error')
      .then(() => {
        return window.location.assign('/');
      });
  } else if (response.status === 429) {
    Swal.fire({
      timer: 5000,
      title: 'Too Many Requests',
      icon: 'error'
    });
  }
}).then(data => {
  userName = data.data.name;
  userPhoto = data.data.photo;
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

const checkGame = document.getElementById('checkOk');
checkGame.addEventListener('click', function () {
  const gameInput = document.getElementById('gameInput').value;
  const typeData = {
    gameId: gameInput,
    status: 0
  };
  fetch('/api/1.0/admin/gameStatus', {
    method: 'PATCH',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 429) {
        Swal.fire({
          timer: 5000,
          title: 'Too Many Requests',
          icon: 'error'
        });
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
  fetch('/api/1.0/admin/gameStatus', {
    method: 'PATCH',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 429) {
        Swal.fire({
          timer: 5000,
          title: 'Too Many Requests',
          icon: 'error'
        });
      }
    }).then(data => {
      document.getElementById('gameInput').value = '';
      console.log(data);
    });
});

const imgs = document.getElementById('imgs');
const start = document.getElementById('start');
start.addEventListener('click', function () {
  const gameInput = document.getElementById('gameInput').value;
  const typeData = {
    gameId: gameInput
  };
  fetch('/api/1.0/admin/gameInfo', {
    method: 'post',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 429) {
        Swal.fire({
          timer: 5000,
          title: 'Too Many Requests',
          icon: 'error'
        });
      }
    }).then(data => {
      if (!data.data.game[0]) {
        Swal.fire({
          timer: 5000,
          title: '沒這個題目！',
          icon: 'warning'
        });
        return;
      }
      canvasAll = data.data.game;
      gameId = canvasAll[0].game_id;
      if (canvasAll[0].canvas_data) {
        getAnswerId = canvasAll[0].question_id;
        imgs.innerHTML = '';
        startTime = new Date().getTime();
        startCountdown(1);
      } else {
        return;
      }
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
    })
    .catch(function (err) {
      return err;
    });
});

const get = document.getElementById('get');
get.addEventListener('click', function () {
  fetch('/api/1.0/admin/pendingGame', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 429) {
        Swal.fire({
          timer: 5000,
          title: 'Too Many Requests',
          icon: 'error'
        });
      }
    }).then(data => {
      if (!data.data.game[0]) {
        Swal.fire({
          timer: 5000,
          title: '沒題目需要確認！',
          icon: 'warning'
        });
        return;
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

const timeout = 1; // countdown task execution times
let countIndex = 1; // time gap
const limitTime = 60;
let startTime;
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
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
      i++;
      countIndex++;
      startCountdown(timeout - deviation);
    } else {
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
          return response.json();
        } else if (response.status === 429) {
          Swal.fire({
            timer: 5000,
            title: 'Too Many Requests',
            icon: 'error'
          });
        }
      }).then((data) => {
        getAnswer = data.answer[0].question;
        const roomAnsDiv = document.getElementById('roomAnsDiv');
        roomAnsDiv.textContent = getAnswer;
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
