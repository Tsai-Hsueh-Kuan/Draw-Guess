const roomContainerHTML = get('.room-container');
const whiteboardHTML = get('.whiteboard');
const canvas = get('.whiteboard canvas.main');
const ctxMain = canvas.getContext('2d');
const canvasShape = get('.whiteboard canvas.shape');
const ctxShape = canvasShape.getContext('2d');
const canvasAll = get('.whiteboard canvas.all');
const ctxAll = canvasAll.getContext('2d');

const Model = {
  user: JSON.parse(localStorage.getItem('user')),
  room: {
    name: getQuery().room,
    title: 'Untitled',
    token: '',
  },
  whiteboard: {
    color: '#000000',
    width: '3',
    drawType: 'line',
    records: [],
    recordsTransfered: [],
    ctx: undefined,
    image: {
      imageReferencePosition: [0, 0],
      imagePosition: [200, 120],
      imageMovable: false,
    },
    text: {
      textReferencePosition: [0, 0],
      textPosition: [200, 120],
      textMovable: false,
    },
    pin: {
      pinOriginalPosition: [0, 0],
      pinReferencePosition: [0, 0],
      pinPosition: [200, 120],
      pinMovable: false,
      pinClickable: true,
    },
    boundary: {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
    lastDrawShapeNode: undefined,
  },
  chatbox: {
    lastOldestCreated_at: 0,
    scrollLock: false,
  },
  historyWB: [],
};

const View = {
  whiteboard: {
    line: {
      draw: function (record, requirement) {
        const { isPreview, isTransfer } = requirement || {};
        const { author, color, width, path, created_at } = record;

        let canvasCtx;
        if (isPreview) {
          canvasCtx = ctxShape;
        } else if (isTransfer) {
          canvasCtx = ctxAll;
        } else {
          Controller.whiteboard.addCanvasLayer({ created_at });
          canvasCtx = Model.whiteboard.ctx;
        }

        // get trace boundary
        const boundary = {
          minX: path[0][0],
          maxX: path[0][0],
          minY: path[0][1],
          maxY: path[0][1],
        };

        if (path.length === 1) {
          const currX = path[0][0];
          const currY = path[0][1];
          canvasCtx.beginPath();
          canvasCtx.fillStyle = color;
          canvasCtx.arc(currX, currY, width / 2, 0, 2 * Math.PI);
          canvasCtx.fill();
          canvasCtx.closePath();
        }

        for (let pathIndex = 1; pathIndex < path.length; pathIndex++) {
          const prevX = path[pathIndex - 1][0];
          const prevY = path[pathIndex - 1][1];
          const currX = path[pathIndex][0];
          const currY = path[pathIndex][1];

          // trace boundary
          if (currX < boundary.minX) {
            boundary.minX = currX;
          }
          if (currX > boundary.maxX) {
            boundary.maxX = currX;
          }
          if (currY < boundary.minY) {
            boundary.minY = currY;
          }
          if (currY > boundary.maxY) {
            boundary.maxY = currY;
          }

          canvasCtx.beginPath();
          canvasCtx.lineCap = 'round';
          canvasCtx.lineJoin = 'round';
          canvasCtx.moveTo(prevX, prevY);
          canvasCtx.lineTo(currX, currY);
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = width;
          canvasCtx.closePath();
          canvasCtx.stroke();
        }

        if (author !== 'self' && !isTransfer) {
          View.whiteboard.line.updateTrace(record, boundary);
        }
      },
      updateTrace: function (record, boundary) {
        const { user_id, path, width } = record;
        const { minX, maxX, minY, maxY } = boundary;
        const userHTML = get(`.whiteboard .trace [data-user_id="${user_id}"]`);
        if (userHTML) {
          userHTML.style.top = `${minY - +width / 2 - 10}px`;
          userHTML.style.left = `${minX - +width / 2 - 10}px`;
          userHTML.style.width = `${maxX - minX + +width + 20}px`;
          userHTML.style.height = `${maxY - minY + +width + 20}px`;
        }
      },
    },
    shape: {
      draw: function (record, requirement) {
        const { isPreview, isTransfer } = requirement || {};
        const { category, color, width, created_at } = record;

        let canvasCtx;
        if (isPreview) {
          this.clear();
          canvasCtx = ctxShape;
        } else if (isTransfer) {
          canvasCtx = ctxAll;
        } else {
          Controller.whiteboard.addCanvasLayer({ created_at });
          canvasCtx = Model.whiteboard.ctx;
        }

        const { origX, origY, currX, currY, } = record.position;

        if (category === 'line') {
          canvasCtx.beginPath();
          canvasCtx.lineCap = 'round';
          canvasCtx.lineJoin = 'round';
          canvasCtx.moveTo(origX, origY);
          canvasCtx.lineTo(currX, currY);
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = width;
          canvasCtx.closePath();
          canvasCtx.stroke();

        } else if (category === 'rect') {
          canvasCtx.beginPath();
          canvasCtx.lineCap = 'round';
          canvasCtx.lineJoin = 'round';
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = width;

          const rectWidth = Math.abs(currX - origX) > 0 ? Math.abs(currX - origX) : width;
          const rectHeight = Math.abs(currY - origY) > 0 ? Math.abs(currY - origY) : width;

          // draw different directions
          // canvas y axis is downward
          // 4 quadrant
          let drawRefX = origX;
          let drawRefY = origY;
          if (currX > origX && currY < origY) {
            // 1 quadrant
            drawRefX = origX;
            drawRefY = currY;
          } else if (currX < origX && currY < origY) {
            // 2 quadrant
            drawRefX = currX;
            drawRefY = currY;
          } else if (currX < origX && currY > origY) {
            // 3 quadrant
            drawRefX = currX;
            drawRefY = origY;
          }

          canvasCtx.strokeRect(drawRefX, drawRefY, rectWidth, rectHeight);
          canvasCtx.closePath();

        } else if (category === 'cir') {
          canvasCtx.beginPath();
          const x = origX;
          const y = origY;
          const radius = Math.sqrt(Math.pow((currX - origX), 2) + Math.pow((currY - origY), 2));
          const startAngle = 0;
          const endAngle = Math.PI * 2;
          canvasCtx.arc(x, y, radius, startAngle, endAngle);
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = width;
          canvasCtx.closePath();
          canvasCtx.stroke();

        } else if (category === 'tri') {
          canvasCtx.beginPath();
          canvasCtx.lineCap = 'round';
          canvasCtx.lineJoin = 'round';
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = width;

          const thirdX = origX;
          const thirdY = currY;

          canvasCtx.moveTo(origX, origY);
          canvasCtx.lineTo(thirdX, thirdY);
          canvasCtx.lineTo(currX, currY);

          canvasCtx.closePath();
          canvasCtx.stroke();
        }

        // trace
        if (!isTransfer) {
          this.updateTrace(record);
        }
      },
      clear: function () {
        ctxShape.clearRect(0, 0, canvasShape.width, canvasShape.height);
      },
      updateTrace: function (record) {
        const { user_id, category, width } = record;
        const { origX, origY, currX, currY, } = record.position;

        let minX = origX < currX ? origX : currX;
        let maxX = origX > currX ? origX : currX;
        let minY = origY < currY ? origY : currY;
        let maxY = origY > currY ? origY : currY;

        if (category === 'cir') {
          const radius = Math.sqrt(Math.pow((currX - origX), 2) + Math.pow((currY - origY), 2));
          minX = origX - radius;
          maxX = origX + radius;
          minY = origY - radius;
          maxY = origY + radius;
        }

        const userHTML = get(`.whiteboard .trace [data-user_id="${user_id}"]`);
        if (userHTML) {
          userHTML.style.top = `${minY - +width / 2 - 10}px`;
          userHTML.style.left = `${minX - +width / 2 - 10}px`;
          userHTML.style.width = `${maxX - minX + +width + 20}px`;
          userHTML.style.height = `${maxY - minY + +width + 20}px`;
        }
      },
    },
    image: {
      draw: function (record, requirement) {
        return new Promise(function (resolve, reject) {
          const { isTransfer } = requirement || {};
          const { x, y, width, height, link, created_at } = record;

          let canvasCtx;
          if (isTransfer) {
            canvasCtx = ctxAll;
          } else {
            Controller.whiteboard.addCanvasLayer({ created_at });
            canvasCtx = Model.whiteboard.ctx;
          }

          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = function () {
            canvasCtx.drawImage(img, x, y, width, height);
            resolve();
          };
          img.src = link;
          // trace
          if (!isTransfer) {
            View.whiteboard.image.updateTrace(record, x, y, width, height);
          }
        });
      },
      updateTrace: function (record, x, y, width, height) {
        const { user_id } = record;
        const userHTML = get(`.whiteboard .trace [data-user_id="${user_id}"]`);
        if (userHTML) {
          userHTML.style.top = `${y - 10}px`;
          userHTML.style.left = `${x - 10}px`;
          userHTML.style.width = `${width + 20}px`;
          userHTML.style.height = `${height + 20}px`;
        }
      },
    },
    text: {
      draw: function (record, requirement) {
        const { isTransfer } = requirement || {};
        const { content, x, y, size, created_at } = record;

        let canvasCtx = ctxMain;
        if (isTransfer) {
          canvasCtx = ctxAll;
        } else {
          Controller.whiteboard.addCanvasLayer({ created_at });
          canvasCtx = Model.whiteboard.ctx;
        }

        canvasCtx.font = `${size} Josefin Sans, cwTeXYen, Verdana`;
        canvasCtx.fillStyle = '#000000';
        const width = canvasCtx.measureText(content).width;
        const height = +size.replace('px', '');
        // offset
        canvasCtx.fillText(content, x + 2, y + 0.25 * height);
        // trace
        if (!isTransfer) {
          View.whiteboard.text.updateTrace(record, x + 2, y + 0.25 * height, width, height);
        }
      },
      updateTrace: function (record, x, y, width, height) {
        const { user_id } = record;
        const userHTML = get(`.whiteboard .trace [data-user_id="${user_id}"]`);
        if (userHTML) {
          userHTML.style.top = `${y - 10 - height}px`;
          userHTML.style.left = `${x - 10}px`;
          userHTML.style.width = `${width + 20}px`;
          userHTML.style.height = `${height + 20}px`;
        }
      },
    },
    pin: {
      create: function (pins, isLoad) {
        // offset from preview-container size
        const preWidth = 100;
        const preHeight = 100;

        // offset from pin itself size
        const pinWidth = 40;
        const pinHeight = 40;

        for (let pinIndex = 0; pinIndex < pins.length; pinIndex++) {
          const pin = pins[pinIndex];
          const { x, y, created_at, content } = pin;
          const iHTML = document.createElement('i');
          iHTML.className = 'fas fa-thumbtack pin';
          iHTML.dataset.created_at = created_at;
          get('.whiteboard .pin-container').appendChild(iHTML);
          iHTML.innerHTML += `
            <div class="pin-text">
              <textarea name="pin-text">${content}</textarea>
              <i class="fas fa-trash-alt remove-btn"></i>
            </div>
          `;
          iHTML.style.left = `${x + preWidth / 2 - pinWidth / 2}px`;
          iHTML.style.top = `${y + preHeight / 2 - pinHeight / 2}px`;

          // add drag listener
          $(`.pin-container i[data-created_at="${created_at}"]`).draggable({
            containment: 'parent',
            stop: function (event, ui) {
              const left = +this.style.left.replace('px', '');
              const top = +this.style.top.replace('px', '');
              const created_at = this.dataset.created_at;

              // offset from preview-container size
              const preWidth = 100;
              const preHeight = 100;

              // offset from pin itself size
              const pinWidth = 40;
              const pinHeight = 40;

              const pin = {
                room: Model.room.name,
                user_id: Model.user.id,
                author: Model.user.name,
                created_at,
                // reverse offset
                x: left - (+ preWidth / 2 - pinWidth / 2),
                y: top - (+ preHeight / 2 - pinHeight / 2),
              };
              socket.emit('update whiteboard pin', JSON.stringify(pin));
            },
          });
        }

        if (isLoad) {
          // close all pins
          get('.whiteboard .pin-container').click();
        } else {
          // pin container
          get('.whiteboard .pin-container').classList.remove('pointer-none');
        }
      },
      update: function (pin) {
        const { created_at, content, x, y } = pin;
        if (content) {
          const pinTextareaHTML = get(`.whiteboard .pin-container [data-created_at="${created_at}"] textarea`);
          if (pinTextareaHTML) {
            pinTextareaHTML.value = content;
          }
        } else if (x && y) {
          // offset from preview-container size
          const preWidth = 100;
          const preHeight = 100;

          // offset from pin itself size
          const pinWidth = 40;
          const pinHeight = 40;

          const pinHTML = get(`.whiteboard .pin-container [data-created_at="${created_at}"]`);
          if (pinHTML) {
            pinHTML.style.left = `${x + preWidth / 2 - pinWidth / 2}px`;
            pinHTML.style.top = `${y + preHeight / 2 - pinHeight / 2}px`;
          }
        }
      },
      remove: function (pin) {
        const { created_at } = pin;
        get(`.whiteboard .pin-container [data-created_at="${created_at}"]`).remove();
      },
      clear: function () {
        get('.whiteboard .pin-container').innerHTML = '';
      },
      createHistoryWB: function () {
        // offset from preview-container size
        const preWidth = 100;
        const preHeight = 100;

        // offset from pin itself size
        const pinWidth = 40;
        const pinHeight = 40;

        get('.history-whiteboard-pin-container').innerHTML = '';
        const pins = Model.historyWB.find((wb) => get('.history-whiteboard img').src === wb.link).pins;
        for (let pinIndex = 0; pinIndex < pins.length; pinIndex++) {
          const pin = pins[pinIndex];
          const { x, y, content, created_at } = pin;

          get('.history-whiteboard-pin-container').innerHTML += `
            <i class="fas fa-thumbtack pin" data-created_at="${created_at}">
              <div class="pin-text">
                <textarea name="pin-text" disabled>${content}</textarea>
              </div>
            </i>
          `;

          const pinHTML = get(`.history-whiteboard-pin-container [data-created_at="${created_at}"]`);
          pinHTML.style.left = `${x + preWidth / 2 - pinWidth / 2}px`;
          pinHTML.style.top = `${y + preHeight / 2 - pinHeight / 2}px`;
        }
      },
    },
    draw: async function (record, requirement) {
      const { isTransfer } = requirement || {};

      if (record.isRemoved) {
        return;
      }

      // cancel ban undo feature
      if (record.user_id === Model.user.id && !isTransfer) {
        View.whiteboard.toggleUndoBtn(isBan = false);
      }

      if (record.type === 'line') {
        View.whiteboard.line.draw(record, requirement);
      } else if (record.type === 'image') {
        await View.whiteboard.image.draw(record, requirement);
      } else if (record.type === 'text') {
        View.whiteboard.text.draw(record, requirement);
      } else if (record.type === 'shape') {
        View.whiteboard.shape.draw(record, requirement);
      }

      const records = Model.whiteboard.records;
      if (records.length > 20) {
        await Controller.whiteboard.transferRecords();
      }
    },
    initWhiteboard: function () {
      ctxAll.fillStyle = '#FFFFFF';
      ctxAll.fillRect(0, 0, canvas.width, canvas.height);
    },
    redraw: async function () {
      View.whiteboard.initWhiteboard();

      for (let recordsIndex = 0; recordsIndex < Model.whiteboard.recordsTransfered.length; recordsIndex++) {
        const record = Model.whiteboard.recordsTransfered[recordsIndex];
        await View.whiteboard.draw(record, { isTransfer: true });
      }
    },
    displayMouseTrace: function (user_id, mouseTrace) {
      const { x, y } = mouseTrace;
      const userHTML = get(`.whiteboard .mouse-trace [data-user_id="${user_id}"]`);
      if (userHTML) {
        userHTML.style.top = `${y}px`;
        userHTML.style.left = `${x}px`;
      }
    },
    displayHistoryWB: function () {
      get('.history-whiteboard-list').innerHTML = '';

      for (let wbIndex = 0; wbIndex < Model.historyWB.length; wbIndex++) {
        const { link } = Model.historyWB[wbIndex];
        get('.history-whiteboard-list').innerHTML += `
          <img src="${link}" alt="">
        `;
      }
    },
    displayRoomTitle: function (title) {
      Model.room.title = title;
      get('.room-navbar .header .room-title span').innerHTML = title;
    },
    undoDraw: function (data) {
      const { user_id, created_at } = data;
      const timestampDay = Math.floor(+created_at / 86400000);
      const canvasLayer = get(`.canvas-container .day-container[data-day="${timestampDay}"] [data-created_at="${created_at}"]`);
      if (canvasLayer) {
        canvasLayer.classList.add('hide');
      }

      // add isRemoved
      const removedRecord = Model.whiteboard.records.find(record => user_id === record.user_id && created_at === record.created_at);
      if (removedRecord) {
        removedRecord.isRemoved = true;
      }
    },
    toggleUndoBtn: function (isBan) {
      if (isBan) {
        get('.whiteboard-toolbox .undo').classList.add('undo-disabled');
      } else {
        get('.whiteboard-toolbox .undo').classList.remove('undo-disabled');
      }
    },
  },
  chatbox: {
    displayNewMsg: function (msgObjs, isLoad) {
      if (isLoad && msgObjs.length === 0) {
        Model.chatbox.scrollLock = true;
        return;
      }
      for (let msgObjIndex = 0; msgObjIndex < msgObjs.length; msgObjIndex++) {
        const { user_id, sender, type, msg, time, created_at } = msgObjs[msgObjIndex];
        let htmlContent = '';
        // type text
        if (type === 'text') {
          if (user_id === Model.user.id) {
            htmlContent += `
              <div class="msg-self">
                You： ${msg}
                <span class="time-self">${time}</span>
              </div>
            `;
          } else {
            htmlContent += `
              <div class="msg-other">
                ${sender}： ${msg}
                <span class="time-other">${time}</span>
              </div>
            `;
          }
        } else if (type === 'notification') {
          htmlContent += `
            <div class="msg-notification">
              <div class="msg-notification-container">
                <div>${Controller.chatbox.getTime(created_at)}</div>
                <div>${msg}</div>
              </div>
            </div>
          `;
        } else if (type === 'whiteboard') {
          htmlContent += `
            <div class="msg-notification">
              <div class="msg-notification-container">
                <img src="${msg}" class="whiteboard-image">
              </div>
            </div>
          `;
        } else if (type === 'image') {
          if (user_id === Model.user.id) {
            htmlContent += `
              <div class="msg-self">
                You：
                <img src="${msg}" class="image-msg">
                <span class="time-self">${time}</span>
              </div>
            `;
          } else {
            htmlContent += `
              <div class="msg-other">
                ${sender}：
                <img src="${msg}" class="image-msg">
                <span class="time-other">${time}</span>
              </div>
            `;
          }
        }
        // load message or not
        if (isLoad) {
          get('.msg-container').insertAdjacentHTML('afterbegin', htmlContent);
        } else {
          get('.msg-container').insertAdjacentHTML('beforeend', htmlContent);
        }
      }

      //  first time load message and not load message
      const isFirstLoad = Model.chatbox.lastOldestCreated_at === 0;
      if (!isLoad || isFirstLoad) {
        View.chatbox.scrollToBottom(isFirstLoad);
      }
      // mark oldest created_at
      if (isLoad) {
        Model.chatbox.lastOldestCreated_at = msgObjs[msgObjs.length - 1].created_at;
        Model.chatbox.scrollLock = false;
      }
      // display new message tooltip
      const msgObj = msgObjs[0];
      const { user_id } = msgObj;
      if (!isLoad && user_id !== Model.user.id) {
        View.chatbox.displayNewMsgTooltip();
      }
    },
    scrollToBottom: function (isForceScrollToBottom) {
      const msgContainerHTML = get('.msg-container');
      if (isForceScrollToBottom) {
        msgContainerHTML.scrollTop = msgContainerHTML.scrollHeight;
        return;
      }

      const maxScrollTop = msgContainerHTML.scrollHeight - msgContainerHTML.offsetHeight;
      if (maxScrollTop - msgContainerHTML.scrollTop < msgContainerHTML.offsetHeight * 1.5) {
        msgContainerHTML.scrollTop = msgContainerHTML.scrollHeight;
      }
    },
    displayUserList: function (users) {
      let htmlContent = '';
      for (let userIndex = 0; userIndex < users.length; userIndex++) {
        htmlContent += `
          <div class="user">
            <span class="status"></span>
            <span class="name">${users[userIndex]}</span>
          </div>
        `;
      }
      get('.user-list .list-container').innerHTML = htmlContent;
    },
    displayNewMsgTooltip: function () {
      $('.new-msg-tooltip').tooltip('show');
    },
    displayNewCallTooltip: function () {
      $('.new-call-tooltip').tooltip('show');
    },
  },
};

const Controller = {
  whiteboard: {
    line: {
      prevX: 0,
      prevY: 0,
      currX: 0,
      currY: 0,
      isDrawing: false,
      record: {
        user_id: '',
        author: '',
        type: 'line',
        created_at: Date.now(),
        color: 'blue',
        width: '5',
        path: [],
      },
      getXY: function (action, e) {
        const { color, width } = Model.whiteboard;

        if (action === 'down') {
          canvasShape.classList.remove('hide');
          canvasShape.classList.add('pointer-none');

          this.prevX = this.currX;
          this.prevY = this.currY;
          this.currX = e.clientX - roomContainerHTML.offsetLeft - whiteboardHTML.offsetLeft + whiteboardHTML.scrollLeft + window.pageXOffset;
          this.currY = e.clientY - roomContainerHTML.offsetTop - whiteboardHTML.offsetTop + whiteboardHTML.scrollTop + window.pageYOffset;

          // trace boundary
          Model.whiteboard.boundary = {
            minX: this.currX,
            maxX: this.currX,
            minY: this.currY,
            maxY: this.currY,
          };

          this.record = {
            user_id: Model.user.id,
            author: Model.user.name,
            type: 'line',
            created_at: Date.now(),
            color,
            width,
            path: [[this.currX, this.currY]],
          };

          this.isDrawing = true;

          View.whiteboard.line.draw({
            author: 'self',
            color,
            width,
            path: [[this.currX, this.currY]],
          }, { isPreview: true });

          // mouse trace
          const mouseTrace = {
            x: this.currX,
            y: this.currY,
          };
          socket.emit('mouse trace', JSON.stringify({
            room: Model.room.name,
            user_id: this.record.user_id,
            mouseTrace
          }));

        } else if (action === 'move') {
          if (this.isDrawing) {
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = e.clientX - roomContainerHTML.offsetLeft - whiteboardHTML.offsetLeft + whiteboardHTML.scrollLeft + window.pageXOffset;
            this.currY = e.clientY - roomContainerHTML.offsetTop - whiteboardHTML.offsetTop + whiteboardHTML.scrollTop + window.pageYOffset;

            // trace boundary
            if (this.currX < Model.whiteboard.boundary.minX) {
              Model.whiteboard.boundary.minX = this.currX;
            }
            if (this.currX > Model.whiteboard.boundary.maxX) {
              Model.whiteboard.boundary.maxX = this.currX;
            }
            if (this.currY < Model.whiteboard.boundary.minY) {
              Model.whiteboard.boundary.minY = this.currY;
            }
            if (this.currY > Model.whiteboard.boundary.maxY) {
              Model.whiteboard.boundary.maxY = this.currY;
            }

            this.record.path.push([this.currX, this.currY]);

            View.whiteboard.line.draw({
              author: 'self',
              color,
              width,
              path: [[this.prevX, this.prevY], [this.currX, this.currY]],
            }, { isPreview: true });

            // mouse trace
            const mouseTrace = {
              x: this.currX,
              y: this.currY,
            };
            socket.emit('mouse trace', JSON.stringify({
              room: Model.room.name,
              user_id: this.record.user_id,
              mouseTrace
            }));
          }
        } else if (action === 'up' || action === 'out') {
          if (this.isDrawing) {
            Model.whiteboard.records.push(this.record);
            View.whiteboard.draw(this.record);
            View.whiteboard.shape.clear();
            // socket
            socket.emit('new draw', JSON.stringify({ room: Model.room.name, record: this.record }));
            // trace
            View.whiteboard.line.updateTrace(this.record, Model.whiteboard.boundary);
          }
          this.isDrawing = false;
          canvasShape.classList.add('hide');
          canvasShape.classList.remove('pointer-none');
        }
      }
    },
    shape: {
      category: 'line',
      position: {
        origX: 0,
        origY: 0,
        currX: 0,
        currY: 0,
      },
      isDrawing: false,
      getXY: function (action, e) {
        if (action === 'down') {
          this.position.origX = e.clientX - roomContainerHTML.offsetLeft - whiteboardHTML.offsetLeft + whiteboardHTML.scrollLeft + window.pageXOffset;
          this.position.origY = e.clientY - roomContainerHTML.offsetTop - whiteboardHTML.offsetTop + whiteboardHTML.scrollTop + window.pageYOffset;

          this.position.currX = this.position.origX;
          this.position.currY = this.position.origY;

          this.isDrawing = true;

        } else if (action === 'move') {
          if (this.isDrawing) {
            this.position.currX = e.clientX - roomContainerHTML.offsetLeft - whiteboardHTML.offsetLeft + whiteboardHTML.scrollLeft + window.pageXOffset;
            this.position.currY = e.clientY - roomContainerHTML.offsetTop - whiteboardHTML.offsetTop + whiteboardHTML.scrollTop + window.pageYOffset;

            // preview
            const category = this.category;
            const { color, width } = Model.whiteboard;
            const position = this.position;

            const record = {
              category: this.category,
              color,
              width,
              position,
            };
            View.whiteboard.shape.draw(record, { isPreview: true });

            // mouse trace
            const mouseTrace = {
              x: this.position.currX,
              y: this.position.currY,
            };
            socket.emit('mouse trace', JSON.stringify({
              room: Model.room.name,
              user_id: Model.user.id,
              mouseTrace
            }));

          }
        } else if (action === 'up' || action === 'out') {
          if (this.isDrawing) {
            const { color, width } = Model.whiteboard;

            const record = {
              user_id: Model.user.id,
              author: Model.user.name,
              type: 'shape',
              category: this.category,
              created_at: Date.now(),
              color,
              width,
              position: $.extend(true, {}, this.position),
            };

            View.whiteboard.draw(record);

            // clear
            View.whiteboard.shape.clear();

            canvasShape.classList.add('hide');
            this.isDrawing = false;

            Model.whiteboard.records.push(record);
            // emit
            socket.emit('new draw', JSON.stringify({ room: Model.room.name, record }));
          }
        }
      },
    },
    initListener: function () {
      // canvas
      canvas.addEventListener('mousedown', (e) => {
        if (Model.whiteboard.drawType === 'line') {
          Controller.whiteboard.line.getXY('down', e);
        }
      });
      canvas.addEventListener('mousemove', (e) => {
        if (Model.whiteboard.drawType === 'line') {
          Controller.whiteboard.line.getXY('move', e);
        }
      });
      canvas.addEventListener('mouseup', (e) => {
        if (Model.whiteboard.drawType === 'line') {
          Controller.whiteboard.line.getXY('up', e);
        }
      });
      canvas.addEventListener('mouseout', (e) => {
        if (Model.whiteboard.drawType === 'line') {
          Controller.whiteboard.line.getXY('out', e);
        }
      });

      // shape
      get('.whiteboard-toolbox .shape-container').addEventListener('click', async (e) => {
        canvasShape.classList.remove('hide');

        if (e.target.closest('.line')) {
          Controller.whiteboard.shape.category = 'line';
        } else if (e.target.closest('.rect')) {
          Controller.whiteboard.shape.category = 'rect';
        } else if (e.target.closest('.cir')) {
          Controller.whiteboard.shape.category = 'cir';
        } else if (e.target.closest('.tri')) {
          Controller.whiteboard.shape.category = 'tri';
        } else {
          return;
        }

        // save last draw shape for maintaining draw shape feature
        Model.whiteboard.lastDrawShapeNode = e.target.closest(`.${Controller.whiteboard.shape.category}`);
        get('.whiteboard-toolbox i.shape').classList.add('color-used');
      });
      // draw shape
      get('.whiteboard canvas.shape').addEventListener('mousedown', async (e) => {
        Controller.whiteboard.shape.getXY('down', e);
      });
      get('.whiteboard canvas.shape').addEventListener('mousemove', async (e) => {
        Controller.whiteboard.shape.getXY('move', e);
      });
      get('.whiteboard canvas.shape').addEventListener('mouseup', async (e) => {
        Controller.whiteboard.shape.getXY('up', e);

        // check last draw is shape
        if (Model.whiteboard.lastDrawShapeNode) {
          Model.whiteboard.lastDrawShapeNode.click();
        }
      });
      get('.whiteboard canvas.shape').addEventListener('mouseout', async (e) => {
        Controller.whiteboard.shape.getXY('out', e);

        // check last draw is shape
        if (Model.whiteboard.lastDrawShapeNode) {
          Model.whiteboard.lastDrawShapeNode.click();
        }
      });

      // toolbox cancel all feature
      get('.whiteboard-toolbox').addEventListener('mousedown', (e) => {
        if (e.target.tagName !== 'I') {
          return;
        }

        // image
        get('.image-whiteboard-preview-container').classList.add('hide');
        // clear input value
        get('.whiteboard-toolbox input[name="image-whiteboard"]').value = '';
        Model.whiteboard.image.imagePosition = [200, 120];

        // text
        get('.text-whiteboard-preview-container').classList.add('hide');
        // clear input value
        get('.text-whiteboard-preview-container input').value = '';
        Model.whiteboard.text.textPosition = [200, 120];

        // pin
        get('.pin-whiteboard-preview-container').classList.add('hide');
        Model.whiteboard.pin.pinPosition = [200, 120];

        // cancel maintain draw image
        canvasShape.classList.add('hide');
        Model.whiteboard.lastDrawShapeNode = undefined;

        // cancel color-used
        if (get('.whiteboard-toolbox i.color-used')) {
          get('.whiteboard-toolbox i.color-used').classList.remove('color-used');
        }
        // add color-used to pen except draw shape
        if (!e.target.closest('.shape-container')) {
          get('.whiteboard-toolbox i.pen').classList.add('color-used');
        }
      });

      // color
      get('.color-btn-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('color-btn')) {
          Model.whiteboard.color = e.target.dataset.color || Model.whiteboard.color;
          get('.now-color').classList.remove('now-color');
          e.target.classList.add('now-color');
        }
      });

      // width
      get('.width-btn-container input').addEventListener('input', (e) => {
        Model.whiteboard.width = e.target.value || Model.whiteboard.width;
      });

      // text size
      get('.text-container input').addEventListener('input', (e) => {
        get('.text-whiteboard-preview-container input').style.fontSize = `${e.target.value}px`;
        get('.whiteboard-toolbox .text-container .size span').innerHTML = e.target.value;
      });

      // create new
      get('.whiteboard-toolbox .new').addEventListener('click', async (e) => {
        if (Model.whiteboard.records.length === 0 && Model.whiteboard.recordsTransfered.length === 0) {
          return;
        }

        Swal.fire({
          title: 'Oops...',
          text: 'Are you sure to create a new whiteboard?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes'
        }).then(async (result) => {
          if (result.value) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Your new whiteboard has been created.'
            });

            const imageFilename = await Controller.whiteboard.newWhiteboard();
            socket.emit('new whiteboard', JSON.stringify({
              room: Model.room.name, user_id: Model.user.id, user: Model.user.name, imageFilename
            }));
            // clear pin
            View.whiteboard.pin.clear();
          }
        });
      });

      // download
      get('.whiteboard-toolbox .download').addEventListener('click', (e) => {
        Controller.whiteboard.downloadWhiteboard();
      });

      // add image on whiteboard
      get('.whiteboard-toolbox .add-image').addEventListener('click', (e) => {
        get('.whiteboard-toolbox input[name="image-whiteboard"]').click();
      });
      // preview upload image on whiteboard
      get('.whiteboard-toolbox input[name="image-whiteboard"]').addEventListener('change', (e) => {
        const file = get('.whiteboard-toolbox input[name="image-whiteboard"]').files[0];
        const image = URL.createObjectURL(file);

        // check file extension
        const extension = file.name.split('.').pop();
        if (!extension.match(/^(jpg|jpeg|png|svg)$/i)) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Only image files are available.',
          });
          return;
        }

        get('.image-whiteboard-preview-container img.preview').src = image;
        get('.image-whiteboard-preview-container').classList.remove('hide');
        const [left, top] = Model.whiteboard.image.imagePosition;
        get('.image-whiteboard-preview-container img.preview').style.left = `${left}px`;
        get('.image-whiteboard-preview-container img.preview').style.top = `${top}px`;
      });

      // add drag listener
      $('.image-whiteboard-preview-container img.preview').draggable({
        containment: 'parent',
        stop: function (event, ui) {
          const left = +this.style.left.replace('px', '');
          const top = +this.style.top.replace('px', '');
          Model.whiteboard.image.imagePosition = [left, top];
        },
      });
      // draw image on whiteboard
      get('.image-whiteboard-preview-container').addEventListener('mousedown', async (e) => {
        if (e.target.tagName !== 'IMG') {
          const room = Model.room.name;
          const { width, height } = get('.image-whiteboard-preview-container img.preview').getBoundingClientRect();
          const [x, y] = Model.whiteboard.image.imagePosition;
          const created_at = Date.now();
          const user_id = Model.user.id;
          // let the user who upload the image no need to wait for the uploading delay
          await View.whiteboard.draw({ user_id, x, y, width, height, link: URL.createObjectURL(get('.whiteboard-toolbox input[name="image-whiteboard"]').files[0]), created_at, type: 'image' });
          get('.image-whiteboard-preview-container').classList.add('hide');
          Model.whiteboard.image.imagePosition = [200, 120];

          // trace
          View.whiteboard.image.updateTrace({ user_id: Model.user.id }, x, y, width, height);

          // upload and send new draw
          const imageFilename = await Controller.whiteboard.uploadImage();
          const link = `${AWS_CLOUDFRONT_DOMAIN}/images/${room}/${imageFilename}`;
          const record = {
            user_id,
            author: Model.user.name,
            type: 'image',
            created_at,
            x,
            y,
            width,
            height,
            link,
          };
          socket.emit('new draw', JSON.stringify({ room, record }));
          Model.whiteboard.records.push(record);
          // clear input value
          get('.whiteboard-toolbox input[name="image-whiteboard"]').value = '';
        }
      });

      // add text on whiteboard
      get('.whiteboard-toolbox .add-text').addEventListener('click', (e) => {
        get('.text-whiteboard-preview-container').classList.remove('hide');
        get('.text-whiteboard-preview-container input').focus();
        const [left, top] = Model.whiteboard.text.textPosition;
        get('.text-whiteboard-preview-container input').style.left = `${left}px`;
        get('.text-whiteboard-preview-container input').style.top = `${top}px`;
      });
      // move text
      get('.text-whiteboard-preview-container input').addEventListener('mousedown', (e) => {
        Model.whiteboard.text.textReferencePosition = [e.clientX, e.clientY];
        Model.whiteboard.text.textMovable = true;
      });
      get('.text-whiteboard-preview-container input').addEventListener('mouseup', (e) => {
        const left = +get('.text-whiteboard-preview-container input').style.left.replace('px', '');
        const top = +get('.text-whiteboard-preview-container input').style.top.replace('px', '');
        Model.whiteboard.text.textPosition = [left, top];
        Model.whiteboard.text.textMovable = false;
      });
      get('.text-whiteboard-preview-container input').addEventListener('mouseout', (e) => {
        if (e.relatedTarget.closest('.text-whiteboard-preview-container')) {
          return;
        }
        const left = +get('.text-whiteboard-preview-container input').style.left.replace('px', '');
        const top = +get('.text-whiteboard-preview-container input').style.top.replace('px', '');
        Model.whiteboard.text.textPosition = [left, top];
        Model.whiteboard.text.textMovable = false;
      });
      get('.text-whiteboard-preview-container').addEventListener('mousemove', (e) => {
        if (!Model.whiteboard.text.textMovable) {
          return;
        }
        const dx = Model.whiteboard.text.textPosition[0] + e.clientX - Model.whiteboard.text.textReferencePosition[0];
        const dy = Model.whiteboard.text.textPosition[1] + e.clientY - Model.whiteboard.text.textReferencePosition[1];
        get('.text-whiteboard-preview-container input').style.left = `${dx}px`;
        get('.text-whiteboard-preview-container input').style.top = `${dy}px`;
      });
      // draw text
      get('.text-whiteboard-preview-container').addEventListener('mousedown', async (e) => {
        if (e.target.tagName !== 'INPUT') {
          if (get('.text-whiteboard-preview-container input').value.replace(/\s/g, '') !== '') {
            const room = Model.room.name;
            const [x, y] = Model.whiteboard.text.textPosition;
            const content = get('.text-whiteboard-preview-container input').value;
            const size = get('.text-whiteboard-preview-container input').style.fontSize || '32px';
            const record = {
              user_id: Model.user.id,
              author: Model.user.name,
              type: 'text',
              created_at: Date.now(),
              x,
              y,
              content,
              size,
            };
            View.whiteboard.draw(record);
            socket.emit('new draw', JSON.stringify({ room, record }));
            Model.whiteboard.records.push(record);
          }
          get('.text-whiteboard-preview-container').classList.add('hide');
          Model.whiteboard.text.textPosition = [200, 120];
          get('.text-whiteboard-preview-container input').value = '';
        }
      });

      // add pin on whiteboard
      get('.whiteboard-toolbox .add-pin').addEventListener('click', (e) => {
        get('.pin-whiteboard-preview-container').classList.remove('hide');
        get('.pin-whiteboard-preview-container i.pin').focus();
        const [left, top] = Model.whiteboard.pin.pinPosition;
        get('.pin-whiteboard-preview-container i.pin').style.left = `${left}px`;
        get('.pin-whiteboard-preview-container i.pin').style.top = `${top}px`;
      });

      // add drag listener
      $('.pin-whiteboard-preview-container i.pin').draggable({
        containment: 'parent',
        stop: function (event, ui) {
          const left = +this.style.left.replace('px', '');
          const top = +this.style.top.replace('px', '');
          Model.whiteboard.pin.pinPosition = [left, top];
        },
      });
      // draw pin
      get('.pin-whiteboard-preview-container').addEventListener('mousedown', async (e) => {
        if (e.target.tagName !== 'I') {
          const room = Model.room.name;
          const [x, y] = Model.whiteboard.pin.pinPosition;

          const pin = {
            room: Model.room.name,
            user_id: Model.user.id,
            author: Model.user.name,
            created_at: Date.now(),
            x,
            y,
            content: '',
          };
          View.whiteboard.pin.create([pin]);
          socket.emit('new whiteboard pin', JSON.stringify(pin));

          get('.pin-whiteboard-preview-container').classList.add('hide');
          Model.whiteboard.pin.pinPosition = [200, 120];
        }
      });
      // pin container
      get('.whiteboard .pin-container').addEventListener('click', async (e) => {
        if (!e.target.closest('.pin')) {
          get('.whiteboard .pin-container').classList.add('pointer-none');
          const pins = getAll('.whiteboard .pin-container .pin-text:not(.hide)');
          for (let pinIndex = 0; pinIndex < pins.length; pinIndex++) {
            pins[pinIndex].classList.add('hide');
          }
        } else {
          get('.whiteboard .pin-container').classList.remove('pointer-none');
          if (e.target.classList.contains('pin') && Model.whiteboard.pin.pinClickable) {
            e.target.closest('.pin').querySelector('.pin-text').classList.toggle('hide');
          }
        }

        // remove pin
        if (e.target.closest('.remove-btn')) {
          const pinHTML = e.target.closest('.pin');
          const created_at = pinHTML.dataset.created_at;

          const pin = {
            room: Model.room.name,
            user_id: Model.user.id,
            created_at,
          };
          View.whiteboard.pin.remove(pin);
          socket.emit('remove whiteboard pin', JSON.stringify(pin));
        }
      });
      // update pin text
      get('.whiteboard .pin-container').addEventListener('change', (e) => {
        const pinHTML = e.target.closest('.pin');
        const created_at = pinHTML.dataset.created_at;
        const content = e.target.value;

        const pin = {
          room: Model.room.name,
          user_id: Model.user.id,
          author: Model.user.name,
          created_at,
          content,
        };

        socket.emit('update whiteboard pin', JSON.stringify(pin));
      });

      // display history whitaboard container
      get('.whiteboard-toolbox .display-history-whiteboard').addEventListener('click', async (e) => {
        await Controller.whiteboard.loadHistoryWB();
        View.whiteboard.displayHistoryWB();
        get('.history-whiteboard-container').classList.remove('hide');
      });
      // hide history whitaboard container
      get('.history-whiteboard-container').addEventListener('click', (e) => {
        if (e.target.closest('.close-btn')) {
          get('.history-whiteboard-container').classList.add('hide');
        }

        if (e.target.closest('.pin')) {
          e.target.querySelector('.pin-text').classList.toggle('hide');
        }
      });
      // display history whiteboard
      get('.history-whiteboard-list').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
          get('.history-whiteboard img').src = e.target.src;
          View.whiteboard.pin.createHistoryWB();
        }
      });

      // leave room
      get('.leave-room-btn').addEventListener('click', async (e) => {
        Swal.fire({
          title: 'Oops...',
          text: 'Are you sure to leave the classroom?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes'
        }).then(async (result) => {
          if (result.value) {
            location.href = '/dashboard.html';
          }
        });
      });

      // edit room title
      get('.room-title').addEventListener('click', (e) => {
        if (e.target === document.activeElement) {
          return;
        }
        const title = get('.room-title span').innerHTML;
        get('.room-title span').classList.add('hide');
        get('.room-title input').classList.remove('hide');
        get('.room-title input').value = title;
        get('.room-title input').focus();
      });
      // modify room title
      get('.room-title input').addEventListener('focusout', (e) => {
        const title = get('.room-title input').value || 'Untitled';
        get('.room-title input').classList.add('hide');
        get('.room-title span').innerHTML = title;
        get('.room-title span').classList.remove('hide');

        // emit to modify all rooms
        if (title !== Model.room.title) {
          Model.room.title = title;

          const user_id = Model.user.id;
          const room = Model.room.name;
          const roomObj = {
            user_id,
            room,
            title,
          };
          socket.emit('update room title', JSON.stringify(roomObj));
        }
      });

      // undo draw
      get('.whiteboard-toolbox .undo').addEventListener('click', (e) => {
        Controller.whiteboard.undoDraw();
      });
      // ctrl + z
      document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'z') {
          Controller.whiteboard.undoDraw();
        }
      });

    },
    uploadWhiteboardImage: async function () {
      const blob = await getCanvasBlob(canvasAll);
      const formData = new FormData();
      const imageFilename = `whiteboard-${getNowTimeString()}-${getRandomString(8)}.png`;
      formData.append('image', blob, imageFilename);
      formData.append('room', getQuery().room);
      const url = API_HOST + '/room/image';

      await fetch(url, {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
        .then(resObj => {
          if (resObj.error) {
            return;
          }
        })
        .catch(error => console.log(error));

      return imageFilename;

      function getCanvasBlob(canvas) {
        return new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) {
            resolve(blob);
          });
        });
      }
    },
    uploadImage: async function () {
      const formData = new FormData();
      const file = get('.whiteboard-toolbox input[name="image-whiteboard"]').files[0];
      const filename = `image-${getNowTimeString()}-${getRandomString(8)}.${file.name.split('.').pop()}`;
      formData.append('image', file, filename);
      formData.append('room', getQuery().room);
      const url = API_HOST + '/room/image';

      await fetch(url, {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
        .then(resObj => {
          if (resObj.error) {
            return;
          }
        })
        .catch(error => console.log(error));

      return filename;
    },
    updateTraceList: function (users, user, user_id, state) {
      const traceHTML = get('.whiteboard .trace');
      const mouseTraceHTML = get('.whiteboard .mouse-trace');
      const traceUserHTML = get(`.whiteboard .trace [data-user_id="${user_id}"]`);
      const mouseUserHTML = get(`.whiteboard .mouse-trace [data-user_id="${user_id}"]`);

      if (state === 'leave') {
        if (traceUserHTML) {
          traceUserHTML.remove();
        }
        if (mouseUserHTML) {
          mouseUserHTML.remove();
        }

      } else if (state === 'join') {

        if (Model.user.id === user_id) {
          let htmlContent = '';
          for (const user_id in users) {
            htmlContent += `
            <div class="author" data-user_id="${user_id}">
              <span>${users[user_id]}</span>
            </div>
          `;
          }
          traceHTML.innerHTML = htmlContent;
          mouseTraceHTML.innerHTML = htmlContent;

        } else {

          if (!traceUserHTML) {
            traceHTML.innerHTML += `
              <div class="author" data-user_id="${user_id}">
                <span>${user}</span>
              </div>
            `;
          }
          if (!mouseUserHTML) {
            mouseTraceHTML.innerHTML += `
              <div class="author" data-user_id="${user_id}">
                <span>${user}</span>
              </div>
            `;
          }

        }
      }
    },
    loadHistoryWB: async function () {
      const access_JWT = localStorage.getItem('access_JWT');
      const url = API_HOST + `/whiteboard/${Model.room.name}`;
      await fetch(url, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${access_JWT}`,
        },
      }).then(res => res.json())
        .then(resObj => {
          if (resObj.error) {
            console.log(resObj.error);
            return;
          }
          Model.historyWB = resObj.data;

          if (Model.historyWB.length > 0) {
            get('.history-whiteboard .no-whiteboard-title').classList.add('hide');
          }
        })
        .catch(error => console.log(error));
    },
    addCanvasLayer: function (data) {
      const { created_at, user_id } = data;

      canvasLayer = document.createElement('canvas');
      canvasLayer.width = 1550;
      canvasLayer.height = 750;
      canvasLayer.dataset.user_id = user_id;
      canvasLayer.dataset.created_at = created_at;
      canvasLayer.style.zIndex = created_at % 86400000;
      canvasLayer.classList.add('layer');

      const timestampDay = Math.floor(created_at / 86400000);
      let canvasContainerDayHTML = get(`.canvas-container .day-container[data-day="${timestampDay}"]`);
      if (!canvasContainerDayHTML) {
        const div = document.createElement('div');
        div.classList.add('day-container');
        div.dataset.day = timestampDay;
        div.style.zIndex = timestampDay;
        get('.canvas-container').appendChild(div);
        canvasContainerDayHTML = div;
      }

      canvasContainerDayHTML.appendChild(canvasLayer);
      const ctxLayer = canvasLayer.getContext('2d');
      Model.whiteboard.ctx = ctxLayer;
    },
    drawToCanvasAll: async function (records) {
      for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
        const record = records[recordIndex];
        await View.whiteboard.draw(record, { isTransfer: true });
      }
    },
    transferRecords: async function (requirement) {
      if (Model.whiteboard.records.length === 0) {
        View.whiteboard.toggleUndoBtn(isBan = true);
        return;
      }

      const { isAll } = requirement || {};

      if (isAll) {
        const records = Model.whiteboard.records;
        Model.whiteboard.recordsTransfered.push(...records);
        await Controller.whiteboard.drawToCanvasAll(records);
        Model.whiteboard.records = [];
        get('.canvas-container').innerHTML = '';
      } else {
        const record = Model.whiteboard.records.shift();
        Model.whiteboard.recordsTransfered.push(record);

        const { created_at } = record;
        const timestampDay = Math.floor(+created_at / 86400000);
        const canvasLayer = get(`.canvas-container .day-container[data-day="${timestampDay}"] [data-created_at="${created_at}"]`);
        if (canvasLayer) {
          await Controller.whiteboard.drawToCanvasAll([record]);
          canvasLayer.remove();
        }
      }

      // check ban undo feature
      const ownUnremovedRecord = Model.whiteboard.records.find(record => Model.user.id === record.user_id && !record.isRemoved);
      if (!ownUnremovedRecord) {
        View.whiteboard.toggleUndoBtn(isBan = true);
      }
    },
    newWhiteboard: async function () {
      await Controller.whiteboard.transferRecords({ isAll: true });
      Model.whiteboard.recordsTransfered = [];
      const imageFilename = await Controller.whiteboard.uploadWhiteboardImage();
      View.whiteboard.initWhiteboard();
      return imageFilename;
    },
    downloadWhiteboard: async function () {
      // temporarily draw
      const records = Model.whiteboard.records;
      await Controller.whiteboard.drawToCanvasAll(records);

      const link = document.createElement('a');
      link.download = `whiteboard-${getNowTimeString()}-${getRandomString(8)}.png`;
      link.href = canvasAll.toDataURL();
      link.click();

      // return to original state
      View.whiteboard.redraw();
    },
    undoDraw: function () {
      // find last draw by self
      const user_id = Model.user.id;
      const room = Model.room.name;
      const records = Model.whiteboard.records;
      const undoRecords = [];
      for (let recordIndex = records.length - 1; recordIndex >= 0; recordIndex--) {
        const record = records[recordIndex];
        if (user_id === record.user_id && !record.isRemoved) {
          if (undoRecords.length === 0) {
            record.isRemoved = true;
          }

          undoRecords.push(record);

          if (undoRecords.length > 1) {
            break;
          }
        }
      }

      if (undoRecords.length === 0) {
        return;
      }

      if (undoRecords.length > 0) {
        const created_at = undoRecords[0].created_at;
        const undoObj = {
          room,
          user_id,
          created_at,
        };
        View.whiteboard.undoDraw({ user_id, created_at });
        socket.emit('undo draw', JSON.stringify(undoObj));
      }

      // ban undo feature
      if (undoRecords.length === 1) {
        View.whiteboard.toggleUndoBtn(isBan = true);
      }
    },
  },
  chatbox: {
    initListener: function () {
      // send message
      // for click send button
      get('.chatbox .send-btn').addEventListener('click', Controller.chatbox.sendMsg);
      // for press enter
      get('.chatbox .send-msg textarea').addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
          e.preventDefault();
          Controller.chatbox.sendMsg();
        }
      });
      // click and copy room invite url
      get('.chatbox-toolbox .copy-link').addEventListener('click', (e) => {
        const link = `${HOMEPAGE_URL}/room.html?room=${Model.room.name}&token=${Model.room.token}`;
        get('.copy-link input[name="invite-url"]').value = link;
        const copyText = get('.copy-link input[name="invite-url"]');
        copyText.setAttribute('type', 'text');
        copyText.select();
        document.execCommand("copy");
        copyText.setAttribute('type', 'hidden');
        // copy invite url hint
        const msgHTML = get('.copy-link .copy-invite-url-msg');
        if (!msgHTML.classList.contains('show-hide')) {
          msgHTML.classList.remove('hide');
          msgHTML.classList.add('show-hide');
          setTimeout(function () {
            msgHTML.classList.add('hide');
            msgHTML.classList.remove('show-hide');
          }, 2000);
        }
      });
      // add image
      get('.chatbox .send-msg').addEventListener('click', (e) => {
        if (e.target.closest('.add-image-btn')) {
          get('.chatbox .send-msg input[name="image"]').click();
        }
      });
      // preview upload image
      get('.chatbox .send-msg input[name="image"]').addEventListener('change', (e) => {
        const file = get('.chatbox .send-msg input[name="image"]').files[0];
        const image = URL.createObjectURL(file);

        // check file extension
        const extension = file.name.split('.').pop();
        if (!extension.match(/^(jpg|jpeg|png|svg)$/i)) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Only image files are available.',
          });
          return;
        }

        get('.chatbox .send-msg img.preview').src = image;
        get('.chatbox .send-msg .preview-container').classList.remove('hide');
      });
      // send or cancel image
      get('.chatbox .send-msg .option-container').addEventListener('click', async (e) => {
        if (e.target.tagName === 'I') {
          get('.chatbox .send-msg .preview-container').classList.add('hide');

          const btnHTML = e.target.closest('i');
          if (btnHTML.classList.contains('send-image-btn')) {
            const imageFilename = await Controller.chatbox.uploadImage();
            const user_id = Model.user.id;
            const room = Model.room.name;
            const sender = Model.user.name;
            const type = 'image';
            const msg = `${AWS_CLOUDFRONT_DOMAIN}/images/${room}/${imageFilename}`;
            const time = Controller.chatbox.getTime();

            const msgObj = {
              user_id,
              room,
              sender,
              type,
              msg,
              time,
              created_at: Date.now()
            };
            View.chatbox.displayNewMsg([{ user_id, sender, type, msg, time }]);
            socket.emit('new chat msg', JSON.stringify(msgObj));
          }

          get('.chatbox .send-msg input[name="image"]').value = '';
        }
      });
      // display large size image for small message image
      get('.chatbox .msg-container').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
          const src = e.target.src;
          get('.chatbox-large-image-container img').src = src;
          get('.chatbox-large-image-container').classList.remove('hide');
        }
      });
      // close large size image
      get('.chatbox-large-image-container').addEventListener('click', (e) => {
        if (e.target.tagName !== 'IMG') {
          get('.chatbox-large-image-container').classList.add('hide');
        }
      });
      // load history chat message when scroll
      get('.msg-container').onscroll = () => {
        const msgContainerHTML = get('.msg-container');
        if (get('.msg-container').scrollTop <= msgContainerHTML.offsetHeight * 1.5 && !Model.chatbox.scrollLock) {
          // lock
          Model.chatbox.scrollLock = true;
          const lastOldestCreated_at = Model.chatbox.lastOldestCreated_at;
          socket.emit('load chat msg', JSON.stringify({
            room: getQuery().room, lastOldestCreated_at
          }));
        }
      };

      // call
      get('.chatbox-toolbox i.call').addEventListener('click', (e) => {
        if (PeerjsCall.isConnecting) {
          return;
        }
        PeerjsCall.connect();

        e.target.classList.toggle('fa-phone');
        e.target.classList.toggle('fa-phone-slash');
        e.target.classList.toggle('color-used');
        if (e.target.classList.contains('fa-phone')) {
          get('.chatbox-toolbox i.users').classList.add('fa-users');
          get('.chatbox-toolbox i.users').classList.remove('fa-users-slash');
          get('.chatbox-toolbox i.users').classList.add('color-used');
          get('.call-container').classList.remove('hide');
          get('.whiteboard').scrollTop = 0;
          get('.whiteboard').classList.add('overflow-hidden');

        } else {
          get('.chatbox-toolbox i.users').classList.remove('fa-users');
          get('.chatbox-toolbox i.users').classList.add('fa-users-slash');
          get('.chatbox-toolbox i.users').classList.remove('color-used');
          get('.call-container').classList.add('hide');
          get('.whiteboard').classList.remove('overflow-hidden');
        }
        PeerjsCall.isAudio = false;
        get('.chatbox-toolbox i.audio').classList.remove('fa-microphone');
        get('.chatbox-toolbox i.audio').classList.add('fa-microphone-slash');
        get('.chatbox-toolbox i.audio').classList.remove('color-used');
        PeerjsCall.isVedio = false;
        get('.chatbox-toolbox i.video').classList.remove('fa-video');
        get('.chatbox-toolbox i.video').classList.add('fa-video-slash');
        get('.chatbox-toolbox i.video').classList.remove('color-used');
      });
      // display all users video
      get('.chatbox-toolbox i.users').addEventListener('click', (e) => {
        e.target.classList.toggle('fa-users');
        e.target.classList.toggle('fa-users-slash');
        e.target.classList.toggle('color-used');
        get('.call-container').classList.toggle('hide');
        get('.whiteboard').scrollTop = 0;
        get('.whiteboard').classList.toggle('overflow-hidden');
      });
      // audio
      get('.chatbox-toolbox i.audio').addEventListener('click', (e) => {
        PeerjsCall.toggleAudio();
        if (PeerjsCall.isAudio) {
          e.target.classList.add('fa-microphone');
          e.target.classList.remove('fa-microphone-slash');
          e.target.classList.add('color-used');
        } else {
          e.target.classList.remove('fa-microphone');
          e.target.classList.add('fa-microphone-slash');
          e.target.classList.remove('color-used');
        }
      });
      // video
      get('.chatbox-toolbox i.video').addEventListener('click', (e) => {
        PeerjsCall.toggleVedio();
        if (PeerjsCall.isVedio) {
          e.target.classList.add('fa-video');
          e.target.classList.remove('fa-video-slash');
          e.target.classList.add('color-used');
        } else {
          e.target.classList.remove('fa-video');
          e.target.classList.add('fa-video-slash');
          e.target.classList.remove('color-used');
        }
      });

      // display chatbox toggle
      get('.chatbox-toolbox i.chat').addEventListener('click', (e) => {
        get('.room-container .chatbox').classList.toggle('display');
        get('.chatbox-toolbox i.chat').classList.toggle('color-used');
        // call container
        get('.call-container').classList.toggle('narrow');
      });
      // close chatbox
      get('.chatbox .header .close-btn').addEventListener('click', (e) => {
        get('.room-container .chatbox').classList.remove('display');
        get('.chatbox-toolbox i.chat').classList.remove('color-used');
        // call container
        get('.call-container').classList.remove('narrow');
      });

      // display user list
      get('.chatbox .show-list').addEventListener('click', (e) => {
        get('.room-container .user-list').classList.toggle('display');
        get('.chatbox .show-list').classList.toggle('color-used');
      });

      // close new message tooltip
      get('.chatbox-toolbox .chat').addEventListener('mouseover', (e) => {
        $('.new-msg-tooltip').tooltip('hide');
      });
      get('.chatbox').addEventListener('mouseover', (e) => {
        $('.new-msg-tooltip').tooltip('hide');
      });

      // close new call tooltip
      get('.chatbox-toolbox .call').addEventListener('click', (e) => {
        $('.new-call-tooltip').tooltip('hide');
      });
    },
    sendMsg: function () {
      const msg = get('.chatbox .send-msg textarea').value;
      if (msg.replace(/\s/g, '') === '') {
        return;
      }
      const user_id = Model.user.id;
      const sender = Model.user.name;
      const type = 'text';
      const time = Controller.chatbox.getTime();
      const msgObj = {
        user_id,
        room: Model.room.name,
        sender,
        type,
        msg,
        time,
        created_at: Date.now()
      };
      View.chatbox.displayNewMsg([{ user_id, sender, type, msg, time }]);
      socket.emit('new chat msg', JSON.stringify(msgObj));
      get('.chatbox .send-msg textarea').value = '';
      View.chatbox.scrollToBottom(true);
    },
    getTime: function (timestamp) {
      const nowTime = timestamp ? new Date(+timestamp) : new Date();
      const hour24 = nowTime.getHours();
      const hour12 = ('0' + hour24 % 12).substr(-2);
      const minute = ('0' + nowTime.getMinutes()).substr(-2);
      return `${hour12}:${minute} ${hour24 > 12 ? 'p.m.' : 'a.m.'}`;
    },
    uploadImage: async function () {
      const formData = new FormData();
      const file = get('.chatbox .send-msg input[name="image"]').files[0];
      const filename = `image-${getNowTimeString()}-${getRandomString(8)}.${file.name.split('.').pop()}`;
      formData.append('image', file, filename);
      formData.append('room', getQuery().room);
      const url = API_HOST + '/room/image';

      await fetch(url, {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
        .then(resObj => {
          if (resObj.error) {
            return;
          }
        })
        .catch(error => console.log(error));

      return filename;
    },
  },
};

// whiteboard
View.whiteboard.initWhiteboard();
Controller.whiteboard.initListener();

// chatbox
Controller.chatbox.initListener();

// bootstrap
// tooltip
$(function () {
  $('.whiteboard-toolbox [data-toggle="tooltip"]').tooltip({ offset: '0px, 10px' });
  $('.chatbox-toolbox [data-toggle="tooltip"]').tooltip({ offset: '0px, 5px' });
});