import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";


export default function EZNav({ socketId, handleLogout, handleNewGame, handleJoinGame, handleLeaveGame }) {
  const [open, setOpen] = React.useState(true);
  const { game, openGames, user } = useSelector(({ auth, game, openGames }) => ({ user: auth.user, game, openGames }));
  const { playerTeam } = game;
  const width = 300;

  React.useEffect(() => {
    if (!game.id)
      setOpen(true);

    if (game.id)
      setOpen(false);
  }, [game]);

  const toggleOpen = (xx) => {
    console.log(xx);
    setOpen((x) => {
      return !x;
    });
  }

  const quitGameButton = (gameId) => (
    <button className='btn' onClick={() => handleLeaveGame(gameId)}>
      Quit Game
    </button>
  );

  const newGameButton = (gameId) => (
    <button className='btn' onClick={handleNewGame}>
      PLAY
    </button>
  );

  const renderGameButtons = () =>
    game.id
      ? quitGameButton(game.id)
      : newGameButton(game.id);

  const renderAccountSection = () => (
    <div className="flex-container column">
      <button className="btn small" onClick={handleLogout}>logout</button>
      <p className="player-socket">{user.email}</p>
      <p className="player-socket">{socketId}</p>
    </div>
  );

  const renderOpenGames = () =>
    !game.id && !!_openGames.length && (
      <>
        <h3>Open Games</h3>
        {_openGames.map((id) =>
          <button key={id} className='btn' onClick={() => handleJoinGame(id)}>
            {openGames[id].displayName}
          </button>
        )}
      </>
    );

  const _openGames = Object.keys(openGames).filter((x) => x !== user._id);

  return (
    <div id='nav' className={open ? 'open' : null}>
      <FontAwesomeIcon
        id="nav-btn"
        icon={faBars}
        onClick={toggleOpen}
      />

      <div className="flex-container column">
        {playerTeam && (
          <h5 id="player-team">
            {playerTeam}
          </h5>
        )}

        <div className='flex-container column'>
          {renderGameButtons()}
        </div>

        {renderOpenGames()}
      </div>

      {renderAccountSection()}
    </div>
  );
}