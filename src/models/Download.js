const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

downloadSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);
