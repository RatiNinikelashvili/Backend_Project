const express = require('express');
const { body } = require('express-validator');

const {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllGames,
  getAllCategories,
} = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);

router.get('/users', getUsers);
router.patch(
  '/users/:id/role',
  [body('role').isIn(['user', 'admin']).withMessage("Role must be 'user' or 'admin'")],
  validate,
  updateUserRole
);
router.delete('/users/:id', deleteUser);

router.get('/games', getAllGames);
router.get('/categories', getAllCategories);

module.exports = router;
