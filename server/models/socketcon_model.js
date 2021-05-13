const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');

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

module.exports = {
  getquestion,
  updateInuse,
  resetInuse,
  getGame,
  getHistory,
  updateHistory
};
