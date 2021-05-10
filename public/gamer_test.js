const socket = io();
let gamer_img = document.querySelector('#gamer_img')
socket.on('new order', (id)=>{
  gamer_img.src = id
});

let save = document.querySelector('#save')
$('#save').on('click', function(){
  if(gamer_img.src){
    this.href = gamer_img.src;
    save.setAttribute('download', "draw_test.png")
  } else {
    alert('阿就沒東西你存個屁')
  }
  
});