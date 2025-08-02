import React from 'react';
import type { Piece } from './gameUtils';

type Props = {
  pieces: Piece[];
  color: 'white' | 'black';
  score: number;
  getPieceSymbol: (piece: Piece) => string;
};

const CapturedPieces: React.FC<Props> = ({ pieces, color, score, getPieceSymbol }) => (
  <div className="captured-pieces">
    <div className="captured-header">
      {color.charAt(0).toUpperCase() + color.slice(1)}: {score}
    </div>
    <div className="captured-list">
      {pieces.map((piece, index) => (
        <span key={index} className={`chess-piece chess-piece-${color}`}>{getPieceSymbol(piece)}</span>
      ))}
    </div>
  </div>
);