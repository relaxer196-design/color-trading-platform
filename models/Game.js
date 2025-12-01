const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  period: {
    type: Number,
    required: true
  },
  result: {
    color: {
      type: String,
      enum: ['red', 'green', 'violet'],
      default: null
    },
    number: {
      type: Number,
      min: 0,
      max: 9,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);