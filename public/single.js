const url = new URLSearchParams(window.location.search);
const type = url.get('type');
let userName;
let userPhoto;
let canvasAll;
let i = 0;
let gameStatus = 0;
let gameDone = true;
let answerLimit = true;
let getAnswerId;
let gameId;
let getAnswer;
const token = localStorage.getItem('token');

const typeShow = document.getElementById('question');
if (type === 'english') {
  typeShow.textContent = '動物 單字';
} else if (type === 'idiom') {
  typeShow.textContent = '四字 成語';
}

fetch('/api/1.0/user/profile', {
  method: 'GET',
  headers: { authorization: `Bearer ${token}` }
}).then(function (response) {
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

const title = document.getElementById('title');
// const message = document.getElementById('message');
const start = document.getElementById('start');
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
  const typeData = {
    type: type
  };

  fetch('/api/1.0/game/single', {
    method: 'post',
    body: JSON.stringify(typeData),
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json(); // 內建promise , send type need json
      }
    }).then(data => {
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
          alert('不好意思 爛題目 請再按下一題 看到這句各位幫我測試的跟我說喔．．．．hsuehkuan感謝你');
        }
        gameStatus = 1;
        title.textContent = ('遊戲開始');
        title.className = 'timeSinglePlaying';
        // message.textContent = '請開始作答';
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
            photo.setAttribute('src', './images/member2.png');
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
const timeout = 2000; // 觸發倒數計時任務的時間間隙
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
        title.textContent = ('請按START GAME開始遊戲');
        title.className = 'timeSingle';
        // message.textContent = '請等待下一局';
        Toast.fire({
          // icon: 'info',
          title: '遊戲結束',
          text: `正確答案:${getAnswer}`,
          width: '400px',
          padding: '30px',
          background: '#ffffff'
        });
        gameDone = true;
      });
    }
  }, interval);
}
const answerCheckButton = document.getElementById('answerCheckButton');

answerCheckButton.addEventListener('click', function (ev) {
  const answerCheck = document.getElementById('answerCheck').value.toLowerCase();
  const answerElement = document.getElementById('answerCheck');
  answerElement.value = '';
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
        const audio = document.getElementById('mp3');
        audio.play();
        // message.textContent = `太厲害了！ 您的紀錄是${countIndex}`;
        title.textContent = `正確答案！ ${getAnswer}`;
        Toast.fire({
          icon: 'success',
          title: '太厲害了！',
          text: `您的紀錄是${countIndex}`,
          width: '400px',
          padding: '30px',
          background: '#FFFFFF'
        });
        gameStatus = 2;
        i = 99999;

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
        // message.textContent = `再亂猜啊！ 才不是${answerCheck}`;
        const audio = document.getElementById('wrongMp3');
        audio.play();
        Toast2.fire({
          icon: 'error',
          title: '猜錯了！',
          width: '400px',
          padding: '30px',
          background: '#ffffff'
        });
      }
    });
  } else if (gameStatus === 0) {
    // message.textContent = 'please wait for next game';
    Toast2.fire({
      icon: 'warning',
      title: 'please wait for next game',
      width: '400px',
      padding: '30px',
      background: '#ffffff'
    });
  } else if (gameStatus === 2) {
    // message.textContent = `您已答對 答案就是${getAnswer} please wait next game`;
    Toast2.fire({
      icon: 'warning',
      title: '已經答對囉',
      width: '400px',
      padding: '30px',
      background: '#ffffff'
    });
  } else if (!answerLimit) {
    // message.textContent = '作答時間間隔太短';
    Toast2.fire({
      icon: 'warning',
      title: '作答時間間隔太短',
      width: '400px',
      padding: '30px',
      background: '#ffffff'
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
          const audio = document.getElementById('mp3');
          audio.play();
          // message.textContent = `太厲害了！ 您的紀錄是${countIndex}`;
          title.textContent = `正確答案！ ${getAnswer}`;
          Toast.fire({
            icon: 'success',
            title: '太厲害了！',
            text: `您的紀錄是${countIndex}`,
            width: '400px',
            padding: '30px',
            background: '#ffffff'
          });
          gameStatus = 2;
          i = 99999;

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
          // message.textContent = `再亂猜啊！ 才不是${answerCheck}`;
          const audio = document.getElementById('wrongMp3');
          audio.play();
          Toast2.fire({
            icon: 'error',
            title: '猜錯了！',
            width: '400px',
            padding: '30px',
            background: '#ffffff'
          });
        }
      });
    } else if (gameStatus === 0) {
      // message.textContent = 'please wait for next game';
      Toast2.fire({
        icon: 'warning',
        title: 'please wait for next game',
        width: '400px',
        padding: '30px',
        background: '#ffffff'
      });
    } else if (gameStatus === 2) {
      Toast2.fire({
        icon: 'warning',
        title: '已經答對囉',
        width: '400px',
        padding: '30px',
        background: '#ffffff'
      });
    } else if (!answerLimit) {
      // message.textContent = '作答時間間隔太短';
      Toast2.fire({
        icon: 'warning',
        title: '作答時間間隔太短',
        width: '400px',
        padding: '30px',
        background: '#ffffff'
      });
    }
  }
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

const Toast2 = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timer: 5000
});

const Toast = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timer: 8000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const imgsAll = ['chipmunk', 'cow', 'dog', 'elephant', 'hippo', 'rabbit'];
const randomNumber = Math.floor(Math.random() * 6);
Swal.fire({
  title: '歡迎加入遊戲',
  imageUrl: `./images/${imgsAll[randomNumber]}.jpeg`,
  imageWidth: 200,
  imageHeight: 200,
  imageAlt: 'image',
  html: '快速作答！ ' +
  '</br>' +
   '在記錄榜留下自己好成績喔～'
});
