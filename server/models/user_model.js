require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
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
      photo: photo || null
    };
    // const accessToken = jwt.sign({
    //   name: user.name,
    //   password: user.password
    // }, TOKEN_SECRET);
    // user.access_token = accessToken;

    const queryStr = 'INSERT INTO user SET ?';
    const result = await query(queryStr, user);

    user.id = result.insertId;
    await commit();
    return { user };
  } catch (error) {
    console.log(error);
    await rollback();
    return { error };
  }
};

// const nativeSignIn = async (email, password) => {
//   try {
//     await transaction();

//     const users = await query('SELECT * FROM user WHERE email = ?', [email]);
//     const user = users[0];
//     if (!bcrypt.compareSync(password, user.password)) {
//       await commit();
//       return { error: 'Password is wrong' };
//     }

//     const loginAt = new Date();
//     const accessToken = jwt.sign({
//       provider: user.provider,
//       name: user.name,
//       email: user.email,
//       picture: user.picture
//     }, TOKEN_SECRET);

//     const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
//     await query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);

//     await commit();

//     user.access_token = accessToken;
//     user.login_at = loginAt;
//     user.access_expired = TOKEN_EXPIRE;
//     return { user };
//   } catch (error) {
//     await rollback();
//     return { error };
//   }
// };

// const facebookSignIn = async (id, roleId, name, email) => {
//   try {
//     await transaction();
//     const loginAt = new Date();
//     const user = {
//       provider: 'facebook',
//       role_id: roleId,
//       email: email,
//       name: name,
//       picture: 'https://graph.facebook.com/' + id + '/picture?type=large',
//       access_expired: TOKEN_EXPIRE,
//       login_at: loginAt
//     };
//     const accessToken = jwt.sign({
//       provider: user.provider,
//       name: user.name,
//       email: user.email,
//       picture: user.picture
//     }, TOKEN_SECRET);
//     user.access_token = accessToken;

//     const users = await query('SELECT id FROM user WHERE email = ? AND provider = \'facebook\' FOR UPDATE', [email]);
//     let userId;
//     if (users.length === 0) { // Insert new user
//       const queryStr = 'insert into user set ?';
//       const result = await query(queryStr, user);
//       userId = result.insertId;
//     } else { // Update existed user
//       userId = users[0].id;
//       const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ?  WHERE id = ?';
//       await query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, userId]);
//     }
//     user.id = userId;

//     await commit();

//     return { user };
//   } catch (error) {
//     await rollback();
//     return { error };
//   }
// };

// const getUserDetail = async (email, roleId) => {
//   try {
//     if (roleId) {
//       const users = await query('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
//       return users[0];
//     } else {
//       const users = await query('SELECT * FROM user WHERE email = ?', [email]);
//       return users[0];
//     }
//   } catch (e) {
//     return null;
//   }
// };

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
  signUp
  // nativeSignIn,
  // facebookSignIn,
  // getUserDetail,
  // getFacebookProfile,
  // getViewList
};
