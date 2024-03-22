import {aiMove, move} from "js-chess-engine/lib/js-chess-engine.mjs";
export const MOVE = 'MOVE';

export function handleMove(from, to) {
  return (dispatch, getState) => {
    const {reducer} = getState();
    const config = move(reducer, from, to);
    dispatch({
      type: 'MOVE', config
    });
  }
}

export function handleAIMove(turn) {
  return (dispatch, getState) => {
    const {reducer} = getState();
    const _aiMove = aiMove(reducer, reducer.turn === 'white' ? 3 : 1);
    const from = Object.keys(_aiMove)[0];
    const config = move(reducer, from, _aiMove[from]);

    return dispatch({ type: 'AI_MOVE', config});
  }
}