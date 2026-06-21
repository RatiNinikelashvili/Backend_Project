const express = require('express');
const { body } = require('express-validator');

const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} = require('../controllers/gameController');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('magnetUri').trim().notEmpty().withMessage('A magnet URI or torrent link is required'),
  body('platform')
    .optional()
    .isIn(['windows', 'mac', 'linux', 'multi'])
    .withMessage('Invalid platform'),
  body('sizeMB').optional().isFloat({ min: 0 }).withMessage('Size must be a positive number'),
  body('categories').optional().isArray().withMessage('Categories must be an array of ids'),
];

router.get('/', getGames);
router.get('/:id', getGame);

router.post('/', protect, authorize('admin'), createRules, validate, createGame);
router.put('/:id', protect, authorize('admin'), updateGame);
router.delete('/:id', protect, authorize('admin'), deleteGame);

module.exports = router;
