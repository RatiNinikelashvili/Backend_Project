const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['windows', 'mac', 'linux', 'multi'],
      default: 'windows',
    },
    sizeMB: {
      type: Number,
      min: [0, 'Size cannot be negative'],
      default: 0,
    },
    version: {
      type: String,
      trim: true,
      default: '1.0',
    },
    magnetUri: {
      type: String,
      required: [true, 'A magnet URI or torrent link is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

gameSchema.index({ title: 'text', description: 'text' });

gameSchema.pre('validate', function buildSlug(next) {
  if (this.isModified('title') || !this.slug) {
    const base = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Game', gameSchema);
