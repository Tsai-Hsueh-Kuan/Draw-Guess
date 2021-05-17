const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');
const User = require('./user_model');
const { TOKEN_SECRET, IP } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const getquestion = async (type) => {
  const question = await query('SELECT * from question where type = ? AND inuse = 0 limit 1', type);
  return question;
};

const updateInuse = async (type) => {
  await query('UPDATE question SET inuse = 0 where type = ?', type);
};

const resetInuse = async (id) => {
  await query('UPDATE question SET inuse = 1 where id = ?', id);
};

const getGame = async (questionId, hostId) => {
  const result = await query('INSERT into game(question_id,host_id) values(?,?)', [questionId, hostId]);
  return result.insertId;
};
const getHistory = async (gameId, userId, record) => {
  const sqlValue = [];
  for (const i in userId) {
    sqlValue.push([gameId, userId[i], record]);
  }
  await query('INSERT into history(game_id,user_id,record) values ?', [sqlValue]);
};

const updateHistory = async (gameId, userId, record) => {
  await query('UPDATE history SET record = ? where game_id = ? AND user_id = ?', [record, gameId, userId]);
};

const updateScore = async (score, userId) => {
  await query('UPDATE user SET score = score + ? where id = ? ', [score, userId]);
};

const inputCanvas = async (gameId, canvasNum, canvasData, data) => {
  await query('INSERT INTO draw.canvas (game_id,canvas_num,canvas_data,canvas_undo) VALUES (?,?,?,?)', [gameId, canvasNum, canvasData, data]);
};

const verifyTokenSocket = (token) => {
  try {
    const user = jwt.verify(token, TOKEN_SECRET);
    return user;
  } catch {
    console.log('wrong token');
    return 'err';
  }
};

const getRank = async () => {
  const data = await query('SELECT id,name,photo,score from draw.user order by score desc limit 10');
  for (const i in data) {
    if (data[i].photo) {
      data[i].photo = IP + data[i].photo;
    }
  }
  return data;
};

const getUser = async (userId) => {
  const data = await query('SELECT id,name,photo from draw.user where id = ?', userId);
  return data;
};
module.exports = {
  getquestion,
  updateInuse,
  resetInuse,
  getGame,
  getHistory,
  updateHistory,
  updateScore,
  inputCanvas,
  verifyTokenSocket,
  getRank,
  getUser
};
