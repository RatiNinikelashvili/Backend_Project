const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, count: categories.length, data: categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.json({ success: true, data: category });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (req.body.name !== undefined) category.name = req.body.name;
  if (req.body.description !== undefined) category.description = req.body.description;

  await category.save();
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
