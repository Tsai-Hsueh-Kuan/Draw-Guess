// socket io
const socket = io();
const canvasDiv = document.querySelector('#add_canvas');
const canvas = document.querySelector('.draw');
const ctx = [];
ctx[0] = canvas.getContext('2d');
let canvasNum = 0;
// 設置畫筆的粗度以及形狀
ctx[canvasNum].lineJoin = 'round';
ctx[canvasNum].lineCap = 'round';
ctx[canvasNum].lineWidth = 5;
// 設置flag以及起始座標
let isDrawing = false;
let lastX = 0;
let lastY = 0;
// 色彩設置
let hue = 0;

const colorChoose = document.querySelector('#favcolor');
colorChoose.addEventListener('change', function () {
  RB = 0;
  eraserOn = 0;
  ctx[canvasNum].strokeStyle = colorChoose.value;
  colorView.style.backgroundColor = colorChoose.value;
  // 取出input中的數值
});

$('.color input').change(function () {
  r = $('#red').val();
  g = $('#green').val();
  b = $('#blue').val();
  RB = 0;
  eraserOn = 0;
  changeColor(r, g, b);
  // 取出input中的數值
});
const colorView = document.querySelector('#color_view');
function changeColor (r, g, b) {
  colors = {
    red: r,
    green: g,
    blue: b
  };
  $.each(colors, function (_color, _value) {
    $('#v' + _color).val(_value);
  });
  ctx[canvasNum].strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
  // 將顏色的值寫到ctx.strokeStyle即可
  RB = 0;
  eraserOn = 0;
  colorView.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
};

const slider = document.getElementById('myRange');
slider.oninput = function () {
  ctx[canvasNum].lineWidth = this.value;
};

let RB = 1;
const rbColor = document.querySelector('#RB_color');
rbColor.addEventListener('click', function () {
  if (RB) {
    eraserOn = false;
    RB = 0;
  } else {
    eraserOn = false;
    RB = 1;
  }
});

const eraser = document.querySelector('#eraser');
let eraserOn = false;
eraser.addEventListener('click', function () {
  eraserOn = true;
  RB = 0;
});

function draw (e) {
  if (!isDrawing) return;
  if (RB) {
    ctx[canvasNum].strokeStyle = `hsl(${hue},100%,50%)`;
    colorView.style.backgroundColor = `hsl(${hue},100%,50%)`;
  }
  if (eraserOn) {
    ctx[canvasNum].strokeStyle = 'white';
    colorView.style.backgroundColor = 'white';
  }

  ctx[canvasNum].lineJoin = 'round';
  ctx[canvasNum].lineCap = 'round';

  ctx[canvasNum].beginPath();
  ctx[canvasNum].moveTo(lastX, lastY);
  ctx[canvasNum].lineTo(e.offsetX, e.offsetY);
  ctx[canvasNum].stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
  // console.log('e.offsetX: ' + e.offsetX);
  // console.log('move x: ' + lastX + ' y: ' + lastY + ' color : ' + `${ctx[canvasNum].strokeStyle}` + ' lineWidth : ' + `${ctx[canvasNum].lineWidth}`);

  hue <= 360 ? hue++ : hue = 0;
}

canvasDiv.addEventListener('mouseup', () => {
  canvasNum++;
  const canvas = document.createElement('canvas');
  canvas.className = 'draw';
  canvas.id = 'draw' + canvasNum;
  canvas.width = '800';
  canvas.height = '500';
  canvas.style.zIndex = canvasNum;
  ctx[canvasNum] = canvas.getContext('2d');
  // ctx[canvas_num].lineJoin = 'round'
  // ctx[canvas_num].lineCap = 'round'
  ctx[canvasNum].lineWidth = ctx[canvasNum - 1].lineWidth;
  ctx[canvasNum].strokeStyle = ctx[canvasNum - 1].strokeStyle;
  canvasDiv.appendChild(canvas);
});

canvasDiv.addEventListener('mouseout', () => {
  if (isDrawing) {
    canvasNum++;
    const canvas = document.createElement('canvas');
    canvas.className = 'draw';
    canvas.id = 'draw' + canvasNum;
    canvas.width = '800';
    canvas.height = '500';
    canvas.style.zIndex = canvasNum;
    ctx[canvasNum] = canvas.getContext('2d');
    // ctx[canvas_num].lineJoin = 'round'
    // ctx[canvas_num].lineCap = 'round'
    ctx[canvasNum].lineWidth = ctx[canvasNum - 1].lineWidth;
    ctx[canvasNum].strokeStyle = ctx[canvasNum - 1].strokeStyle;
    canvasDiv.appendChild(canvas);
  }
});

