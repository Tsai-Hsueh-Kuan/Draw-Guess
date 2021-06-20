const { pool } = require('../../util/mysqlcon.js');
const { TOKEN_SECRET, IP } = process.env;
const jwt = require('jsonwebtoken');

const getquestion = async (type) => {
  try {
    if (!type) {
      return 'err';
    }
    const [question] = await pool.query('SELECT * from question where type = ? AND inuse = 0 ORDER BY RAND() limit 1', type);
    return question;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateInuse = async (type) => {
  try {
    await pool.query('UPDATE question SET inuse = 0 where type = ?', type);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const resetInuse = async (id) => {
  try {
    await pool.query('UPDATE question SET inuse = 1 where id = ?', id);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getGame = async (questionId, hostId) => {
  try {
    const [result] = await pool.query('INSERT into game(question_id,report,status,host_id) values(?,?,?,?)', [questionId, 0, 9, hostId]);
    return result.insertId;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getHistory = async (gameId, userId, record) => {
  try {
    const sqlValue = [];
    for (const i in userId) {
      sqlValue.push([gameId, userId[i], record]);
    }
    await pool.query('INSERT into history(game_id,user_id,record) values ?', [sqlValue]);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateHistory = async (gameId, userId, record) => {
  try {
    await pool.query('UPDATE history SET record = ? where game_id = ? AND user_id = ?', [record, gameId, userId]);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateScore = async (score, userId, hostId, gameId) => {
  try {
    const [totalList] = await pool.query('SELECT * from draw.history where game_id = ?', gameId);
    const totalCount = totalList.length;
    const hostScore = Math.ceil(score / totalCount);
    await pool.query('UPDATE user SET score = score + ? where id = ? ', [hostScore, hostId]);
    await pool.query('UPDATE user SET score = score + ? where id = ? ', [score, userId]);
    return hostScore;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const inputCanvas = async (gameId, canvasNum, canvasData, data) => {
  try {
    await pool.query('INSERT INTO draw.canvas (game_id,canvas_num,canvas_data,canvas_undo) VALUES (?,?,?,?)', [gameId, canvasNum, canvasData, data]);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const verifyTokenSocket = (token) => {
  try {
    const user = jwt.verify(token, TOKEN_SECRET);
    return user;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getRank = async () => {
  try {
    const [data] = await pool.query('SELECT id,name,photo,score from draw.user order by score desc limit 20');
    for (const i in data) {
      if (data[i].photo) {
        data[i].photo = IP + data[i].photo;
      }
    }
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getUser = async (userId) => {
  try {
    const [data] = await pool.query('SELECT id,name,photo,score from draw.user where id = ?', userId);
    for (const i in data) {
      if (data[i].photo) {
        data[i].photo = IP + data[i].photo;
      }
    }
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const checkGameCanvas = async (gameId) => {
  try {
    const [data] = await pool.query('SELECT id from draw.canvas where game_id = ?', gameId);
    if (data[0]) {
      return;
    } else {
      await pool.query('UPDATE draw.game SET status = 1 where id = ?', gameId);
      return;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const canvasUpdate = async (gameId) => {
  try {
    const [data] = await pool.query('SELECT * from draw.canvas where game_id = ?', gameId);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateReport = async (gameId, reason, userId) => {
  try {
    const [totalList] = await pool.query('SELECT * from draw.history where game_id = ? AND record <> "only view"', gameId);
    const totalCount = totalList.length;
    await pool.query('UPDATE draw.game SET report = report + 1 where id = ?', gameId);
    await pool.query('INSERT into draw.report(game_id,reason,report_user_id) values (?,?,?)', [gameId, reason, userId]);
    const [reportCount] = await pool.query('SELECT report from draw.game where id = ?', gameId);
    if (parseInt(reportCount[0].report) * 2 > totalCount) {
      await pool.query('UPDATE draw.game SET status = 1 where id = ?', gameId);
      return 'need check';
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateHeart = async (hostId) => {
  try {
    await pool.query('UPDATE user SET heart = heart + 1 where id = ? ', [hostId]);
    const [heartCount] = await pool.query('SELECT heart from user where id = ? ', [hostId]);
    return heartCount[0].heart;
  } catch (error) {
    console.log(error);
    return error;
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
  updateReport,
  updateHeart
};
