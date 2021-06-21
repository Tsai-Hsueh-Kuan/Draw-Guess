const url = new URLSearchParams(window.location.search);
const test = url.get('test');

let userId;
let userName;
let userPhoto;
let onlineUser;
const signUp = document.getElementById('signUp');
const signIn = document.getElementById('signIn');
const token = localStorage.getItem('token');
const socket = io((''), {
  auth: {
    room: 'homePage',
    type: 'homePage',
    token: token
  },
  reconnect: true
});

socket.on('canvasUpdate', (msg) => {
  const roomId = msg.room;
  const canvasAll = msg.canvas;
  const imgs = document.getElementById(`imgs${roomId}`);
  if (msg.game && imgs) {
    for (const i in canvasAll) {
      if (canvasAll[i].canvas_data !== '0') {
        const img = document.createElement('img');
        img.src = canvasAll[i].canvas_data;
        img.className = `img img${roomId}`;
        img.id = 'img' + roomId + 'step' + canvasAll[i].canvas_num;
        canvasNum[roomId] = canvasAll[i].canvas_num + 1;
        imgs.appendChild(img);
      } else if (canvasAll[i].canvas_undo !== '0') {
        const img = document.getElementsByClassName(`img${roomId}`);
        const finalNum = img.length;
        canvasNum[roomId]--;
        img[finalNum - 1].remove();
      }
    }
  }
});

