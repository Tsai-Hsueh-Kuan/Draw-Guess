let userId;
let userName;
let userPhoto;
let userScore;
const signUp = document.getElementById('signUp');
const signIn = document.getElementById('signIn');
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
        Swal.fire('登入逾期！', '請重新登入', 'error')
          .then(() => {
            return window.location.assign('/');
          });
      }
    }).then(data => {
      userId = data.data.id;
      userName = data.data.name;
      userPhoto = data.data.photo;
      userScore = data.data.score;
      signIn.style = 'display:none;';
      signUp.style = 'display:none;';
      signOutButton.style = 'display:block;';
      createGame.style = 'display:block;';
      singlePlay.style = 'display:block;';
      const info = document.getElementById('info');

      const name = document.createElement('div');
      name.textContent = `NAME: ${userName}`;
      name.className = 'userName hover';
      info.appendChild(name);
      const photoTd = document.createElement('td');
      info.appendChild(photoTd);
      const photo = document.getElementById('userPhoto');
      photo.remove();
      const newPhoto = document.createElement('img');
      newPhoto.id = 'userPhotoSignIn';
      newPhoto.className = 'userPhoto';
      if (userPhoto) {
        newPhoto.setAttribute('src', `${userPhoto}`);
      } else {
        newPhoto.setAttribute('src', './images/member2.png');
      }
      photoTd.appendChild(newPhoto);

      newPhoto.addEventListener('click', async function () {
        const inputOptions = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              'member2.png': '<img src="./images/member2.png" class="userPhoto" >',
              'chipmunk.jpeg': '<img src="./images/chipmunk.jpeg" class="userPhoto" >',
              'cow.jpeg': '<img src="./images/cow.jpeg" class="userPhoto" >',
              'dog.jpeg': '<img src="./images/dog.jpeg" class="userPhoto" >',
              'hippo.jpeg': '<img src="./images/hippo.jpeg" class="userPhoto" >',
              'elephant.jpeg': '<img src="./images/elephant.jpeg" class="userPhoto" >',
              'rabbit.jpeg': '<img src="./images/rabbit.jpeg" class="userPhoto" >',
              upload: '<div id="uploadText" >上傳照片</div>'
            });
          }, 1000);
        });

        const { value: photo } = await Swal.fire({
          title: 'CHANGE PHOTO',
          input: 'radio',
          width: '1100px',
          inputOptions: inputOptions,
          inputValidator: (value) => {
            if (!value) {
              return 'You need to choose something!';
            }
          }
        });

        if (photo) {
          if (photo === 'upload') {
            Swal.fire({
              title: '上傳新的頭像',
              html:
              '<form enctype="multipart/form-data" method="POST" name="file">' +
              '<input type="file" name="photo">' +
              '</form>'

            }).then(function (result) {
              const file = document.forms.namedItem('file');
              const formData = new FormData(file);
              if (file) {
                fetch('/api/1.0/user/uploadPhoto', {
                  method: 'POST',
                  body: formData,
                  headers: { authorization: `Bearer ${token}` }
                }).then(function (response) {
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
                }).then(data => {
                  if (data.ok) {
                    Swal.fire({
                      position: 'top-end',
                      icon: 'success',
                      title: '您頭像已更新',
                      showConfirmButton: false,
                      timer: 1500
                    });
                    const userinfoPhotoElement = document.getElementById(`userinfoPhoto${userId}`);
                    userinfoPhotoElement.setAttribute('src', `${data.photo}`);
                    newPhoto.setAttribute('src', `${data.photo}`);
                  }
                });
              }
            });
          } else {
            const data = {
              photo: photo
            };
            fetch('/api/1.0/user/replacePhoto', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
            }).then(function (response) {
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
            }).then(data => {
              if (data.ok) {
                Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: '您頭像已更新',
                  showConfirmButton: false,
                  timer: 1500
                });
                const userinfoPhotoElement = document.getElementById(`userinfoPhoto${userId}`);
                userinfoPhotoElement.setAttribute('src', `./images/${photo}`);
                newPhoto.setAttribute('src', `./images/${photo}`);
              }
            });
          }
        }
      });
    })
    .catch(function (err) {
      return err;
    });
}

