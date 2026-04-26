import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory, MEMORY_COLORS, MEMORY_LABELS, USER_NAMES, START_DATE } from '../types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface Props { onClose: () => void }

export default function CalendarView({ onClose }: Props) {
  const { memories, currentUser, viewMode } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const visibleMemories = useMemo(() => {
    if (!currentUser || viewMode === 'merged') return memories;
    if (viewMode === 'mine') return memories.filter(m => m.author === currentUser);
    return memories.filter(m => m.author !== currentUser);
  }, [memories, currentUser, viewMode]);

  const byDate = useMemo(() => {
    const map: Record<string, Memory[]> = {};
    for (const m of visibleMemories) {
      (map[m.date] ??= []).push(m);
    }
    return map;
  }, [visibleMemories]);

  const firstDayOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const canPrev = year > START_DATE.getFullYear() || (year === START_DATE.getFullYear() && month > START_DATE.getMonth());
  const canNext = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

  const prevMonth = () => { if (!canPrev) return; month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1); setSelectedDate(null); };
  const nextMonth = () => { if (!canNext) return; month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1); setSelectedDate(null); };

  const selectedMemories = selectedDate ? (byDate[selectedDate] ?? []) : [];

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div
        className="w-full max-w-sm animate-slide-up flex flex-col overflow-hidden"
        style={{
          maxHeight: '88vh',
          background: 'rgba(255, 251, 247, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 40px rgba(80, 60, 100, 0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Month navigation header */}
        <div className="flex items-center px-5 py-4" style={{ borderBottom: '1px solid rgba(200, 190, 210, 0.2)' }}>
          <button
            onClick={prevMonth}
            disabled={!canPrev}
            className="text-secondary hover:text-primary transition-colors disabled:opacity-25 p-1"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="flex-1 text-center">
            <div className="font-serif text-xl font-light text-primary leading-tight">
              {MONTHS_EN[month]} {year}
            </div>
            <div className="text-xs text-secondary/50 mt-0.5">{MONTHS_ZH[month]} {year}</div>
          </div>

          <button
            onClick={nextMonth}
            disabled={!canNext}
            className="text-secondary hover:text-primary transition-colors disabled:opacity-25 p-1"
          >
            <ChevronRight size={17} />
          </button>

          <button onClick={onClose} className="ml-2 text-secondary hover:text-primary transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs text-secondary/40 font-medium tracking-wide">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;

            const ds = dateStr(year, month, day);
            const mems = byDate[ds] ?? [];
            const hasMem = mems.length > 0;
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            const isFuture = ds > todayStr;
            const isBeforeStart = new Date(ds) < new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());

            return (
              <button
                key={i}
                onClick={() => hasMem && setSelectedDate(isSelected ? null : ds)}
                disabled={!hasMem}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                  isSelected
                    ? 'shadow-sm cursor-pointer'
                    : hasMem
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }`}
                style={isSelected ? { background: 'rgba(210, 195, 225, 0.35)' } : undefined}
                onMouseEnter={e => { if (hasMem && !isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(210, 195, 225, 0.2)'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                {isToday ? (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #C97EA0, #D4937A)' }}
                  >
                    {day}
                  </span>
                ) : (
                  <span className={`text-sm ${
                    isBeforeStart || isFuture
                      ? 'text-secondary/25'
                      : hasMem
                      ? 'text-primary font-medium'
                      : 'text-secondary/55'
                  }`}>
                    {day}
                  </span>
                )}
                {/* Colored dots for memory types */}
                {hasMem && (
                  <div className="flex gap-0.5 mt-0.5">
                    {mems.slice(0, 3).map((m, mi) => (
                      <span
                        key={mi}
                        className="w-1 h-1 rounded-full"
                        style={{ background: MEMORY_COLORS[m.type] }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day detail panel */}
        {selectedDate && selectedMemories.length > 0 && (
          <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 260, borderTop: '1px solid rgba(200, 190, 210, 0.25)' }}>
            <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider" style={{ color: 'rgba(122, 110, 130, 0.5)' }}>
              {selectedDate}
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2.5">
              {selectedMemories.map(m => (
                <div key={m.id} className="rounded-xl p-3.5" style={{ background: 'rgba(240, 232, 245, 0.45)', border: '1px solid rgba(220, 210, 230, 0.4)' }}>
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: MEMORY_COLORS[m.type] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary truncate">{m.title}</div>
                      <div className="text-xs text-secondary mt-0.5">
                        {USER_NAMES[m.author]} · {MEMORY_LABELS[m.type]}
                        {m.location && <span className="ml-1.5 text-secondary/60">📍 {m.location}</span>}
                      </div>
                      {m.content && (
                        <div
                          className="text-xs text-secondary/70 mt-1.5 leading-relaxed"
                          style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: 13,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {m.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
