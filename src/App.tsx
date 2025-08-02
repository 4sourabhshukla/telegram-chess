import React, { useState, useEffect } from 'react';

// Types
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';
type Piece = { type: PieceType; color: PieceColor } | null;
type Square = { row: number; col: number };
type Move = { from: Square; to: Square; score?: number };

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

// Piece values for AI
const pieceValues: Record<PieceType, number> = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
};

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('w');
  const [gameMode, setGameMode] = useState<'menu' | 'ai' | 'friend'>('menu');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isInCheck, setIsInCheck] = useState(false);
  const [gameOver, setGameOver] = useState<{ winner: PieceColor | 'draw'; reason: string } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[], black: Piece[] }>({ 
    white: [], 
    black: [] 
  });
  const [score, setScore] = useState<{ white: number, black: number }>({ white: 0, black: 0 });

  // Get piece symbol
  const getPieceSymbol = (piece: Piece): string => {
    if (!piece) return '';
    return pieceSymbols[`${piece.color}${piece.type}`] || '';
  };

  // Find king position
  const findKing = (board: Piece[][], color: PieceColor): Square | null => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  };

  // Check if a square is attacked by enemy
  const isSquareAttacked = (square: Square, byColor: PieceColor, board: Piece[][]): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === byColor) {
          const moves = getPossibleMovesWithoutCheckValidation({ row, col }, board);
          if (moves.some(move => move.row === square.row && move.col === square.col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check if king is in check
  const isKingInCheck = (color: PieceColor, board: Piece[][]): boolean => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;
    return isSquareAttacked(kingPos, color === 'w' ? 'b' : 'w', board);
  };

  // Simulate a move and check if it leaves king in check
  const wouldMoveLeaveKingInCheck = (from: Square, to: Square, board: Piece[][]): boolean => {
    const piece = board[from.row][from.col];
    if (!piece) return true;
    
    // Create a copy of the board
    const testBoard = board.map(row => [...row]);
    
    // Make the move
    testBoard[to.row][to.col] = piece;
    testBoard[from.row][from.col] = null;
    
    // Check if king is in check after the move
    return isKingInCheck(piece.color, testBoard);
  };

  // Get possible moves without check validation (used for attack detection)
  const getPossibleMovesWithoutCheckValidation = (from: Square, board: Piece[][]): Square[] => {
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

  // Get valid moves (with check validation)
  const getValidMoves = (from: Square, board: Piece[][]): Square[] => {
    const possibleMoves = getPossibleMovesWithoutCheckValidation(from, board);
    
    // Filter out moves that would leave king in check
    return possibleMoves.filter(to => !wouldMoveLeaveKingInCheck(from, to, board));
  };

  // Check if player has any legal moves
  const hasLegalMoves = (color: PieceColor, board: Piece[][]): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const moves = getValidMoves({ row, col }, board);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  };

  // Check for checkmate or stalemate
  const checkGameOver = (board: Piece[][], currentTurn: PieceColor) => {
    const inCheck = isKingInCheck(currentTurn, board);
    const hasLegalMove = hasLegalMoves(currentTurn, board);
    
    if (!hasLegalMove) {
      if (inCheck) {
        // Checkmate
        setGameOver({ 
          winner: currentTurn === 'w' ? 'b' : 'w', 
          reason: 'Checkmate!' 
        });
      } else {
        // Stalemate
        setGameOver({ 
          winner: 'draw', 
          reason: 'Stalemate - Draw!' 
        });
      }
    }
  };

  // Make a move
  const makeMove = (from: Square, to: Square) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    const capturedPiece = newBoard[to.row][to.col];
    
    // Safety check
    if (!piece) return;
    
    // Track captured piece
    if (capturedPiece) {
      const capturedBy = piece.color;
      const capturedKey = capturedBy === 'w' ? 'white' : 'black';
      setCapturedPieces(prev => ({
        ...prev,
        [capturedKey]: [...prev[capturedKey], capturedPiece]
      }));
      
      // Update score
      const points = pieceValues[capturedPiece.type];
      setScore(prev => ({
        ...prev,
        [capturedKey]: prev[capturedKey] + points
      }));
    }
    
    // Move the piece
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
    
    // Pawn promotion
    if (piece.type === 'p') {
      if ((piece.color === 'w' && to.row === 0) || (piece.color === 'b' && to.row === 7)) {
        newBoard[to.row][to.col] = { type: 'q', color: piece.color };
      }
    }
    
    // Update state
    setBoard(newBoard);
    const nextTurn = currentTurn === 'w' ? 'b' : 'w';
    setCurrentTurn(nextTurn);
    setSelectedSquare(null);
    setPossibleMoves([]);
    
    // Check if next player is in check
    setIsInCheck(isKingInCheck(nextTurn, newBoard));
    
    // Check for game over
    checkGameOver(newBoard, nextTurn);
    
    // Add to move history
    const moveNotation = `${piece.type}${capturedPiece ? 'x' : ''}${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    setMoveHistory([...moveHistory, moveNotation]);
  };

  // Evaluate board position for AI
  const evaluateBoard = (board: Piece[][]): number => {
    let score = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type];
          score += piece.color === 'b' ? value : -value;
        }
      }
    }
    
    return score;
  };

  // Get best move for AI
  const getBestMove = (board: Piece[][]): Move | null => {
    const moves: Move[] = [];
    
    // Generate all possible moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === 'b') {
          const validMoves = getValidMoves({ row, col }, board);
          validMoves.forEach(to => {
            moves.push({ from: { row, col }, to });
          });
        }
      }
    }
    
    if (moves.length === 0) return null;
    
    // Evaluate each move
    moves.forEach(move => {
      const testBoard = board.map(row => [...row]);
      const capturedPiece = testBoard[move.to.row][move.to.col];
      
      // Make the move on test board
      testBoard[move.to.row][move.to.col] = testBoard[move.from.row][move.from.col];
      testBoard[move.from.row][move.from.col] = null;
      
      // Calculate score
      let score = evaluateBoard(testBoard);
      
      // Bonus for captures
      if (capturedPiece) {
        score += pieceValues[capturedPiece.type] * 10;
      }
      
      // Bonus for checking the enemy king
      if (isKingInCheck('w', testBoard)) {
        score += 50;
      }
      
      // Penalty if our piece can be captured
      if (isSquareAttacked(move.to, 'w', testBoard)) {
        const ourPiece = board[move.from.row][move.from.col];
        if (ourPiece) {
          score -= pieceValues[ourPiece.type] * 5;
        }
      }
      
      move.score = score;
    });
    
    // Sort moves by score and pick one of the best
    moves.sort((a, b) => (b.score || 0) - (a.score || 0));
    const bestScore = moves[0].score;
    const bestMoves = moves.filter(m => m.score === bestScore);
    
    // Return random best move for variety
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  };

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;
    
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
    if (gameMode === 'ai' && currentTurn === 'b' && !gameOver) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board);
        if (bestMove) {
          makeMove(bestMove.from, bestMove.to);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, board, gameOver]);

  // Reset game
  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentTurn('w');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    setIsInCheck(false);
    setGameOver(null);
    setCapturedPieces({ white: [], black: [] });
    setScore({ white: 0, black: 0 });
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
    const kingSquare = piece?.type === 'k' && piece.color === currentTurn && isInCheck;
    
    return (
      <div
        key={`${row}-${col}`}
        onClick={() => handleSquareClick(row, col)}
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
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '30px'
      }}>
        {/* Left side - Captured by Black */}
        <div style={{ 
          minWidth: '150px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Black: {score.black}
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '2px',
            minHeight: '60px',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px'
          }}>
            {capturedPieces.black.map((piece, index) => (
              <span key={index} style={{ 
                fontSize: '30px',
                color: '#FFFFFF',
                textShadow: '0 0 3px #000'
              }}>
                {getPieceSymbol(piece)}
              </span>
            ))}
          </div>
        </div>

        {/* Center - Board and controls */}
        <div>
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
              {isInCheck && <span style={{ color: '#FF6B6B', marginLeft: '10px' }}>CHECK!</span>}
            </div>
          </div>
          
          {/* Game Over Message */}
          {gameOver && (
            <div style={{
              backgroundColor: gameOver.winner === 'draw' ? '#F39C12' : '#27AE60',
              color: 'white',
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {gameOver.reason}
              {gameOver.winner !== 'draw' && ` ${gameOver.winner === 'w' ? 'White' : 'Black'} wins!`}
            </div>
          )}
          
          {/* Chess board */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 60px)',
            gap: '0',
            border: '2px solid #1A252F',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
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
              New Game
            </button>
          </div>
        </div>

        {/* Right side - Captured by White */}
        <div style={{ 
          minWidth: '150px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            White: {score.white}
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '2px',
            minHeight: '60px',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px'
          }}>
            {capturedPieces.white.map((piece, index) => (
              <span key={index} style={{ 
                fontSize: '30px',
                color: '#000000',
                textShadow: '0 0 3px #FFF'
              }}>
                {getPieceSymbol(piece)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;