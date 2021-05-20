const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');
const User = require('./user_model');
const { TOKEN_SECRET, IP } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const getquestion = async (type) => {
  if (!type) {
    return 'err';
  }
  const question = await query('SELECT * from question where type = ? AND inuse = 0 ORDER BY RAND() limit 1', type);
  return question;
};

const updateInuse = async (type) => {
  await query('UPDATE question SET inuse = 0 where type = ?', type);
};

const resetInuse = async (id) => {
  await query('UPDATE question SET inuse = 1 where id = ?', id);
};

const getGame = async (questionId, hostId) => {
  const result = await query('INSERT into game(question_id,report,need_check,host_id) values(?,?,?,?)', [questionId, 0, 0, hostId]);
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
    // console.log('wrong token');
    return 'err';
  }
};

const getRank = async () => {
  const data = await query('SELECT id,name,photo,score from draw.user order by score desc');
  for (const i in data) {
    if (data[i].photo) {
      data[i].photo = IP + data[i].photo;
    }
  }
  return data;
};

const getUser = async (userId) => {
  const data = await query('SELECT id,name,photo,score from draw.user where id = ?', userId);
  for (const i in data) {
    if (data[i].photo) {
      data[i].photo = IP + data[i].photo;
    }
  }
  return data;
};

const checkGameCanvas = async (gameId) => {
  try {
    const data = await query('SELECT id from draw.canvas where game_id = ?', gameId);
    if (data[0]) {
    } else {
      await query('DELETE from draw.game where id = ?', gameId);
      await query('DELETE from draw.history where game_id = ?', gameId);
      return;
    }
  } catch {
    console.log('del err');
    return 'err';
  }
};
const canvasUpdate = async (gameId) => {
  const data = await query('SELECT * from draw.canvas where game_id = ?', gameId);
  return data;
};

const updateReport = async (gameId) => {
  const totalList = await query('SELECT * from draw.history where game_id = ? AND record <> "only view"', gameId);
  const totalCount = totalList.length;
  await query('UPDATE draw.game SET report = report + 1 where id = ?', gameId);
  const reportCount = await query('SELECT report from draw.game where id = ?', gameId);
  if (parseInt(reportCount[0].report) * 2 > totalCount) {
    await query('UPDATE draw.game SET need_check = 1 where id = ?', gameId);
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
