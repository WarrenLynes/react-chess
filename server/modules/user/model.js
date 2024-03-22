const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  displayName: {type: String, unique: true}
});

module.exports = mongoose.model('User', schema);