const userPhotoImg = document.getElementById('userPhoto');
userPhotoImg.addEventListener('click', function () {
  Swal.fire({
    title: '已有帳號 請登入',
    html:
    '<div>NAME</div>' +
    '<input id="swal-input1" type="text" class="swal2-input">' +
    '<div>PASSWORD</div>' +
    '<input id="swal-input2" type="password" class="swal2-input">',

    preConfirm: function () {
      return new Promise(function (resolve) {
        resolve([
          $('#swal-input1').val(),
          $('#swal-input2').val()
        ]);
      });
    }

  }).then(function (result) {
    if (result.value) {
      if (!result.value[0]) {
        alert('NAME不能為空');
      } else if (!result.value[1]) {
        alert('PASSWORD不能為空');
      } else {
        const signInData = {
          name: result.value[0],
          password: result.value[1]
        };
        fetch('/api/1.0/user/signin', {
          method: 'POST',
          body: JSON.stringify(signInData),
          headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
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
        }).then(data => {
          if (data.error) {
            Swal.fire('OOPS！', `${data.error}`, 'error');
          } else if (data.data) {
            localStorage.setItem('token', `${data.data.access_token}`);
            Swal.fire({
              timer: 5000,
              title: '登入成功',
              text: `歡迎${data.data.user.name}玩家`,
              icon: 'success'
            }).then(() => {
              return window.location.assign('/');
            });
          }
        });
      }
    }
  }).catch(Swal.fire.noop);
});

// const signUpForm = document.forms.namedItem('signUpForm');
// const signUpButton = document.getElementById('signUpButton');
// signUpButton.addEventListener('click', function (ev) {
//   const signUpFormData = new FormData(signUpForm);
//   fetch('/api/1.0/user/signup', {
//     method: 'POST',
//     body: signUpFormData
//   })
//     .then(function (response) {
//       if (response.status === 200) {
//         return response.json();
//       } else if (response.status === 429) {
//         alert('Too Many Requests');
//       } else if (response.status === 400) {
//         return response.json();
//       } else if (response.status === 403) {
//         return response.json();
//       } else if (response.status === 500) {
//         return response.json();
//       }
//     })
//     .then(data => {
//       if (data.error) {
//         Swal.fire('OOPS！', `${data.error}`, 'error');
//       } else if (data.data) {
//         localStorage.setItem('token', `${data.data.access_token}`);
//         Swal.fire({
//           title: '註冊成功',
//           text: `歡迎${data.data.user.name}玩家`,
//           icon: 'success'
//         }).then(() => {
//           return window.location.assign('/');
//         });
//       }
//     });
//   ev.preventDefault();
// }, false);

signUp.addEventListener('click', async function () {
  Swal.fire({
    title: '尚未擁有帳號 這邊註冊',
    html:

    '<div>NAME*</div>' +
    '<input id="swal-input3" type="text" name="name" class="swal2-input">' +
    '<div>PASSWORD*</div>' +
    '<input id="swal-input4" type="password" name="password" class="swal2-input">',
    preConfirm: function () {
      return new Promise(function (resolve) {
        resolve([
          $('#swal-input3').val(),
          $('#swal-input4').val()
        ]);
      });
    }

  }).then(function (result) {
    if (result.value) {
      if (!result.value[0]) {
        alert('NAME不能為空');
      } else if (!result.value[1]) {
        alert('PASSWORD不能為空');
      } else {
        const signUpData = {
          name: result.value[0],
          password: result.value[1]
        };
        fetch('/api/1.0/user/signup', {
          method: 'POST',
          body: JSON.stringify(signUpData),
          headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
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
        }).then(data => {
          if (data.error) {
            Swal.fire('OOPS！', `${data.error}`, 'error');
          } else if (data.data) {
            localStorage.setItem('token', `${data.data.access_token}`);
            Swal.fire({
              timer: 5000,
              title: '註冊成功',
              text: `歡迎${data.data.user.name}玩家`,
              icon: 'success'
            }).then(() => {
              return window.location.assign('/');
            });
          }
        });
      }
    }
  }).catch(Swal.fire.noop);
});

