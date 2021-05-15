const url = new URLSearchParams(window.location.search);
const type = url.get('type');
const room = url.get('room');
let userId;
let userName;
let userPhoto;
let userScore;
let canvasAll;
let i = 0;
const answerLimit = true;
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

const start = document.getElementById('start');
const imgs = document.getElementById('imgs');
start.addEventListener('click', function (ev) {
  fetch('/api/1.0/game/single', {
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
      startTime = new Date().getTime();

      startCountdown(timeout);
      if (data.error) {
        sweetAlert('已無更多題目！', '何不試試連線模式？', 'warning', { button: { text: 'Click Me!' } })
          .then(() => {
            return window.location.assign('/');
          });
      } else {
        canvasAll = data.data.game;
        const recordDiv = document.getElementById('record');
        for (const i in data.data.history) {
          const recordName = data.data.history[i].name;
          const recordPhoto = data.data.history[i].photo;
          const recordRecord = data.data.history[i].record;
          const recordInfo = document.createElement('div');
          recordInfo.className = 'recordInfo';
          recordDiv.appendChild(recordInfo);

          const name = document.createElement('div');
          name.textContent = `NAME: ${recordName}`;
          recordInfo.appendChild(name);

          const record = document.createElement('div');
          record.textContent = `RECORD: ${recordRecord}`;
          recordInfo.appendChild(record);

          const photo = document.createElement('img');
          if (recordPhoto) {
            photo.setAttribute('src', `${recordPhoto}`);
          } else {
            photo.setAttribute('src', './images/member.png');
          }
          photo.style.width = '5%';
          recordInfo.appendChild(photo);
        }
      }
    })
    .catch(function (err) {
      return err;
    });
});
const timeout = 2000; // 觸發倒數計時任務的時間間隙
let countIndex = 1; // 倒數計時任務執行次數
const limitTime = 20;
let startTime = new Date().getTime();
function startCountdown (interval) {
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    const deviation = endTime - (startTime + countIndex * timeout);
    if (countIndex < limitTime && canvasAll[i]) {
      const img = document.createElement('img');
      img.src = canvasAll[i].canvas_data;
      img.className = 'img';
      img.id = 'img' + i;
      imgs.appendChild(img);
      // 下一次倒數計時
      i++;
      countIndex++;
      startCountdown(timeout - deviation);
    } else {
      i = 0;
      countIndex = 1;
      console.log('no');
    }
  }, interval);
}
