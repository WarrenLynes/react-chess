import {useEffect, useRef, useState} from 'react';
import {useDispatch} from "react-redux";

/*
  <Timer
    time={game[`${playerTeam === 'white' ? 'black' : 'white'}Time`]}
    playerTeam={playerTeam === 'white' ? 'black' : 'white'}
    turn={game.turn}
    handleTimeExpired={handleTimeExpired}
    handleUpdateTime={(time) => dispatch({type: 'UPDATE_TIME', playerTeam, time})}
  />
 */

export default function Timer({time, turn, playerTeam, handleUpdateTime, handleTimeExpired}) {
  const [timer, setTimer] = useState(time);
  const timerID = useRef(null);

  useEffect(() => {
    if(!turn)
      return;
    if(turn === playerTeam){
      console.log('START TIMER ', playerTeam);
      startTimer();
    } else if(timerID.current) {
      stopTimer();
    }
    return () => stopTimer();
  }, [turn]);

  const startTimer = () => {
    if(timerID.current)
      return;

    timerID.current = setInterval(() => {
      setTimer((t) => {
        if(t === 1) {
          stopTimer();
          onTimerCompleted();
          return 0;
        }

        handleUpdateTime(t - 1);
        return t - 1;
      })
    }, 1000);
  }

  const onTimerCompleted = () => {
    handleTimeExpired();
  }

  const stopTimer = () => {
    clearInterval(timerID.current);
    timerID.current = null;
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return (minutes > 9 ? minutes : '0' + minutes) + ':'
      + (seconds > 9 ? seconds : '0' + seconds)
  }

  return formatTime(timer);
}