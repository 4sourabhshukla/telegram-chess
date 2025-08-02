// Types
// Represents pawn, knight, bishop, rook, queen, king
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
// Represents white or black pieces
export type PieceColor = 'w' | 'b';

export type Piece = { type: PieceType; color: PieceColor } | null;
export type Square = { row: number; col: number };
export type Move = { from: Square; to: Square; score?: number };

// Initial board setup
export const createInitialBoard = (): Piece[][] => [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];

// Piece symbols
export const pieceSymbols: Record<string, string> = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

// Piece values for AI
export const pieceValues: Record<PieceType, number> = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
};

// Get piece symbol
export const getPieceSymbol = (piece: Piece): string => {
  if (!piece) return '';
  return pieceSymbols[`${piece.color}${piece.type}`] || '';
};

// Find king position
export const findKing = (board: Piece[][], color: PieceColor): Square | null => {
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
export const isSquareAttacked = (_square: Square, _byColor: PieceColor, _board: Piece[][]): boolean => {
  const { row: targetRow, col: targetCol } = _square;
  const directions = {
    bishop: [
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ],
    rook: [
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ],
    knight: [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ],
    king: [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]
  };

  // Check for pawn attacks
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = _board[row][col];
      if (!piece || piece.color !== _byColor) continue;
      switch (piece.type) {
        case 'p': {
          const direction = piece.color === 'w' ? -1 : 1;
          if (row + direction === targetRow && Math.abs(col - targetCol) === 1) {
            return true;
          }
          break;
        }
        case 'n': {
          for (const [dr, dc] of directions.knight) {
            if (row + dr === targetRow && col + dc === targetCol) {
              return true;
            }
          }
          break;
        }
        case 'b': {
          for (const [dr, dc] of directions.bishop) {
            for (let i = 1; i < 8; i++) {
              const r = row + dr * i;
              const c = col + dc * i;
              if (r < 0 || r > 7 || c < 0 || c > 7) break;
              if (r === targetRow && c === targetCol) return true;
              if (_board[r][c]) break;
            }
          }
          break;
        }
        case 'r': {
          for (const [dr, dc] of directions.rook) {
            for (let i = 1; i < 8; i++) {
              const r = row + dr * i;
              const c = col + dc * i;
              if (r < 0 || r > 7 || c < 0 || c > 7) break;
              if (r === targetRow && c === targetCol) return true;
              if (_board[r][c]) break;
            }
          }
          break;
        }
        case 'q': {
          for (const [dr, dc] of [...directions.bishop, ...directions.rook]) {
            for (let i = 1; i < 8; i++) {
              const r = row + dr * i;
              const c = col + dc * i;
              if (r < 0 || r > 7 || c < 0 || c > 7) break;
              if (r === targetRow && c === targetCol) return true;
              if (_board[r][c]) break;
            }
          }
          break;
        }
        case 'k': {
          for (const [dr, dc] of directions.king) {
            const r = row + dr;
            const c = col + dc;
            if (r === targetRow && c === targetCol) return true;
          }
          break;
        }
      }
    }
  }
  return false;
};

// Check if king is in check
export const isKingInCheck = (color: PieceColor, board: Piece[][]): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(kingPos, color === 'w' ? 'b' : 'w', board);
};

// Simulate a move and check if it leaves king in check
export const wouldMoveLeaveKingInCheck = (from: Square, to: Square, board: Piece[][]): boolean => {
  const piece = board[from.row][from.col];
  if (!piece) return false;
  const testBoard = board.map(row => [...row]);
  testBoard[to.row][to.col] = piece;
  testBoard[from.row][from.col] = null;
  return isKingInCheck(piece.color, testBoard);
};

// Get possible moves without check validation (used for attack detection)
export const getPossibleMovesWithoutCheckValidation = (from: Square, board: Piece[][]): Square[] => {
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
    case 'p': {
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
    }
    case 'n': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach(([rowOffset, colOffset]) => {
        addMoveIfValid(from.row + rowOffset, from.col + colOffset);
      });
      break;
    }
    case 'b': {
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
    }
    case 'r': {
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
    }
    case 'q': {
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
    }
    case 'k': {
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          if (rowOffset === 0 && colOffset === 0) continue;
          addMoveIfValid(from.row + rowOffset, from.col + colOffset);
        }
      }
      break;
    }
  }

  return moves;
};