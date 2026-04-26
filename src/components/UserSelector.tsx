import React from 'react';
import { useApp } from '../context/AppContext';
import { UserId, START_DATE } from '../types';
import { daysBetween } from '../utils/dateUtils';

const ANNIVERSARY_DATE = new Date(2026, 3, 29); // April 29, 2026

export default function UserSelector() {
  const { setCurrentUser, theme, setTheme } = useApp();
  const today = new Date();
  const totalDays = daysBetween(START_DATE, today) + 1;
  const daysToAnniversary = daysBetween(today, ANNIVERSARY_DATE);

  const profiles: { id: UserId; name: string; nameZh: string; desc: string }[] = [
    { id: 'shiyun', name: '诗云', nameZh: 'Shiyun', desc: 'Continue our journey' },
    { id: 'tim', name: 'Tim', nameZh: 'Tim', desc: 'Continue our journey' },
  ];

  return (
    <div className="app-bg min-h-screen flex flex-col items-center justify-center px-6 relative">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'purple' ? 'mint' : 'purple')}
        className="absolute top-6 right-6 glass rounded-full px-4 py-2 text-xs text-secondary hover:opacity-80 transition-opacity"
      >
        {theme === 'purple' ? '🌿 薄荷' : '🌸 紫罗兰'}
      </button>

      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        {/* Title with mirror reflection */}
        <div className="relative inline-block mb-3">
          <h1 className="font-serif text-6xl font-light text-primary tracking-wide leading-none">
            Remember We
          </h1>
          {/* Mirror reflection */}
          <div
            aria-hidden="true"
            className="font-serif text-6xl font-light tracking-wide leading-none select-none pointer-events-none"
            style={{
              transform: 'scaleY(-1)',
              opacity: 0.18,
              color: 'var(--text-primary)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
              marginTop: '2px',
            }}
          >
            Remember We
          </div>
        </div>
        <p className="text-secondary text-sm tracking-widest uppercase">
          Every point is a star in our shared sky
        </p>
        <p className="text-secondary text-sm mt-1">
          每一颗星点，都是我们共享过的时刻
        </p>
      </div>

      {/* Relationship stats */}
      <div className="glass-card px-8 py-5 mb-10 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-12 items-center">
          <div>
            <div className="font-serif text-4xl font-light text-primary">{totalDays}</div>
            <div className="text-xs text-secondary mt-1 uppercase tracking-wider">在一起 · Days Together</div>
          </div>
          <div className="w-px h-10 bg-white/40" />
          <div>
            <div className="font-serif text-4xl font-light text-primary">
              {daysToAnniversary > 0 ? daysToAnniversary : '🎉'}
            </div>
            <div className="text-xs text-secondary mt-1 uppercase tracking-wider">
              {daysToAnniversary > 0 ? '两周年 · 2nd Anniversary' : '两周年快乐 · Happy 2nd Anniversary!'}
            </div>
          </div>
          <div className="w-px h-10 bg-white/40" />
          <div>
            <div className="font-serif text-lg font-light text-primary">2024.04.29</div>
            <div className="text-xs text-secondary mt-1 uppercase tracking-wider">起始 · Since</div>
          </div>
        </div>
      </div>

      {/* Profile cards */}
      <div className="flex gap-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => setCurrentUser(profile.id)}
            className="glass-card px-10 py-8 flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-300 group"
            style={{ minWidth: 200 }}
          >
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-serif font-light"
              style={{
                background: profile.id === 'shiyun'
                  ? 'linear-gradient(135deg, #C97EA0, #D4937A)'
                  : 'linear-gradient(135deg, #7DAFC8, #9AACAA)',
              }}
            >
              {profile.name[0]}
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl font-light text-primary">{profile.name}</div>
              <div className="text-secondary text-xs mt-0.5 tracking-wider">{profile.nameZh}</div>
            </div>
            <div className="text-xs text-secondary/70 mt-1">{profile.desc}</div>
            <div
              className="mt-2 px-5 py-1.5 rounded-full text-sm font-light text-white transition-opacity"
              style={{
                background: profile.id === 'shiyun'
                  ? 'linear-gradient(135deg, #C97EA0, #D4937A)'
                  : 'linear-gradient(135deg, #7DAFC8, #9AACAA)',
              }}
            >
              Enter →
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-secondary/60 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        诗云 & Tim · 2024.04.29 — forever
      </p>
    </div>
  );
}
