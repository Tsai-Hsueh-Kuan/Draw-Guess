require('dotenv').config();
const { pool } = require('../../util/mysqlcon.js');
const { IP } = process.env;

const getGameInfo = async (gameId) => {
  try {
    const [historyCheck] = await pool.query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? order by draw.history.record', gameId);
    for (const i in historyCheck) {
      delete historyCheck[i].password;
      if (historyCheck[i].photo) {
        historyCheck[i].photo = IP + historyCheck[i].photo;
      }
    }

    const [gameCheck] = await pool.query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.id = ?', gameId);
    const data = {
      game: gameCheck,
      history: historyCheck
    };
    return { data: data };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getPendingGame = async () => {
  try {
    const [gameCheck] = await pool.query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.status = 9 limit 1');
    const data = {
      game: gameCheck
    };
    return { data: data };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const gameStatus = async (status, gameId) => {
  try {
    await pool.query('UPDATE draw.game SET status = ? where id = ?', [status, gameId]);
    return 'ok';
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  getGameInfo,
  gameStatus,
  getPendingGame
};