signIn.addEventListener('click', async function () {
  Swal.fire({
    title: '已有帳號 請登入',
    html:
    '<div>NAME</div>' +
    '<input id="swal-input1" type="text" class="swal2-input">' +
    '<div>PASSWORD</div>' +
    '<input id="swal-input2" type="password" class="swal2-input">',

    preConfirm: function () {
      return new Promise(function (resolve) {
        resolve([
          $('#swal-input1').val(),
          $('#swal-input2').val()
        ]);
      });
    }

  }).then(function (result) {
    if (result.value) {
      if (!result.value[0]) {
        alert('NAME不能為空');
      } else if (!result.value[1]) {
        alert('PASSWORD不能為空');
      } else {
        const signInData = {
          name: result.value[0],
          password: result.value[1]
        };
        fetch('/api/1.0/user/signin', {
          method: 'POST',
          body: JSON.stringify(signInData),
          headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
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
        }).then(data => {
          if (data.error) {
            Swal.fire('OOPS！', `${data.error}`, 'error');
          } else if (data.data) {
            localStorage.setItem('token', `${data.data.access_token}`);
            Swal.fire({
              timer: 5000,
              title: '登入成功',
              text: `歡迎${data.data.user.name}玩家`,
              icon: 'success'
            }).then(() => {
              return window.location.assign('/');
            });
          }
        });
      }
    }
  }).catch(Swal.fire.noop);
});

const photoButton = document.getElementById('userPhoto');
photoButton.addEventListener('click', function () {

});
// const signInForm = document.forms.namedItem('signInForm');
// const signInButton = document.getElementById('signInButton');
// signInButton.addEventListener('click', function (ev) {
//   const signIpFormData = new FormData(signInForm);
//   fetch('/api/1.0/user/signin', {
//     method: 'POST',
//     body: signIpFormData
//   }).then(function (response) {
//     if (response.status === 200) {
//       return response.json();
//     } else if (response.status === 429) {
//       alert('Too Many Requests');
//     } else if (response.status === 400) {
//       return response.json();
//     } else if (response.status === 403) {
//       return response.json();
//     } else if (response.status === 500) {
//       return response.json();
//     }
//   }).then(data => {
//     if (data.error) {
//       Swal.fire('OOPS！', `${data.error}`, 'error');
//     } else if (data.data) {
//       localStorage.setItem('token', `${data.data.access_token}`);
//       Swal.fire({
//         title: '登入成功',
//         text: `歡迎${data.data.user.name}玩家`,
//         icon: 'success'
//       }).then(() => {
//         return window.location.assign('/');
//       });
//     }
//   });
//   ev.preventDefault();
// }, false);

const signOutButton = document.getElementById('exampleModal2');
const createGame = document.getElementById('createGame');
const singlePlay = document.getElementById('singlePlay');

signOutButton.addEventListener('click', function () {
  Swal.fire({
    title: '確定要登出嗎？',
    text: `親愛的 ${userName} 玩家`,
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: '繼續遊戲',
    confirmButtonText: '確認登出'
  })
    .then((result) => {
      if (result.isConfirmed) {
        if (token) {
          localStorage.removeItem('token');
        }
        return window.location.assign('/');
      }
    });
});

const socket = io((''), {
  auth: {
    room: 'homePage',
    type: 'homePage'
  }
});
socket.emit('roomData', 'get');
socket.emit('homeRank', 'get');

