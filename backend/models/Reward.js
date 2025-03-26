const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  points: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reward', RewardSchema); 