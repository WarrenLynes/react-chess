import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

export default function Board({ children, playerTeam }) {
  const height = window.innerHeight;
  const width = window.innerWidth;

  const getBoardDimensions = () => {
    if (width > height) {
      return { height: height - 40, width: height - 40 };
    } else {
      return { height: width - 40, width: width - 40 };
    }
  };

  const getBoardAnimations = () => {
    if (playerTeam && playerTeam === 'black')
      return {
        animation: 'rotate-board .5s',
        transform: 'rotate(180deg)'
      };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div id="board"
        className='board'
        style={{ ...getBoardDimensions(), ...getBoardAnimations() }}
      >
        {children}
      </div>
    </DndProvider>
  )
}