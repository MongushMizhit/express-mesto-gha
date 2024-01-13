/* eslint-disable import/no-unresolved */
const jwt = require('jsonwebtoken');

// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Authorization required' });
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, 'your-secret-key');
  } catch (err) {
    return res.status(401).send({ message: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
};

module.exports = auth;
