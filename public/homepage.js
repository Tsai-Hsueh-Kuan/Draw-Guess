let userId;
let userName;
let userPhoto;
let userScore;

const button = document.getElementsByClassName('btn');
const token = localStorage.getItem('token');
if (token) {
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
      }
    }).then(data => {
      userId = data.data.id;
      userName = data.data.name;
      userPhoto = data.data.photo;
      userScore = data.data.score;
      button[0].style = 'display:none;';
      button[1].style = 'display:none;';
      signOutButton.style = 'display:block;';
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
      photo.style.width = '10%';
      info.appendChild(photo);
    })
    .catch(function (err) {
      return err;
    });
}

const signUpForm = document.forms.namedItem('signUpForm');
const signUpButton = document.getElementById('signUpButton');
signUpButton.addEventListener('click', function (ev) {
  const signUpFormData = new FormData(signUpForm);
  fetch('/api/1.0/user/signup', {
    method: 'POST',
    body: signUpFormData
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 429) {
        alert('Too Many Requests');
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 403) {
        return response.json();
      } else if (response.status === 500) {
        return response.json();
      }
    })
    .then(data => {
      if (data.error) {
        sweetAlert('OOPS！', `${data.error}`, 'error', { button: { text: '確認' } });
      } else if (data.data) {
        localStorage.setItem('token', `${data.data.access_token}`);
        sweetAlert('註冊成功！', `歡迎${data.data.user.name}`, 'success', { button: { text: 'Click Me!' } })
          .then((value) => {
            return window.location.assign('/');
          });
      }
    });
  ev.preventDefault();
}, false);

const signInForm = document.forms.namedItem('signInForm');
const signInButton = document.getElementById('signInButton');
signInButton.addEventListener('click', function (ev) {
  const signIpFormData = new FormData(signInForm);
  fetch('/api/1.0/user/signin', {
    method: 'POST',
    body: signIpFormData
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 429) {
        alert('Too Many Requests');
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 403) {
        return response.json();
      } else if (response.status === 500) {
        return response.json();
      }
    })
    .then(data => {
      if (data.error) {
        sweetAlert('OOPS！', `${data.error}`, 'error', { button: { text: '確認' } });
      } else if (data.data) {
        localStorage.setItem('token', `${data.data.access_token}`);
        sweetAlert('登入成功！', `歡迎${data.data.user.name}`, 'success', { button: { text: 'Click Me!' } })
          .then((value) => {
            return window.location.assign('/');
          });
      }
    });
  ev.preventDefault();
}, false);

const signOutButton = document.getElementById('exampleModal2');
signOutButton.style = 'display:none';
signOutButton.addEventListener('click', function () {
  sweetAlert('確定要登出嗎？', `親愛的 ${userName} 玩家`, 'warning', {
    buttons: {
      cancel: {
        text: 'cancel',
        visible: true,
        value: 'cancel'
      },
      confirm: {
        text: 'Sign Out',
        visible: true,
        value: 'check'
      }
    }
  }).then((value) => {
    if (value === 'check') {
      if (token) {
        localStorage.removeItem('token');
      }
      return window.location.assign('/');
    }
  });
});

const socket = io((''), {
  auth: {
    token: 'homePage',
    room: 'homePage',
    type: 'homePage'
  }
});
socket.emit('roomData', 'get');
socket.emit('homeRank', 'get');

const rank = document.getElementById('rank');
socket.on('getRank', async (msg) => {
  rank.innerHTML = '';
  for (const i in msg.data) {
    const rankId = msg.data[i].id;
    const rankName = msg.data[i].name;
    const rankPhoto = msg.data[i].photo;
    const rankScore = msg.data[i].score;
    const userinfo = document.createElement('tr');
    userinfo.className = 'userinfo';
    rank.appendChild(userinfo);

    const scope = document.createElement('th');
    scope.scope = 'row';
    scope.textContent = parseInt(i) + 1;
    userinfo.appendChild(scope);

    const name = document.createElement('td');
    name.className = 'userinfoName';
    name.textContent = `${rankName}`;
    userinfo.appendChild(name);

    const score = document.createElement('td');
    score.className = 'userinfoScore';
    score.textContent = `${rankScore}`;
    userinfo.appendChild(score);

    const photo = document.createElement('img');
    photo.className = 'userinfoPhoto';
    if (rankPhoto) {
      photo.setAttribute('src', `${rankPhoto}`);
    } else {
      photo.setAttribute('src', './images/member.png');
    }
    userinfo.appendChild(photo);
  }
});

const mainPart = document.getElementById('mainPart');

