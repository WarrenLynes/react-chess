const jwt = require('jsonwebtoken');
const User = require('../modules/user/model');

async function authMiddleware(req, res, next) {
  const bearerToken = req.headers.authorization;

  if (!bearerToken)
    return res.status(403).send('TOKEN MISSING');

  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    console.log(decoded._id);
    req.user = await User.findById(decoded._id);
    next();
  } catch (error) {
    return res.status(401).send('BAD TOKEN');
  }
}

module.exports = authMiddleware;