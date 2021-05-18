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
      photo.style.width = '5%';
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

});
socket.emit('homeRank', 'get');
const rank = document.getElementById('rank');
socket.on('getRank', async (msg) => {
  for (const i in msg.data) {
    const rankId = msg.data[i].id;
    const rankName = msg.data[i].name;
    const rankPhoto = msg.data[i].photo;
    const rankScore = msg.data[i].score;
    const userinfo = document.createElement('div');
    userinfo.className = 'userinfo';
    rank.appendChild(userinfo);

    const name = document.createElement('div');
    name.textContent = `NAME: ${rankName}`;
    userinfo.appendChild(name);

    const score = document.createElement('div');
    score.textContent = `SCORE: ${rankScore}`;
    userinfo.appendChild(score);

    const photo = document.createElement('img');
    if (rankPhoto) {
      photo.setAttribute('src', `${rankPhoto}`);
    } else {
      photo.setAttribute('src', './images/member.png');
    }

    photo.style.width = '5%';
    userinfo.appendChild(photo);
  }
});

const testPlay = document.getElementById('testPlay');
testPlay.addEventListener('click', function () {
  return window.location.assign('/gamer.html?room=3');
});
