import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "./SocketProvider";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { HTML5Backend } from "react-dnd-html5-backend";
import EZNav from "./EZNav";
import Board from "./Board";
import { spaces } from "./utils/constants";
import Space from "./Space";
import Piece from "./Piece";
import { DndProvider } from "react-dnd";
import { addNotification } from "./redux/notifications";
import Timer from "./Timer";
import { saveGameImage } from "./utils/api";
import html2canvas from "html2canvas";

export default function Game() {
  const socket = useContext(SocketContext);
  const { game, token } = useSelector(({ auth, game }) => ({ ...auth, game: game.id ? game : null }));
  const { gameId } = useParams();
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [playerTeam, setPlayerTeam] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket)
      return;

    const listeners = [
      { id: 'PLAYER_MOVE', cb: ({ game, move }) => onPlayerMove(game, move) },
      { id: 'WINNER', cb: ({ game, move, winner }) => onWinner({ winner, game, move }) },
      { id: 'PLAYER_JOINED', cb: (playerId) => onPlayerJoined(playerId) },
      { id: 'START_GAME', cb: (game) => onStartGame(game) },
      { id: 'GAME_OVER', cb: (id) => onGameOver(id) },
      { id: 'GAME_UNAVAILABLE', cb: (gameId) => onGameUnavailable(gameId) }
    ];

    listeners.forEach(({ id, cb }) => socket.on(id, cb));

    return () => {
      if (!socket)
        return;
      socket.emit('QUIT_GAME', gameId);
      listeners.forEach(({ id }) => socket.off(id));
    };
  }, [socket]);

  useEffect(() => {
    if (!gameId || !socket)
      return;
    socket.emit('JOIN_GAME', gameId);
  }, [gameId, socket]);

  useEffect(() => {
    if (!game || !game.isFinished)
      return;

    /*if (playerTeam === 'white') {
      html2canvas(document.getElementById("board"), {
        allowTaint: true,
        useCORS: true,
      }).then(function (canvas) {
        // It will return a canvas element
        let _image = canvas.toDataURL("image/png", 0.5);
        saveGameImage(token, _image, gameId)
          .then((x) => {
            console.log(x);
          });
      }).catch((e) => {
        // Handle errors
        console.log(e);
      });

    }*/
  }, [game]);

  const onWinner = ({ winner, game, move }) => {
    if (move)
      dispatch({ type: 'MOVE', game });
    dispatch(addNotification({ message: `WINNER ${winner.displayName}`, duration: 2000 }));
  }

  const onPlayerMove = (game, move, winner) => {
    dispatch({ type: 'MOVE', game });
    dispatch(addNotification({ message: `${move.from} ${move.to}`, duration: 2000 }));
  };

  const onPlayerJoined = (playerId) => {
    dispatch(
      addNotification({
        message: 'PLAYER JOINED GAME: ' + playerId,
        duration: 2000
      })
    )
  }

  const onStartGame = (game) => {
    console.log(game);
    dispatch({ type: 'INITIALIZE_GAME', game });
    dispatch(addNotification({ message: 'GAME STARTED', duration: 3000 }));
    setPlayerTeam(game.playerTeam)
  }

  const onGameOver = (id) => {
    if (game && game.isFinished) {
    }

    dispatch({ type: 'GAME_OVER' });
    navigate('/app');
  }

  const onGameUnavailable = (id) => {
    navigate('/app');
  }

  const handleSelectSpace = (space, piece) => {
    if (!game.turn === playerTeam)
      return;

    if (piece && piece.team === game.turn) {
      // PLAYER SELECTED THEIR OWN PIECE
      setSelectedPiece(space);
    } else if (selectedPiece && (
      game.moves[selectedPiece] &&
      game.moves[selectedPiece].indexOf(space) > -1)) {
      // PLAYER SELECTED SPACE & COMPLETED MOVE
      try {
        socket.emit('HANDLE_PLAYER_MOVE', { from: selectedPiece, to: space, socketId: socket.id, gameId: game.id });
        return setSelectedPiece(null);
      } catch (e) {
        throw new Error(e);
      }
    } else {
      // PLAYER SELECTED INVALID SPACE / PIECE ~ RESET
      setSelectedPiece(null);
    }
  };

  const getPiece = (spaceId) => {
    if (!game.pieces)
      return null;

    const id = game.pieces[spaceId];

    if (id) {
      const team = id === id.toUpperCase() ? 'white' : 'black';

      if (!game[team])
        return null;

      return {
        id,
        team,
        selectedPiece: selectedPiece === spaceId,
        deadKing: getCheckmate(spaceId),
        spaceId
      }
    }

    return null;
  };

  const getMove = (spaceId) => {
    if (!selectedPiece)
      return false;
    const _moves = game.moves[selectedPiece];
    return _moves && _moves.indexOf(spaceId) > -1;
  };

  const getCheckmate = (spaceId) => {
    if (!game.checkMate)
      return false;

    const deadKing = game.turn === 'white' ? 'K' : 'k';

    if (game.pieces[spaceId] === deadKing)
      return true;

    return false;
  };

  const spaceProps = (space) => ({
    key: space.id,
    space: space,
    move: getMove(space.id),
    selectedPiece: selectedPiece,
    onSelect: handleSelectSpace,
    piece: getPiece(space.id)
  })

  const renderSpaces = () => spaces.map((x) => (
    <Space {...spaceProps(x)}>
      {getPiece(x.id) && (
        <Piece move={getMove(x.id)} piece={getPiece(x.id)} playerTeam={game.playerTeam} onSelect={handleSelectSpace} />
      )}
    </Space>
  ));

  return socket && game && playerTeam && (
    <div style={{ backgroundColor: '#121212' }}>
      <div className="flex-container column" >
        <div className="board-bar">
          <h1 style={{ textAlign: 'left', fontSize: '16px', margin: '0px' }}>{game[`${playerTeam === 'white' ? 'black' : 'white'}Name`]}</h1>
          {/* {!game.isFinished && (
            <Timer
              time={game[`${playerTeam === 'white' ? 'black' : 'white'}Time`]}
              playerTeam={playerTeam === 'white' ? 'black' : 'white'}
              turn={game.turn}
              handleTimeExpired={handleTimeExpired}
              handleUpdateTime={(time) => dispatch({type: 'UPDATE_TIME', playerTeam, time})}
            />
          )} */}
        </div>

        <Board playerTeam={playerTeam}>
          {renderSpaces()}
        </Board>

        <div className="board-bar">
          <h1 style={{ textAlign: 'left', fontSize: '16px', margin: '0px' }}>{game[`${playerTeam}Name`]}</h1>
          {/* {!game.isFinished && (
            <Timer
              time={game[`${playerTeam}Time`]}
              playerTeam={playerTeam}
              turn={game.turn}
              handleTimeExpired={handleTimeExpired}
              handleUpdateTime={(time) => dispatch({type: 'UPDATE_TIME', playerTeam, time})}
            />
          )} */}
        </div>
      </div>
    </div>
  );
}

