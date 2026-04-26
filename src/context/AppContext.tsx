import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserId, ViewMode, Theme, AppView, Memory, Letter } from '../types';
import { supabase } from '../lib/supabase';

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
  updateMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  letters: Letter[];
  addLetter: (l: Letter) => void;
  markLetterRead: (id: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function loadPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function rowToMemory(row: Record<string, unknown>): Memory {
  return {
    id: row.id as string,
    date: row.date as string,
    author: row.author as UserId,
    type: row.type as Memory['type'],
    title: row.title as string,
    content: row.content as string,
    photos: (row.photos as string[]) ?? [],
    voiceNote: (row.voice_note as string) ?? undefined,
    location: (row.location as string) ?? undefined,
    dayOfJourney: row.day_of_journey as number,
  };
}

function memoryToRow(m: Memory) {
  return {
    id: m.id,
    date: m.date,
    author: m.author,
    type: m.type,
    title: m.title,
    content: m.content,
    photos: m.photos,
    voice_note: m.voiceNote ?? null,
    location: m.location ?? null,
    day_of_journey: m.dayOfJourney,
  };
}

function rowToLetter(row: Record<string, unknown>): Letter {
  return {
    id: row.id as string,
    from: row.from_user as UserId,
    to: row.to_user as UserId,
    title: row.title as string,
    content: row.content as string,
    scheduledDate: row.scheduled_date as string,
    scheduledTime: row.scheduled_time as string,
    createdAt: row.created_at as string,
    isRead: row.is_read as boolean,
  };
}

function letterToRow(l: Letter) {
  return {
    id: l.id,
    from_user: l.from,
    to_user: l.to,
    title: l.title,
    content: l.content,
    scheduled_date: l.scheduledDate,
    scheduled_time: l.scheduledTime,
    created_at: l.createdAt,
    is_read: l.isRead,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserId | null>(() =>
    loadPref<UserId | null>('rm_user', null)
  );
  const [viewMode, setViewModeState] = useState<ViewMode>('merged');
  const [theme, setThemeState] = useState<Theme>(() =>
    loadPref<Theme>('rm_theme', 'purple')
  );
  const [currentView, setCurrentView] = useState<AppView>('grid');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      const [{ data: mems }, { data: lets }] = await Promise.all([
        supabase.from('memories').select('*').order('date', { ascending: true }),
        supabase.from('letters').select('*').order('created_at', { ascending: true }),
      ]);
      if (!cancelled) {
        setMemories((mems ?? []).map(rowToMemory));
        setLetters((lets ?? []).map(rowToLetter));
        setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const memoriesChannel = supabase
      .channel('memories-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, payload => {
        setMemories(prev => {
          if (prev.find(m => m.id === (payload.new as Record<string, unknown>).id)) return prev;
          return [...prev, rowToMemory(payload.new as Record<string, unknown>)].sort((a, b) => a.date.localeCompare(b.date));
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'memories' }, payload => {
        setMemories(prev => prev.map(m =>
          m.id === (payload.new as Record<string, unknown>).id ? rowToMemory(payload.new as Record<string, unknown>) : m
        ));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'memories' }, payload => {
        setMemories(prev => prev.filter(m => m.id !== (payload.old as Record<string, unknown>).id));
      })
      .subscribe();

    const lettersChannel = supabase
      .channel('letters-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'letters' }, payload => {
        setLetters(prev => {
          if (prev.find(l => l.id === (payload.new as Record<string, unknown>).id)) return prev;
          return [...prev, rowToLetter(payload.new as Record<string, unknown>)];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'letters' }, payload => {
        setLetters(prev => prev.map(l =>
          l.id === (payload.new as Record<string, unknown>).id ? rowToLetter(payload.new as Record<string, unknown>) : l
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(memoriesChannel);
      supabase.removeChannel(lettersChannel);
    };
  }, []);

  const setCurrentUser = useCallback((u: UserId | null) => {
    setCurrentUserState(u);
    localStorage.setItem('rm_user', JSON.stringify(u));
  }, []);

  const setViewMode = useCallback((m: ViewMode) => setViewModeState(m), []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('rm_theme', JSON.stringify(t));
  }, []);

  const addMemory = useCallback(async (m: Memory) => {
    setMemories(prev => [...prev, m].sort((a, b) => a.date.localeCompare(b.date)));
    await supabase.from('memories').insert(memoryToRow(m));
  }, []);

  const updateMemory = useCallback(async (m: Memory) => {
    setMemories(prev => prev.map(mem => mem.id === m.id ? m : mem));
    await supabase.from('memories').update(memoryToRow(m)).eq('id', m.id);
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    await supabase.from('memories').delete().eq('id', id);
  }, []);

  const addLetter = useCallback(async (l: Letter) => {
    setLetters(prev => [...prev, l]);
    await supabase.from('letters').insert(letterToRow(l));
  }, []);

  const markLetterRead = useCallback(async (id: string) => {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, isRead: true } : l));
    await supabase.from('letters').update({ is_read: true }).eq('id', id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      viewMode, setViewMode,
      theme, setTheme,
      currentView, setCurrentView,
      memories, addMemory, updateMemory, deleteMemory,
      letters, addLetter, markLetterRead,
      loading,
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