socket.on('mainPageView', async (msg) => {
  const roomId = msg.roomId;
  canvasNum[roomId] = 0;
  let room = document.getElementById(`room${roomId}`);
  if (room) {
    room.innerHTML = '';
  } else {
    room = document.createElement('div');
    room.id = `room${roomId}`;
    room.className = 'room';
    mainPart.appendChild(room);
  }
  const imgs = document.createElement('a');
  imgs.id = `imgs${roomId}`;
  imgs.className = 'imgs';
  imgs.setAttribute('href', `/gamer.html?room=${roomId}`);
  room.appendChild(imgs);

  const tableDiv = document.createElement('div');
  tableDiv.className = 'tableDiv';
  room.appendChild(tableDiv);

  const table = document.createElement('table');
  table.id = `table${roomId}`;
  table.className = 'table';
  tableDiv.appendChild(table);

  const thead = document.createElement('thead');
  thead.id = `thead${roomId}`;
  thead.className = 'thead';
  table.appendChild(thead);

  const tr = document.createElement('tr');
  thead.appendChild(tr);

  const th = document.createElement('th');
  th.scope = 'col';
  th.textContent = 'NAME';
  tr.appendChild(th);

  const th2 = document.createElement('th');
  th2.scope = 'col';
  th2.textContent = 'PHOTO';
  tr.appendChild(th2);

  const tbodyHost = document.createElement('tbody');
  tbodyHost.id = `tbodyHost${roomId}`;
  tbodyHost.className = 'tbodyHost';
  table.appendChild(tbodyHost);

  const tbodyPlayerList = document.createElement('tbody');
  tbodyPlayerList.id = `tbodyPlayerList${roomId}`;
  tbodyPlayerList.className = 'tbodyPlayerList';
  table.appendChild(tbodyPlayerList);

  tbodyPlayerList.innerHTML = '';
  if (msg.roomUserData && msg.roomUserData[0]) {
    for (const i in msg.roomUserData) {
      const gamerName = msg.roomUserData[i][0].name;
      const gamerPhoto = msg.roomUserData[i][0].photo;
      const gamerScore = msg.roomUserData[i][0].score;
      const userinfo = document.createElement('tr');
      userinfo.className = 'userinfo';
      tbodyPlayerList.appendChild(userinfo);
      const name = document.createElement('td');
      name.textContent = `NAME: ${gamerName}`;
      userinfo.appendChild(name);
      const photo = document.createElement('img');
      photo.className = 'gamerPhoto';
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', './images/member.png');
      }

      userinfo.appendChild(photo);
    }
  }
  tbodyHost.innerHTML = '';
  if (msg.hostDetail) {
    const hostName = msg.hostDetail[0].name;
    const hostPhoto = msg.hostDetail[0].photo;
    const hostinfo = document.createElement('tr');
    hostinfo.className = 'hostinfo';
    tbodyHost.appendChild(hostinfo);
    const name = document.createElement('td');
    name.textContent = `HOST: ${hostName}`;
    hostinfo.appendChild(name);
    const photo = document.createElement('img');
    photo.className = 'hostPhoto';
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', './images/member.png');
    }

    hostinfo.appendChild(photo);
  }
  // { roomId: inRoom, hostId: hostId[inRoom], hostDetail: hostDetail[inRoom], roomType: intype }
});

socket.on('mainPageViewClose', async (msg) => {
  const roomId = msg.room;
  const room = document.getElementById(`room${roomId}`);
  room.remove();
});

const canvasNum = [];
socket.on('mainPageCanvasClear', async (msg) => {
  const roomId = msg.room;
  canvasNum[roomId] = 0;
  const imgs = document.getElementById(`imgs${roomId}`);
  imgs.innerHTML = '';
});

socket.on('mainPageConvasData', (msg) => {
  const roomId = msg.room;
  const imgs = document.getElementById(`imgs${roomId}`);
  const img = document.createElement('img');
  img.src = msg.url;
  img.className = `img img${roomId}`;
  img.id = 'img' + roomId + 'step' + canvasNum[roomId];
  canvasNum[roomId]++;
  imgs.appendChild(img);
});

socket.on('mainPageUndo', (msg) => {
  const roomId = msg.room;
  if (msg.data) {
    const myobj = document.getElementById(`img${roomId}step${canvasNum[roomId] - 1}`);
    myobj.remove();
    canvasNum[roomId]--;
  }
});
let roomList;
socket.on('roomList', (msg) => {
  roomList = msg.roomList;
});

socket.on('canvasUpdate', (msg) => {
  const roomId = msg.room;
  const canvasAll = msg.canvas;
  const imgs = document.getElementById(`imgs${roomId}`);
  if (msg.game) {
    for (const i in canvasAll) {
      if (canvasAll[i].canvas_data !== '0') {
        const img = document.createElement('img');
        img.src = canvasAll[i].canvas_data;
        img.className = `img img${roomId}`;
        img.id = 'img' + roomId + 'step' + i;
        canvasNum[roomId] = canvasAll[i].canvas_num - 1;
        imgs.appendChild(img);
      } else if (canvasAll[i].canvas_undo !== '0') {
        const img = document.getElementsByClassName(`img${roomId}`);
        const finalNum = img.length;
        img[finalNum - 1].remove();
      }
    }
  }
  // else {
  //   const img = document.createElement('img');
  //   img.src = '/images/member.png';
  //   img.className = `img img${roomId}`;
  //   imgs.appendChild(img);
  // }
});

const singlePlay = document.getElementById('singlePlay');
singlePlay.addEventListener('click', function () {
  const type = 'english';
  return window.location.assign(`/single.html?type=${type}`);
});

const createGame = document.getElementById('createGame');
createGame.addEventListener('click', function () {
  const type = 'english';
  for (let j = 0; j < 10000; j++) {
    const check = roomList.indexOf(`${j}`);
    if (check === -1) {
      return window.location.assign(`/draw.html?room=${j}&type=${type}`);
    }
  }
});
