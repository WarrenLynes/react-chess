import React from 'react';
import { useSelector } from "react-redux";

const styles = { position: 'absolute', bottom: '0', right: '0', zIndex: 10, background: '#121212b5' };

export default function Notifications() {
  const state = useSelector((x) => x.notifications);
  return (
    <div id="notifications" style={styles}>
      {state.length > 0 && state.map((x) => (
        <div className="notification" key={x.id}>
          {x.message}
        </div>
      ))}
    </div>
  )
}