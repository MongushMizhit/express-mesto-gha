/* eslint-disable import/no-unresolved */
const { Types } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');

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

// eslint-disable-next-line consistent-return
const createUser = async (req, res) => {
  const {
    name = 'Жак-Ив Кусто',
    about = 'Исследователь',
    avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
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

// eslint-disable-next-line consistent-return
const updateUser = async (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Пользователь с указанным _id не найден' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Переданы некорректные данные при обновлении профиля' });
    } else {
      res.status(500).json({ message: 'Ошибка по умолчанию' });
    }
  }
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true },
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'Пользователь с указанным _id не найден' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

// eslint-disable-next-line consistent-return
const login = async (req, res) => {
  const { email, password } = req.body || {};

  // Валидация формата email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Некорректный формат email' });
  }

  try {
    // Поиск пользователя по email в базе данных
    const user = await User.findOne({ email }).select('+password');

    // Проверка, найден ли пользователь и соответствует ли пароль
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Неправильные почта или пароль' });
    }

    // Создание JWT токена
    const token = jwt.sign({ _id: user._id }, 'your-secret-key', { expiresIn: '7d' });

    // Отправка токена в куке
    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // Неделя в миллисекундах
      httpOnly: true,
    });

    // Отправка ответа
    res.status(200).json({ message: 'Вход успешно выполнен' });
  } catch (error) {
    // Обработка других ошибок
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getUsers, getUserById, createUser, updateUser, updateAvatar, login, getCurrentUser,
};
