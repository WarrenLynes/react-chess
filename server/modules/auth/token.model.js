const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: mongoose.Schema.Types.String,
});

module.exports = mongoose.model('Token', schema);