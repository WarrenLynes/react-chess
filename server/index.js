require('dotenv').config();
const db = require('./config/database');
const App = require('./app');
const {Server} = require("socket.io");
const {API_PORT} = process.env;
const port = process.env.PORT || API_PORT;
const http = require("http");
const connect = require('./socket');
const _connect = require('./_socket');
const authService = require("./modules/auth/service");

const app = new App();

const httpServer = http.Server(app.app);
const io = new Server(httpServer, {cors: {origin: "*", methods: ['GET', 'POST']}});

httpServer.listen('3333');
// connect(io);
_connect(io);