import React from 'react';
import logo from './logo.svg';
import './App.css';

import Console from './Console';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Console />
      </header>
    </div>
  );
};

export default App;
