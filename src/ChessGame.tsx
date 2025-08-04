import React, { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';

// TypeScript declaration for chess.js global
declare global {
  interface Window {
    Chess: any;
  }
}

// Types
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';
type Piece = { type: PieceType; color: PieceColor } | null;
type Square = { row: number; col: number };

// Piece Unicode symbols
const pieceSymbols: Record<string, string> = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

// Piece values for AI
const pieceValues: Record<PieceType, number> = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
};

// Convert chess.js square notation (e.g., 'e4') to board indices
const squareToIndices = (square: string): Square => {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1]);
  return { row, col };
};

// Convert board indices to chess.js square notation
const indicesToSquare = (row: number, col: number): string => {
  return `${String.fromCharCode('a'.charCodeAt(0) + col)}${8 - row}`;
};

// Convert chess.js board to our board format
const convertChessJSBoard = (chess: any): Piece[][] => {
  const board: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = indicesToSquare(row, col);
      const piece = chess.get(square);
      if (piece) {
        board[row][col] = {
          type: piece.type as PieceType,
          color: piece.color as PieceColor
        };
      }
    }
  }
  
  return board;
};

// Chess puzzles
const chessPuzzles = [
  {
    id: 1,
    name: "Back Rank Mate",
    category: 'checkmate',
    difficulty: 'beginner',
    fen: "3r1k1/5ppp/8/8/3Q4/8/5PPP/6K1 w - - 0 1",
    solution: { from: "d4", to: "d8" },
    hint: "Look for a back rank checkmate!",
    description: "White to move - Mate in 1"
  },
  {
    id: 2,
    name: "Queen and King Mate",
    category: 'checkmate',
    difficulty: 'beginner',
    fen: "7k/8/5K2/8/8/1Q6/8/8 w - - 0 1",
    solution: { from: "b3", to: "g8" },
    hint: "Drive the king to the edge and deliver mate!",
    description: "White to move - Mate in 1"
  },
  {
    id: 3,
    name: "Smothered Mate",
    category: 'checkmate',
    difficulty: 'intermediate',
    fen: "5rk1/5ppp/6N1/8/8/8/8/6K1 w - - 0 1",
    solution: { from: "g6", to: "e7" },
    hint: "The knight can deliver a special mate when the king is trapped by its own pieces!",
    description: "White to move - Mate in 1"
  },
  {
    id: 4,
    name: "Fork Attack",
    category: 'tactics',
    difficulty: 'beginner',
    fen: "r2r2k1/ppp2ppp/8/4p3/4P3/2N5/PPP2PPP/R4RK1 w - - 0 1",
    solution: { from: "c3", to: "d5" },
    hint: "Knights are great at attacking two pieces at once!",
    description: "White to move - Win material"
  },
  {
    id: 5,
    name: "Castling Defense",
    category: 'tactics',
    difficulty: 'beginner',
    fen: "r3k2r/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/R3K2R w KQkq - 0 1",
    solution: { from: "e1", to: "g1" },
    hint: "Castle to safety!",
    description: "White to move - Castle kingside"
  },
  {
    id: 6,
    name: "En Passant Capture",
    category: 'tactics',
    difficulty: 'intermediate',
    fen: "rnbqkbnr/ppp2ppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
    solution: { from: "e5", to: "d6" },
    hint: "Capture the pawn that just moved two squares!",
    description: "White to move - En passant"
  },
  {
    id: 7,
    name: "Pawn Promotion",
    category: 'endgame',
    difficulty: 'beginner',
    fen: "8/1P4k1/8/8/8/5K2/8/8 w - - 0 1",
    solution: { from: "b7", to: "b8" },
    hint: "Push the pawn to promote!",
    description: "White to move - Promote and win"
  }
];

