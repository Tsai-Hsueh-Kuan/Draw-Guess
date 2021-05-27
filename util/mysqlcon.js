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

const pool = mysql.createPool(mysqlConfig[env]);

module.exports = {
  mysql,
  pool
};
