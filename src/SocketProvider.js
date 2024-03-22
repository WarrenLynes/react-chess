import React, { useState } from 'react';
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./redux/auth/actions";

export const SocketContext = React.createContext(null);

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { authenticated, token } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!authenticated)
      return;

    const _socket = io(`http://${window.location.hostname}:3333/`, { auth: { token: token } });

    _socket.on("connect", (x) => setSocket(_socket));
    _socket.on("UNAUTHORIZED", (x) => {
      if (x === 'USER ALREADY LOGGED IN') {
        console.log('User already logged in');
      }

      dispatch(logout());
    });

    return () => {
      _socket.close();
      if (socket)
        socket.close();
    };
  }, [authenticated]);

  return <SocketContext.Provider value={socket} >{children}</SocketContext.Provider>
}