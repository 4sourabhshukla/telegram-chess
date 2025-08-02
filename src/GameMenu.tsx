import React from 'react';

type Props = {
  startGame: (mode: 'ai' | 'friend' | 'puzzle') => void;
};

const GameMenu: React.FC<Props> = ({ startGame }) => (
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
        <button
          onClick={() => startGame('puzzle')}
          style={{
            padding: '20px 40px',
            fontSize: '20px',
            backgroundColor: '#9a4317ff',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            width: '250px'
          }}
        >
          🧩 Solve Puzzles
        </button>
      </div>
    </div>
  </div>
);

export default GameMenu;