import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserId, ViewMode, Theme, AppView, Memory, Letter } from '../types';
import { INITIAL_MEMORIES, INITIAL_LETTERS } from '../data/mockData';

interface AppContextType {
  currentUser: UserId | null;
  setCurrentUser: (u: UserId | null) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  currentView: AppView;
  setCurrentView: (v: AppView) => void;
  memories: Memory[];
  addMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  letters: Letter[];
  addLetter: (l: Letter) => void;
  markLetterRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const APP_VERSION = '3';
if (typeof window !== 'undefined' && localStorage.getItem('rm_version') !== APP_VERSION) {
  localStorage.removeItem('rm_letters');
  localStorage.removeItem('rm_memories');
  localStorage.setItem('rm_version', APP_VERSION);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserId | null>(() =>
    loadFromStorage<UserId | null>('rm_user', null)
  );
  const [viewMode, setViewModeState] = useState<ViewMode>('merged');
  const [theme, setThemeState] = useState<Theme>(() =>
    loadFromStorage<Theme>('rm_theme', 'purple')
  );
  const [currentView, setCurrentView] = useState<AppView>('grid');
  const [memories, setMemories] = useState<Memory[]>(() =>
    loadFromStorage<Memory[]>('rm_memories', INITIAL_MEMORIES)
  );
  const [letters, setLetters] = useState<Letter[]>(() =>
    loadFromStorage<Letter[]>('rm_letters', INITIAL_LETTERS)
  );

  const setCurrentUser = useCallback((u: UserId | null) => {
    setCurrentUserState(u);
    saveToStorage('rm_user', u);
  }, []);

  const setViewMode = useCallback((m: ViewMode) => setViewModeState(m), []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    saveToStorage('rm_theme', t);
  }, []);

  const addMemory = useCallback((m: Memory) => {
    setMemories(prev => {
      const next = [...prev, m];
      saveToStorage('rm_memories', next);
      return next;
    });
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => {
      const next = prev.filter(m => m.id !== id);
      saveToStorage('rm_memories', next);
      return next;
    });
  }, []);

  const addLetter = useCallback((l: Letter) => {
    setLetters(prev => {
      const next = [...prev, l];
      saveToStorage('rm_letters', next);
      return next;
    });
  }, []);

  const markLetterRead = useCallback((id: string) => {
    setLetters(prev => {
      const next = prev.map(l => l.id === id ? { ...l, isRead: true } : l);
      saveToStorage('rm_letters', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      viewMode, setViewMode,
      theme, setTheme,
      currentView, setCurrentView,
      memories, addMemory, deleteMemory,
      letters, addLetter, markLetterRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
