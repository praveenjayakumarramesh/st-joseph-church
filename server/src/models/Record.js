const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  function: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['offering', 'donation', 'church_tax'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
recordSchema.index({ date: 1, function: 1, type: 1 });

module.exports = mongoose.model('Record', recordSchema); 