
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
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const redis = require('socket.io-redis');
io.adapter(redis({ host: REDIS_HOST, port: 6379 }));

const { socketCon } = require('./util/socketcon');
socketCon(io);
// const your_namespace_socket = io.of('');
// your_namespace_socket.on('connection', function (socket) {
//   io.to('room1').emit('some event');
//   socket.on('join', function (room) {
//     console.log('2');
//     console.log(room);
//     socket.join(room); // log other socket.io-id's in the room
//     your_namespace_socket.adapter.clients([room], (err, clients) => {
//       console.log(clients);
//     });
//   });
// });
// const redisClient = require('redis').createClient();
// redisClient.publish('channelName', '123');

// const redisSub = require('redis').createClient();
// redisSub.subscribe('channelName', 'moreChannels');

// redisSub.on('message', function (channel, message) {
//   io.emit(channel, message);
// });

// Page not found
app.use(function (req, res, next) {
  res.status(404).redirect('/404.html');
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
