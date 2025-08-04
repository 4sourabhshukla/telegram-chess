import React, { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';

// Types
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';
type Piece = { type: PieceType; color: PieceColor } | null;
type Square = { row: number; col: number };
type Move = { from: Square; to: Square; score?: number };

// Piece Unicode symbols
const pieceSymbols: Record<string, string> = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

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

// Piece values for AI
const pieceValues: Record<PieceType, number> = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
};

// Chess puzzles - Extended collection
const chessPuzzles = [
  // Beginner Puzzles
  {
    id: 1,
    name: "Back Rank Mate",
    category: 'checkmate',
    difficulty: 'beginner',
    fen: [
      [null, null, null, null, { type: 'r', color: 'b' }, null, { type: 'k', color: 'b' }, null],
      [null, null, null, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, { type: 'q', color: 'w' }, null, null, null, null],
      [null, null, null, null, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [null, null, null, null, null, null, { type: 'k', color: 'w' }, null]
    ] as Piece[][],
    solution: { from: { row: 5, col: 3 }, to: { row: 0, col: 3 } },
    hint: "Look for a back rank checkmate!",
    description: "White to move - Mate in 1"
  },
  {
    id: 2,
    name: "Queen and King Mate",
    category: 'checkmate',
    difficulty: 'beginner',
    fen: [
      [null, null, null, null, null, null, null, { type: 'k', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, { type: 'k', color: 'w' }, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, { type: 'q', color: 'w' }, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null]
    ] as Piece[][],
    solution: { from: { row: 5, col: 1 }, to: { row: 0, col: 6 } },
    hint: "Drive the king to the edge and deliver mate!",
    description: "White to move - Mate in 1"
  },
  {
    id: 3,
    name: "Smothered Mate",
    category: 'checkmate',
    difficulty: 'intermediate',
    fen: [
      [null, null, null, null, null, { type: 'r', color: 'b' }, { type: 'k', color: 'b' }, null],
      [null, null, null, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, { type: 'n', color: 'w' }, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, { type: 'k', color: 'w' }, null]
    ] as Piece[][],
    solution: { from: { row: 2, col: 6 }, to: { row: 1, col: 4 } },
    hint: "The knight can deliver a special mate when the king is trapped by its own pieces!",
    description: "White to move - Mate in 1"
  },
  {
    id: 4,
    name: "Fork Attack",
    category: 'tactics',
    difficulty: 'beginner',
    fen: [
      [null, null, null, { type: 'r', color: 'b' }, null, { type: 'r', color: 'b' }, { type: 'k', color: 'b' }, null],
      [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, { type: 'p', color: 'b' }, null, null, null],
      [null, null, null, null, { type: 'p', color: 'w' }, null, null, null],
      [null, null, { type: 'n', color: 'w' }, null, null, null, null, null],
      [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, null, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [{ type: 'r', color: 'w' }, null, null, null, { type: 'k', color: 'w' }, null, null, { type: 'r', color: 'w' }]
    ] as Piece[][],
    solution: { from: { row: 5, col: 2 }, to: { row: 3, col: 3 } },
    hint: "Knights are great at attacking two pieces at once!",
    description: "White to move - Win material"
  },
  {
    id: 5,
    name: "Pin and Win",
    category: 'tactics',
    difficulty: 'intermediate',
    fen: [
      [{ type: 'r', color: 'b' }, null, null, null, { type: 'k', color: 'b' }, null, null, { type: 'r', color: 'b' }],
      [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'b', color: 'b' }, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, { type: 'n', color: 'b' }, null, null, null, null, null],
      [null, null, null, null, { type: 'p', color: 'b' }, null, null, null],
      [null, null, { type: 'b', color: 'w' }, null, { type: 'p', color: 'w' }, null, null, null],
      [null, null, null, null, null, null, null, null],
      [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, null, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [{ type: 'r', color: 'w' }, null, null, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, null, null, { type: 'r', color: 'w' }]
    ] as Piece[][],
    solution: { from: { row: 4, col: 2 }, to: { row: 1, col: 5 } },
    hint: "Pin the knight to the king and win material!",
    description: "White to move - Win a piece"
  },
  {
    id: 6,
    name: "Discovered Attack",
    category: 'tactics',
    difficulty: 'intermediate',
    fen: [
      [null, null, null, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, null, null, { type: 'r', color: 'b' }],
      [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, null, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, { type: 'p', color: 'b' }, null, null, null],
      [null, null, null, { type: 'n', color: 'w' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, null, { type: 'r', color: 'w' }, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [null, null, null, null, { type: 'k', color: 'w' }, null, null, { type: 'r', color: 'w' }]
    ] as Piece[][],
    solution: { from: { row: 3, col: 3 }, to: { row: 2, col: 5 } },
    hint: "Move the knight to discover an attack on the queen!",
    description: "White to move - Win the queen"
  },
  {
    id: 7,
    name: "Pawn Promotion",
    category: 'endgame',
    difficulty: 'beginner',
    fen: [
      [null, null, null, null, null, null, null, null],
      [null, { type: 'p', color: 'w' }, null, null, null, null, { type: 'k', color: 'b' }, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, { type: 'k', color: 'w' }, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null]
    ] as Piece[][],
    solution: { from: { row: 1, col: 1 }, to: { row: 0, col: 1 } },
    hint: "Push the pawn to promote to a queen!",
    description: "White to move - Promote and win"
  },
  {
    id: 8,
    name: "King and Pawn Endgame",
    category: 'endgame',
    difficulty: 'intermediate',
    fen: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, { type: 'k', color: 'b' }, null, null, null, null],
      [null, null, { type: 'p', color: 'w' }, null, null, null, null, null],
      [null, null, null, { type: 'k', color: 'w' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null]
    ] as Piece[][],
    solution: { from: { row: 4, col: 3 }, to: { row: 3, col: 3 } },
    hint: "The king must support the pawn's advance!",
    description: "White to move - Win with proper technique"
  },
  {
    id: 9,
    name: "Rook Endgame Cut-off",
    category: 'endgame',
    difficulty: 'advanced',
    fen: [
      [null, null, null, null, { type: 'k', color: 'b' }, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, { type: 'p', color: 'w' }],
      [null, null, null, null, null, null, { type: 'k', color: 'w' }, null],
      [{ type: 'r', color: 'w' }, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null]
    ] as Piece[][],
    solution: { from: { row: 5, col: 0 }, to: { row: 5, col: 4 } },
    hint: "Cut off the enemy king from the pawn!",
    description: "White to move - Secure the win"
  },
  {
    id: 10,
    name: "Queen Sacrifice for Mate",
    category: 'checkmate',
    difficulty: 'advanced',
    fen: [
      [{ type: 'r', color: 'b' }, null, null, null, { type: 'k', color: 'b' }, null, null, { type: 'r', color: 'b' }],
      [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, null, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, null],
      [null, null, { type: 'n', color: 'b' }, null, null, null, null, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, { type: 'b', color: 'w' }, null, null],
      [null, null, null, null, null, null, null, null],
      [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, null, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [null, null, null, { type: 'q', color: 'w' }, null, { type: 'r', color: 'w' }, { type: 'k', color: 'w' }, null]
    ] as Piece[][],
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } },
    hint: "Sometimes you need to sacrifice your most powerful piece!",
    description: "White to move - Mate in 2"
  }
];

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('w');
  const [gameMode, setGameMode] = useState<'menu' | 'ai' | 'friend' | 'puzzle'>('menu');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isInCheck, setIsInCheck] = useState(false);
  const [gameOver, setGameOver] = useState<{ winner: PieceColor | 'draw'; reason: string } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[], black: Piece[] }>({ 
    white: [], 
    black: [] 
  });
  const [score, setScore] = useState<{ white: number, black: number }>({ white: 0, black: 0 });
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'solving' | 'correct' | 'incorrect'>('solving');
  const [puzzleAttempts, setPuzzleAttempts] = useState(0);

  // Get piece symbol (for captured pieces display)
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
      const capturedByKey = capturedBy === 'w' ? 'white' : 'black';
      setCapturedPieces(prev => ({
        ...prev,
        [capturedByKey]: [...prev[capturedByKey], capturedPiece]
      }));
      
      // Update score
      const points = pieceValues[capturedPiece.type];
      setScore(prev => ({
        ...prev,
        [capturedByKey]: prev[capturedByKey] + points
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
    
    // Puzzle mode
    if (gameMode === 'puzzle') {
      if (puzzleStatus !== 'solving') return;
      
      const puzzle = chessPuzzles[currentPuzzle];
      
      if (selectedSquare) {
        const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
        
        if (isValidMove) {
          // Check if this is the correct solution
          const isCorrect = 
            selectedSquare.row === puzzle.solution.from.row &&
            selectedSquare.col === puzzle.solution.from.col &&
            row === puzzle.solution.to.row &&
            col === puzzle.solution.to.col;
          
          if (isCorrect) {
            makeMove(selectedSquare, { row, col });
            setPuzzleStatus('correct');
          } else {
            setPuzzleStatus('incorrect');
            setPuzzleAttempts(prev => prev + 1);
            // Reset selection after wrong move
            setTimeout(() => {
              setPuzzleStatus('solving');
              setSelectedSquare(null);
              setPossibleMoves([]);
            }, 1500);
          }
        } else {
          // Select new piece
          const piece = board[row][col];
          if (piece && piece.color === 'w') {
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
        if (piece && piece.color === 'w') {
          setSelectedSquare({ row, col });
          setPossibleMoves(getValidMoves({ row, col }, board));
        }
      }
      return;
    }
    
    // Regular game modes (AI and friend)
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

  // Navigate puzzles
  const nextPuzzle = () => {
    const nextIndex = (currentPuzzle + 1) % chessPuzzles.length;
    setCurrentPuzzle(nextIndex);
    setBoard(chessPuzzles[nextIndex].fen);
    setCurrentTurn('w');
    setPuzzleStatus('solving');
    setPuzzleAttempts(0);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };
  
  const previousPuzzle = () => {
    const prevIndex = currentPuzzle === 0 ? chessPuzzles.length - 1 : currentPuzzle - 1;
    setCurrentPuzzle(prevIndex);
    setBoard(chessPuzzles[prevIndex].fen);
    setCurrentTurn('w');
    setPuzzleStatus('solving');
    setPuzzleAttempts(0);
    setSelectedSquare(null);
    setPossibleMoves([]);
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
    if (gameMode === 'puzzle') {
      // Reset current puzzle
      setBoard(chessPuzzles[currentPuzzle].fen);
      setPuzzleStatus('solving');
      setPuzzleAttempts(0);
    } else {
      // Reset regular game
      setBoard(createInitialBoard());
      setCapturedPieces({ white: [], black: [] });
      setScore({ white: 0, black: 0 });
    }
    setCurrentTurn('w');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    setIsInCheck(false);
    setGameOver(null);
  };

  // Start new game
  const startGame = (mode: 'ai' | 'friend' | 'puzzle') => {
    setGameMode(mode);
    if (mode === 'puzzle') {
      // Load first puzzle
      setBoard(chessPuzzles[currentPuzzle].fen);
      setCurrentTurn('w');
      setPuzzleStatus('solving');
      setPuzzleAttempts(0);
    } else {
      resetGame();
    }
  };

  // Menu screen
  if (gameMode === 'menu') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#2C3E50', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', color: 'white', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '30px' }}>♟️ Quick Chess</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <button
              onClick={() => startGame('ai')}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: '#3498DB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '250px'
              }}
            >
              🤖 Play vs AI
            </button>
            <button
              onClick={() => startGame('friend')}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: '#27AE60',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '250px'
              }}
            >
              👥 Pass & Play
            </button>
            <button
              onClick={() => startGame('puzzle')}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: '#9B59B6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '250px'
              }}
            >
              🧩 Puzzles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Puzzle screen
  if (gameMode === 'puzzle') {
    const puzzle = chessPuzzles[currentPuzzle];
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#34495E', 
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#2C3E50', 
          padding: '15px', 
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '600px',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{ 
            color: 'white', 
            marginBottom: '15px', 
            textAlign: 'center' 
          }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
              🧩 Puzzle {currentPuzzle + 1} of {chessPuzzles.length}
            </h2>
            <h3 style={{ margin: '0 0 10px 0', color: '#9B59B6', fontSize: '20px' }}>
              {puzzle.name}
            </h3>
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: puzzle.difficulty === 'beginner' ? '#27AE60' : 
                               puzzle.difficulty === 'intermediate' ? '#F39C12' : '#E74C3C',
                fontSize: '12px',
                marginRight: '10px'
              }}>
                {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
              </span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: '#34495E',
                fontSize: '12px'
              }}>
                {puzzle.category.charAt(0).toUpperCase() + puzzle.category.slice(1)}
              </span>
            </div>
            <div style={{ fontSize: '16px', marginTop: '10px' }}>
              {puzzle.description}
            </div>
          </div>
          
          {/* Puzzle Status */}
          {puzzleStatus === 'correct' && (
            <div style={{
              backgroundColor: '#27AE60',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ✅ Correct! Well done!
            </div>
          )}
          
          {puzzleStatus === 'incorrect' && (
            <div style={{
              backgroundColor: '#E74C3C',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              ❌ Not quite. Try again!
            </div>
          )}
          
          {/* Chess board using ChessBoard component */}
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            isInCheck={isInCheck}
            currentTurn={currentTurn}
            onSquareClick={handleSquareClick}
          />
          
          {/* Hint */}
          {puzzleAttempts > 1 && puzzleStatus === 'solving' && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#F39C12',
              color: 'white',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              💡 Hint: {puzzle.hint}
            </div>
          )}
          
          {/* Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <button
              onClick={previousPuzzle}
              style={{
                padding: '10px 15px',
                fontSize: '14px',
                backgroundColor: '#95A5A6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ← Previous
            </button>
            {puzzleStatus !== 'correct' && (
              <button
                onClick={resetGame}
                style={{
                  padding: '10px 15px',
                  fontSize: '14px',
                  backgroundColor: '#3498DB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Reset Puzzle
              </button>
            )}
            <button
              onClick={() => setGameMode('menu')}
              style={{
                padding: '10px 15px',
                fontSize: '14px',
                backgroundColor: '#E74C3C',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Back to Menu
            </button>
            {puzzleStatus === 'correct' && (
              <button
                onClick={nextPuzzle}
                style={{
                  padding: '10px 15px',
                  fontSize: '14px',
                  backgroundColor: '#27AE60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game screen - using ChessBoard component
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
        gap: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center'
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
          
          {/* Chess board using ChessBoard component */}
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            isInCheck={isInCheck}
            currentTurn={currentTurn}
            onSquareClick={handleSquareClick}
          />
          
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