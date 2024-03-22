import React, { useContext, useEffect } from "react";
import { SocketContext } from "./SocketProvider";

export default function Test() {
  const socket = useContext(SocketContext);

  useEffect(() => {
    console.log('socket');
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('ping', (ping) => {
      console.log('TEST - PING : ', ping);
    });
    socket.emit('ping', socket.id);
  }, []);

  return (
    <h1>
      Test
      {socket.id}
    </h1>
  )
}