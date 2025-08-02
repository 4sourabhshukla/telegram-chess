import React from 'react';
import type { Piece, Square } from './gameUtils';

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
  <div className="chess-board-grid">
    {board.map((row, rowIndex) =>
      row.map((_, colIndex) => {
        const piece = board[rowIndex][colIndex];
        const isLight = (rowIndex + colIndex) % 2 === 0;
        const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
        const isPossibleMove = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);
        const kingSquare = piece?.type === 'k' && piece.color === currentTurn && isInCheck;
        let squareClass = 'chess-square ';
        squareClass += isLight ? 'chess-light ' : 'chess-dark ';
        if (isSelected) squareClass += 'chess-selected ';
        if (kingSquare) squareClass += 'chess-check ';
        return (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => onSquareClick(rowIndex, colIndex)}
// Removed duplicate export
          >
            {piece && (
              <span className={`chess-piece chess-piece-${piece.color}`}>{getPieceSymbol(piece)}</span>
            )}
            {isPossibleMove && <div className="chess-move-indicator" />}
          </div>
        );
      })
    )}
  </div>
);

export default ChessBoard;