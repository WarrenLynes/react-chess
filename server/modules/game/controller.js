const express = require("express");
const Game = require('./model');
const authMiddleware = require("../../middleware/auth");

function gameController() {
  const router = new express.Router();

  router.get('/', authMiddleware, getGames);
  router.get('/:id', authMiddleware, getGameById);
  router.post('/', authMiddleware, createGame);
  router.put('/:id', authMiddleware, updateGame);

  async function getGameById(req, res, next) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send('ID REQUIRED');
    }

    const game = await Game.findById(id);

    return res.status(200).json(game);
  }

  async function getGames(req, res, next) {
    const user = req.user;
    Game.find()
      .where({ $or: [{ black: user._id }, { white: user._id }] })
      .populate('white')
      .populate('black')
      .then((games) => {
        res.status(200).json(games);
      });
  }

  async function createGame(req, res, next) {
    try {
      const newGame = new Game(req.body);
      await newGame.save();
      res.status(201).json(newGame);
    } catch (e) {
      next(e);
    }
  }

  async function updateGame(req, res, next) {
    try {
      const { id } = req.params;
      let game = await Game.findById(id);
      game = { ...game, ...req.body };
      await game.save();
      res.status(204).send(game);
    } catch (e) {
      res.status(400).send(e);
    }
  }

  return router;
}

module.exports = gameController;