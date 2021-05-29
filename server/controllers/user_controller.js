require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const signUp = async (req, res) => {
  let { name, password } = req.body;
  let photo;
  if (req.file) {
    photo = req.file.originalname;
  }
  if (!name || !password) {
    res.status(400).send({ error: 'Name and password need to be entered completely' });
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
      access_token: user.access_token,
      user: {
        id: user.id,
        name: user.name,
        photo: user.photo
      }
    }
  });
};

const signIn = async (req, res) => {
  const { name, password } = req.body;
  const result = await User.signIn(name, password);
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
      access_token: user.access_token,
      user: {
        id: user.id,
        name: user.name,
        photo: user.photo
      }
    }
  });
};

const getUserProfile = async (req, res) => {
  res.status(200).send({
    data: {
      id: req.user.id,
      name: req.user.name,
      photo: req.user.photo,
      score: req.user.score
    }
  });
};

const replacePhoto = async (req, res) => {
  const id = req.user.id;
  const photo = req.body.photo;
  await User.replacePhoto(id, photo);
  res.status(200).send({ ok: 'ok' });
};
const uploadPhoto = async (req, res) => {
  const id = req.user.id;
  if (req.file) {
    const photo = req.file.originalname;
    if (photo) {
      const photoUrl = await User.uploadPhoto(id, photo);
      res.status(200).send({ ok: 'ok', photo: photoUrl });
    } else {
      res.status(200).send({ none: 'none' });
    }
  } else {
    res.status(200).send({ none: 'none' });
  }
};

const testRate = async (req, res) => {
  res.status(200).send({ ok: 'ok' });
};

module.exports = {
  signIn,
  signUp,
  getUserProfile,
  replacePhoto,
  uploadPhoto,
  testRate
};
