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
    <nav className="glass fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-4">
      {/* Logo */}
      <button
        onClick={() => setCurrentView('grid')}
        className="font-serif text-base sm:text-xl font-light text-primary shrink-0"
      >
        Remember We
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Day counter — desktop only */}
      <span className="text-xs text-secondary hidden sm:block">
        Day <span className="font-serif text-base text-primary">{totalDays}</span>
      </span>

      {/* View buttons */}
      <div className="flex items-center glass rounded-full overflow-hidden text-xs">
        <button
          onClick={() => setCurrentView('grid')}
          className={`px-3 py-1.5 transition-all flex items-center gap-1 ${
            currentView === 'grid' ? 'bg-white/40 text-primary' : 'text-secondary'
          }`}
        >
          <span style={{ fontSize: 11 }}>✦</span>
          <span>星点 <span className="hidden sm:inline">Stars</span></span>
        </button>
        <button
          onClick={() => setCurrentView('letters')}
          className={`px-3 py-1.5 transition-all flex items-center gap-1 ${
            currentView === 'letters' ? 'bg-white/40 text-primary' : 'text-secondary'
          }`}
        >
          <Mail size={12} />
          <span>信件 <span className="hidden sm:inline">Letters</span></span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/30 hidden sm:block" />

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'purple' ? 'mint' : 'purple')}
        className="text-secondary hover:text-primary transition-colors"
        title="切换主题"
      >
        {theme === 'purple' ? <Moon size={15} /> : <Sun size={15} />}
      </button>

      {/* Calendar — desktop only */}
      <button
        onClick={() => setShowCalendar(true)}
        className="flex items-center gap-1.5 text-secondary text-xs hover:text-primary transition-colors rounded-full px-2 py-1 hover:bg-white/20"
      >
        <Calendar size={13} />
        <span className="font-light italic hidden md:inline">Apr 2024 — {END_LABEL}</span>
      </button>

      {/* User avatars */}
      {(['shiyun', 'tim'] as UserId[]).map((id) => (
        <button
          key={id}
          onClick={() => setCurrentUser(id)}
          title={`切换到 ${USER_NAMES[id]}`}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-light transition-all shrink-0 ${
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
        className="text-secondary hover:text-primary transition-colors"
      >
        <Settings size={15} />
      </button>
    </nav>
    {showCalendar && <CalendarView onClose={() => setShowCalendar(false)} />}
    </>
  );
}
