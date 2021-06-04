require('dotenv').config();
const { pool } = require('../../util/mysqlcon');
const { TOKEN_SECRET, IP } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

const passwordencryption = function (password) {
  try {
    const hash = createHash('sha256');
    hash.update(password);
    return (hash.digest('hex'));
  } catch (error) {
    return error;
  }
};

const signUp = async (name, password, photo) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const nameCheck = await conn.query('SELECT name FROM user WHERE name = ? FOR UPDATE', name);
    if (nameCheck[0].length > 0) {
      await conn.query('COMMIT');
      return { error: 'Name Already Exists' };
    }
    const user = {
      password: passwordencryption(password),
      name: name,
      photo: photo || null,
      score: 0,
      heart: 0
    };
    const queryStr = 'INSERT INTO user SET ?';
    const result = await conn.query(queryStr, user);
    user.id = result[0].insertId;
    const accessToken = jwt.sign({
      id: user.id,
      name: user.name
    }, TOKEN_SECRET);
    user.access_token = accessToken;
    await conn.query('COMMIT');
    return { user };
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

const signIn = async (name, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const nameCheck = await conn.query('SELECT * FROM user WHERE name = ? FOR UPDATE', name);
    if (!nameCheck[0][0]) {
      return { error: 'please check your name' };
    }
    if (nameCheck[0][0].password !== passwordencryption(password)) {
      await conn.query('COMMIT');
      return { error: 'Password is wrong' };
    }
    const user = {
      id: nameCheck[0][0].id,
      password: passwordencryption(password),
      name: nameCheck[0][0].name,
      photo: nameCheck[0][0].photo
    };
    const accessToken = jwt.sign({
      id: nameCheck[0][0].id,
      name: user.name
    }, TOKEN_SECRET);

    user.access_token = accessToken;
    await conn.query('COMMIT');
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

const getUserDetail = async (userId) => {
  try {
    const userDetail = await pool.query('SELECT * FROM user WHERE id = ?', userId);
    if (userDetail[0][0].photo) {
      userDetail[0][0].photo = IP + userDetail[0][0].photo;
    }
    return userDetail[0][0];
  } catch (error) {
    return error;
  }
};

const replacePhoto = async (id, photo) => {
  try {
    await pool.query('UPDATE draw.user SET photo = ? where id = ?', [photo, id]);
  } catch (error) {
    return error;
  }
};

const uploadPhoto = async (id, photo) => {
  try {
    await pool.query('UPDATE draw.user SET photo = ? where id = ?', [photo, id]);
    photo = IP + photo;
    return photo;
  } catch (error) {
    return error;
  }
};

const testRate = async () => {
  try {
    await pool.query('SELECT * FROM draw.canvas');
    return;
  } catch (error) {
    return error;
  }
};

module.exports = {
  signUp,
  signIn,
  getUserDetail,
  replacePhoto,
  uploadPhoto,
  testRate
};
