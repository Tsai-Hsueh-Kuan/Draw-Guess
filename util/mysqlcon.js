require('dotenv').config();
const mysql = require('mysql');
const { promisify } = require('util');
const { NODE_ENV, DB_HOST, DB_USER, DB_PWD, DB_DB } = process.env;
const env = NODE_ENV || 'production';

const mysqlConfig = {
  production: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB,
    waitForConnections: true,
    connectionLimit: 5000
  },
  development: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB,
    waitForConnections: true,
    connectionLimit: 5000
  },
  test: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB,
    waitForConnections: true,
    connectionLimit: 5000
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

const mysqlCon = mysql.createConnection(mysqlConfig[env]);
const promiseQuery = promisify(mysqlCon.query).bind(mysqlCon);
const promiseTransaction = promisify(mysqlCon.beginTransaction).bind(mysqlCon);
const promiseCommit = promisify(mysqlCon.commit).bind(mysqlCon);
const promiseRollback = promisify(mysqlCon.rollback).bind(mysqlCon);
const promiseEnd = promisify(mysqlCon.end).bind(mysqlCon);

module.exports = {
  core: mysql,
  query: promiseQuery,
  transaction: promiseTransaction,
  commit: promiseCommit,
  rollback: promiseRollback,
  end: promiseEnd
};