// Promotion Modal Component
interface PromotionModalProps {
  color: PieceColor;
  onSelect: (piece: string) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect }) => {
  const pieces = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' }
  ];
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2C3E50',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
          Choose Promotion Piece
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {pieces.map(piece => (
            <button
              key={piece.type}
              onClick={() => onSelect(piece.type)}
              style={{
                padding: '10px',
                fontSize: '48px',
                backgroundColor: '#34495E',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                color: color === 'w' ? '#FFFFFF' : '#000000',
                textShadow: color === 'w' 
                  ? '0 0 3px #000' 
                  : '0 0 3px #FFF'
              }}
            >
              {pieceSymbols[`${color}${piece.type}`]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChessGame: React.FC = () => {
  const [chess] = useState<any>(() => new window.Chess());
  const [board, setBoard] = useState<Piece[][]>(() => convertChessJSBoard(chess));
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
  const [promotionModal, setPromotionModal] = useState<{ from: string; to: string; color: PieceColor } | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Update board and game state after moves
  const updateGameState = () => {
    setBoard(convertChessJSBoard(chess));
    setCurrentTurn(chess.turn());
    setIsInCheck(chess.in_check());
    
    // Check game over conditions
    if (chess.game_over()) {
      if (chess.in_checkmate()) {
        setGameOver({
          winner: chess.turn() === 'w' ? 'b' : 'w',
          reason: 'Checkmate!'
        });
      } else if (chess.in_stalemate()) {
        setGameOver({
          winner: 'draw',
          reason: 'Stalemate - Draw!'
        });
      } else if (chess.in_threefold_repetition()) {
        setGameOver({
          winner: 'draw',
          reason: 'Draw by threefold repetition!'
        });
      } else if (chess.insufficient_material()) {
        setGameOver({
          winner: 'draw',
          reason: 'Draw by insufficient material!'
        });
      } else if (chess.in_draw()) {
        setGameOver({
          winner: 'draw',
          reason: 'Draw by 50-move rule!'
        });
      }
    }
  };

  // Get piece symbol
  const getPieceSymbol = (piece: Piece): string => {
    if (!piece) return '';
    return pieceSymbols[`${piece.color}${piece.type}`] || '';
  };

  // Get possible moves for a square
  const getPossibleMovesForSquare = (row: number, col: number): Square[] => {
    const square = indicesToSquare(row, col);
    const moves = chess.moves({ square, verbose: true });
    
    return moves.map((move: any) => squareToIndices(move.to));
  };

  // Make a move
  const makeMove = (from: string, to: string, promotion?: string) => {
    try {
      const move = chess.move({ from, to, promotion });
      if (!move) return false;
      
      // Track captured piece
      if (move.captured) {
        const capturedPiece: Piece = {
          type: move.captured as PieceType,
          color: move.color === 'w' ? 'b' : 'w'
        };
        const capturedBy = move.color === 'w' ? 'white' : 'black';
        
        setCapturedPieces(prev => ({
          ...prev,
          [capturedBy]: [...prev[capturedBy], capturedPiece]
        }));
        
        // Update score
        const points = pieceValues[capturedPiece.type];
        setScore(prev => ({
          ...prev,
          [capturedBy]: prev[capturedBy] + points
        }));
      }
      
      // Update move history
      setMoveHistory(prev => [...prev, move.san]);
      
      // Clear selection
      setSelectedSquare(null);
      setPossibleMoves([]);
      
      // Update game state
      updateGameState();
      return true;
    } catch (e) {
      console.error('Invalid move:', e);
      return false;
    }
  };

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || promotionModal || isAIThinking) return;
    
    const clickedSquare = indicesToSquare(row, col);
    
    // Puzzle mode
    if (gameMode === 'puzzle') {
      if (puzzleStatus !== 'solving') return;
      
      const puzzle = chessPuzzles[currentPuzzle];
      
      if (selectedSquare) {
        const fromSquare = indicesToSquare(selectedSquare.row, selectedSquare.col);
        const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
        
        if (isValidMove) {
          // Check if this is the correct solution
          const isCorrect = fromSquare === puzzle.solution.from && clickedSquare === puzzle.solution.to;
          
          if (isCorrect) {
            makeMove(fromSquare, clickedSquare);
            setPuzzleStatus('correct');
          } else {
            setPuzzleStatus('incorrect');
            setPuzzleAttempts(prev => prev + 1);
            setTimeout(() => {
              setPuzzleStatus('solving');
              setSelectedSquare(null);
              setPossibleMoves([]);
            }, 1500);
          }
        } else {
          // Select new piece
          const piece = chess.get(clickedSquare);
          if (piece && piece.color === 'w') {
            setSelectedSquare({ row, col });
            setPossibleMoves(getPossibleMovesForSquare(row, col));
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        }
      } else {
        // Select a piece
        const piece = chess.get(clickedSquare);
        if (piece && piece.color === 'w') {
          setSelectedSquare({ row, col });
          setPossibleMoves(getPossibleMovesForSquare(row, col));
        }
      }
      return;
    }
    
    // Regular game modes
    if (selectedSquare) {
      const fromSquare = indicesToSquare(selectedSquare.row, selectedSquare.col);
      const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        // Check if this is a pawn promotion
        const piece = chess.get(fromSquare);
        if (piece && piece.type === 'p' && 
            ((piece.color === 'w' && row === 0) || (piece.color === 'b' && row === 7))) {
          setPromotionModal({ from: fromSquare, to: clickedSquare, color: piece.color });
        } else {
          makeMove(fromSquare, clickedSquare);
        }
      } else {
        // Select new piece
        const piece = chess.get(clickedSquare);
        if (piece && piece.color === chess.turn() && 
            (gameMode === 'friend' || (gameMode === 'ai' && chess.turn() === 'w'))) {
          setSelectedSquare({ row, col });
          setPossibleMoves(getPossibleMovesForSquare(row, col));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select a piece
      const piece = chess.get(clickedSquare);
      if (piece && piece.color === chess.turn() && 
          (gameMode === 'friend' || (gameMode === 'ai' && chess.turn() === 'w'))) {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMovesForSquare(row, col));
      }
    }
  };

  // Handle promotion
  const handlePromotion = (piece: string) => {
    if (!promotionModal) return;
    
    makeMove(promotionModal.from, promotionModal.to, piece);
    setPromotionModal(null);
  };

  // Get best move for AI
  const getBestMove = (): { from: string; to: string } | null => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    // Evaluate each move
    const evaluatedMoves = moves.map((move: any) => {
      chess.move(move);
      
      let score = 0;
      
      // Material count
      const board = chess.board();
      for (let row of board) {
        for (let square of row) {
          if (square) {
            const value = pieceValues[square.type as PieceType];
            score += square.color === 'b' ? value : -value;
          }
        }
      }
      
      // Bonuses
      if (move.captured) score += pieceValues[move.captured as PieceType] * 10;
      if (chess.in_check()) score += 50;
      if (move.flags.includes('k') || move.flags.includes('q')) score += 30; // Castling
      
      chess.undo();
      
      return { move, score };
    });
    
    // Sort by score and pick one of the best
    evaluatedMoves.sort((a: { score: number; }, b: { score: number; }) => b.score - a.score);
    const bestScore = evaluatedMoves[0].score;
    const bestMoves = evaluatedMoves.filter((m: { score: any; }) => m.score === bestScore);
    const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
    
    return { from: selectedMove.from, to: selectedMove.to };
  };

  // AI move
  useEffect(() => {
    if (gameMode !== 'ai' || currentTurn !== 'b' || gameOver || promotionModal || isAIThinking) return;
    
    setIsAIThinking(true);
    const timer = setTimeout(() => {
      const bestMove = getBestMove();
      if (bestMove) {
        // Check if AI needs to promote
        const piece = chess.get(bestMove.from);
        if (piece && piece.type === 'p') {
          const toRow = squareToIndices(bestMove.to).row;
          if (toRow === 7) {
            makeMove(bestMove.from, bestMove.to, 'q'); // AI always promotes to queen
            setIsAIThinking(false);
            return;
          }
        }
        makeMove(bestMove.from, bestMove.to);
      }
      setIsAIThinking(false);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      setIsAIThinking(false);
    };
  }, [currentTurn, gameMode, gameOver, promotionModal]);

  // Reset game
  const resetGame = () => {
    setIsAIThinking(false);
    
    if (gameMode === 'puzzle') {
      // Reset current puzzle
      chess.load(chessPuzzles[currentPuzzle].fen);
      setPuzzleStatus('solving');
      setPuzzleAttempts(0);
    } else {
      // Reset regular game
      chess.reset();
      setCapturedPieces({ white: [], black: [] });
      setScore({ white: 0, black: 0 });
    }
    
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    setGameOver(null);
    setPromotionModal(null);
    
    // Update game state
    updateGameState();
  };

  // Start new game
  const startGame = (mode: 'ai' | 'friend' | 'puzzle') => {
    setGameMode(mode);
    setIsAIThinking(false);
    
    if (mode === 'puzzle') {
      chess.load(chessPuzzles[currentPuzzle].fen);
      setPuzzleStatus('solving');
      setPuzzleAttempts(0);
    } else {
      chess.reset();
      setCapturedPieces({ white: [], black: [] });
      setScore({ white: 0, black: 0 });
    }
    
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    setGameOver(null);
    
    // Update game state
    updateGameState();
  };

  // Navigate puzzles
  const nextPuzzle = () => {
    const nextIndex = (currentPuzzle + 1) % chessPuzzles.length;
    setCurrentPuzzle(nextIndex);
    chess.load(chessPuzzles[nextIndex].fen);
    setPuzzleStatus('solving');
    setPuzzleAttempts(0);
    setSelectedSquare(null);
    setPossibleMoves([]);
    updateGameState();
  };
  
  const previousPuzzle = () => {
    const prevIndex = currentPuzzle === 0 ? chessPuzzles.length - 1 : currentPuzzle - 1;
    setCurrentPuzzle(prevIndex);
    chess.load(chessPuzzles[prevIndex].fen);
    setPuzzleStatus('solving');
    setPuzzleAttempts(0);
    setSelectedSquare(null);
    setPossibleMoves([]);
    updateGameState();
  };

  // Initialize chess on first render if not already done
  if (!chess) {
    return null; // Brief moment while initializing
  }

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
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#BDC3C7' }}>
            <p>Powered by chess.js library</p>
            <p>Full FIDE chess rules including:</p>
            <p>Castling • En Passant • Pawn Promotion</p>
            <p>50-Move Rule • Threefold Repetition</p>
          </div>
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
          
          {/* Chess board */}
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
              onClick={() => {
                setGameMode('menu');
                setIsAIThinking(false);
              }}
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
      {/* Promotion Modal */}
      {promotionModal && (
        <PromotionModal
          color={promotionModal.color}
          onSelect={handlePromotion}
        />
      )}
      
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
              {isAIThinking && <span style={{ color: '#3498DB', marginLeft: '10px' }}>AI thinking...</span>}
            </div>
            <div style={{ fontSize: '12px', color: '#BDC3C7', marginTop: '5px' }}>
              Move {Math.floor(moveHistory.length / 2) + 1}
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
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            isInCheck={isInCheck}
            currentTurn={currentTurn}
            onSquareClick={handleSquareClick}
          />
          
          {/* Move History */}
          {moveHistory.length > 0 && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '12px',
              maxHeight: '50px',
              overflowY: 'auto'
            }}>
              <strong>Moves:</strong> {moveHistory.join(', ')}
            </div>
          )}
          
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