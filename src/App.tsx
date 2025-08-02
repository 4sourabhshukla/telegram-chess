import React, { useState, useEffect } from 'react';

// Types
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';
type Piece = { type: PieceType; color: PieceColor } | null;
type Square = { row: number; col: number };

// Initial board setup
const createInitialBoard = (): Piece[][] => [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill(null).map(() => ({ type: 'p' as PieceType, color: 'b' as PieceColor })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p' as PieceType, color: 'w' as PieceColor })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];

// Piece symbols
const pieceSymbols: Record<string, string> = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('w');
  const [gameMode, setGameMode] = useState<'menu' | 'ai' | 'friend'>('menu');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // Get piece symbol
  const getPieceSymbol = (piece: Piece): string => {
    if (!piece) return '';
    return pieceSymbols[`${piece.color}${piece.type}`] || '';
  };

  // Check if path is clear (for rook, bishop, queen)
  const isPathClear = (from: Square, to: Square, board: Piece[][]): boolean => {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;
    
    while (currentRow !== to.row || currentCol !== to.col) {
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  };

  // Get all valid moves for a piece
  const getValidMoves = (from: Square, board: Piece[][]): Square[] => {
    const piece = board[from.row][from.col];
    if (!piece) return [];
    
    const moves: Square[] = [];
    const { type, color } = piece;
    
    // Helper to check if a square is valid and empty or has enemy
    const isValidSquare = (row: number, col: number): boolean => {
      if (row < 0 || row > 7 || col < 0 || col > 7) return false;
      const target = board[row][col];
      return !target || target.color !== color;
    };
    
    // Helper to add move if valid
    const addMoveIfValid = (row: number, col: number): boolean => {
      if (isValidSquare(row, col)) {
        moves.push({ row, col });
        return board[row][col] === null; // Continue if empty
      }
      return false;
    };

    switch (type) {
      case 'p': // Pawn
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        
        // Move forward one square
        if (board[from.row + direction]?.[from.col] === null) {
          moves.push({ row: from.row + direction, col: from.col });
          
          // Move forward two squares from starting position
          if (from.row === startRow && board[from.row + 2 * direction][from.col] === null) {
            moves.push({ row: from.row + 2 * direction, col: from.col });
          }
        }
        
        // Capture diagonally
        [-1, 1].forEach(offset => {
          const newCol = from.col + offset;
          if (newCol >= 0 && newCol <= 7) {
            const target = board[from.row + direction]?.[newCol];
            if (target && target.color !== color) {
              moves.push({ row: from.row + direction, col: newCol });
            }
          }
        });
        break;

      case 'n': // Knight
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([rowOffset, colOffset]) => {
          addMoveIfValid(from.row + rowOffset, from.col + colOffset);
        });
        break;

      case 'b': // Bishop
        // Diagonals
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row + i, from.col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row + i, from.col - i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row - i, from.col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row - i, from.col - i)) break;
        }
        break;

      case 'r': // Rook
        // Vertical and horizontal
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row + i, from.col)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row - i, from.col)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row, from.col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(from.row, from.col - i)) break;
        }
        break;

      case 'q': // Queen (combination of rook and bishop)
        // All 8 directions
        const queenDirections = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        queenDirections.forEach(([rowDir, colDir]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMoveIfValid(from.row + i * rowDir, from.col + i * colDir)) break;
          }
        });
        break;

      case 'k': // King
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
          for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue;
            addMoveIfValid(from.row + rowOffset, from.col + colOffset);
          }
        }
        break;
    }
    
    return moves;
  };

  // Make a move
  const makeMove = (from: Square, to: Square) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    const capturedPiece = newBoard[to.row][to.col];
    
    // Move the piece
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
    
    // Pawn promotion
    if (piece?.type === 'p') {
      if ((piece.color === 'w' && to.row === 0) || (piece.color === 'b' && to.row === 7)) {
        newBoard[to.row][to.col] = { type: 'q', color: piece.color };
      }
    }
    
    // Update state
    setBoard(newBoard);
    setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
    setSelectedSquare(null);
    setPossibleMoves([]);
    
    // Add to move history
    const moveNotation = `${piece?.type}${capturedPiece ? 'x' : ''}${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    setMoveHistory([...moveHistory, moveNotation]);
  };

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    // If there's a selected piece
    if (selectedSquare) {
      const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        makeMove(selectedSquare, { row, col });
      } else {
        // Select new piece if it's the current player's
        const piece = board[row][col];
        if (piece && piece.color === currentTurn && (gameMode === 'friend' || (gameMode === 'ai' && currentTurn === 'w'))) {
          setSelectedSquare({ row, col });
          setPossibleMoves(getValidMoves({ row, col }, board));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select a piece
      const piece = board[row][col];
      if (piece && piece.color === currentTurn && (gameMode === 'friend' || (gameMode === 'ai' && currentTurn === 'w'))) {
        setSelectedSquare({ row, col });
        setPossibleMoves(getValidMoves({ row, col }, board));
      }
    }
  };

  // AI move
  useEffect(() => {
    if (gameMode === 'ai' && currentTurn === 'b') {
      const timer = setTimeout(() => {
        // Find all black pieces
        const blackPieces: Square[] = [];
        board.forEach((row, rowIndex) => {
          row.forEach((piece, colIndex) => {
            if (piece && piece.color === 'b') {
              blackPieces.push({ row: rowIndex, col: colIndex });
            }
          });
        });
        
        // Find a piece with valid moves
        const shuffled = [...blackPieces].sort(() => Math.random() - 0.5);
        for (const pieceSquare of shuffled) {
          const moves = getValidMoves(pieceSquare, board);
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            makeMove(pieceSquare, randomMove);
            break;
          }
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, board]);

  // Reset game
  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentTurn('w');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
  };

  // Start new game
  const startGame = (mode: 'ai' | 'friend') => {
    setGameMode(mode);
    resetGame();
  };

  // Render square
  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isPossibleMove = possibleMoves.some(move => move.row === row && move.col === col);
    
    return (
      <div
        key={`${row}-${col}`}
        onClick={() => handleSquareClick(row, col)}
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: isLight ? '#F5DEB3' : '#8B4513',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          outline: isSelected ? '3px solid #4169E1' : 'none',
          outlineOffset: '-3px'
        }}
      >
        {piece && (
          <span style={{ fontSize: '40px', userSelect: 'none' }}>
            {getPieceSymbol(piece)}
          </span>
        )}
        {isPossibleMove && (
          <div
            style={{
              position: 'absolute',
              width: piece ? '100%' : '20px',
              height: piece ? '100%' : '20px',
              backgroundColor: piece ? 'transparent' : '#32CD32',
              border: piece ? '3px solid #32CD32' : 'none',
              borderRadius: piece ? '0' : '50%',
              opacity: 0.7,
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    );
  };

  // Menu screen
  if (gameMode === 'menu') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#2C3E50', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '40px' }}>♟️ Quick Chess</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <button
              onClick={() => startGame('ai')}
              style={{
                padding: '20px 40px',
                fontSize: '20px',
                backgroundColor: '#3498DB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '250px'
              }}
            >
              🤖 Play vs AI
            </button>
            <button
              onClick={() => startGame('friend')}
              style={{
                padding: '20px 40px',
                fontSize: '20px',
                backgroundColor: '#27AE60',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '250px'
              }}
            >
              👥 Pass & Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#34495E', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ 
        backgroundColor: '#2C3E50', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          color: 'white', 
          marginBottom: '20px', 
          textAlign: 'center' 
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>
            {gameMode === 'ai' ? '🤖 Playing vs AI' : '👥 Pass & Play'}
          </h2>
          <div style={{ fontSize: '18px' }}>
            {currentTurn === 'w' ? '⚪ White' : '⚫ Black'} to move
          </div>
        </div>
        
        {/* Chess board */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(8, 60px)',
          gap: '0',
          border: '2px solid #1A252F'
        }}>
          {board.map((row, rowIndex) =>
            row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
          )}
        </div>
        
        {/* Controls */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setGameMode('menu')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#E74C3C',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Back to Menu
          </button>
          <button
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#95A5A6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;