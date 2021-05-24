require('dotenv').config();
const mysql = require('mysql2/promise');
const multipleStatements = (process.env.NODE_ENV === 'test');
const { NODE_ENV, DB_HOST, DB_USER, DB_PWD, DB_DB } = process.env;
const env = NODE_ENV || 'production';

const mysqlConfig = {
  production: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB,
    waitForConnections: true,
    connectionLimit: 100
  },
  development: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB,
    waitForConnections: true,
    connectionLimit: 100
  },
  test: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB,
    waitForConnections: true,
    connectionLimit: 100
  }
};
// const mysqlCon = mysql.createPool(mysqlConfig[env]);

// const promiseQuery = (query, bindings) => {
//   return promisify(mysqlCon.query).bind(mysqlCon)(query, bindings);
// };
// const promiseTransaction = (beginTransaction, bindings) => {
//   return promisify(mysqlCon.beginTransaction).bind(mysqlCon)(beginTransaction, bindings);
// };
// const promiseCommit = (promiseCommit, bindings) => {
//   return promisify(mysqlCon.promiseCommit).bind(mysqlCon)(promiseCommit, bindings);
// };
// const promiseRollback = (promiseRollback, bindings) => {
//   return promisify(mysqlCon.promiseRollback).bind(mysqlCon)(promiseRollback, bindings);
// };
// const promiseEnd = (promiseEnd, bindings) => {
//   return promisify(mysqlCon.promiseEnd).bind(mysqlCon)(promiseEnd, bindings);
// };

// const mysqlCon = mysql.createConnection(mysqlConfig[env]);
// const promiseQuery = promisify(mysqlCon.query).bind(mysqlCon);
// const promiseTransaction = promisify(mysqlCon.beginTransaction).bind(mysqlCon);
// const promiseCommit = promisify(mysqlCon.commit).bind(mysqlCon);
// const promiseRollback = promisify(mysqlCon.rollback).bind(mysqlCon);
// const promiseEnd = promisify(mysqlCon.end).bind(mysqlCon);

const pool = mysql.createPool(mysqlConfig[env]);
// const promisePool = pool.promise();
// async function main () {
//   const a = await promisePool.query('SELECT * from draw.user where id = 1');
//   console.log(a[0][0].name);
// }
// main();
module.exports = {
  mysql,
  pool
  // promisePool
};
