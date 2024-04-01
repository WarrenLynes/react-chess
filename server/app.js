const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const authController = require('./modules/auth/controller');
const userController = require('./modules/user/controller');
const gameController = require('./modules/game/controller');
const GameModel = require('./modules/game/model');

const db = require("./config/database");
const path = require("path");
const base64Img = require("base64-img");

class App {
  constructor() {
    db();

    this.app = express();
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb' }));
    this.app.use(cors({ origin: '*' }));

    this.app.use(express.static(path.join(__dirname, '../build')));
    this.app.use('/api/public', express.static(path.join(__dirname, '../public')));

    this.apiRouter = new express.Router();
    this.app.use('/api', this.apiRouter);

    authController(this.apiRouter);
    userController(this.apiRouter);

    this.apiRouter.use('/games', gameController());
    this.apiRouter.post('/upload/:gameId', async (req, res, next) => {
      const { image } = req.body;
      const { gameId } = req.params;
      const game = await GameModel.findOne({ gameId });
      const imagePath = base64Img.imgSync(
        image,
        './public',
        gameId
      );

      game.img = imagePath;
      await game.save();
      res.status(200).send(imagePath);
    });
  }
}

module.exports = App;