const rank = document.getElementById('rank');
socket.on('getRank', async (msg) => {
  rank.innerHTML = '';
  for (const i in msg.data) {
    const rankId = msg.data[i].id;
    const rankName = msg.data[i].name;
    const rankPhoto = msg.data[i].photo;
    const rankScore = msg.data[i].score;
    const userinfo = document.createElement('tr');
    userinfo.className = 'userinfo';

    rank.appendChild(userinfo);

    const scope = document.createElement('td');
    scope.scope = 'row';
    scope.textContent = (parseInt(i) + 1);
    userinfo.appendChild(scope);

    const name = document.createElement('td');
    name.className = 'userinfoName';

    name.textContent = `${rankName}`;
    userinfo.appendChild(name);

    const score = document.createElement('td');
    score.className = 'userinfoScore';
    score.textContent = `${rankScore}`;
    userinfo.appendChild(score);
    const photoTd = document.createElement('td');
    userinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    photo.className = 'userinfoPhoto';
    photo.id = `userinfoPhoto${rankId}`;
    if (rankPhoto) {
      photo.setAttribute('src', `${rankPhoto}`);
    } else {
      photo.setAttribute('src', './images/player.png');
    }
    photoTd.appendChild(photo);
  }
});

const mainPart = document.getElementById('mainPart');

socket.on('mainPageView', async (msg) => {
  const roomId = msg.roomId;
  const roomType = msg.roomType;
  canvasNum[roomId] = 0;
  let room = document.getElementById(`room${roomId}`);
  if (room) {
    room.innerHTML = '';
  } else {
    room = document.createElement('div');
    room.id = `room${roomId}`;
    room.className = 'room';
    mainPart.appendChild(room);
  }
  const imgs = document.createElement('a');
  imgs.id = `imgs${roomId}`;
  imgs.className = 'imgs col-10';
  imgs.setAttribute('href', `/gamer.html?room=${roomId}&type=${roomType}`);
  room.appendChild(imgs);

  const tableDiv = document.createElement('div');
  tableDiv.className = 'tableDiv col-2';
  room.appendChild(tableDiv);

  const table = document.createElement('table');
  table.id = `table${roomId}`;
  table.className = 'table';
  tableDiv.appendChild(table);

  const thead = document.createElement('thead');
  thead.id = `thead${roomId}`;
  thead.className = 'thead';
  table.appendChild(thead);

  const tr = document.createElement('tr');
  thead.appendChild(tr);

  const th = document.createElement('th');
  th.scope = 'col';
  th.textContent = 'NAME';
  th.className = 'thName';
  tr.appendChild(th);

  const th2 = document.createElement('th');
  th2.scope = 'col';
  th2.textContent = '目前玩家';
  tr.appendChild(th2);

  const tbodyHost = document.createElement('tbody');
  tbodyHost.id = `tbodyHost${roomId}`;
  tbodyHost.className = 'tbodyHost';
  imgs.appendChild(tbodyHost);

  const tbodyPlayerList = document.createElement('tbody');
  tbodyPlayerList.id = `tbodyPlayerList${roomId}`;
  tbodyPlayerList.className = 'tbodyPlayerList';
  table.appendChild(tbodyPlayerList);

  tbodyPlayerList.innerHTML = '';
  if (msg.roomUserData && msg.roomUserData[0]) {
    const playlistCount = msg.roomUserData.length;
    th2.textContent = `目前玩家 共${playlistCount}位`;
    for (const i in msg.roomUserData) {
      const gamerName = msg.roomUserData[i][0].name;
      const gamerPhoto = msg.roomUserData[i][0].photo;
      const gamerScore = msg.roomUserData[i][0].score;
      const userinfo = document.createElement('tr');
      userinfo.className = 'userinfo';
      tbodyPlayerList.appendChild(userinfo);
      const name = document.createElement('td');
      name.textContent = `NAME: ${gamerName}`;
      name.className = 'userName hover';

      const photoTd = document.createElement('td');
      photoTd.className = 'gamerTd';
      userinfo.appendChild(photoTd);
      const photo = document.createElement('img');
      photo.className = 'gamerPhoto';
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', './images/member2.png');
      }
      photoTd.appendChild(name);
      photoTd.appendChild(photo);
    }
  }
  tbodyHost.innerHTML = '';
  if (msg.hostDetail) {
    const hostName = msg.hostDetail[0].name;
    const hostPhoto = msg.hostDetail[0].photo;
    const hostinfo = document.createElement('tr');
    hostinfo.className = 'hostinfo';
    tbodyHost.appendChild(hostinfo);
    const name = document.createElement('td');
    name.textContent = `房主: ${hostName}`;
    name.className = 'hostName';
    hostinfo.appendChild(name);
    const photoTd = document.createElement('td');
    hostinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    photo.className = 'hostPhoto hostPhotoMainPage';
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', './images/member2.png');
    }

    photoTd.appendChild(photo);
  }
});

