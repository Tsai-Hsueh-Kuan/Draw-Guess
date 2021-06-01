
require('dotenv').config();
const { rateLimiterRoute } = require('./util/ratelimiter');
const { PORT_TEST, PORT, NODE_ENV, API_VERSION } = process.env;
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

// const fs = require('fs');
// const PeerServer = require('peer').PeerServer;

// const { ExpressPeerServer } = require('peer');
// const { PeerServer } = require('peer');
// const peerServer = PeerServer({ port: PORT_PEER_SERVER, path: '/call' });

// const { Emitter } = require('@socket.io/redis-emitter');
// const { createClient } = require('redis'); // not included, needs to be explicitly installed

// const redisClient = createClient();
// const io2 = new Emitter(redisClient);

// setInterval(() => {
//   io2.emit('time', new Date());
// }, 5000);

// const cluster = require('cluster');
// const http = require('http');
// const { Server } = require('socket.io');
// const redisAdapter = require('socket.io-redis');
// const numCPUs = require('os').cpus().length;
// console.log(numCPUs);
// const { setupMaster, setupWorker } = require('@socket.io/sticky');
// let server;
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   server = require('http').createServer(app);
//   setupMaster(server, {
//     loadBalancingMethod: 'least-connection' // either "random", "round-robin" or "least-connection"
//   });

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } else {
//   console.log(`Worker ${process.pid} started`);

//   server = require('http').createServer(app);
//   const io = new Server(server);
//   io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
//   setupWorker(io);

//   io.on('connection', (socket) => {
//     /* ... */
//   });
// }
// socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const { socketCon } = require('./util/socketcon');
socketCon(io);

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
