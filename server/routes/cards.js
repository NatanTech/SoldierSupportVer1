const express = require('express');
const router = express.Router();
const { 
  createCard, 
  getCards, 
  getCardById, 
  updateCard, 
  deleteCard, 
  getNearbyCards,
  getUserCards,
  upload
} = require('../controllers/cardController');
const { protect, isAdmin } = require('../middleware/auth');

// @route   POST /api/cards
router.post('/', protect, upload.single('image'), createCard);

// @route   GET /api/cards
router.get('/', getCards);

// @route   GET /api/cards/near
router.get('/near', getNearbyCards);

// @route   GET /api/cards/user
router.get('/user', protect, getUserCards);

// @route   GET /api/cards/:id
router.get('/:id', getCardById);

// @route   PUT /api/cards/:id
router.put('/:id', protect, upload.single('image'), updateCard);

// @route   DELETE /api/cards/:id
router.delete('/:id', protect, deleteCard);

module.exports = router;