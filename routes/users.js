const express = require('express');
const {
  getUsers, getUserById, updateUser, updateAvatar, getCurrentUser,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, getUsers);
router.get('/:userId', auth, getUserById);
router.patch('/me', auth, updateUser);
router.patch('/me/avatar', auth, updateAvatar);
router.get('/me', auth, getCurrentUser);

module.exports = router;
