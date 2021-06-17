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
for (let i = 1; i < count; i++) {
  const url = `https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=${i}&q=1`;

  request(url, async (err, res, body) => {
    try {
      const $ = cheerio.load(body);
      const data = [];
      $('#idiomTab tbody tr td').each(function (i, elem) {
        data.push($(this).text().split('\n'));
      });
      const idiom = data[0][0];
      if (idiom.length === 4) {
        await pool.query('INSERT into draw.question(question,type,inuse) values (?,?,?)', [idiom, 'idiom', 0]);
      }
      return;
    } catch {
      console.log(err);
    }
  });
}
