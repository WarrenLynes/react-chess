require('dotenv').config();
const mongoose = require('mongoose');
const {MONGO_URI} = process.env;

module.exports = function connect() {
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('DB CONNECTED');
  }).catch((error) => {
    console.warn('DB NOT CONNECTED');
    console.error(error);

    process.exit(1);
  });
};