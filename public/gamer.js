const url = new URLSearchParams(window.location.search);
const type = url.get('type');
const room = url.get('room');
const userId = 1;
const socket = io();
const imgs = document.querySelector('#imgs');
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
    if (countIndex < 10 && !gameDone) {
      // console.log(`${10 - countIndex}: 偏差${deviation}ms`);
      title.textContent = (`剩 ${10 - countIndex} 秒鐘！`);
      countIndex++;

      // 下一次倒數計時
      startCountdown(timeout - deviation);
    } else {
      gameStatus = 0;
      message.textContent = '請等待下一局';
    }
  }, interval);
}
socket.on(`answerGet${room}`, (msg) => {
  gameDone = true;
  answerData = msg.answer;
  title.textContent = (`時間到 正確答案:${answerData}`);
});
const title = document.getElementById('title');
socket.on(`answer${room}`, (msg) => {
  const imgs = document.querySelector('#imgs');
  imgs.innerHTML = '';
  canvasNum = 0;
  gameStatus = 1;
  countIndex = 1; // 倒數計時任務執行次數
  timeout = 1000; // 觸發倒數計時任務的時間間隙
  startTime = new Date().getTime();
  startCountdown(timeout);
  title.textContent = ('遊戲開始');
  gameDone = false;
  message.textContent = '請開始作答';
  socket.emit('checkPlayer', { userId: userId, room: room });
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
  const answerCheck = document.getElementById('answerCheck').value;
  if (gameStatus === 1) {
    const time = new Date();
    socket.emit('answerCheck', { room: room, userId: userId, time: time, answerData: answerCheck, canvasNum: canvasNum });

    socket.on(`answerCorrect${userId}`, (msg) => {
      if (msg.check) {
        message.textContent = `正確答案！ ${answerCheck}`;
        gameStatus = 2;
      } else {
        message.textContent = `再亂猜啊！ 才不是${answerCheck}`;
      }
    });
  } else if (gameStatus === 0) {
    message.textContent = 'please wait next game';
  } else if (gameStatus === 2) {
    message.textContent = `您已答對 答案就是${answerCheck} please wait next game`;
  }

  ev.preventDefault();
}, false);
// let save = document.querySelector('#save')
// $('#save').on('click', function(){
//   if(gamer_img.src){
//     this.href = gamer_img.src;
//     save.setAttribute('download', "draw_test.png")
//   } else {
//     alert('阿就沒東西你存個屁')
//   }
// })
socket.on(`answerShow${room}`, (msg) => {
  console.log(msg);
});

window.addEventListener('load', function () {
  socket.emit('checkPlayer', { userId: userId, room: room });
});
