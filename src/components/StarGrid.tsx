import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory, MemoryType, MEMORY_COLORS, MEMORY_LABELS, UserId, PARTNER, START_DATE } from '../types';
import { generateMonthGroups, MonthGroup, toDateStr, daysBetween } from '../utils/dateUtils';
import MemoryModal from './MemoryModal';
import AddMemoryModal from './AddMemoryModal';

// Grid layout constants
const MONTH_SLOT_W = 70;
const DAY_H = 8;
const LEFT_PAD = 48;
const TOP_PAD = 28;
const MONTH_LABEL_H = 22;
const YEAR_GAP = 32;
const YEAR_ROW_H = 31 * DAY_H + MONTH_LABEL_H + YEAR_GAP;
const SVG_INNER_W = 12 * MONTH_SLOT_W;
const SVG_W = SVG_INNER_W + LEFT_PAD + 28;

const DOT_R_EMPTY = 2.2;
const DOT_R_MEMORY = 5.5;
const DOT_R_TODAY = 3;
const GLOW_R = 15;

interface DotInfo {
  x: number;
  y: number;
  dateStr: string;
  dayOfJourney: number | null;
  isToday: boolean;
  isFuture: boolean;
  isBeforeStart: boolean;
  memories: Memory[];
}

interface TooltipState {
  x: number;
  y: number;
  dot: DotInfo;
}

