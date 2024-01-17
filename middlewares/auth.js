/* eslint-disable import/no-unresolved */
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'your-secret-key');
  } catch (err) {
    return next(new UnauthorizedError('Что-то не так с токеном'));
  }

  req.user = payload;
  next();
};

module.exports = auth;
