const { pool } = require('../../util/mysqlcon.js');
const User = require('./user_model');
const { TOKEN_SECRET, IP } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const getquestion = async (type) => {
  if (!type) {
    return 'err';
  }
  const question = await pool.query('SELECT * from question where type = ? AND inuse = 0 ORDER BY RAND() limit 1', type);
  return question[0];
};

const updateInuse = async (type) => {
  await pool.query('UPDATE question SET inuse = 0 where type = ?', type);
};

const resetInuse = async (id) => {
  await pool.query('UPDATE question SET inuse = 1 where id = ?', id);
};

const getGame = async (questionId, hostId) => {
  const result = await pool.query('INSERT into game(question_id,report,need_check,host_id) values(?,?,?,?)', [questionId, 0, 0, hostId]);
  return result[0].insertId;
};
const getHistory = async (gameId, userId, record) => {
  const sqlValue = [];
  for (const i in userId) {
    sqlValue.push([gameId, userId[i], record]);
  }
  await pool.query('INSERT into history(game_id,user_id,record) values ?', [sqlValue]);
};

const updateHistory = async (gameId, userId, record) => {
  await pool.query('UPDATE history SET record = ? where game_id = ? AND user_id = ?', [record, gameId, userId]);
};

const updateScore = async (score, userId) => {
  await pool.query('UPDATE user SET score = score + ? where id = ? ', [score, userId]);
};

const inputCanvas = async (gameId, canvasNum, canvasData, data) => {
  await pool.query('INSERT INTO draw.canvas (game_id,canvas_num,canvas_data,canvas_undo) VALUES (?,?,?,?)', [gameId, canvasNum, canvasData, data]);
};

const verifyTokenSocket = (token) => {
  try {
    const user = jwt.verify(token, TOKEN_SECRET);
    return user;
  } catch {
    // console.log('wrong token');
    return 'err';
  }
};

const getRank = async () => {
  const data = await pool.query('SELECT id,name,photo,score from draw.user order by score desc');
  for (const i in data[0]) {
    if (data[0][i].photo) {
      data[0][i].photo = IP + data[0][i].photo;
    }
  }
  return data[0];
};

const getUser = async (userId) => {
  const data = await pool.query('SELECT id,name,photo,score from draw.user where id = ?', userId);
  for (const i in data[0]) {
    if (data[0][i].photo) {
      data[0][i].photo = IP + data[0][i].photo;
    }
  }
  return data[0];
};

const checkGameCanvas = async (gameId) => {
  try {
    const data = await pool.query('SELECT id from draw.canvas where game_id = ?', gameId);
    if (data[0][0]) {
    } else {
      await pool.query('DELETE from draw.game where id = ?', gameId);
      await pool.query('DELETE from draw.history where game_id = ?', gameId);
      return;
    }
  } catch {
    console.log('del err');
    return 'err';
  }
};
const canvasUpdate = async (gameId) => {
  const data = await pool.query('SELECT * from draw.canvas where game_id = ?', gameId);
  return data[0];
};

const updateReport = async (gameId, reason, userId) => {
  const totalList = await pool.query('SELECT * from draw.history where game_id = ? AND record <> "only view"', gameId);
  const totalCount = totalList[0].length;
  await pool.query('UPDATE draw.game SET report = report + 1 where id = ?', gameId);
  await pool.query('INSERT into draw.report(game_id,reason,report_user_id) values (?,?,?)', [gameId, reason, userId]);
  const reportCount = await pool.query('SELECT report from draw.game where id = ?', gameId);
  if (parseInt(reportCount[0][0].report) * 2 > totalCount) {
    await pool.query('UPDATE draw.game SET need_check = 1 where id = ?', gameId);
    return 'need check';
  }
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
  getUser,
  checkGameCanvas,
  canvasUpdate,
  updateReport
};
