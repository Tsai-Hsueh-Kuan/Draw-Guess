
require('dotenv').config();
const { rateLimiterRoute } = require('./util/ratelimiter');
const { PORT_TEST, PORT, NODE_ENV, API_VERSION, REDIS_HOST } = process.env;
const port = NODE_ENV === 'test' ? PORT_TEST : PORT;
// Express Initialization
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.set('trust proxy', true);
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json({ limit: '210000kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS allow all
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/homepage.html'), (err) => {
    if (err) res.status(404).redirect('/404.html');
  });
});
// API routes
app.use('/api/' + API_VERSION,
  rateLimiterRoute,
  [
    require('./server/routes/user_route'),
    require('./server/routes/game_route')
  ]
);

// socket.io
// const server = require('http').createServer(app);
// const io = require('socket.io')(server, {
//   cors: {
//     origin: 'localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });
// const { socketCon } = require('./util/socketcon');
// socketCon(io);

// const redis = require('socket.io-redis');
// io.adapter(redis({ host: REDIS_HOST, port: 6379 }));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: REDIS_HOST, port: 6379 }));

io.emit('hello', 'to all clients');
io.to('room42').emit('hello', "to all clients in 'room42' room");

io.on('connection', (socket) => {
  socket.on('hello', (msg) => {
    console.log(msg);
  });
  socket.broadcast.emit('hello', 'to all clients except sender');
  socket.to('room42').emit('hello', "to all clients in 'room42' room except sender");
});

// const io2 = io.of('');

// setTimeout(() => {
//   io.emit('hi', 'all sockets');
//   io2.emit('hi', 'all sockets');
// }, 5000);

// io2.on('connection', (socket) => {
//   socket.on('message-all', (data) => {
//     console.log(data);
//     io2.emit('message-all', data);
//   });

//   socket.on('hi', (data) => {
//     console.log(data);
//     io2.emit('message-all', data);
//   });

//   socket.on('join', (room) => {
//     socket.join(room);
//     console.log(room);
//     io2.emit('message-all', 'Socket ' + socket.id + ' joined to room ' + room);
//   });

//   socket.on('message-room', (data) => {
//     const room = data.room;
//     const message = data.message;
//     console.log(data);
//     io2.to(room).emit('message-room', data);
//   });
// });

// Page not found
app.use(function (req, res, next) {
  res.status(404).redirect('/404.html');
});

io.on('hello', async (msg) => {
  console.log(msg);
});
// Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

if (NODE_ENV !== 'production') {
  server.listen(port, () => { console.log(`Listening on port: ${port}`); });
}

module.exports = app;
