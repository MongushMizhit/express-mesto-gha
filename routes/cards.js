const express = require('express');
const { getCards, createCard, deleteCard } = require('../controllers/cards');
const { likeCard, dislikeCard } = require('../controllers/cards');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, getCards);
router.post('/', auth, createCard);
router.delete('/:cardId', auth, deleteCard);
router.put('/:cardId/likes', auth, likeCard);
router.delete('/:cardId/likes', auth, dislikeCard);

module.exports = router;
