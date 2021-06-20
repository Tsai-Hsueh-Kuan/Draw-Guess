require('dotenv').config();
const { pool } = require('../../util/mysqlcon.js');
const { IP } = process.env;
const getSingleGame = async (id, type) => {
  try {
    const [gameIdList] = await pool.query('SELECT draw.game.id from draw.game left join draw.question on draw.game.question_id = draw.question.id where draw.game.host_id <> ? AND draw.question.type = ? AND draw.game.status = 0', [id, type]);
    const gameIdListArr = gameIdList.map(x => x.id);
    const [gameIdCheck] = await pool.query('SELECT game_id from draw.history where user_id = ?', id);
    const gameIdCheckArr = gameIdCheck.map(x => x.game_id);

    const result = gameIdListArr.filter((e) => {
      return gameIdCheckArr.indexOf(e) === -1;
    });
    if (!result[0]) {
      return { error: '已無更多題庫給您' };
    } else {
      const randomQuestion = Math.floor(Math.random() * result.length);
      const [historyCheck] = await pool.query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? AND draw.history.record <> 999 order by draw.history.record', result[randomQuestion]);
      for (const i in historyCheck) {
        delete historyCheck[i].password;
        if (historyCheck[i].photo) {
          historyCheck[i].photo = IP + historyCheck[i].photo;
        }
      }

      const [gameCheck] = await pool.query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.id = ?', result[randomQuestion]);
      await pool.query('INSERT into history(game_id,user_id,record) values (?,?,?)', [result[randomQuestion], id, '999']);

      const data = {
        game: gameCheck,
        history: historyCheck
      };
      return { data: data };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateHistory = async (gameId, userId, record) => {
  try {
    await pool.query('UPDATE history SET record = ? where game_id = ? AND user_id = ?', [record, gameId, userId]);

    const [historyCheck] = await pool.query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? AND draw.history.record <> 999 order by draw.history.record', gameId);
    for (const i in historyCheck) {
      delete historyCheck[i].password;
      if (historyCheck[i].photo) {
        historyCheck[i].photo = IP + historyCheck[i].photo;
      }
    }

    const data = {
      history: historyCheck
    };
    return { data: data };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const singleAnswerCheck = async (answerId, answerCheck) => {
  try {
    const [answer] = await pool.query('SELECT question from draw.question where id = ?', answerId);
    if (answer[0].question === answerCheck) {
      return { answer: answer };
    } else {
      return { answer: '' };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getSingleAnswer = async (answerId) => {
  try {
    const [answer] = await pool.query('SELECT question from draw.question where id = ?', answerId);
    return { answer: answer };
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  getSingleGame,
  updateHistory,
  singleAnswerCheck,
  getSingleAnswer
};
