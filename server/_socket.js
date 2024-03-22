const authService = require("./modules/auth/service");
const { Game } = require("js-chess-engine");
const GameModel = require('./modules/game/model');

const testConfig = {
  "fullMove": 4,
  "halfMove": 0,
  "enPassant": null,
  "isFinished": false,
  "checkMate": false,
  "check": false,
  "turn": "white",
  "pieces": {
    "E1": "K",
    "A1": "R",
    "H1": "R",
    "C1": "B",
    "B1": "N",
    "G1": "N",
    "A2": "P",
    "B2": "P",
    "C2": "P",
    "D2": "P",
    "F2": "P",
    "G2": "P",
    "H2": "P",
    "E8": "k",
    "D8": "q",
    "A8": "r",
    "H8": "r",
    "C8": "b",
    "F8": "b",
    "G8": "n",
    "A7": "p",
    "B7": "p",
    "C7": "p",
    "F7": "p",
    "G7": "p",
    "H7": "p",
    "E4": "P",
    "E5": "p",
    "C4": "B",
    "A6": "n",
    "F3": "Q",
    "D6": "p"
  },
  "castling": {
    "whiteShort": true,
    "blackShort": true,
    "whiteLong": true,
    "blackLong": true
  }
};

const games = {};
const loggedInUsers = {};
const singles = {};

class Connection {
  constructor(io, socket, user) {
    this.io = io;
    this.user = user;
    this.socket = socket;
    this.sockets = [];

    loggedInUsers[user._id] = Object.assign({}, user._doc, { socket: socket.id });

    io.use(async (socket, next) => await this.authenticateRequest(socket, next));

    this.listeners = [
      {
        id: 'disconnect', cb: () => {
          console.log('SOCKET IO ON: disconnect', this.user.displayName);
          return this.disconnect();
        }
      },
      {
        id: 'PING', cb: (x) => {
          console.log('SOCKET IO ON: PING', this.user.displayName);
          return this.ping(x);
        }
      },
      {
        id: 'LOGOUT', cb: (x) => {
          console.log('SOCKET IO ON: LOGOUT', this.user.displayName);
          return this.logout();
        }
      },
      {
        id: 'INITIATE_SEARCH', cb: (opponentId) => {
          console.log('SOCKET IO ON: INITIATE_SEARCH', this.user.displayName);
          return this.initiateSearch(opponentId);
        }
      },
      {
        id: 'JOIN_GAME', cb: (gameId) => {
          console.log('SOCKET IO ON: JOIN_GAME', this.user.displayName);
          return this.joinGame(gameId);
        }
      },
      {
        id: 'QUIT_GAME', cb: (gameId) => {
          console.log('SOCKET IO ON: QUIT_GAME', this.user.displayName);
          return this.quitGame(gameId);
        }
      },
      {
        id: 'HANDLE_PLAYER_MOVE', cb: ({ from, to, socketId, gameId }) => {
          console.log('SOCKET IO ON: HANDLE_PLAYER_MOVE', this.user.displayName);
          return this.playerMove({ from, to, socketId, gameId });
        }
      },
    ];
    this.listeners.forEach(({ id, cb }) => socket.on(id, cb));
  }

  ping() {
    this.socket.emit('ping', this.socket.id);
    this.socket.emit('UPDATE_OPEN_GAMES', singles);
  }

  async disconnect() {

    delete loggedInUsers[this.user._id];
    delete singles[this.user._id];
    this.io.sockets.emit('UPDATE_OPEN_GAMES', singles);

    await Promise.all(
      this.sockets.map(async (socketId) => {
        if (games[socketId])
          await this.quitGame(socketId);
        this.socket.leave(socketId);
      })
    );

    this.listeners.forEach(({ id, cb }) => this.socket.off(id, cb));
  }

  async logout() {
    const userGames = this._getUserGames();
    this.socket.disconnect();
    if (userGames)
      await Promise.all(userGames.map(x => this.quitGame(x)));
    delete loggedInUsers[this.user._id];
    delete singles[this.user._id];
  }

  getTeam(game) {
    if (game.black === this.user._id) {
      return 'black';
    } else if (game.white === this.user._id) {
      return 'white';
    }
  }

  leaveSocket(socketId) {
    this.socket.leave(socketId);
    this.sockets = this.sockets.filter(({ id }) => id !== socketId);
  }

  async endGame(gameId) {
    const game = games[gameId];

    if (!game)
      return;

    const _game = await GameModel.findOne({ gameId }).populate('white').populate('black');
    const loserTeam = this.getTeam(game);
    const winnerTeam = loserTeam === 'white' ? 'black' : 'white';

    _game.winner = _game[winnerTeam];
    game.winner = game[winnerTeam];
    _game.save();

    delete games[gameId];
    return _game;
  }

  async quitGame(gameId) {
    const game = await this.endGame(gameId);

    this.io.sockets.in(gameId).emit('GAME_OVER', game);
    this.leaveSocket(gameId);
  }

