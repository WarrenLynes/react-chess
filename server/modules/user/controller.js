const authMiddleware = require("../../middleware/auth");
const User = require('./model');

function userController(app) {
  app.get('/user', authMiddleware, getUser);
  app.get('/user-profile/:displayName', authMiddleware, getUserByDisplayName);

  async function getUser(req, res, next) {
    try {
      // already authenticated -> send user
      return res.status(200).send(req.user);
    } catch (error) {
      throw new Error(error);
    }
  }

  async function getUserByDisplayName(req, res, next) {
    try {
      const { displayName } = req.params;
      const userProfile = await User.findOne({ displayName }).select('displayName');
      return res.status(200).json(userProfile);
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = userController;