const mongoose = require('mongoose');

const ServiceCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  categoryDescription: {
    type: String,
    required: [true, 'Please provide a category description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  categoryImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', ServiceCategorySchema);