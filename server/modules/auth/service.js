const User = require("../user/model");
const jwt = require("jsonwebtoken");

module.exports.authenticate = async function (token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  return user;
}