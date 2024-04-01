const {Game, move, moves, } = require('js-chess-engine');
const jwt = require("jsonwebtoken");
const User = require('./modules/user/model');
const authController = require('./modules/auth/controller');
const authService = require('./modules/auth/service');
const GameModel = require('./modules/game/model');

const games = {};
const loggedInUsers = {};
const _loggedInUsers = {};
const openGames = {};
const log = (title, data) => {
  console.log(`<< ${title} >>`, data);
}

class Connection {
  constructor(io, socket, user) {
    this.io = io;
    this.socket = socket;
    this.user = user;
    this.sockets = [];

    loggedInUsers[this.socket.id] = user;
    _loggedInUsers[user._id] = {...user, socket: this.socket.id};

    io.use(async ({handshake}, next) => {
      const user = await authService.authenticate(handshake.auth.token);

      if(user && user._id)
        next();
    });
    socket.on('ping', (x) => {
      log('PING', socket.id + ' ' + x);
      socket.emit('ping', socket.id + ' ' + x);
    });
    socket.on('disconnect', async (x) => {
      await this._resetSockets();
      try {
        const user = await User.updateOne({_id: this.user.id}, {token: null});
        delete _loggedInUsers[this.user.id];
        return;
      } catch(e) {
        throw new Error(e);
      }
      console.log('USER DISCONNECTED: ', this.user.email);
    });
    socket.on('handlePlayerMove', (move) => this.move(move));
    socket.on('handleLeaveGame', ({id}) => this.leaveGame(id));
    socket.on('handleNewGame', () => this.newGame());
    socket.on('handleJoinGame', (gameId) => this.joinGame(gameId));
    socket.on('handleStartGame', (black) => this.startGame(black));

    this.io.sockets.emit('updateOpenGames', Object.keys(openGames));
  }

  _getGame(id) {
    const game = games[id];
    // const _game = await GameModel.findById(id);
    return {
      id,
      ...game.exportJson(),
      white: game.white,
      black: game.black,
      host: game.host,
      history: game.board.history,
    }
  }

  async _resetSockets() {
    this.sockets.forEach((xx) => {
      delete openGames[xx];
      delete games[xx];
      this.io.sockets.in(xx).emit('playerLeftGame', this.socket.id);
      this.socket.leave(xx);
    });

    this.io.sockets.emit('updateOpenGames', Object.keys(openGames));
    this.sockets = [];
  }

  async _createGame() {
    const id = ( Math.random() * 100000 ) | 0;
    games[id.toString()] = new Game;
    games[id]['host'] = this.socket.id;
    games[id]['white'] = this.socket.id;
    games[id]['id'] = id.toString();

    return this._getGame(id.toString());
  }

  async newGame() {
    await this._resetSockets();
    const game = await this._createGame();

    openGames[game.id] = {host: this.socket.id};

    console.log('newgame', this.user._id);

    this.socket.join(game.id);
    this.sockets.push(game.id);
    this.io.sockets.in(game.id).emit('startGame', game);
    this.io.sockets.emit('updateOpenGames', Object.keys(openGames));
  }

  async startGame({black, id}) {

    const game = games[id];
    if(!game)
      return;

    const newGame = await new GameModel();
    newGame['gameId'] = id;
    newGame['black'] = loggedInUsers[black];
    newGame['white'] = loggedInUsers[game.white];
    newGame['config'] = game.exportJson();
    await newGame.save();

    game['black'] = black;
    delete openGames[id];

    this.io.sockets.emit('updateOpenGames', Object.keys(openGames));
    this.io.sockets.in(id).emit('startGame', this._getGame(id));
  }

  async joinGame(id) {
    this.socket.join(id.toString());
    this.sockets.push(id.toString());

    await this.startGame({id, black: this.socket.id});
  }

  leaveGame(id) {
    this.sockets = this.sockets.filter((x) => x !== id);
    delete openGames[id];
    this.io.sockets.emit('updateOpenGames', Object.keys(openGames));
    this.io.sockets.in(id).emit('playerLeftGame', this.socket.id)
    this.socket.leave(id);
  }

  async move({from, to, gameId}) {
    const game = games[gameId];
    const gameJson = game.exportJson();
    const _game = await GameModel.findOne({gameId});

    if(!game || !game.white || !game.black)
      return;

    game.move(from, to);
    _game.history.push({from, to, configuration: _game.config})
    _game.config = game.exportJson();

    if(game.board.configuration.isFinished) {
      const winningTeam = game.board.configuration.turn === 'white' ? 'black' : 'white';
      const winner =  game[winningTeam];
      _game.winner = loggedInUsers[winner];
      await _game.save();

      console.log(`GAME OVER: WINNER: ${winningTeam} : ${winner}`);
      return this.io.sockets.in(gameId).emit('gameOver', {winner, ...game});
    }

    await _game.save();
    return this.io.sockets.in(gameId).emit('PLAYER_MOVE', {game: this._getGame(gameId), move: {from, to}});
  }

  async saveGame(_id, image) {
    const game = await Game.findById({_id});

  }
}

function connect(io) {
  io.on('connection', async (socket, next) => {
    const user = await authService.authenticate(socket.handshake.auth.token);

    if(user && user._id) {
      if(_loggedInUsers[user._id]) {
        console.log('User Already Logged In');
        socket.emit('UNAUTHORIZED', 'USER ALREADY LOGGED IN');
        next(new Error('USER ALREADY LOGGED IN'));
      } else {
        console.log('USER CONNECTED: ', user.email);
        new Connection(io, socket, user);
      }
    }
  });
}

module.exports = connect;
