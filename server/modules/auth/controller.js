const User = require("../user/model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authService = require('./service');

function authController(app) {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/authenticate', authenticate);
  app.get('/logout', logout);

  const updatedToken = (_id, email) => jwt.sign({ _id, email }, process.env.JWT_SECRET, { expiresIn: "2h" });

  async function register(req, res, next) {
    try {
      const { email, password, displayName } = req.body;

      if (!(email && password))
        return res.status(400).send('EMAIL & PASSWORD REQUIRED');

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser)
        return res.status(409).send('USER ALREADY EXISTS.');

      const encryptedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: email.toLowerCase(),
        password: encryptedPassword,
        displayName
      });

      const token = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
  async function login(req, res, next) {
    const { email, password } = req.body;

    if (!(email && password))
      return res.status(400).send('EMAIL & PASSWORD REQUIRED');

    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "2h" });

        return res.status(201).json({ user, token });
      }
      return res.status(400).send("Invalid Credentials");
    } catch (error) {
      next(error);
    }
  }

  async function authenticate(req, res, next) {
    const token = req.headers['authentication'];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (user && user._id) {
          const token = updatedToken(user._id, user.email);
          return res.status(201).json({ ...user._doc, token });
        }
      } catch (e) {
        console.log(e);
      }

    }
  }
  async function logout(req, res, next) {
    const token = req.headers['authentication'];
    if (token) {
      const user = await authService.authenticate(token);
      if (user && user._id) {
        user.token = null;
        await user.save();
        return res.status(201).send(true);
      }
    }
  }
}

module.exports = authController;