function buildDots(months: MonthGroup[], filtered: Memory[]): DotInfo[] {
  const memByDate: Record<string, Memory[]> = {};
  filtered.forEach(m => {
    if (!memByDate[m.date]) memByDate[m.date] = [];
    memByDate[m.date].push(m);
  });

  const todayStr = toDateStr(new Date());
  const dots: DotInfo[] = [];

  months.forEach(mg => {
    const baseY = TOP_PAD + mg.rowIdx * YEAR_ROW_H;
    const x = LEFT_PAD + mg.colIdx * MONTH_SLOT_W + MONTH_SLOT_W / 2;

    for (let d = 1; d <= mg.daysCount; d++) {
      const month = String(mg.month + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${mg.year}-${month}-${day}`;
      const dateObj = new Date(dateStr + 'T00:00:00');
      const isBeforeStart = dateObj < START_DATE;
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;
      const dayOfJourney = isBeforeStart ? null : daysBetween(START_DATE, dateObj) + 1;

      dots.push({
        x,
        y: baseY + (d - 1) * DAY_H + DAY_H / 2,
        dateStr,
        dayOfJourney,
        isToday,
        isFuture,
        isBeforeStart,
        memories: memByDate[dateStr] || [],
      });
    }
  });

  return dots;
}

function getPrimaryType(memories: Memory[]): MemoryType {
  const priority: MemoryType[] = ['anniversary', 'special', 'travel', 'daily', 'note'];
  for (const t of priority) {
    if (memories.some(m => m.type === t)) return t;
  }
  return memories[0].type;
}

const LEGEND_TYPES: MemoryType[] = ['daily', 'travel', 'anniversary', 'special', 'note'];

export default function StarGrid() {
  const { memories, currentUser, viewMode, setViewMode } = useApp();
  const [selectedDot, setSelectedDot] = useState<DotInfo | null>(null);
  const [addDate, setAddDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const months = generateMonthGroups();
  const numRows = months.length > 0 ? months[months.length - 1].rowIdx + 1 : 1;
  const SVG_H = numRows * YEAR_ROW_H + TOP_PAD + 20;

  // Filter memories based on viewMode
  const filtered = memories.filter(m => {
    if (!currentUser) return true;
    if (viewMode === 'mine') return m.author === currentUser;
    if (viewMode === 'partner') return m.author === PARTNER[currentUser];
    return true; // merged
  });

  const dots = buildDots(months, filtered);
  const today = new Date();
  const totalDays = daysBetween(START_DATE, today) + 1;

  const handleDotClick = useCallback((dot: DotInfo) => {
    if (dot.isBeforeStart || dot.isFuture) return;
    if (dot.memories.length > 0) {
      setSelectedDot(dot);
    } else {
      setAddDate(dot.dateStr);
    }
  }, []);

  const handleMouseMove = useCallback((dot: DotInfo, e: React.MouseEvent) => {
    setTooltip({ x: e.clientX, y: e.clientY, dot });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Build month label positions
  const monthLabels = months.map(mg => {
    const x = LEFT_PAD + mg.colIdx * MONTH_SLOT_W + MONTH_SLOT_W / 2;
    const y = TOP_PAD + mg.rowIdx * YEAR_ROW_H + 31 * DAY_H + MONTH_LABEL_H / 2 + 4;
    return { x, y, label: mg.label, key: `${mg.year}-${mg.month}` };
  });

  // Year row separator labels
  const yearLabels: { y: number; label: string }[] = [];
  for (let r = 0; r < numRows; r++) {
    const firstMonth = months.find(m => m.rowIdx === r);
    if (firstMonth) {
      yearLabels.push({
        y: TOP_PAD + r * YEAR_ROW_H - 6,
        label: `Year ${r + 1}  ·  ${firstMonth.year}`,
      });
    }
  }

  return (
    <div className="pt-16 pb-4 px-4 flex flex-col h-screen">
      {/* Legend and filter bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-secondary italic">Every point is a star in our shared sky</span>
          <div className="flex items-center gap-3">
            {LEGEND_TYPES.map(type => (
              <div key={type} className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="4" fill={MEMORY_COLORS[type]} />
                </svg>
                <span className="text-xs text-secondary">{MEMORY_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View mode filter */}
        {currentUser && (
          <div className="glass rounded-full flex overflow-hidden text-xs">
            {(['mine', 'partner', 'merged'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 transition-all ${
                  viewMode === mode
                    ? 'bg-white/40 text-primary font-medium'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {mode === 'mine' ? '只看我的 Mine' : mode === 'partner' ? '只看Ta的 Partner' : '合并 Merged'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Grid */}
      <div className="flex-1 overflow-auto relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ minWidth: 600, display: 'block' }}
        >
          <defs>
            {LEGEND_TYPES.map(type => (
              <radialGradient key={type} id={`glow-${type}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={MEMORY_COLORS[type]} stopOpacity="0.55" />
                <stop offset="100%" stopColor={MEMORY_COLORS[type]} stopOpacity="0" />
              </radialGradient>
            ))}
            <radialGradient id="glow-today" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Year row separators */}
          {yearLabels.map((yl, i) => i > 0 && (
            <line
              key={i}
              x1={LEFT_PAD - 8}
              y1={yl.y}
              x2={SVG_W - 10}
              y2={yl.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4 6"
            />
          ))}

          {/* Year labels on left */}
          {yearLabels.map((yl, i) => (
            <text
              key={i}
              x={LEFT_PAD - 4}
              y={yl.y + 14}
              fontSize="8"
              fill="rgba(255,255,255,0.4)"
              textAnchor="end"
            >
              {yl.label}
            </text>
          ))}

          {/* Month column labels */}
          {monthLabels.map(ml => (
            <text
              key={ml.key}
              x={ml.x}
              y={ml.y}
              fontSize="7.5"
              textAnchor="middle"
              fill="rgba(255,255,255,0.45)"
              letterSpacing="0.5"
            >
              {ml.label}
            </text>
          ))}

          {/* Dots */}
          {dots.map(dot => {
            if (dot.isBeforeStart) return null;

            const hasMemory = dot.memories.length > 0;
            const primaryType = hasMemory ? getPrimaryType(dot.memories) : null;
            const color = primaryType ? MEMORY_COLORS[primaryType] : 'white';
            const opacity = dot.isFuture ? 0.1 : (hasMemory ? 1 : 0.28);
            const r = dot.isToday ? DOT_R_TODAY : (hasMemory ? DOT_R_MEMORY : DOT_R_EMPTY);
            const canInteract = !dot.isFuture;

            return (
              <g
                key={dot.dateStr}
                onClick={() => canInteract && handleDotClick(dot)}
                onMouseMove={(e) => canInteract && handleMouseMove(dot, e)}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: canInteract ? (hasMemory ? 'pointer' : 'crosshair') : 'default' }}
              >
                {/* Glow ring for memory dots */}
                {hasMemory && primaryType && (
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={GLOW_R}
                    fill={`url(#glow-${primaryType})`}
                  />
                )}
                {/* Today glow */}
                {dot.isToday && (
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={GLOW_R * 0.8}
                    fill="url(#glow-today)"
                  />
                )}
                {/* Main dot */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={r}
                  fill={dot.isToday && !hasMemory ? 'white' : color}
                  opacity={opacity}
                  strokeWidth={dot.isToday ? 1 : 0}
                  stroke={dot.isToday ? 'rgba(255,255,255,0.8)' : 'none'}
                />
                {/* Multiple memories indicator */}
                {dot.memories.length > 1 && (
                  <circle
                    cx={dot.x + DOT_R_MEMORY - 1}
                    cy={dot.y - DOT_R_MEMORY + 1}
                    r={2.5}
                    fill="white"
                    opacity={0.9}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="dot-tooltip"
            style={{ left: tooltip.x, top: tooltip.y - 8 }}
          >
            <div className="font-medium text-xs mb-0.5">{tooltip.dot.dateStr}</div>
            {tooltip.dot.dayOfJourney && (
              <div className="text-secondary" style={{ fontSize: 11 }}>
                Day {tooltip.dot.dayOfJourney}
              </div>
            )}
            {tooltip.dot.memories.length > 0 ? (
              <div className="mt-1">
                {tooltip.dot.memories.slice(0, 2).map(m => (
                  <div key={m.id} className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: MEMORY_COLORS[m.type] }}
                    />
                    <span>{m.title}</span>
                  </div>
                ))}
                {tooltip.dot.memories.length > 2 && (
                  <div style={{ fontSize: 11 }} className="text-secondary">
                    +{tooltip.dot.memories.length - 2} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-secondary" style={{ fontSize: 11 }}>点击添加记忆 · Click to add</div>
            )}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-end justify-between mt-3 px-2">
        <div>
          <div className="text-xs text-secondary/60 uppercase tracking-widest">起始 · Day 1</div>
          <div className="font-serif text-3xl font-light text-primary">1</div>
          <div className="text-xs text-secondary/50 mt-0.5">APR 2024</div>
        </div>
        <div className="text-secondary/40 text-xs italic text-center">
          诗云 & Tim
        </div>
        <div className="text-right">
          <div className="text-xs text-secondary/60 uppercase tracking-widest">今天 · Days to Today</div>
          <div className="font-serif text-3xl font-light text-primary">{totalDays}</div>
          <div className="text-xs text-secondary/50 mt-0.5">
            {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][new Date().getMonth()]} {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Add memory FAB */}
      {currentUser && (
        <button
          onClick={() => setAddDate(toDateStr(new Date()))}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          style={{ background: 'linear-gradient(135deg, #C97EA0, #D4937A)' }}
          title="添加记忆"
        >
          <Plus size={22} />
        </button>
      )}

      {/* Modals */}
      {selectedDot && (
        <MemoryModal
          dot={selectedDot}
          onClose={() => setSelectedDot(null)}
          onAddMemory={() => {
            setAddDate(selectedDot.dateStr);
            setSelectedDot(null);
          }}
        />
      )}
      {addDate && (
        <AddMemoryModal
          defaultDate={addDate}
          onClose={() => setAddDate(null)}
        />
      )}
    </div>
  );
}
