const Game = require('../models/Game');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getGames = asyncHandler(async (req, res) => {
  const { search, platform, category, sort } = req.query;

  const filter = { isPublished: true };
  if (platform) filter.platform = platform;
  if (category) filter.categories = category;
  if (search) filter.$text = { $search: search };

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const sortBy = sort || '-createdAt';

  const [games, total] = await Promise.all([
    Game.find(filter)
      .populate('categories', 'name slug')
      .sort(sortBy)
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

const getGame = asyncHandler(async (req, res) => {
  const game = await Game.find({ _id: req.params.id })
    .populate('categories', 'name slug')
    .populate('createdBy', 'username');

  if (!game.length) {
    throw new ApiError(404, 'Game not found');
  }

  res.json({ success: true, data: game[0] });
});

const createGame = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user._id };
  const game = await Game.create(payload);
  res.status(201).json({ success: true, data: game });
});

const updateGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }

  const forbidden = ['createdBy', 'downloadCount', 'slug'];
  Object.keys(req.body).forEach((key) => {
    if (!forbidden.includes(key)) {
      game[key] = req.body[key];
    }
  });

  await game.save();
  res.json({ success: true, data: game });
});

const deleteGame = asyncHandler(async (req, res) => {
  const game = await Game.findByIdAndDelete(req.params.id);
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }
  res.json({ success: true, message: 'Game deleted' });
});

module.exports = { getGames, getGame, createGame, updateGame, deleteGame };
