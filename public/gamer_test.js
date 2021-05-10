const socket = io();
const imgs = document.querySelector('#imgs');
let canvasNum = 0;
socket.on('new order', (id) => {
  const img = document.createElement('img');
  img.src = id;
  img.className = 'img';
  img.id = 'img' + canvasNum;
  canvasNum++;
  imgs.appendChild(img);
});

socket.on('undo msg', (id) => {
  if (id) {
    const myobj = document.getElementById(`img${canvasNum - 1}`);
    myobj.remove();
    canvasNum--;
  }
});

// let save = document.querySelector('#save')
// $('#save').on('click', function(){
//   if(gamer_img.src){
//     this.href = gamer_img.src;
//     save.setAttribute('download', "draw_test.png")
//   } else {
//     alert('阿就沒東西你存個屁')
//   }
// })
