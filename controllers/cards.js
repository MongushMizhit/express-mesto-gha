const Card = require('../models/card');

// eslint-disable-next-line max-len
const handleErrorResponse = (res, message, statusCode) => res.status(statusCode).json({ error: message });

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).json(cards))
    .catch((err) => handleErrorResponse(res, err.message, 500));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(201).json(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        handleErrorResponse(res, 'Переданы некорректные данные в метод создания карточки', 400);
      } else {
        handleErrorResponse(res, err.message, 500);
      }
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        handleErrorResponse(res, 'Карточка не найдена', 404);
      } else {
        res.status(200).json(card);
      }
    })
    .catch((err) => handleErrorResponse(res, err.message, 500));
};

const likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      handleErrorResponse(res, 'Карточка не найдена', 404);
    } else {
      res.status(200).json(card);
    }
  } catch (error) {
    handleErrorResponse(res, 'Ошибка на стороне сервера', 500);
  }
};

const dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      handleErrorResponse(res, 'Карточка не найдена', 404);
    } else {
      res.status(200).json(card);
    }
  } catch (error) {
    handleErrorResponse(res, 'Ошибка на стороне сервера', 500);
  }
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