socket.on('mainPageViewClose', async (msg) => {
  const roomId = msg.room;
  const room = document.getElementById(`room${roomId}`);
  room.remove();
});

const canvasNum = [];
socket.on('mainPageCanvasClear', async (msg) => {
  const roomId = msg.room;
  canvasNum[roomId] = 0;
  const imgs = document.getElementById(`imgs${roomId}`);
  imgs.innerHTML = '';
});

socket.on('mainPageConvasData', (msg) => {
  const roomId = msg.room;
  const imgs = document.getElementById(`imgs${roomId}`);
  const img = document.createElement('img');
  img.src = msg.url;
  img.className = `img img${roomId}`;
  img.id = 'img' + roomId + 'step' + canvasNum[roomId];
  canvasNum[roomId]++;
  imgs.appendChild(img);
});

socket.on('mainPageUndo', (msg) => {
  const roomId = msg.room;
  if (msg.data) {
    const myobj = document.getElementById(`img${roomId}step${canvasNum[roomId] - 1}`);
    myobj.remove();
    canvasNum[roomId]--;
  }
});
let roomList;
socket.on('roomList', (msg) => {
  roomList = msg.roomList;
});

socket.on('canvasUpdate', (msg) => {
  const roomId = msg.room;
  const canvasAll = msg.canvas;
  const imgs = document.getElementById(`imgs${roomId}`);
  if (msg.game) {
    for (const i in canvasAll) {
      if (canvasAll[i].canvas_data !== '0') {
        const img = document.createElement('img');
        img.src = canvasAll[i].canvas_data;
        img.className = `img img${roomId}`;
        img.id = 'img' + roomId + 'step' + i;
        canvasNum[roomId] = canvasAll[i].canvas_num - 1;
        imgs.appendChild(img);
      } else if (canvasAll[i].canvas_undo !== '0') {
        const img = document.getElementsByClassName(`img${roomId}`);
        const finalNum = img.length;
        img[finalNum - 1].remove();
      }
    }
  }
});

singlePlay.addEventListener('click', function () {
  Swal.fire({
    title: '準備開始單人模式',
    input: 'select',
    inputOptions: {
      english: 'ENGLISH',
      idiom: '四字成語'
    },
    inputPlaceholder: '選擇您喜歡的題型',
    showCancelButton: true,
    inputValidator: (value) => {
      if (value === 'english') {
        return window.location.assign('/single.html?type=english');
      } else if (value === 'idiom') {
        return window.location.assign('/single.html?type=idiom');
      } else {
        Swal.fire({
          timer: 2000,
          title: '未選擇 取消！',
          showConfirmButton: false
        });
      }
    }
  });
});