if (token) {
  fetch('/api/1.0/user/profile', {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` }
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 403) {
        localStorage.removeItem('token');
        Swal.fire('登入逾期！', '請重新登入', 'error')
          .then(() => {
            return window.location.assign('/');
          });
      } else if (response.status === 429) {
        Swal.fire({
          timer: 5000,
          title: 'Too Many Requests',
          icon: 'error'
        });
      }
    }).then(data => {
      userId = data.data.id;
      userName = data.data.name;
      userPhoto = data.data.photo;
      signIn.style = 'display:none;';
      signUp.style = 'display:none;';
      signOutButton.style = 'display:block;';
      const info = document.getElementById('info');
      const name = document.createElement('div');
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
        newPhoto.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
      }
      photoTd.appendChild(newPhoto);

      newPhoto.addEventListener('click', async function () {
        const inputOptions = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              'member.png': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/member.png" class="userPhotoReplace" >',
              'chipmunk.jpeg': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/chipmunk.jpeg" class="userPhotoReplace" >',
              'cow.jpeg': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/cow.jpeg" class="userPhotoReplace" >',
              'dog.jpeg': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/dog.jpeg" class="userPhotoReplace" >',
              'hippo.jpeg': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/hippo.jpeg" class="userPhotoReplace" >',
              'elephant.jpeg': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/elephant.jpeg" class="userPhotoReplace" >',
              'rabbit.jpeg': '<img src="https://d3cek75nx38k91.cloudfront.net/draw/rabbit.jpeg" class="userPhotoReplace" >',
              upload: '<div id="uploadText" ><i class="fas fa-upload"></i>上傳</div>'
            });
          }, 100);
        });

        const { value: photo } = await Swal.fire({
          title: `親愛的 ${userName} 玩家 \n</br>\n CHANGE PHOTO `,
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
              title: 'Choose Photo',
              html:
              '<form enctype="multipart/form-data" method="POST" name="file">' +
              '<input type="file" name="photo">' +
              '</form>'

            }).then(function (result) {
              const file = document.forms.namedItem('file');
              const formData = new FormData(file);
              if (result.isConfirmed) {
                if (file) {
                  fetch('/api/1.0/user/photoUpload', {
                    method: 'PATCH',
                    body: formData,
                    headers: { authorization: `Bearer ${token}` }
                  }).then(function (response) {
                    if (response.status === 200) {
                      return response.json();
                    } else if (response.status === 429) {
                      Swal.fire({
                        timer: 5000,
                        title: 'Too Many Requests',
                        icon: 'error'
                      });
                    } else if (response.status === 400) {
                      return response.json();
                    } else if (response.status === 403) {
                      return response.json();
                    } else if (response.status === 500) {
                      Swal.fire({
                        icon: 'error',
                        title: '上傳圖片太大',
                        text: '限制1Mb',
                        showConfirmButton: false,
                        timer: 3000
                      });
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
                      const newPhoto = document.getElementById('userPhotoSignIn');
                      if (userinfoPhotoElement) {
                        userinfoPhotoElement.setAttribute('src', `${data.photo}`);
                      }

                      newPhoto.setAttribute('src', `${data.photo}`);
                    }
                  });
                }
              }
            });
          } else {
            const data = {
              photo: photo
            };
            fetch('/api/1.0/user/photoReplace', {
              method: 'PATCH',
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
            }).then(function (response) {
              if (response.status === 200) {
                return response.json();
              } else if (response.status === 429) {
                Swal.fire({
                  timer: 5000,
                  title: 'Too Many Requests',
                  icon: 'error'
                });
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
                if (userinfoPhotoElement) {
                  userinfoPhotoElement.setAttribute('src', `https://d3cek75nx38k91.cloudfront.net/draw/${photo}`);
                }

                const newPhoto = document.getElementById('userPhotoSignIn');
                newPhoto.setAttribute('src', `https://d3cek75nx38k91.cloudfront.net/draw/${photo}`);
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
    '<input id="swal-input1" type="text" class="swal2-input" maxlength="10">' +
    '<div>PASSWORD</div>' +
    '<input id="swal-input2" type="password" class="swal2-input" maxlength="18">',

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
        Swal.fire({
          timer: 5000,
          title: 'NAME不能為空',
          icon: 'error'
        });
      } else if (!result.value[1]) {
        Swal.fire({
          timer: 5000,
          title: 'PASSWORD不能為空',
          icon: 'error'
        });
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
            Swal.fire({
              timer: 5000,
              title: 'Too Many Requests',
              icon: 'error'
            });
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

signUp.addEventListener('click', async function () {
  Swal.fire({
    title: '尚未擁有帳號 這邊註冊',
    html:

    '<div>NAME*</div>' +
    '<input id="swal-input3" type="text" name="name" class="swal2-input" maxlength="10">' +
    '<div>PASSWORD*</div>' +
    '<input id="swal-input4" type="password" name="password" class="swal2-input" maxlength="18">',
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
        Swal.fire({
          timer: 5000,
          title: 'NAME不能為空',
          icon: 'error'
        });
      } else if (result.value[0].length > 10) {
        Swal.fire({
          timer: 5000,
          title: 'NAME太長了',
          icon: 'error'
        });
      } else if (!result.value[1]) {
        Swal.fire({
          timer: 5000,
          title: 'PASSWORD不能為空',
          icon: 'error'
        });
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
            Swal.fire({
              timer: 5000,
              title: 'Too Many Requests',
              icon: 'error'
            });
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
    '<input id="swal-input1" type="text" class="swal2-input" maxlength="10">' +
    '<div>PASSWORD</div>' +
    '<input id="swal-input2" type="password" class="swal2-input" maxlength="18">',

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
        Swal.fire({
          timer: 5000,
          title: 'NAME不能為空',
          icon: 'error'
        });
      } else if (!result.value[1]) {
        Swal.fire({
          timer: 5000,
          title: 'PASSWORD不能為空',
          icon: 'error'
        });
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
            Swal.fire({
              timer: 5000,
              title: 'Too Many Requests',
              icon: 'error'
            });
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

const signOutButton = document.getElementById('exampleModal2');
const playGame = document.getElementById('playGame');
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

socket.emit('roomData', 'get');
socket.emit('homeRank', 'get');
socket.emit('onlineUser', 'get');

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
      photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
    }
    photoTd.appendChild(photo);
  }
});

const mainPart = document.getElementById('mainPart');
socket.on('mainPageView', async (msg) => {
  if (roomList[0]) {
    const noRoom = document.getElementById('noRoom');
    noRoom.className = 'haveRoom';
  } else {
    const noRoom = document.getElementById('noRoom');
    noRoom.className = 'noRoom';
  }

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
  imgs.className = 'imgs col-10 homePageImgs';
  imgs.alt = `/gamer.html?room=${roomId}&type=${roomType}`;
  imgs.setAttribute('href', `/gamer.html?room=${roomId}&type=${roomType}`);
  room.appendChild(imgs);

  const roomIdArea = document.createElement('div');
  roomIdArea.className = 'roomId';
  if (roomType === 'english') {
    roomIdArea.textContent = `ROOM ${roomId} (ENGLISH)`;
  } else if (roomType === 'idiom') {
    roomIdArea.textContent = `ROOM ${roomId} (四字成語)`;
  }

  imgs.appendChild(roomIdArea);

  const tbodyHost = document.createElement('div');
  tbodyHost.id = `tbodyHost${roomId}`;
  tbodyHost.className = 'tbodyHost';
  imgs.appendChild(tbodyHost);

  tbodyHost.innerHTML = '';
  if (msg.hostDetail) {
    const hostName = msg.hostDetail[0].name;
    const hostPhoto = msg.hostDetail[0].photo;
    const hostinfo = document.createElement('tr');
    hostinfo.className = 'hostinfo roomHostInfo';
    tbodyHost.appendChild(hostinfo);
    const name = document.createElement('td');
    name.textContent = `房主: ${hostName}`;
    name.className = 'hostName hover';

    const photoTd = document.createElement('td');
    hostinfo.appendChild(photoTd);
    const photo = document.createElement('img');
    photo.className = 'hostPhoto hostPhotoMainPage';
    photo.id = `hostPhoto${hostName}`;
    photo.alt = `/gamer.html?room=${roomId}&type=${roomType}`;
    if (hostPhoto) {
      photo.setAttribute('src', `${hostPhoto}`);
    } else {
      photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
    }
    photoTd.appendChild(name);
    photoTd.appendChild(photo);
  }

  const tableDiv = document.createElement('div');
  tableDiv.className = 'tableDiv';
  imgs.appendChild(tableDiv);

  const table = document.createElement('div');
  table.id = `table${roomId}`;
  table.className = 'table';
  tableDiv.appendChild(table);

  const thead = document.createElement('div');
  thead.id = `thead${roomId}`;
  thead.className = 'thead';
  table.appendChild(thead);

  const tr = document.createElement('div');
  thead.appendChild(tr);

  const th = document.createElement('div');
  th.scope = 'col';
  th.textContent = 'NAME';
  th.className = 'thName';
  tr.appendChild(th);

  const th2 = document.createElement('div');
  th2.scope = 'col';
  th2.id = `th2${roomId}`;
  th2.textContent = '目前玩家 0位';
  tr.appendChild(th2);

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
      const userinfo = document.createElement('tr');
      userinfo.className = 'userinfo';
      tbodyPlayerList.appendChild(userinfo);
      const name = document.createElement('td');
      name.textContent = `${gamerName}`;
      name.className = 'playerName hover';

      const photoTd = document.createElement('td');
      photoTd.className = 'gamerTd';
      userinfo.appendChild(photoTd);
      const photo = document.createElement('img');
      photo.className = 'gamerPhoto';
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
      }
      photoTd.appendChild(name);
      photoTd.appendChild(photo);
    }
  }
});

