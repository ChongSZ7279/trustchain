const mongoose = require('mongoose');

const CharityUpdateSchema = new mongoose.Schema({
  charityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CharityUpdate', CharityUpdateSchema); 