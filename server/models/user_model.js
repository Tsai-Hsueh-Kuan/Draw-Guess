require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');
const { TOKEN_EXPIRE, TOKEN_SECRET, IP } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

const passwordencryption = function (password) {
  const hash = createHash('sha256');
  hash.update(password);
  return (hash.digest('hex'));
};

const signUp = async (name, password, photo) => {
  try {
    await transaction();
    const nameCheck = await query('SELECT name FROM user WHERE name = ? FOR UPDATE', name);
    if (nameCheck.length > 0) {
      await commit();
      return { error: 'Name Already Exists' };
    }

    const user = {
      password: passwordencryption(password),
      name: name,
      photo: photo || null,
      score: 0
    };

    const queryStr = 'INSERT INTO user SET ?';
    const result = await query(queryStr, user);
    user.id = result.insertId;
    const accessToken = jwt.sign({
      id: user.id,
      name: user.name
    }, TOKEN_SECRET, { expiresIn: '36000s' });
    user.access_token = accessToken;

    await commit();
    return { user };
  } catch (error) {
    console.log(error);
    await rollback();
    return { error };
  }
};

const signIn = async (name, password) => {
  try {
    await transaction();
    const nameCheck = await query('SELECT * FROM user WHERE name = ? FOR UPDATE', name);
    if (!nameCheck[0]) {
      return { error: 'please check your name' };
    }
    if (nameCheck[0].password !== passwordencryption(password)) {
      await commit();
      return { error: 'Password is wrong' };
    }
    const user = {
      id: nameCheck[0].id,
      password: passwordencryption(password),
      name: nameCheck[0].name,
      photo: nameCheck[0].photo
    };
    const accessToken = jwt.sign({
      id: nameCheck[0].id,
      name: user.name
    }, TOKEN_SECRET, { expiresIn: '36000s' });

    user.access_token = accessToken;
    await commit();
    return { user };
  } catch (error) {
    console.log(error);
    await rollback();
    return { error };
  }
};

const getUserDetail = async (userId) => {
  try {
    const userDetail = await query('SELECT * FROM user WHERE id = ?', userId);
    if (userDetail[0].photo) {
      userDetail[0].photo = IP + userDetail[0].photo;
    }

    return userDetail[0];
  } catch (error) {
    return null;
  }
};

// const getFacebookProfile = async function (accessToken) {
//   try {
//     const res = await got('https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken, {
//       responseType: 'json'
//     });
//     return res.body;
//   } catch (e) {
//     console.log(e);
//     throw ('Permissions Error: facebook access token is wrong');
//   }
// };

// const getViewList = async (id) => {
//   // let id_list = await query(`SELECT DISTINCT * FROM view_count WHERE user_id = ${id} ORDER BY create_at`);
//   const id_list = await query(`SELECT DISTINCT inner_select.product_id,inner_select.id FROM (SELECT * FROM view_count WHERE user_id = ${id} ORDER BY create_at desc ) AS inner_select`);
//   const id_list_r = id_list.reverse();
//   const id_time = [];
//   for (const i in id_list_r) {
//     let ans = 0;
//     for (let j = 0; j < i; j++) {
//       if (id_time[j] === id_list_r[i].product_id) {
//         ans = 1;
//       }
//     }
//     if (ans === 0) {
//       id_time.push(id_list_r[i].product_id);
//     }
//   }
//   id_time.splice(12);
//   const list_array = [];
//   for (const i in id_time) {
//     const list = await query(`SELECT * FROM product WHERE id =${id_time[i]}`);
//     list_array.push(...list);
//   }
//   return list_array;
// };

module.exports = {
  signUp,
  signIn,
  // nativeSignIn,
  // facebookSignIn,
  getUserDetail
  // getFacebookProfile,
  // getViewList
};