socket.on('mainPageViewPlayerChange', async (msg) => {
  const roomId = msg.roomId;
  const th2 = document.getElementById(`th2${roomId}`);
  const tbodyPlayerList = document.getElementById(`tbodyPlayerList${roomId}`);
  tbodyPlayerList.innerHTML = '';
  th2.textContent = '目前玩家 0位';
  if (msg.roomUserData && msg.roomUserData[0]) {
    const playlistCount = msg.roomUserData.length;
    th2.textContent = `目前玩家 共${playlistCount}位`;
    for (const i in msg.roomUserData) {
      const gamerName = msg.roomUserData[i][0].name;
      const gamerPhoto = msg.roomUserData[i][0].photo;
      const userinfo = document.createElement('tr');
      userinfo.className = 'userinfo';
      tbodyPlayerList.appendChild(userinfo);
      const name = document.createElement('td');
      name.textContent = `${gamerName}`;
      name.className = 'playerName hover';
      const photoTd = document.createElement('td');
      photoTd.className = 'gamerTd';
      userinfo.appendChild(photoTd);
      const photo = document.createElement('img');
      photo.className = 'gamerPhoto';
      if (gamerPhoto) {
        photo.setAttribute('src', `${gamerPhoto}`);
      } else {
        photo.setAttribute('src', 'https://d3cek75nx38k91.cloudfront.net/draw/member.png');
      }
      photoTd.appendChild(name);
      photoTd.appendChild(photo);
    }
  }
});
let tabNew = true;
const roomTab = document.getElementById('room-tab');
roomTab.addEventListener('click', function () {
  if (roomList) {
    if (roomList[0]) {
      const noRoom = document.getElementById('noRoom');
      noRoom.className = 'haveRoom';
    } else {
      Swal.fire({
        timer: 3000,
        title: '目前無房間可以加入',
        icon: 'warning',
        showConfirmButton: false
      });
      const noRoom = document.getElementById('noRoom');
      noRoom.className = 'noRoom';
    }
  }
  if (tabNew) {
    socket.emit('homePageRoomTab', '');
    tabNew = false;
  }
});

