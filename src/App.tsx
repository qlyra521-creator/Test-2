import React from 'react';
import { useApp } from './context/AppContext';
import UserSelector from './components/UserSelector';
import Navigation from './components/Navigation';
import StarGrid from './components/StarGrid';
import LetterSystem from './components/LetterSystem';

function LoadingScreen() {
  return (
    <div className="app-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="font-serif text-4xl font-light text-primary mb-3 animate-float">✦</div>
        <div className="text-secondary text-sm tracking-widest">Loading…</div>
      </div>
    </div>
  );
}

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
  const { currentUser, loading } = useApp();
  if (loading) return <LoadingScreen />;
  return currentUser ? <MainApp /> : <UserSelector />;
}
