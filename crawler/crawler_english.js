require('dotenv').config();
const { DB_HOST, DB_USER, DB_PWD, DB_DB } = process.env;
const cheerio = require('cheerio');

const mysql = require('mysql2/promise');
const mysqlConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PWD,
  database: DB_DB,
  waitForConnections: true,
  connectionLimit: 100
};

const pool = mysql.createPool(mysqlConfig);

const count = 0;
const request = require('request');
const url = 'https://lingokids.com/english-for-kids/animals';
request(url, async (err, res, body) => {
  try {
    const $ = cheerio.load(body);
    const data = [];
    $('.elementor-13514 .elementor-element.elementor-element-b3e5474').each(function (i, elem) {
      data.push($(this).text().split('\n'));
    });
    for (let i = 0; i < count; i++) {
      if (data[0][48 + (i)] && data[0][48 + (i)] !== ' ') {
        try {
          const english = data[0][48 + (i)];
          await pool.query('INSERT into draw.question(question,type,inuse) values (?,?,?)', [english, 'english', 0]);
        } catch {
          console.log('err');
        }
      }
    }
  } catch {
    return err;
  }
});
