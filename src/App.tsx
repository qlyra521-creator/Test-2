import React from 'react';
import { useApp } from './context/AppContext';
import UserSelector from './components/UserSelector';
import Navigation from './components/Navigation';
import StarGrid from './components/StarGrid';
import LetterSystem from './components/LetterSystem';

function MainApp() {
  const { currentView } = useApp();

  return (
    <div className="app-bg min-h-screen">
      <Navigation />
      {currentView === 'grid' ? <StarGrid /> : <LetterSystem />}
    </div>
  );
}

export default function App() {
  const { currentUser } = useApp();
  return currentUser ? <MainApp /> : <UserSelector />;
}
