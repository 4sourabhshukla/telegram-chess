import React, { useState, useEffect } from 'react';

// Types
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';
type Piece = { type: PieceType; color: PieceColor } | null;
type Square = { row: number; col: number };

interface ChessBoardProps {
  board: Piece[][];
  selectedSquare: Square | null;
  possibleMoves: Square[];
  isInCheck?: boolean;
  currentTurn?: PieceColor;
  onSquareClick: (row: number, col: number) => void;
}

// Piece Unicode symbols
const pieceSymbols: Record<string, string> = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  possibleMoves,
  isInCheck = false,
  currentTurn = 'w',
  onSquareClick
}) => {
  const [boardSize, setBoardSize] = useState(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const containerPadding = 40; // Padding for the container
    const maxSize = Math.min(screenWidth - containerPadding, 400); // Max 400px
    return Math.floor(maxSize / 8) * 8; // Ensure divisible by 8
  });

  // Calculate board size on mount and resize
  useEffect(() => {
    const calculateBoardSize = () => {
      const screenWidth = window.innerWidth;
      const containerPadding = 40;
      const maxSize = Math.min(screenWidth - containerPadding, 400);
      setBoardSize(Math.floor(maxSize / 8) * 8);
    };

    calculateBoardSize();
    window.addEventListener('resize', calculateBoardSize);
    
    return () => window.removeEventListener('resize', calculateBoardSize);
  }, []);

  // Get piece symbol
  const getPieceSymbol = (piece: Piece): string => {
    if (!piece) return '';
    return pieceSymbols[`${piece.color}${piece.type}`] || '';
  };

  // Render a single square
  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isPossibleMove = possibleMoves.some(move => move.row === row && move.col === col);
    const kingInCheck = isInCheck && piece?.type === 'k' && piece.color === currentTurn;
    
    const squareSize = boardSize / 8;
    
    return (
      <div
        key={`${row}-${col}`}
        onClick={() => onSquareClick(row, col)}
        style={{
          width: `${squareSize}px`,
          height: `${squareSize}px`,
          backgroundColor: kingInCheck ? '#FF6B6B' : (isLight ? '#EEEED2' : '#769656'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          outline: isSelected ? '3px solid #F7F769' : 'none',
          outlineOffset: '-3px',
          boxSizing: 'border-box'
        }}
      >
        {piece && (
          <span style={{ 
            fontSize: `${squareSize * 0.65}px`, 
            userSelect: 'none',
            lineHeight: 1,
            color: piece.color === 'w' ? '#FFFFFF' : '#000000',
            textShadow: piece.color === 'w' 
              ? '0 0 3px #000, 0 0 5px #000' 
              : '0 0 3px #FFF, 0 0 5px #FFF'
          }}>
            {getPieceSymbol(piece)}
          </span>
        )}
        {isPossibleMove && (
          <div
            style={{
              position: 'absolute',
              width: piece ? '100%' : `${squareSize * 0.3}px`,
              height: piece ? '100%' : `${squareSize * 0.3}px`,
              backgroundColor: piece ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
              border: piece ? '3px solid #F7F769' : 'none',
              borderRadius: piece ? '0' : '50%',
              opacity: 0.9,
              pointerEvents: 'none',
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    }}>
      <div style={{
        width: `${boardSize}px`,
        height: `${boardSize}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${boardSize / 8}px)`,
        gridTemplateRows: `repeat(8, ${boardSize / 8}px)`,
        gap: 0,
        border: '2px solid #1A252F',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        backgroundColor: '#1A252F'
      }}>
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
        )}
      </div>
    </div>
  );
};

export default ChessBoard;