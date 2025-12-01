const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: String,
    required: true
  },
  period: {
    type: Number,
    required: true
  },
  betType: {
    type: String,
    enum: ['color', 'number'],
    required: true
  },
  betValue: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  multiplier: {
    type: Number,
    default: 2
  },
  result: {
    type: String,
    enum: ['pending', 'win', 'loss'],
    default: 'pending'
  },
  winAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bet', betSchema);