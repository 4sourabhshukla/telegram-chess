import React from 'react';

type Props = {
  startGame: (mode: 'ai' | 'friend' | 'puzzle') => void;
};

const GameMenu: React.FC<Props> = ({ startGame }) => (
  <div className="menu-bg">
    <div className="menu-center">
      <h1 className="menu-title">♟️ Telegram Chess</h1>
      <div className="menu-btn-group">
        <button className="menu-btn" onClick={() => startGame('ai')}>🤖 Play vs AI</button>
        <button className="menu-btn" onClick={() => startGame('friend')}>👥 Pass & Play</button>
        <button className="menu-btn" onClick={() => startGame('puzzle')}>🧩 Solve Puzzles</button>
      </div>
    </div>
  </div>
);

export default GameMenu;