const roomIdJoin = document.getElementById('roomIdJoin');
roomIdJoin.addEventListener('click', function () {
  const roomIdSearch = document.getElementById('roomIdSearch').value;
  const roomIdSearchArea = document.getElementById('roomIdSearch');
  const roomImgs = document.getElementById(`imgs${roomIdSearch}`);
  if (roomImgs) {
    const roomUrl = roomImgs.alt;
    roomIdSearchArea.value = '';
    Swal.fire({
      timer: 2000,
      title: '加入遊戲中',
      icon: 'info',
      showConfirmButton: false
    });
    return window.location.assign(`${roomUrl}`);
  } else {
    roomIdSearchArea.value = '';
    Swal.fire({
      timer: 2000,
      title: '房號不存在！',
      icon: 'error',
      showConfirmButton: false
    });
  }
});

$('#roomIdSearch').on('keypress', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const roomIdSearch = document.getElementById('roomIdSearch').value;
    const roomIdSearchArea = document.getElementById('roomIdSearch');
    const roomImgs = document.getElementById(`imgs${roomIdSearch}`);
    if (roomImgs) {
      const roomUrl = roomImgs.alt;
      roomIdSearchArea.value = '';
      Swal.fire({
        timer: 2000,
        title: '加入遊戲中',
        icon: 'info',
        showConfirmButton: false
      });
      return window.location.assign(`${roomUrl}`);
    } else {
      roomIdSearchArea.value = '';
      Swal.fire({
        timer: 2000,
        title: '房號不存在！',
        icon: 'error',
        showConfirmButton: false
      });
    }
  }
});

const hostNameJoin = document.getElementById('hostNameJoin');
hostNameJoin.addEventListener('click', function () {
  const hostNameSearch = document.getElementById('hostNameSearch').value;
  const hostNameSearchArea = document.getElementById('hostNameSearch');
  const hostPhoto = document.getElementById(`hostPhoto${hostNameSearch}`);
  if (hostPhoto) {
    const roomUrl = hostPhoto.alt;
    hostNameSearchArea.value = '';
    Swal.fire({
      timer: 2000,
      title: '加入遊戲中',
      icon: 'info',
      showConfirmButton: false
    });
    return window.location.assign(`${roomUrl}`);
  } else {
    hostNameSearchArea.value = '';
    Swal.fire({
      timer: 2000,
      title: '不存在該房主！',
      icon: 'error',
      showConfirmButton: false
    });
  }
});

$('#hostNameSearch').on('keypress', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const hostNameSearch = document.getElementById('hostNameSearch').value;
    const hostNameSearchArea = document.getElementById('hostNameSearch');
    const hostPhoto = document.getElementById(`hostPhoto${hostNameSearch}`);
    if (hostPhoto) {
      const roomUrl = hostPhoto.alt;
      hostNameSearchArea.value = '';
      Swal.fire({
        timer: 2000,
        title: '加入遊戲中',
        icon: 'info',
        showConfirmButton: false
      });
      return window.location.assign(`${roomUrl}`);
    } else {
      hostNameSearchArea.value = '';
      Swal.fire({
        timer: 2000,
        title: '不存在該房主！',
        icon: 'error',
        showConfirmButton: false
      });
    }
  }
});

socket.on('onlineUserShow', async (msg) => {
  onlineUser = msg.userAll.filter(function (element, index, arr) {
    return arr.indexOf(element) === index;
  });
  const onlineCount = onlineUser.length;
  const onlineUserCount = document.getElementById('onlineUserCount');
  onlineUserCount.textContent = '在線人數：' + onlineCount + '人';
});

socket.on('mainPageViewClose', async (msg) => {
  const roomId = msg.room;
  roomList = roomList.filter(function (item) {
    return item !== roomId;
  });
  if (roomList[0]) {
    const noRoom = document.getElementById('noRoom');
    noRoom.className = 'haveRoom';
  } else {
    const noRoom = document.getElementById('noRoom');
    noRoom.className = 'noRoom';
  }
  const room = document.getElementById(`room${roomId}`);
  if (room) {
    room.remove();
  }
});

const canvasNum = [];
socket.on('mainPageCanvasClear', async (msg) => {
  const roomId = msg.room;
  canvasNum[roomId] = 0;
  $(`.img${roomId}`).remove();
});

