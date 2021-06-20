require('dotenv').config();
const mysql = require('mysql2/promise');
const { NODE_ENV, DB_HOST, DB_USER, DB_PWD, DB_DB, DB_HOST_TEST, DB_USER_TEST, DB_PWD_TEST, DB_DB_TEST } = process.env;
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
    host: DB_HOST_TEST,
    user: DB_USER_TEST,
    password: DB_PWD_TEST,
    database: DB_DB_TEST,
    waitForConnections: true,
    connectionLimit: 100
  }
};

const pool = mysql.createPool(mysqlConfig[env]);

module.exports = {
  mysql,
  pool
};
