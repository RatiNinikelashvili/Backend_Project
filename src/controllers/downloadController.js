const Download = require('../models/Download');
const Game = require('../models/Game');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const requestDownload = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ _id: req.params.gameId, isPublished: true });
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }

  await Download.create({
    game: game._id,
    user: req.user._id,
    ipAddress: req.ip,
  });

  game.downloadCount += 1;
  await game.save();

  res.status(201).json({
    success: true,
    message: 'Download recorded',
    data: {
      game: game.title,
      magnetUri: game.magnetUri,
      downloadCount: game.downloadCount,
    },
  });
});

const getMyDownloads = asyncHandler(async (req, res) => {
  const downloads = await Download.find({ user: req.user._id })
    .populate('game', 'title slug platform sizeMB')
    .sort('-createdAt');

  res.json({ success: true, count: downloads.length, data: downloads });
});

const getAllDownloads = asyncHandler(async (req, res) => {
  const downloads = await Download.find()
    .populate('game', 'title slug')
    .populate('user', 'username email')
    .sort('-createdAt')
    .limit(200);

  res.json({ success: true, count: downloads.length, data: downloads });
});

module.exports = { requestDownload, getMyDownloads, getAllDownloads };
