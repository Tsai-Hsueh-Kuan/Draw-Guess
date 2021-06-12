require('dotenv').config();
const { pool } = require('../../util/mysqlcon.js');
const { IP } = process.env;
const getSingleGame = async (id, type) => {
  try {
    const gameIdList = await pool.query('SELECT draw.game.id from draw.game left join draw.question on draw.game.question_id = draw.question.id where draw.game.host_id <> ? AND draw.question.type = ? AND draw.game.status = 0', [id, type]);
    const gameIdListArray = gameIdList[0].map(x => x.id);
    const gameIdCheck = await pool.query('SELECT game_id from draw.history where user_id = ?', id);
    const gameIdCheckArray = gameIdCheck[0].map(x => x.game_id);

    const result = gameIdListArray.filter((e) => {
      return gameIdCheckArray.indexOf(e) === -1;
    });
    if (!result[0]) {
      return { error: '已無更多題庫給您' };
    } else {
      const rdQuestion = Math.floor(Math.random() * result.length);
      const historyCheck = await pool.query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? AND draw.history.record <> 999 order by draw.history.record', result[rdQuestion]);
      for (const i in historyCheck[0]) {
        delete historyCheck[0][i].password;
        if (historyCheck[0][i].photo) {
          historyCheck[0][i].photo = IP + historyCheck[0][i].photo;
        }
      }

      const gameCheck = await pool.query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.id = ?', result[rdQuestion]);
      await pool.query('INSERT into history(game_id,user_id,record) values (?,?,?)', [result[rdQuestion], id, '999']);

      const data = {
        game: gameCheck[0],
        history: historyCheck[0]
      };
      return { data: data };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getSingleGameTest = async (id, gameId) => {
  try {
    const historyCheck = await pool.query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? order by draw.history.record', gameId);
    for (const i in historyCheck[0]) {
      delete historyCheck[0][i].password;
      if (historyCheck[0][i].photo) {
        historyCheck[0][i].photo = IP + historyCheck[0][i].photo;
      }
    }

    const gameCheck = await pool.query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.id = ?', gameId);
    const data = {
      game: gameCheck[0],
      history: historyCheck[0]
    };
    return { data: data };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getSingleGameNeedCheck = async () => {
  try {
    const gameCheck = await pool.query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.status = 9 limit 1');
    const data = {
      game: gameCheck[0]
    };
    return { data: data };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const checkGame = async (status, gameId) => {
  try {
    await pool.query('UPDATE draw.game SET status = ? where id = ?', [status, gameId]);
    return 'ok';
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateHistory = async (gameId, userId, record) => {
  try {
    await pool.query('UPDATE history SET record = ? where game_id = ? AND user_id = ?', [record, gameId, userId]);

    const historyCheck = await pool.query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? AND draw.history.record <> 999 order by draw.history.record', gameId);
    for (const i in historyCheck[0]) {
      delete historyCheck[0][i].password;
      if (historyCheck[0][i].photo) {
        historyCheck[0][i].photo = IP + historyCheck[0][i].photo;
      }
    }

    const data = {
      history: historyCheck[0]
    };
    return { data: data };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const checkAnswer = async (answerId, answerCheck) => {
  try {
    const answer = await pool.query('SELECT question from draw.question where id = ?', answerId);
    if (answer[0][0].question === answerCheck) {
      return { answer: answer[0] };
    } else {
      return { answer: '' };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAnswer = async (answerId) => {
  try {
    const answer = await pool.query('SELECT question from draw.question where id = ?', answerId);
    return { answer: answer[0] };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getcrawler = async (all) => {
  try {
    await pool.query('INSERT into draw.question(question,type,inuse) values (?,?,?)', [all, 'idiom', 0]);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  getSingleGame,
  getSingleGameTest,
  updateHistory,
  checkAnswer,
  getAnswer,
  getcrawler,
  checkGame,
  getSingleGameNeedCheck
};
