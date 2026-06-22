const User = require('../models/User');
const Game = require('../models/Game');
const Category = require('../models/Category');
const Download = require('../models/Download');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getPaging = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const getStats = asyncHandler(async (req, res) => {
  const [users, admins, games, unpublishedGames, categories, downloads] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Game.countDocuments(),
    Game.countDocuments({ isPublished: false }),
    Category.countDocuments(),
    Download.countDocuments(),
  ]);

  res.json({
    success: true,
    data: {
      users,
      admins,
      games,
      unpublishedGames,
      categories,
      downloads,
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: users,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, "Role must be either 'user' or 'admin'");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: { id: user._id, username: user.username, email: user.email, role: user.role },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ success: true, message: 'User deleted' });
});

const getAllGames = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req);
  const filter = {};
  if (req.query.published === 'true') filter.isPublished = true;
  if (req.query.published === 'false') filter.isPublished = false;

  const [games, total] = await Promise.all([
    Game.find(filter)
      .populate('categories', 'name slug')
      .populate('createdBy', 'username')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Game.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: games.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: games,
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name').lean();

  const counts = await Game.aggregate([
    { $unwind: '$categories' },
    { $group: { _id: '$categories', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  const data = categories.map((cat) => ({
    ...cat,
    gameCount: countMap[cat._id.toString()] || 0,
  }));

  res.json({ success: true, count: data.length, data });
});

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllGames,
  getAllCategories,
};
