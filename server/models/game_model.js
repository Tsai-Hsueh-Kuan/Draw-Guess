require('dotenv').config();

const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');
const { TOKEN_EXPIRE, TOKEN_SECRET, IP } = process.env; // 30 days by seconds

const getSingleGame = async (id, type) => {
  // const gameIdList = await query('SELECT id from draw.game where host_id <> ?', id);
  const gameIdList = await query('SELECT draw.game.id from draw.game left join draw.question on draw.game.question_id = draw.question.id where draw.game.host_id <> ? AND draw.question.type = ?', [id, type]);

  const gameIdListArray = gameIdList.map(x => x.id);
  const gameIdCheck = await query('SELECT game_id from draw.history where user_id = ?', id);
  const gameIdCheckArray = gameIdCheck.map(x => x.game_id);

  const result = gameIdListArray.filter((e) => {
    return gameIdCheckArray.indexOf(e) === -1;
  });
  if (!result[0]) {
    return { error: '已無更多題庫給您' };
  } else {
    const rdQuestion = Math.floor(Math.random() * result.length);
    const historyCheck = await query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ? order by draw.history.record', result[rdQuestion]);
    for (const i in historyCheck) {
      delete historyCheck[i].password;
      if (historyCheck[i].photo) {
        historyCheck[i].photo = IP + historyCheck[i].photo;
      }
    }

    const gameCheck = await query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.id = ?', result[rdQuestion]);
    await query('INSERT into history(game_id,user_id,record) values (?,?,?)', [result[rdQuestion], id, 'fail']);

    const data = {
      game: gameCheck,
      history: historyCheck
    };
    return { data: data };
  }
};

const updateHistory = async (gameId, userId, record) => {
  await query('UPDATE history SET record = ? where game_id = ? AND user_id = ?', [record, gameId, userId]);
};

const checkAnswer = async (answerId, answerCheck) => {
  const answer = await query('SELECT question from draw.question where id = ?', answerId);
  if (answer[0].question === answerCheck) {
    return { answer: answer };
  } else {
    return { answer: '' };
  }
};

const getAnswer = async (answerId) => {
  const answer = await query('SELECT question from draw.question where id = ?', answerId);

  return { answer: answer };
};

module.exports = {
  getSingleGame,
  updateHistory,
  checkAnswer,
  getAnswer
};
