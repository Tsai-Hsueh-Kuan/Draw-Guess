const url = new URLSearchParams(window.location.search);
const type = url.get('type');
let userId;
let userName;
let userPhoto;
let userScore;
let canvasAll;
let i = 0;
let gameStatus = 0;
let gameDone = true;
let answerLimit = true;
let getAnswerId;
let gameId;
let getAnswer;
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
const title = document.getElementById('title');
const message = document.getElementById('message');
const start = document.getElementById('start');
const imgs = document.getElementById('imgs');
start.addEventListener('click', function () {
  if (!gameDone) {
    alert('欣賞完作品 再準備下一題');
    return;
  }
  gameDone = false;
  const typeData = {
    type: type
  };
  // const imgs = document.querySelector('#imgs');
  // imgs.innerHTML = '';
  fetch('/api/1.0/game/single', {
    method: 'post',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
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
      if (data.error) {
        sweetAlert('已無更多題目！', '何不試試連線模式？', 'warning', { button: { text: 'Click Me!' } })
          .then(() => {
            return window.location.assign('/');
          });
      } else {
        canvasAll = data.data.game;
        gameId = canvasAll[0].game_id;
        if (canvasAll[0].canvas_data) {
          getAnswerId = canvasAll[0].question_id;
          imgs.innerHTML = '';
          startTime = new Date().getTime();
          startCountdown(timeout);
        } else {
          alert('不好意思 爛題目 請再按下一題');
        }
        gameStatus = 1;
        title.textContent = ('遊戲開始');
        message.textContent = '請開始作答';
        const recordDiv = document.getElementById('record');
        recordDiv.innerHTML = '';
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
      fetch('/api/1.0/game/done', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
      }).then(function (response) {
        if (response.status === 200) {
          return response.json(); // 內建promise , send type need json
        }
      }).then((data) => {
        getAnswer = data.answer[0].question;
        title.textContent = (`遊戲結束 正確答案是${getAnswer}`);
        message.textContent = '請等待下一局';
        start.textContent = 'NEXT GAME';
        gameDone = true;
      });
    }
  }, interval);
}

const answer = document.getElementById('answer');
answer.addEventListener('submit', function (ev) {
  const answerCheck = document.getElementById('answerCheck').value.toLowerCase();
  if (gameStatus === 1 && answerLimit) {
    answerLimit = false;
    setTimeout(() => {
      answerLimit = true;
    }, 2000);
    const data = {
      answerId: getAnswerId,
      answerCheck: answerCheck
    };
    fetch('/api/1.0/game/answer', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
    }).then(function (response) {
      if (response.status === 200) {
        return response.json(); // 內建promise , send type need json
      }
    }).then((data) => {
      if (data.answer) {
        getAnswer = data.answer[0].question;
        return getAnswer;
      } else {
        return getAnswer;
      }
    }).then((data) => {
      if (answerCheck === getAnswer) {
        message.textContent = `太厲害了！ 您的紀錄是${countIndex}`;
        title.textContent = `正確答案！ ${getAnswer}`;
        gameStatus = 2;
        start.textContent = 'NEXT GAME';
        const historyData = {
          record: countIndex,
          gameId: gameId
        };
        fetch('/api/1.0/game/history', {
          method: 'post',
          body: JSON.stringify(historyData),
          headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
        })
          .then(function (response) {
            if (response.status === 200) {
              return response.json(); // 內建promise , send type need json
            }
          }).then(data => {
            console.log('update record ok');
          })
          .catch(function (err) {
            return err;
          });
      } else {
        message.textContent = `再亂猜啊！ 才不是${answerCheck}`;
      }
    });
  } else if (gameStatus === 0) {
    message.textContent = 'please wait for next game';
  } else if (gameStatus === 2) {
    message.textContent = `您已答對 答案就是${getAnswer} please wait next game`;
    start.textContent = 'NEXT GAME';
  } else if (!answerLimit) {
    message.textContent = '作答時間間隔太短';
  }

  ev.preventDefault();
}, false);

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
