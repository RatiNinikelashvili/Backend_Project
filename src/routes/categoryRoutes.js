const express = require('express');
const { body } = require('express-validator');

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post(
  '/',
  protect,
  authorize('admin'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  createCategory
);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
