import React from 'react';
import { Analytics } from '@vercel/analytics/react';
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

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="app-bg min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="font-serif text-4xl font-light text-primary mb-4">✦</div>
        <div className="text-primary text-base font-semibold mb-2">无法连接到数据库</div>
        <div className="text-secondary text-sm mb-4 leading-relaxed">{message}</div>
        <div className="text-secondary text-xs leading-relaxed">
          请前往 Supabase 控制台检查项目状态，若项目已暂停请点击 "Restore project" 恢复。
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 px-4 py-2 text-sm rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
        >
          重试
        </button>
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
  const { currentUser, loading, dbError } = useApp();
  if (loading) return <LoadingScreen />;
  if (dbError) return <ErrorScreen message={dbError} />;
  return (
    <>
      {currentUser ? <MainApp /> : <UserSelector />}
      <Analytics />
    </>
  );
}
