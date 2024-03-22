import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { SocketContext } from "./SocketProvider";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompletedGames } from "./utils/api";

export default function Home() {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const { user, token } = useSelector(({ auth }) => auth);
  const [loading, setLoading] = useState(null);
  const [completedGames, setCompletedGames] = useState(null);

  useEffect(() => {
    if (!socket)
      return;

    const listeners = [
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
      }

    ];

    listeners.forEach(({ id, cb }) => socket.on(id, cb))

    return () => {
      listeners.forEach(({ id }) => socket.off(id))
    };
  }, [socket]);

  useEffect(() => {
    fetchCompletedGames(token)
      .then((games) => {
        setLoading(false);
        setCompletedGames(games);
      })
  }, []);

  const newGame = () => {
    socket.emit('INITIATE_SEARCH')
  }

  const linkToUserProfile = (white, black) => {

    const userDisplayName = white._id === user._id.toString()
      ? black.displayName
      : white.displayName

    return (
      <Link to={`user-profile/${userDisplayName}`}>
        {userDisplayName}
      </Link>
    )
  }

  return socket && (
    <div style={{ maxHeight: '100%', width: '100%', overflow: 'hidden', overflowY: 'scroll'}}>
      {loading && (
        <h1>{loading}</h1>
      )}
      <h1>{user.email}</h1>

      {completedGames && completedGames.map((g) => (
        <div className="gamePreview" key={g._id}>
          <h5>{g._id}</h5>
          <img src={`api/${g.img}`} style={{ height: '175px' }} />
          <h5>VS {linkToUserProfile(g.white, g.black)}</h5>
        </div>
      ))}
    </div>
  );
}