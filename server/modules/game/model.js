const mongoose = require('mongoose');

const gameConfiguration = new mongoose.Schema({
  finalImage: mongoose.Schema.Types.String,
  fullMove: mongoose.Schema.Types.Number,
  halfMove: mongoose.Schema.Types.Number,
  enPassant: mongoose.Schema.Types.String,
  isFinished: mongoose.Schema.Types.Boolean,
  checkMate: mongoose.Schema.Types.Boolean,
  check: mongoose.Schema.Types.Boolean,
  turn: mongoose.Schema.Types.String,
  pieces: mongoose.Schema.Types.Mixed,
  moves: mongoose.Schema.Types.Mixed,
  castling: {
    whiteShort: mongoose.Schema.Types.Boolean,
    blackShort: mongoose.Schema.Types.Boolean,
    whiteLong: mongoose.Schema.Types.Boolean,
    blackLong: mongoose.Schema.Types.Boolean
  }
});

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  timeStamp: {
    type: mongoose.Schema.Types.Date,
    required: true
  }
});

const schema = new mongoose.Schema({
  img: mongoose.Schema.Types.String,
  white: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  black: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  configuration: {
    type: gameConfiguration,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gameId: mongoose.Schema.Types.String,
  history: [mongoose.Schema.Types.Mixed],
  messages: [messageSchema]
});

module.exports = mongoose.model('Game', schema);