createGame.addEventListener('click', function () {
  let room;
  for (let j = 0; j < 10000; j++) {
    const check = roomList.indexOf(`${j}`);
    if (check === -1) {
      room = j;
      break;
    }
  }
  Swal.fire({
    title: '準備開始連線模式',
    input: 'select',
    inputOptions: {
      english: 'ENGLISH',
      idiom: '四字成語'
    },
    inputPlaceholder: '選擇您喜歡的題型',
    showCancelButton: true,
    inputValidator: (value) => {
      if (value === 'english') {
        return window.location.assign(`/draw.html?room=${room}&type=english`);
      } else if (value === 'idiom') {
        return window.location.assign(`/draw.html?room=${room}&type=idiom`);
      } else {
        Swal.fire({
          timer: 2000,
          title: '未選擇 取消！',
          showConfirmButton: false
        });
      }
    }
  });
});

// const canvasDiv = document.querySelector('#addCanvas');
// const canvas = document.querySelector('.draw');
// const ctx = [];
// let canvasNumPhoto = 0;
// ctx[canvasNumPhoto] = canvas.getContext('2d');

// // 設置畫筆的粗度以及形狀
// ctx[canvasNumPhoto].lineJoin = 'round';
// ctx[canvasNumPhoto].lineCap = 'round';
// ctx[canvasNumPhoto].lineWidth = 5;
// // 設置flag以及起始座標
// let isDrawing = false;
// let lastX = 0;
// let lastY = 0;
// // 色彩設置
// let hue = 0;
// let colorNow = '#555555';
// let lineWidthNow = 5;
// let isRainbow = true;

// const colorChoose = document.querySelector('#colorChoose');
// const colorView = document.querySelector('#colorView');
// colorChoose.addEventListener('change', function () {
//   isRainbow = 0;
//   rainbowColor.textContent = ('rainbow color : OFF');
//   ctx[canvasNumPhoto].strokeStyle = colorChoose.value;
//   colorView.style.backgroundColor = colorChoose.value;
//   colorNow = colorChoose.value;
// });

// const lineWidthRange = document.getElementById('lineWidthRange');
// lineWidthRange.oninput = function () {
//   ctx[canvasNumPhoto].lineWidth = this.value;
//   lineWidthNow = this.value;
// };

// const rainbowColor = document.querySelector('#rainbowColor');
// rainbowColor.addEventListener('click', function () {
//   isRainbow = true;
//   rainbowColor.textContent = ('rainbow color : ON');
// });

// const eraser = document.querySelector('#eraser');
// eraser.addEventListener('click', function () {
//   colorNow = 'white';
//   isRainbow = false;
// });

// function draw (e) {
//   if (!isDrawing) return;
//   if (isRainbow) {
//     ctx[canvasNumPhoto].strokeStyle = `hsl(${hue},100%,50%)`;
//     colorView.style.backgroundColor = `hsl(${hue},100%,50%)`;
//   } else {
//     ctx[canvasNumPhoto].strokeStyle = colorNow;
//   }
//   ctx[canvasNumPhoto].beginPath();
//   ctx[canvasNumPhoto].moveTo(lastX, lastY);
//   ctx[canvasNumPhoto].lineTo(e.offsetX, e.offsetY);
//   ctx[canvasNumPhoto].stroke();
//   [lastX, lastY] = [e.offsetX, e.offsetY];
//   hue <= 360 ? hue++ : hue = 0;
// }
// const createCanvas = function () {
//   canvasNumPhoto++;
//   const canvas = document.createElement('canvas');
//   canvas.className = 'draw';
//   canvas.id = 'draw' + canvasNumPhoto;
//   canvas.width = '400';
//   canvas.height = '250';
//   canvas.style.zIndex = canvasNumPhoto;
//   ctx[canvasNumPhoto] = canvas.getContext('2d');
//   canvasDiv.appendChild(canvas);
// };

// canvasDiv.addEventListener('mouseup', () => {
//   if (isDrawing) {
//     createCanvas();
//   }
// });

// canvasDiv.addEventListener('mouseout', () => {
//   if (isDrawing) {
//     createCanvas();
//   }
// });

// canvasDiv.addEventListener('mousedown', (e) => {
//   isDrawing = true;
//   [lastX, lastY] = [e.offsetX, e.offsetY];

