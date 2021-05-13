require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');
const util = require('../../util/util');

const signUp = async (req, res) => {
  let { name, password, photo } = req.body;
  if (!name || !password) {
    res.status(400).send({ error: 'Request Error: name, email and password are required.' });
    return;
  }

  name = validator.escape(name);
  const result = await User.signUp(name, password, photo);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(200).send({
    data: {
      user: {
        id: user.id,
        name: user.name,
        photo: user.photo
      }
    }
  });
};

const signIn = async (req, res) => {
  const data = req.body;
  const result = await signIn(data.name, data.password);

  if (result.error) {
    const statusCode = result.status ? result.status : 403;
    res.status(statusCode).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(200).send({
    data: {
      user: {
        id: user.id,
        name: user.name,
        photo: user.photo
      }
    }
  });
};

module.exports = {
  signIn,
  signUp
};
