const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
designationSchema.index({ name: 1 });

module.exports = mongoose.model('Designation', designationSchema); 