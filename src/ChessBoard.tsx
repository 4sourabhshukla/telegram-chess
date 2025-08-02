import React from 'react';
import type { Piece } from './gameUtils';
import type { Square } from './gameUtils';

type ChessBoardProps = {
  board: Piece[][];
  selectedSquare: Square | null;
  possibleMoves: Square[];
  currentTurn: string;
  isInCheck: boolean;
  onSquareClick: (row: number, col: number) => void;
  getPieceSymbol: (piece: Piece) => string;
};

const ChessBoard: React.FC<ChessBoardProps> = ({
  board, selectedSquare, possibleMoves, currentTurn, isInCheck, onSquareClick, getPieceSymbol
}) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 60px)',
    gap: '0',
    border: '2px solid #1A252F',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
  }}>
    {board.map((row, rowIndex) =>
      row.map((_, colIndex) => {
        const piece = board[rowIndex][colIndex];
        const isLight = (rowIndex + colIndex) % 2 === 0;
        const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
        const isPossibleMove = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);
        const kingSquare = piece?.type === 'k' && piece.color === currentTurn && isInCheck;
        return (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => onSquareClick(rowIndex, colIndex)}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: kingSquare ? '#FF6B6B' : (isLight ? '#EEEED2' : '#769656'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              outline: isSelected ? '3px solid #F7F769' : 'none',
              outlineOffset: '-3px'
            }}
          >
            {piece && (
              <span style={{
                fontSize: '40px',
                userSelect: 'none',
                color: piece.color === 'w' ? '#FFFFFF' : '#000000',
                textShadow: piece.color === 'w'
                  ? '0 0 3px #000, 0 0 5px #000, 0 0 7px #000'
                  : '0 0 3px #FFF, 0 0 5px #FFF, 0 0 7px #FFF'
              }}>
                {getPieceSymbol(piece)}
              </span>
            )}
            {isPossibleMove && (
              <div
                style={{
                  position: 'absolute',
                  width: piece ? '100%' : '20px',
                  height: piece ? '100%' : '20px',
                  backgroundColor: piece ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
                  border: piece ? '3px solid #F7F769' : 'none',
                  borderRadius: piece ? '0' : '50%',
                  opacity: 0.9,
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>
        );
      })
    )}
  </div>
);

export default ChessBoard;