  _getGame(gameId) {
    const game = games[gameId];
    return Object.assign({}, {
      ...game.exportJson(),
      id: game.id,
      black: game.black,
      white: game.white,
      whiteTime: game.whiteTime,
      whiteName: loggedInUsers[game.white].displayName,
      blackName: loggedInUsers[game.black].displayName,
      blackTime: game.blackTime,
      history: game.board.history,
    });
  };

  _getUserGames() {
    const userId = this.user._id.toString();
    const _gs = Object.keys(games).filter((x) => games[x].black === userId || games[x].white === userId);
    return _gs.length > 0 ? _gs : null;
  };

  async authenticateRequest(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token)
      return next(new Error('TOKEN REQUIRED'));

    authService.authenticate(token)
      .then(({ email, _id }) => {
        if (_id)
          next();
      });

  }

  joinGame(gameId) {
    const game = games[gameId.toString()];

    if (!game) {
      return this.socket.emit('GAME_UNAVAILABLE', gameId);
    }

    const white = game.white;
    const black = game.black;

    if (this.user._id.toString() !== white && this.user._id.toString() !== black)
      return;

    const userId = this.user._id.toString();

    this.socket.join(gameId);
    this.sockets.push(gameId);
    this.io.sockets.in(gameId).emit('PLAYER_JOINED', this.socket.id);

    if (this.socket.adapter.rooms.get(gameId).size === 2) {

      this.io.to(loggedInUsers[white].socket).emit('START_GAME', { playerTeam: 'white', ...this._getGame(gameId) });
      this.io.to(loggedInUsers[black].socket).emit('START_GAME', { playerTeam: 'black', ...this._getGame(gameId) });
    }
  }

  async _newGame(playerOne, playerTwo) {
    const id = (Math.random() * 100000) | 0;
    games[id.toString()] = new Game();
    games[id]['id'] = id.toString();
    games[id]['white'] = playerOne;
    games[id]['black'] = playerTwo;

    games[id]['whiteTime'] = 180;
    games[id]['blackTime'] = 180;

    const newGame = await GameModel.create({
      gameId: games[id]['id'],
      white: games[id]['white'],
      black: games[id]['black'],
      messages: [],
      history: games[id].board.history,
      configuration: games[id].exportJson()
    });

    return this._getGame(id);
  }

  async newGame(playerOne, playerTwo) {
    const game = await this._newGame(playerOne, playerTwo);
    this.io.to(loggedInUsers[playerOne].socket).emit('INITIATE_GAME', game);
    this.io.to(loggedInUsers[playerTwo].socket).emit('INITIATE_GAME', game);
  }

  async initiateSearch(opponentId) {
    if (this._getUserGames())
      return;

    const userId = this.user._id.toString();

    if (singles[userId])
      return;

    if (opponentId) {
      await this.newGame(userId, opponentId);
      delete singles[opponentId];
      this.io.sockets.emit('UPDATE_OPEN_GAMES', singles);
      return;
    }

    const singlesList = Object.keys(singles);

    if (singlesList.length > 0) {
      await this.newGame(userId, singlesList[0]);
      delete singles[singlesList[0]];
    } else {
      singles[userId] = this.user;
      this.socket.emit('SEARCH_INITIATED', { que: Object.keys(singles).length });
    }

    this.io.sockets.emit('UPDATE_OPEN_GAMES', singles);
  }

  async sendMessage(message, gameId) {
    const game = games[gameId];
    game.chat = [
      { message, from: this.user._id },
      ...game.messages
    ];

    this.io.sockets.in(gameId).emit('UPDATE_GAME_CHAT', game.chat);
  }

  async playerMove({ from, to, socketId, gameId }) {
    const game = games[gameId];
    const _game = await GameModel.findOne({ gameId }).populate('white').populate('black');

    if (!game || !game.white || !game.black)
      return;

    game.move(from, to);

    const gameJson = game.exportJson();

    if (gameJson.isFinished) {
      const winningTeam = gameJson.turn === 'white' ? 'black' : 'white';
      const winner = _game[winningTeam];
      game.winner = _game[winningTeam];
      _game.winner = _game[winningTeam];
      this.io.sockets.in(gameId).emit('WINNER', { winner, move: { from, to }, game: this._getGame(gameId) });
      delete games[gameId];
    } else {
      this.io.sockets.in(gameId).emit('PLAYER_MOVE', { game: this._getGame(gameId), move: { from, to } });
    }

    _game.configuration = game.exportJson();
    _game.history = game.board.history;
    await _game.save();
  }
}

function _connect(io) {
  io.on('connection', async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return new Error('TOKEN REQUIRED');
    }
    const user = await authService.authenticate(socket.handshake.auth.token);

    if (user && user._id) {
      if (loggedInUsers[user._id]) {
        socket.emit('UNAUTHORIZED', 'USER ALREADY LOGGED IN');
        throw new Error('USER ALREADY LOGGED IN')
      } else {
        new Connection(io, socket, user);
      }
    }
  });
}

module.exports = _connect;

