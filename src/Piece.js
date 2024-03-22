import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessKing,
  faChessQueen,
  faChessBishop,
  faChessKnight,
  faChessRook,
  faChessPawn
} from "@fortawesome/free-regular-svg-icons";
import { DragPreviewImage, useDrag } from "react-dnd";
import crosshairsSolid from './icons/crosshairs-solid.svg';

const icons = {
  'K': faChessKing,
  'Q': faChessQueen,
  'B': faChessBishop,
  'N': faChessKnight,
  'R': faChessRook,
  'P': faChessPawn
};

const styles = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexGrow: '1',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function Piece({ piece, move, playerTeam, onSelect }) {

  const [{ isDragging }, drag, preview] = useDrag(
    () => {
      return {
        type: 'piece',
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
      };
    }, [],
  )

  const pieceColor = () => {
    if (piece.selectedPiece) {
      return '#00c4ff';
    } else if (move) {
      return '#ff0044';
    } else if (piece.deadKing) {
      return '#ff0044';
    }
    return piece.team;
  }

  return (
    <div
      style={styles}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(piece.spaceId, piece)
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        onSelect(piece.spaceId, piece)
      }}
    >
      {move}
      <DragPreviewImage connect={preview} src={crosshairsSolid} />
      <div ref={drag} style={{ flexGrow: 1, padding: playerTeam === 'white' ? '0 0 5px 0' : '8px 0 0 0' }}>
        <FontAwesomeIcon
          icon={icons[piece.id.toUpperCase()]}
          className="piece"
          style={{
            color: pieceColor(),
            animation: piece.deadKing ? `spin 60s linear infinite` : 'none',
            transform: playerTeam === 'black' ? 'rotate(180deg)' : 'none'
          }}
        />
      </div>
    </div>
  );
}