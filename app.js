require('dotenv').config();
const { PORT_TEST, PORT, NODE_ENV, API_VERSION } = process.env;
const port = NODE_ENV === 'test' ? PORT_TEST : PORT;
// Express Initialization
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json({ limit: '2100000kb' }));
app.use(express.urlencoded({ extended: true }));

const { promisify } = require('util');

const redis = require('redis');
const cache = redis.createClient(6379, 'localhost', { no_ready_check: true });
cache.on('ready', () => {
  console.log('redis is ready');
});
cache.on('error', () => {
  console.log('redis is error');
});
const promisifyget = promisify(cache.get).bind(cache);
const promisifyset = promisify(cache.set).bind(cache);

// CORS allow all
app.use(cors());

// API routes
app.use('/api/' + API_VERSION,
  [
    require('./server/routes/test_route')
  ]
);
// socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
io.on('connection', (socket) => {
  socket.on('abc', async (msg) => {
    if (cache.ready) {
      await promisifyset(msg.number, msg.url, 'Ex', 60);
      socket.broadcast.emit('new order', msg.url);
    }
  });
  socket.on('undo', (msg) => {
    socket.broadcast.emit('undo msg', msg);
  });
  socket.on('redo', async (msg) => {
    if (cache.ready) {
      const redoUrl = await promisifyget(msg);
      if (redoUrl) {
        socket.broadcast.emit('new order', redoUrl);
        socket.emit('redo url', redoUrl);
      }
    }
  });
});

// Page not found
app.use(function (req, res, next) {
  res.status(404).send('page not found');
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
