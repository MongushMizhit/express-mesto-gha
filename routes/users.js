const express = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, getCurrentUser, updateUser, updateAvatar,
} = require('../controllers/users');
const auth = require('../middlewares/auth');
const { URL_EXP } = require('../constants/constants');

const router = express.Router();

router.get('/me', auth, getCurrentUser);
router.get('/:userId', auth, celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
}), getUserById);
router.get('/', auth, getUsers);

router.patch('/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateUser);
router.patch('/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(URL_EXP).required(),
  }),
}), updateAvatar);

module.exports = router;
