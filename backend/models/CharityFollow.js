const mongoose = require('mongoose');

const CharityFollowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  charityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can only follow a charity once
CharityFollowSchema.index({ userId: 1, charityId: 1 }, { unique: true });

module.exports = mongoose.model('CharityFollow', CharityFollowSchema); 