socket.on('mainPageConvasData', (msg) => {
  const roomId = msg.room;
  const imgs = document.getElementById(`imgs${roomId}`);
  const img = document.createElement('img');
  img.src = msg.url;
  img.className = `img img${roomId}`;
  img.id = 'img' + roomId + 'step' + canvasNum[roomId];
  canvasNum[roomId]++;
  if (imgs) {
    imgs.appendChild(img);
  }
});

socket.on('mainPageUndo', (msg) => {
  const roomId = msg.room;
  if (msg.data) {
    const img = document.getElementsByClassName(`img${roomId}`);
    const finalNum = img.length;
    canvasNum[roomId]--;
    img[finalNum - 1].remove();
  }
});

let roomList;
socket.on('roomList', (msg) => {
  roomList = msg.roomList;
});

playGame.addEventListener('click', function () {
  if (userId) {
    Swal.fire({
      input: 'select',
      inputOptions: {
        quick: '快速開始',
        create: '連線模式',
        single: '單人模式'
      },
      showCancelButton: true,
      inputValidator: (value) => {
        if (value === 'quick') {
          const checkOnlineUser = onlineUser.filter(function (item) {
            return item !== userId;
          });

          if (roomList[0]) {
            const roomImgs = document.getElementById(`imgs${roomList[0]}`);
            if (roomImgs) {
              const roomUrl = roomImgs.alt;
              Swal.fire({
                timer: 2000,
                title: '加入遊戲中',
                icon: 'info',
                showConfirmButton: false
              });
              return window.location.assign(`${roomUrl}`);
            }
          } else if (checkOnlineUser[0]) {
            let room;
            for (let j = 1; j < 10000; j++) {
              const check = roomList.indexOf(`${j}`);
              if (check === -1) {
                room = j;
                break;
              }
            }
            Swal.fire({
              timer: 2000,
              title: '創建房間中',
              icon: 'info',
              showConfirmButton: false
            });
            const num = Math.floor(Math.random() * 2);
            if (num === 0) {
              return window.location.assign(`/draw.html?room=${room}&type=english`);
            } else {
              return window.location.assign(`/draw.html?room=${room}&type=idiom`);
            }
          } else {
            Swal.fire({
              timer: 2000,
              title: '單人模式加入中',
              icon: 'info',
              showConfirmButton: false
            });
            const num = Math.floor(Math.random() * 2);
            if (num === 0) {
              return window.location.assign('/single.html?type=english');
            } else {
              return window.location.assign('/single.html?type=idiom');
            }
          }
        } else if (value === 'create') {
          let room;
          for (let j = 1; j < 10000; j++) {
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
              }
            }
          });
        } else if (value === 'single') {
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
              }
            }
          });
        } else {
          return window.location.assign('/');
        }
      }
    });
  } else {
    Swal.fire({
      title: '開始遊戲前 請先登入',
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
          Swal.fire({
            timer: 5000,
            title: 'NAME不能為空',
            icon: 'error'
          });
        } else if (!result.value[1]) {
          Swal.fire({
            timer: 5000,
            title: 'PASSWORD不能為空',
            icon: 'error'
          });
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
              Swal.fire({
                timer: 5000,
                title: 'Too Many Requests',
                icon: 'error'
              });
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
  }
});

const owl = $('.owl-carousel');
owl.owlCarousel({
  items: 1,
  loop: true,
  margin: 10,
  autoplay: true,
  autoplayTimeout: 10000,
  nav: true,
  autoplayHoverPause: true,
  navText: ['<<<', '>>>']
});
$('.play').on('click', function () {
  owl.trigger('play.owl.autoplay', [10000]);
});
$('.stop').on('click', function () {
  owl.trigger('stop.owl.autoplay');
});

const createGame = document.getElementById('createGame');
createGame.addEventListener('click', function () {
  let room;
  for (let j = 1; j < 10000; j++) {
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

if (test === 'test') {
  Swal.fire({
    title: '測試帳號 請登入',
    html:
    '<div>NAME</div>' +
    '<input id="swal-input1" type="text" class="swal2-input" value="test" maxlength="10">' +
    '<div>PASSWORD</div>' +
    '<input id="swal-input2" type="password" class="swal2-input" value="test" maxlength="18">',
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
          Swal.fire({
            timer: 5000,
            title: 'Too Many Requests',
            icon: 'error'
          });
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
  });
}
