const mongoose = require('mongoose');

const RewardTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RewardTransaction', RewardTransactionSchema); 