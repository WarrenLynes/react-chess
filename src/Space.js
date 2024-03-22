import React from "react";
import { useDrop } from "react-dnd";
import Overlay from "./Overlay";
import { BOARD_BLACK_COLOR, BOARD_WHITE_COLOR } from './utils/constants.js';

export default function Space({ piece, space, onSelect, move, children, selectedPiece }) {

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'piece',
      canDrop: () => move,
      drop: () => {
        onSelect(space.id)
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [selectedPiece],
  )

  return (
    <div
      ref={drop}
      role="space"
      className="space"
      onClick={() => onSelect(space.id)}
      style={{
        backgroundColor: BOARD_WHITE_COLOR,
        color: space.color === 'black' ? 'white' : 'black',
        height: '12.5%',
        width: '12.5%',
        position: 'relative'
      }}
    >
      {children}
      {!piece && !isOver && move && (<Overlay status={'legalMove'} />)}
      {!piece && isOver && move && (<Overlay status={'possibleMove'} />)}
    </div>
  );
}