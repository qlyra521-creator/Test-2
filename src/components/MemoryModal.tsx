import React, { useState } from 'react';
import { X, Edit2, Trash2, ChevronLeft, ChevronRight, Volume2, Plus, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory, MemoryType, MEMORY_COLORS, MEMORY_LABELS, USER_NAMES } from '../types';
import { formatDateEN } from '../utils/dateUtils';

// Morandi-toned card backgrounds per type
const TYPE_BG: Record<MemoryType, { card: string; mid: string; border: string }> = {
  daily:       { card: 'rgba(238, 225, 195, 0.82)', mid: 'rgba(215, 200, 165, 0.35)', border: 'rgba(200, 182, 145, 0.3)' },
  travel:      { card: 'rgba(195, 220, 235, 0.82)', mid: 'rgba(168, 198, 218, 0.35)', border: 'rgba(145, 178, 205, 0.3)' },
  anniversary: { card: 'rgba(232, 208, 222, 0.82)', mid: 'rgba(210, 180, 200, 0.35)', border: 'rgba(190, 155, 180, 0.3)' },
  special:     { card: 'rgba(238, 215, 200, 0.82)', mid: 'rgba(218, 188, 168, 0.35)', border: 'rgba(200, 165, 145, 0.3)' },
  note:        { card: 'rgba(200, 220, 215, 0.82)', mid: 'rgba(172, 202, 196, 0.35)', border: 'rgba(148, 182, 175, 0.3)' },
};

interface DotInfo {
  dateStr: string;
  dayOfJourney: number | null;
  memories: Memory[];
}

interface Props {
  dot: DotInfo;
  onClose: () => void;
  onAddMemory: () => void;
}

