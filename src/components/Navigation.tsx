import React, { useState } from 'react';
import { Settings, Mail, Calendar, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserId, USER_NAMES, START_DATE } from '../types';
import { daysBetween } from '../utils/dateUtils';
import CalendarView from './CalendarView';

const TODAY = new Date();
const END_LABEL = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][TODAY.getMonth()]} ${TODAY.getFullYear()}`;

export default function Navigation() {
  const { currentUser, setCurrentUser, theme, setTheme, currentView, setCurrentView } = useApp();
  const [showCalendar, setShowCalendar] = useState(false);

  const totalDays = daysBetween(START_DATE, TODAY) + 1;

  const avatarStyle = (id: UserId) => ({
    background: id === 'shiyun'
      ? 'linear-gradient(135deg, #C97EA0, #D4937A)'
      : 'linear-gradient(135deg, #7DAFC8, #9AACAA)',
  });

  return (
    <>
    <nav className="glass fixed top-0 left-0 right-0 z-40 px-6 py-3 flex items-center gap-4">
      {/* Logo */}
      <button
        onClick={() => setCurrentView('grid')}
        className="font-serif text-xl font-light text-primary mr-2 shrink-0"
      >
        Remember We
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Day counter */}
      <span className="text-xs text-secondary hidden sm:block">
        Day <span className="font-serif text-base text-primary">{totalDays}</span>
      </span>

      {/* View buttons */}
      <button
        onClick={() => setCurrentView('grid')}
        className={`px-3 py-1 rounded-full text-xs transition-all ${
          currentView === 'grid'
            ? 'bg-white/40 text-primary'
            : 'text-secondary hover:text-primary'
        }`}
      >
        星点 Stars
      </button>
      <button
        onClick={() => setCurrentView('letters')}
        className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 ${
          currentView === 'letters'
            ? 'bg-white/40 text-primary'
            : 'text-secondary hover:text-primary'
        }`}
      >
        <Mail size={12} />
        <span>信件 Letters</span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-white/30" />

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'purple' ? 'mint' : 'purple')}
        className="text-secondary hover:text-primary transition-colors"
        title="切换主题"
      >
        {theme === 'purple' ? <Moon size={15} /> : <Sun size={15} />}
      </button>

      {/* Calendar icon + date range — clickable */}
      <button
        onClick={() => setShowCalendar(true)}
        className="flex items-center gap-1.5 text-secondary text-xs hidden md:flex hover:text-primary transition-colors rounded-full px-2 py-1 hover:bg-white/20"
      >
        <Calendar size={13} />
        <span className="font-light italic">Apr 2024 — {END_LABEL}</span>
        <span className="text-secondary/50">· 诗云 & Tim</span>
      </button>

      {/* User avatars */}
      {(['shiyun', 'tim'] as UserId[]).map((id) => (
        <button
          key={id}
          onClick={() => setCurrentUser(id)}
          title={`切换到 ${USER_NAMES[id]}`}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-light transition-all ${
            currentUser === id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
          }`}
          style={avatarStyle(id)}
        >
          {USER_NAMES[id][0]}
        </button>
      ))}

      {/* Logout */}
      <button
        onClick={() => setCurrentUser(null)}
        title="返回选择"
        className="text-secondary hover:text-primary transition-colors ml-1"
      >
        <Settings size={15} />
      </button>
    </nav>
    {showCalendar && <CalendarView onClose={() => setShowCalendar(false)} />}
    </>
  );
}
