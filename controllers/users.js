/* eslint-disable import/no-unresolved */
const { Types } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

// eslint-disable-next-line consistent-return
const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Передан некорректный идентификатор пользователя' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

const getCurrentUser = async (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный _id пользователя'));
      } else {
        next(err);
      }
    });
};

// eslint-disable-next-line consistent-return
const createUser = async (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body || {};

  // Проверка наличия email и password в теле запроса
  if (!email || !password) {
    return res.status(400).json({ message: 'Отсутствует email или password в теле запроса' });
  }

  // Валидация формата email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Некорректный формат email' });
  }

  try {
    // Хеширование пароля перед сохранением в базу данных
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, about, avatar, email, password: hashedPassword,
    });

    // Отправка созданного пользователя в ответе
    res.status(201).json(user);
  } catch (error) {
    // Обработка конкретных ошибок валидации
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Переданы некорректные данные при создании пользователя' });
    }

    // Обработка других ошибок
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((result) => {
      if (!result) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      res.status(200).json(result);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара.'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      // eslint-disable-next-line no-undef
      const token = jwt.sign({ _id: user._id }, 'your-secret-key', { expiresIn: '7d' });
      res.send({ JWT: token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getUsers, getUserById, createUser, updateUser, updateAvatar, login, getCurrentUser,
};
