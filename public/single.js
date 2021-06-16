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

const socket = io((''), {
  auth: {
    room: 'singlePlayer',
    token: token,
    type: 'singlePlayer'
  },
  reconnect: true
});

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
const start = document.getElementById('start');
const imgs = document.getElementById('imgs');
let getSingleNewGameDelay = 1;
function getSingleNewGame (e) {
  document.getElementById('answerDiv').innerHTML = '';
  if (getSingleNewGameDelay) {
    getSingleNewGameDelay = 0;
    setTimeout(() => {
      getSingleNewGameDelay = 1;
    }, 300);
    if (!gameDone) {
      Swal.fire({
        timer: 1000,
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
          return response.json();
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

            gameStatus = 1;
            title.textContent = ('遊戲開始');
            title.className = 'timeSinglePlaying';
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
          } else {
            gameDone = true;
            getSingleNewGame();
          }
        }
      })
      .catch(function (err) {
        return err;
      });
  }
  e.preventDefault(); // 停止預設功能
}

start.addEventListener('click', getSingleNewGame, true);

let timeout = 2000; // 觸發倒數計時任務的時間間隙
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
      timeout = 2000;
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
          return response.json();
        }
      }).then((data) => {
        gameDone = true;
        getAnswer = data.answer[0].question;

        setTimeout(() => {
          title.textContent = ('按START開始遊戲');
          title.className = 'time';
        }, 2000);
        document.getElementById('answerDiv').innerHTML = `正確答案 : ${getAnswer}`;
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
    }, 1000);
    const data = {
      answerId: getAnswerId,
      answerCheck: answerCheck
    };
    fetch('/api/1.0/game/singleAnswerCheck', {
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
        audio.volume = 0.7;
        title.textContent = '';
        Toast.fire({
          icon: 'success',
          text: `太厲害了！ 您的紀錄是${countIndex}`,
          width: '500px',
          padding: '30px',
          background: '#FFFFFF'
        });
        gameStatus = 2;
        timeout = 1;

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
            const recordDiv = document.getElementById('record');
            recordDiv.innerHTML = '';
            for (const i in data.data.history) {
              const recordName = data.data.history[i].name;

              const recordPhoto = data.data.history[i].photo;
              const recordRecord = data.data.history[i].record;
              const recordInfo = document.createElement('tr');

              if (recordName === userName) {
                recordInfo.className = 'recordInfo recordInfoNew';
              } else {
                recordInfo.className = 'recordInfo';
              }

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
      } else {
        const audio = document.getElementById('wrongMp3');
        audio.play();
        audio.volume = 0.7;
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
      }, 1000);
      const data = {
        answerId: getAnswerId,
        answerCheck: answerCheck
      };
      fetch('/api/1.0/game/singleAnswerCheck', {
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
          gameStatus = 2;
          timeout = 1;
          const audio = document.getElementById('mp3');
          audio.play();
          audio.volume = 0.7;
          title.textContent = '';
          Toast.fire({
            icon: 'success',
            text: `太厲害了！ 您的紀錄是${countIndex}`,
            width: '400px',
            padding: '30px',
            background: '#ffffff'
          });

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
                if (recordName === userName) {
                  record.innerHTML = `${recordRecord} &nbsp &nbsp 新紀錄!`;
                  record.style.color = 'red';
                } else {
                  record.textContent = `${recordRecord}`;
                }

                recordInfo.appendChild(record);
              }
            })
            .catch(function (err) {
              return err;
            });
        } else {
          // message.textContent = `再亂猜啊！ 才不是${answerCheck}`;
          const audio = document.getElementById('wrongMp3');
          audio.play();
          audio.volume = 0.7;
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

socket.emit('onlineUser', 'get');
socket.on('onlineUserShow', async (msg) => {
  const onlineUser = msg.userAll.filter(function (element, index, arr) {
    return arr.indexOf(element) === index;
  });
  const onlineCount = onlineUser.length;
  const onlineUserCount = document.getElementById('onlineUserCount');
  onlineUserCount.textContent = '在線人數：' + onlineCount + '人';
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

const Toast2 = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timer: 1000
});

const Toast = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timer: 2000
});

const imgsAll = ['chipmunk', 'cow', 'dog', 'elephant', 'hippo', 'rabbit'];
const randomNumber = Math.floor(Math.random() * 6);
Swal.fire({
  title: '歡迎加入遊戲',
  imageUrl: `https://d3cek75nx38k91.cloudfront.net/draw/${imgsAll[randomNumber]}.jpeg`,
  imageWidth: 200,
  imageHeight: 200,
  imageAlt: 'image',
  html: '快速作答！ ' +
  '</br>' +
   '在記錄榜留下自己好成績喔～'
});
