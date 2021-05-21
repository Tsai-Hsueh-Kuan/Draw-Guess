require('dotenv').config();
const { PORT_TEST, PORT, NODE_ENV, API_VERSION } = process.env;
const port = NODE_ENV === 'test' ? PORT_TEST : PORT;
// Express Initialization
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json({ limit: '2100000kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS allow all
app.use(cors());

const { core, query, transaction, commit, rollback, end } = require('./util/mysqlcon.js');
const cheerio = require('cheerio');
app.get('/testgetdata', async (req, res) => {
  const aa = await query('SELECT question from draw.question where id = 2084');
  console.log(aa);
  const a = await query('DELETE from draw.question where question = ?', aa[0].question);
  console.log(a);
  // const request = require('request');
  // const url = 'https://lingokids.com/english-for-kids/animals';
  // request(url, (err, res, body) => {
  //   const englishList = [];
  //   try {
  //     const $ = cheerio.load(body);
  //     const weathers = [];
  //     $('.elementor-13514 .elementor-element.elementor-element-b3e5474').each(function (i, elem) {
  //       weathers.push($(this).text().split('\n'));
  //     });
  //     for (let i = 0; i < 300; i++) {
  //       if (weathers[0][48 + (i)] && weathers[0][48 + (i)] !== ' ') {
  //         try {
  //           query('INSERT into question(question,type,inuse) values (?,?,?)', [weathers[0][48 + (i)], 'english', 0]);
  //         } catch {
  //           console.log('err');
  //         }
  //       }
  //     }
  //   } catch {
  //     return err;
  //   }
  // });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/homepage.html'), (err) => {
    if (err) res.send(404);
  });
});
// API routes
app.use('/api/' + API_VERSION,
  [
    require('./server/routes/user_route'),
    require('./server/routes/game_route')
  ]
);

// socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { socketCon } = require('./util/socketcon');
socketCon(io);

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
