const express = require('express');

const {
  requestDownload,
  getMyDownloads,
  getAllDownloads,
} = require('../controllers/downloadController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/:gameId', protect, requestDownload);
router.get('/me', protect, getMyDownloads);

router.get('/', protect, authorize('admin'), getAllDownloads);

module.exports = router;
