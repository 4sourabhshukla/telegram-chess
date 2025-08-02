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
export const isSquareAttacked = (square: Square, byColor: PieceColor, board: Piece[][]): boolean => {
  // Implement attack detection logic here (for brevity, left as a stub)
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
  // Implement move generation logic here (for brevity, left as a stub)
  return [];
};