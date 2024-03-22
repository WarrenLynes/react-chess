import './App.css';
import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { SocketContext } from "./SocketProvider";
import EZNav from "./EZNav";
import { logout } from "./redux/auth/actions";
import { addNotification } from "./redux/notifications";


function App() {
  const { user, game } = useSelector(({ auth, game }) => ({ ...auth, game }));
  const [, setLoading] = useState(null);
  const socket = React.useContext(SocketContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { playerTeam } = game;

  React.useEffect(() => {
    if (!socket)
      return;

    const listeners = [
      { id: "UNAUTHORIZED", cb: (x) => onUnauthorized(x) },
      { id: 'UPDATE_OPEN_GAMES', cb: (data) => dispatch({ type: 'OPEN_GAMES_SET', data }) },
      {
        id: 'INITIATE_GAME',
        cb: (game) => {
          dispatch({ type: 'NOTIFICATION_REMOVE', id: 'SEARCH_INITIATED' });
          dispatch({ type: 'INITIALIZE_NEW_GAME', config: game });
          navigate(`game/${game.id}`);
        }
      },
      {
        id: 'SEARCH_INITIATED',
        cb: ({ que }) => {
          setLoading(`Search for opponent. ${que}`)
          dispatch({
            type: 'NOTIFICATION_ADD',
            notification: {
              id: 'SEARCH_INITIATED',
              message: `Searching for game, que: ${que}`
            }
          });
        }
      },
      { id: 'GAME_OVER', cb: (id) => dispatch({ type: 'GAME_OVER' }) },
    ];

    listeners.forEach(({ id, cb }) => socket.on(id, cb));

    socket.emit('PING');

    return () => {
      listeners.forEach(({ id }) => socket.off(id))
    };
  }, [socket]);

  React.useEffect(() => {
    if (!user || !user._id)
      navigate('/login');

    dispatch(addNotification({ message: 'LOGGED IN', duration: 2000 }));
  }, [user])

  const onUnauthorized = (x) => {
    // TEMP error
    if (x === 'USER ALREADY LOGGED IN') {
      alert('USER ALREADY LOGGED IN');
    }
  }

  const handleNewGame = () => {
    socket.emit('INITIATE_SEARCH');
  };

  const handleJoinGame = (id) => {
    return socket.emit('INITIATE_SEARCH', id.toString());
  };

  const handleLeaveGame = () => {
    socket.emit('QUIT_GAME', game.id.toString());
  }

  const handleLogout = () => {
    if (game.id)
      socket.emit('QUIT_GAME', game.id.toString());

    socket.emit('LOGOUT');
    dispatch(logout());
    socket.disconnect();
    socket.close();
  }

  return socket && (
    <>
      <EZNav playerTeam={playerTeam}
        socketId={socket.id}
        handleNewGame={handleNewGame}
        handleJoinGame={handleJoinGame}
        handleLeaveGame={handleLeaveGame}
        handleLogout={handleLogout}
      />
      <Outlet />
    </>
  )
}

export default App;