export default function MemoryModal({ dot, onClose, onAddMemory }: Props) {
  const { currentUser, deleteMemory } = useApp();
  const [memIdx, setMemIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const memory = dot.memories[memIdx];
  if (!memory) return null;

  const canEdit = currentUser === memory.author;
  const date = new Date(dot.dateStr + 'T00:00:00');
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = date.getDate();
  const yearNum = date.getFullYear();

  const handleDelete = () => {
    if (confirm('确定要删除这条记忆吗？')) {
      deleteMemory(memory.id);
      if (dot.memories.length <= 1) {
        onClose();
      } else {
        setMemIdx(Math.max(0, memIdx - 1));
      }
    }
  };

  const togglePlay = () => {
    if (!memory.voiceNote) return;
    if (!audioEl) {
      const el = new Audio(memory.voiceNote);
      el.onended = () => setPlaying(false);
      el.play();
      setAudioEl(el);
      setPlaying(true);
    } else if (playing) {
      audioEl.pause();
      setPlaying(false);
    } else {
      audioEl.play();
      setPlaying(true);
    }
  };

  const typeColor = MEMORY_COLORS[memory.type];
  const bg = TYPE_BG[memory.type];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-3xl overflow-hidden animate-slide-up"
        style={{
          background: bg.card,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 18,
          border: `1px solid ${bg.border}`,
          boxShadow: '0 8px 40px rgba(60, 40, 80, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${bg.border}` }}>
          <div className="flex items-center gap-3">
            {dot.memories.length > 1 && dot.memories.map((_, i) => (
              <button
                key={i}
                onClick={() => { setMemIdx(i); setPhotoIdx(0); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === memIdx ? 'bg-white scale-125' : 'bg-white/40'
                }`}
              />
            ))}
            {dot.memories.length > 1 && (
              <span className="text-xs text-secondary ml-1">
                {memIdx + 1} / {dot.memories.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <button onClick={handleDelete} className="text-secondary hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={onAddMemory} className="text-secondary hover:text-primary transition-colors" title="添加记忆">
              <Plus size={15} />
            </button>
            <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-3 gap-0 min-h-64">
          {/* Left: Date & stats */}
          <div className="p-6 flex flex-col justify-between" style={{ borderRight: `1px solid ${bg.border}` }}>
            <div>
              <div className="font-serif italic text-3xl font-light text-primary leading-tight">
                {monthName} {dayNum}
              </div>
              <div className="text-secondary text-sm mt-1">{yearNum}</div>

              <div className="mt-6">
                <div className="text-xs text-secondary/60 uppercase tracking-widest mb-1">
                  第几天 · Day of Journey
                </div>
                <div className="font-serif text-5xl font-light text-primary">
                  {dot.dayOfJourney}
                </div>
              </div>

              {memory.location && (
                <div className="mt-4 flex items-center gap-1.5 text-secondary text-xs">
                  <MapPin size={11} />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs mt-4 self-start"
              style={{ background: typeColor }}
            >
              {MEMORY_LABELS[memory.type]}
            </div>
          </div>

          {/* Middle: Photo */}
          <div className="relative flex items-center justify-center overflow-hidden" style={{ background: bg.mid }}>
            {memory.photos.length > 0 ? (
              <>
                <img
                  src={memory.photos[photoIdx]}
                  alt="memory"
                  className="w-full h-full object-cover"
                  style={{ minHeight: 260 }}
                />
                {memory.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx(i => Math.max(0, i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPhotoIdx(i => Math.min(memory.photos.length - 1, i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {memory.photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i === photoIdx ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full" style={{ minHeight: 220 }}>
                <svg viewBox="0 0 200 170" width="190" fill="none" xmlns="http://www.w3.org/2000/svg"
                  style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}>

                  {/* Speech bubble */}
                  <rect x="48" y="4" width="104" height="26" rx="9"
                    fill="white" fillOpacity="0.55"
                    stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.2"/>
                  <path d="M96 30 L100 38 L104 30"
                    fill="white" fillOpacity="0.55"
                    stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.2"/>
                  <text x="100" y="21" textAnchor="middle"
                    style={{ fontSize: 8.5, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}
                    fill={bg.border.replace('0.3)', '0.85)')}>
                    Add some photos~
                  </text>

                  {/* ── Dog 1 (left, pointy ears) ── */}
                  {/* Body */}
                  <ellipse cx="65" cy="118" rx="21" ry="15" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Head */}
                  <circle cx="65" cy="84" r="15" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Left ear */}
                  <path d="M55 72 L49 55 L63 70" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Right ear */}
                  <path d="M75 72 L81 55 L67 70" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Eyes */}
                  <circle cx="59" cy="83" r="2.3" fill={bg.border.replace('0.3)', '0.7)')}/>
                  <circle cx="71" cy="83" r="2.3" fill={bg.border.replace('0.3)', '0.7)')}/>
                  {/* Nose */}
                  <ellipse cx="65" cy="89" rx="2.8" ry="1.8" fill={bg.border.replace('0.3)', '0.5)')}/>
                  {/* Smile */}
                  <path d="M60 93 Q65 97 70 93" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.5"/>
                  {/* Tail (curly right) */}
                  <path d="M86 113 Q102 100 95 120 Q90 128 83 120" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Paws */}
                  <ellipse cx="54" cy="132" rx="6" ry="3" stroke={bg.border.replace('0.3)', '0.55)')} strokeWidth="1.4"/>
                  <ellipse cx="72" cy="132" rx="6" ry="3" stroke={bg.border.replace('0.3)', '0.55)')} strokeWidth="1.4"/>

                  {/* ── Dog 2 (right, floppy ears, squint eyes) ── */}
                  {/* Body */}
                  <ellipse cx="138" cy="118" rx="21" ry="15" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Head */}
                  <circle cx="138" cy="84" r="15" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Left floppy ear */}
                  <path d="M126 76 Q115 62 121 78" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="2.3"/>
                  {/* Right floppy ear */}
                  <path d="M150 76 Q161 62 155 78" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="2.3"/>
                  {/* Happy squint eyes */}
                  <path d="M130 82 Q133 78 137 82" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.9"/>
                  <path d="M139 82 Q142 78 146 82" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.9"/>
                  {/* Nose */}
                  <ellipse cx="138" cy="89" rx="2.8" ry="1.8" fill={bg.border.replace('0.3)', '0.5)')}/>
                  {/* Big smile */}
                  <path d="M132 93 Q138 99 144 93" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.5"/>
                  {/* Tail */}
                  <path d="M159 113 Q175 100 168 120 Q163 128 156 120" stroke={bg.border.replace('0.3)', '0.7)')} strokeWidth="1.8"/>
                  {/* Paws */}
                  <ellipse cx="127" cy="132" rx="6" ry="3" stroke={bg.border.replace('0.3)', '0.55)')} strokeWidth="1.4"/>
                  <ellipse cx="145" cy="132" rx="6" ry="3" stroke={bg.border.replace('0.3)', '0.55)')} strokeWidth="1.4"/>

                  {/* Little hearts between them */}
                  <path d="M100 105 Q101 103 103 103 Q105 103 105 105 Q105 107 103 109 Q101 107 99 105 Q99 103 101 103 Q103 103 103 105"
                    fill={bg.border.replace('0.3)', '0.4)')} stroke="none"/>
                </svg>
              </div>
            )}
          </div>

          {/* Right: Notes & voice */}
          <div className="p-5 flex flex-col gap-4" style={{ borderLeft: `1px solid ${bg.border}` }}>
            {/* Notes */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-secondary/60 uppercase tracking-wider">记录 · Notes</span>
              </div>
              <div className="text-primary font-medium text-sm mb-2">{memory.title}</div>
              <div className="text-secondary text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                {memory.content}
              </div>
            </div>

            {/* Author */}
            <div className="text-xs text-secondary/50 italic">
              by {USER_NAMES[memory.author]}
            </div>

            {/* Voice note */}
            {memory.voiceNote && (
              <div className="rounded-xl p-4 flex flex-col items-center gap-2" style={{ background: bg.mid, border: `1px solid ${bg.border}` }}>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                  style={{ background: playing ? '#C97EA0' : '#9AACAA' }}
                >
                  <Volume2 size={16} />
                </button>
                <span className="text-xs text-secondary">{playing ? '播放中 · Playing…' : '点击播放语音 · Play voice'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