canvasDiv.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];

  if (RB) {
    ctx[canvasNum].strokeStyle = `hsl(${hue},100%,50%)`;
    colorView.style.backgroundColor = `hsl(${hue},100%,50%)`;
  }
  if (eraserOn) {
    ctx[canvasNum].strokeStyle = 'white';
    colorView.style.backgroundColor = 'white';
  }

  ctx[canvasNum].lineJoin = 'round';
  ctx[canvasNum].lineCap = 'round';
  ctx[canvasNum].beginPath();
  ctx[canvasNum].moveTo(lastX, lastY);
  ctx[canvasNum].lineTo(e.offsetX, e.offsetY);
  ctx[canvasNum].stroke();

  // [lastX, lastY] = [e.offsetX, e.offsetY];
  // console.log('down x: ' + lastX + ' y: ' + lastY + ' color : ' + `${ctx[canvasNum].strokeStyle}` + ' lineWidth : ' + `${ctx[canvasNum].lineWidth}`);
  hue <= 360 ? hue++ : hue = 0;
});

canvasDiv.addEventListener('mousemove', draw);
canvasDiv.addEventListener('mousedown', () => isDrawing = true);
// canvasDiv.addEventListener('mouseup', () => isDrawing = false);
// canvas_div.addEventListener('mouseout', () => isDrawing = false);

// $('#save').on('click', function () {
//   const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
//   const _url = cavasNow.toDataURL();
//   this.href = _url;
//   save.setAttribute('download', 'draw_test.png');
// });

canvasDiv.addEventListener('mouseout', function () {
  if (isDrawing) {
    const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
    const _url = cavasNow.toDataURL();
    // 利用toDataURL() 把canvas轉成data:image
    // this.href = _url;
    // 再把href載入上面的Data:image
    socket.emit('abc', { number: canvasNum - 1, url: _url });
  };
  isDrawing = false;
});
canvasDiv.addEventListener('mouseup', function () {
  if (isDrawing) {
    const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
    const _url = cavasNow.toDataURL();
    // 利用toDataURL() 把canvas轉成data:image
    // this.href = _url;
    // 再把href載入上面的Data:image
    socket.emit('abc', { number: canvasNum - 1, url: _url });
  }
  isDrawing = false;
});

const questionSql = '123';
const question = document.querySelector('#question');
question.textContent = `question: ${questionSql}`;

const undo = document.querySelector('#undo');
undo.addEventListener('click', function () {
  if (canvasNum > 0) {
    const myobjNow = document.getElementById(`draw${canvasNum}`);
    myobjNow.remove();
    const myobj = document.getElementById(`draw${canvasNum - 1}`);
    const c = myobj.getContext('2d');
    c.clearRect(0, 0, 800, 500);
    canvasNum--;
    socket.emit('undo', 1);
  }
});

const keyZ = function (e) {
  if (e.key === 'z') {
    if (canvasNum > 0) {
      const myobjNow = document.getElementById(`draw${canvasNum}`);
      myobjNow.remove();
      const myobj = document.getElementById(`draw${canvasNum - 1}`);
      const c = myobj.getContext('2d');
      c.clearRect(0, 0, 800, 500);
      canvasNum--;
      socket.emit('undo', 1);
    }
  }
};
document.addEventListener('keydown', function (e) { // 對整個頁面監聽
  console.log(e.key);
  if (e.key === 'Meta') {
    document.addEventListener('keydown', keyZ);
  }
});
document.addEventListener('keyup', function (e) { // 對整個頁面監聽
  if (e.key === 'Meta') {
    document.removeEventListener('keydown', keyZ);
  }
});
const redo = document.querySelector('#redo');

redo.addEventListener('click', function () {
  socket.emit('redo', canvasNum);
});

socket.on('redo url', async (msg) => {
  const myobjNow = document.getElementById(`draw${canvasNum}`);
  const contextNow = myobjNow.getContext('2d');
  const img = new Image();
  img.src = msg;
  img.onload = function () {
    contextNow.drawImage(img, 0, 0);
    contextNow.stroke();
    canvasNum++;
    const canvas = document.createElement('canvas');
    canvas.className = 'draw';
    canvas.id = 'draw' + canvasNum;
    canvas.width = '800';
    canvas.height = '500';
    canvas.style.zIndex = canvasNum;
    ctx[canvasNum] = canvas.getContext('2d');
    ctx[canvasNum].lineWidth = ctx[canvasNum - 1].lineWidth;
    ctx[canvasNum].strokeStyle = ctx[canvasNum - 1].strokeStyle;
    canvasDiv.appendChild(canvas);
  };
});
