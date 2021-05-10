//socket io

const socket = io();

const canvas = document.querySelector('#draw')
const ctx = canvas.getContext('2d')
//將畫布設至為視窗大小
// canvas.width = window.innerWidth
// canvas.height = window.innerHeight
//設置畫筆的粗度以及形狀
ctx.lineJoin = 'round'
ctx.lineCap = 'round'
ctx.lineWidth = 5;
//設置flag以及起始座標
let isDrawing = false;
let lastX = 0;
let lastY = 0;
//色彩設置
let hue = 0

$('.color input').change(function(){
  r = $('#red').val();
  g = $('#green').val();
  b = $('#blue').val();
  RB = 0
  eraser_on = 0
  changeColor(r,g,b);
  //取出input中的數值
});
let color_view = document.querySelector('#color_view')
function changeColor(r,g,b){
  colors = {
    red : r,
    green : g,
    blue : b
  }
  $.each(colors, function(_color, _value) {
    $('#v'+_color).val(_value);
  });
  ctx.strokeStyle = "rgb("+r+","+g+","+b+")" ;
  //將顏色的值寫到ctx.strokeStyle即可
  RB = 0
  eraser_on = 0
  color_view.style.backgroundColor ="rgb("+r+","+g+","+b+")";
};

var slider = document.getElementById("myRange");
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  ctx.lineWidth = this.value;
}

let RB = 1
let RB_color = document.querySelector('#RB_color')
RB_color.addEventListener('click', function(){
  if(RB){
    eraser_on = false
    RB = 0
  } else {
    eraser_on = false
    RB = 1
  }
})

let eraser = document.querySelector('#eraser')
let eraser_on = false;
eraser.addEventListener('click', function(){
    eraser_on = true
    RB = 0 
})

function draw(e) {
  if (!isDrawing) return;
  if(RB){
  ctx.strokeStyle = `hsl(${hue},100%,50%)`  
  color_view.style.backgroundColor =`hsl(${hue},100%,50%)`;
  }
  if(eraser_on){
  ctx.strokeStyle = `white` 
  color_view.style.backgroundColor = 'white'
  }
  
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke();
  console.log('lastX: '+lastX);
  [lastX, lastY] = [e.offsetX, e.offsetY]
  console.log('e.offsetX: '+e.offsetX)
  console.log('move x: '+lastX+' y: '+lastY +' color : '+`${ctx.strokeStyle}`+' lineWidth : '+`${ctx.lineWidth}`)
  
  hue <= 360 ? hue++ : hue = 0;
}


canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY]
  
  if(RB){
  ctx.strokeStyle = `hsl(${hue},100%,50%)`  
  color_view.style.backgroundColor =`hsl(${hue},100%,50%)`;
  }
  if(eraser_on){
  ctx.strokeStyle = `white` 
  color_view.style.backgroundColor = 'white'
  }

  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY]
  console.log('down x: '+lastX+' y: '+lastY +' color : '+`${ctx.strokeStyle}`+' lineWidth : '+`${ctx.lineWidth}`)
  hue <= 360 ? hue++ : hue = 0;
});

canvas.addEventListener('mousemove', draw)
canvas.addEventListener('mousedown', () => isDrawing = true)
canvas.addEventListener('mouseup', () => isDrawing = false)
canvas.addEventListener('mouseout', () => isDrawing = false)

$('#save').on('click', function(){
  var _url = canvas.toDataURL();
  this.href = _url;
  save.setAttribute('download', "draw_test.png") 
});

canvas.addEventListener('mouseout', function(){
  var _url = canvas.toDataURL();
  //利用toDataURL() 把canvas轉成data:image
  // this.href = _url;
  //再把href載入上面的Data:image
  socket.emit('abc', _url)
})

canvas.addEventListener('mouseup', function(){
  var _url = canvas.toDataURL();
  //利用toDataURL() 把canvas轉成data:image
  // this.href = _url;
  //再把href載入上面的Data:image
  socket.emit('abc', _url)
})

let question_sql = '123'
let question = document.querySelector('#question')
question.textContent = `question: ${question_sql}`

let clear_all = document.querySelector('#clear_all')
clear_all.addEventListener('click', function(){
  ctx.clearRect(0,0,canvas.width, canvas.height )
})