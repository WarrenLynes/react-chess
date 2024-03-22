import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyMiddleware, combineReducers, createStore } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import SocketProvider from "./SocketProvider";
import AuthRouter from "./AuthRouter";
import logger from "./redux/middleware";
import gameReducer from "./redux/game/reducer";
import authReducer from "./redux/auth/reducer";
import notifications from "./redux/notifications";
import openGames from "./redux/openGames";
import Notifications from "./Notifications";

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

const middleware = applyMiddleware(thunk, logger,);

const reducers = combineReducers({
  game: gameReducer,
  auth: authReducer,
  notifications,
  openGames
});

const store = createStore(
  reducers,
  middleware
);

root.render(
  <Provider store={store}>
    <div className="app">
      <Notifications />
      <SocketProvider >
        <AuthRouter />
      </SocketProvider>
    </div>
  </Provider>
);