//   if (isRainbow) {
//     ctx[canvasNumPhoto].strokeStyle = `hsl(${hue},100%,50%)`;
//     colorView.style.backgroundColor = `hsl(${hue},100%,50%)`;
//   } else {
//     ctx[canvasNumPhoto].strokeStyle = colorNow;
//   }
//   ctx[canvasNumPhoto].lineWidth = lineWidthNow;
//   ctx[canvasNumPhoto].lineJoin = 'round';
//   ctx[canvasNumPhoto].lineCap = 'round';
//   ctx[canvasNumPhoto].beginPath();
//   ctx[canvasNumPhoto].moveTo(lastX, lastY);
//   ctx[canvasNumPhoto].lineTo(e.offsetX, e.offsetY);
//   ctx[canvasNumPhoto].stroke();
//   hue <= 360 ? hue++ : hue = 0;
// });

// canvasDiv.addEventListener('mousemove', draw);
// canvasDiv.addEventListener('mousedown', () => isDrawing = true);

// // $('#save').on('click', function () {
// //   const cavasNow = document.getElementById(`draw${canvasNum - 1}`);
// //   const _url = cavasNow.toDataURL();
// //   this.href = _url;
// //   save.setAttribute('download', 'draw_test.png');
// // });
// const socketUrl = function () {
//   // if (isDrawing) {
//   //   const cavasNow = document.getElementById(`draw${canvasNumPhoto - 1}`);
//   //   const _url = cavasNow.toDataURL();
//   //   socket.emit('canvasData', { room: room, canvasNumPhoto: canvasNumPhoto - 1, url: _url });
//   // };
//   isDrawing = false;
// };

// canvasDiv.addEventListener('mouseout', function () {
//   socketUrl();
// });
// canvasDiv.addEventListener('mouseup', function () {
//   socketUrl();
// });

// const undo = function () {
//   if (canvasNumPhoto > 0) {
//     const myobjNow = document.getElementById(`draw${canvasNumPhoto}`);
//     myobjNow.remove();
//     const myobj = document.getElementById(`draw${canvasNumPhoto - 1}`);
//     const c = myobj.getContext('2d');
//     c.clearRect(0, 0, 400, 250);
//     canvasNumPhoto--;
//     socket.emit('undo', { room: room, canvasNumPhoto: canvasNumPhoto, data: 1 });
//   }
// };
// const undoBottom = document.querySelector('#undo');
// undoBottom.addEventListener('click', function () {
//   undo();
// });

// function KeyPress () {
//   const evtobj = window.event;
//   const Mac = new RegExp('Mac');
//   const Win = new RegExp('Win');
//   const computerType = navigator.platform;
//   if (Win.test(computerType)) {
//     if (evtobj.keyCode === 90 && evtobj.ctrlKey && evtobj.shiftKey) {
//       socket.emit('redo', { room: room, canvasNumPhoto: canvasNumPhoto });
//     } else if (evtobj.keyCode === 90 && evtobj.ctrlKey) {
//       undo();
//     }
//   } else if (Mac.test(computerType)) {
//     if (evtobj.keyCode === 90 && evtobj.metaKey && evtobj.shiftKey) {
//       socket.emit('redo', { room: room, canvasNumPhoto: canvasNumPhoto });
//     } else if (evtobj.keyCode === 90 && evtobj.metaKey) {
//       undo();
//     }
//   }
// }

// document.onkeydown = KeyPress;

// const redoBotton = document.querySelector('#redo');
// redoBotton.addEventListener('click', function () {
//   // socket.emit('redo', { room: room, canvasNumPhoto: canvasNumPhoto });
// });

// socket.on(`redo url${room}`, async (msg) => {
//   const myobjNow = document.getElementById(`draw${canvasNumPhoto}`);
//   const contextNow = myobjNow.getContext('2d');
//   const img = new Image();
//   img.src = msg;
//   img.onload = function () {
//     contextNow.drawImage(img, 0, 0);
//     contextNow.stroke();
//     createCanvas();
//   };
// });
