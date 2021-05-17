require('dotenv').config();

const { core, query, transaction, commit, rollback, end } = require('../../util/mysqlcon.js');
const { TOKEN_EXPIRE, TOKEN_SECRET, IP } = process.env; // 30 days by seconds

const getSingleGame = async (id) => {
  const gameIdList = await query('SELECT id from draw.game where host_id <> ?', id);
  const gameIdListArray = gameIdList.map(x => x.id);
  const gameIdCheck = await query('SELECT game_id from draw.history where user_id = ?', id);
  const gameIdCheckArray = gameIdCheck.map(x => x.game_id);
  const result = gameIdListArray.filter((e) => {
    return gameIdCheckArray.indexOf(e) === -1;
  });
  console.log(gameIdListArray);
  console.log(gameIdCheckArray);
  console.log(result);
  if (!result[0]) {
    return { error: '已無更多題庫給您' };
  } else {
    const historyCheck = await query('SELECT * from draw.history left join draw.user on draw.history.user_id = draw.user.id where draw.history.game_id = ?', result[0]);
    const gameCheck = await query('SELECT * from (draw.game left join draw.question on draw.game.question_id = draw.question.id) left join draw.canvas on draw.game.id = draw.canvas.game_id where draw.game.id = ?', result[0]);
    await query('INSERT into history(game_id,user_id,record) values (?,?,?)', [result[0], id, 'fail']);
    const data = {
      game: gameCheck,
      history: historyCheck
    };
    return { data: data };
  }
};

module.exports = {
  getSingleGame
};