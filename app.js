require('dotenv').config();
const {PORT_TEST, PORT, NODE_ENV, API_VERSION} = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : PORT;
// Express Initialization
const express = require('express');
const cors = require('cors');
const app = express();

app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json({limit : '2100000kb'}));
app.use(express.urlencoded({extended:true}));

// CORS allow all
app.use(cors());

// API routes
app.use('/api/' + API_VERSION,
    [
        require('./server/routes/test_route'),
    ]
);
// socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
io.on('connection', (socket) => {
  socket.on('abc', (msg)=>{
    // console.log(msg);
    socket.broadcast.emit('new order', msg);
  })
});

// Page not found
app.use(function(req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Error handling
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).send('Internal Server Error');
});

if (NODE_ENV != 'production'){
    server.listen(port, () => {console.log(`Listening on port: ${port}`);});
}


module.exports = app;
