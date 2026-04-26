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
          <div className="p-4 flex flex-col gap-3" style={{ borderRight: `1px solid ${bg.border}` }}>
            {/* Date block */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.52)' }}>
              <div className="font-serif italic text-3xl font-light text-primary leading-tight">
                {monthName} {dayNum}
              </div>
              <div className="text-secondary text-sm mt-1">{yearNum}</div>
            </div>

            {/* Day of Journey block */}
            <div className="rounded-2xl p-4 flex-1" style={{ background: 'rgba(255,255,255,0.52)' }}>
              <div className="text-xs text-secondary/60 uppercase tracking-widest mb-1">
                Day of Journey
              </div>
              <div className="font-serif text-5xl font-light text-primary">
                {dot.dayOfJourney}
              </div>
              {memory.location && (
                <div className="mt-3 flex items-center gap-1.5 text-secondary text-xs">
                  <MapPin size={11} />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs self-start"
              style={{ background: typeColor }}
            >
              {MEMORY_LABELS[memory.type]}
            </div>
          </div>

          {/* Middle: Photo */}
          <div className="relative flex items-center justify-center overflow-hidden p-4" style={{ background: bg.mid }}>
            {memory.photos.length > 0 ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: 220 }}>
                <img
                  src={memory.photos[photoIdx]}
                  alt="memory"
                  className="w-full h-full object-cover"
                  style={{ minHeight: 220 }}
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
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full rounded-2xl" style={{ minHeight: 220, background: 'rgba(255,255,255,0.52)' }}>
                {(() => {
                  const S = 'rgba(50,38,62,0.78)';   // stroke / dark
                  const G = 'rgba(245,208,130,0.82)'; // golden dog fill
                  const W = 'rgba(255,255,255,0.84)'; // white dog fill
                  const sw = (w: number) => ({ stroke: S, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });
                  return (
                    <svg viewBox="0 0 200 168" width="188" fill="none" xmlns="http://www.w3.org/2000/svg">

                      {/* ── WHITE DOG (back) body + head ── */}
                      <ellipse cx="124" cy="122" rx="22" ry="16" fill={W} {...sw(2)}/>
                      <circle  cx="126" cy="81"  r="21"           fill={W} {...sw(2)}/>
                      {/* round ears */}
                      <circle cx="109" cy="63" r="9" fill={W} {...sw(2)}/>
                      <circle cx="143" cy="63" r="9" fill={W} {...sw(2)}/>
                      {/* eye marks */}
                      <path d="M118 72 L121 69 L124 72" fill="none" {...sw(1.4)}/>
                      <path d="M128 72 L131 69 L134 72" fill="none" {...sw(1.4)}/>
                      {/* eyes – happy squint arcs */}
                      <path d="M116 78 Q121 84 126 78" fill="none" {...sw(2.3)}/>
                      <path d="M126 78 Q131 84 136 78" fill="none" {...sw(2.3)}/>
                      {/* nose */}
                      <ellipse cx="126" cy="87" rx="5" ry="2.8" fill={S} stroke="none"/>
                      {/* smile */}
                      <path d="M118 93 Q126 100 134 93" fill="none" {...sw(1.8)}/>

                      {/* ── WHITE DOG arms hugging (drawn before golden dog body) ── */}
                      {/* left arm – white body then outline */}
                      <path d="M105 108 Q82 116 66 132" stroke={W}  strokeWidth="9"  strokeLinecap="round"/>
                      <path d="M105 108 Q82 116 66 132" stroke={S}   strokeWidth="2"  strokeLinecap="round" fill="none"/>
                      {/* right arm */}
                      <path d="M107 120 Q86 128 72 143" stroke={W}  strokeWidth="9"  strokeLinecap="round"/>
                      <path d="M107 120 Q86 128 72 143" stroke={S}   strokeWidth="2"  strokeLinecap="round" fill="none"/>

                      {/* ── GOLDEN DOG (front) ── */}
                      {/* tail */}
                      <path d="M56 118 Q43 107 47 126 Q50 136 60 128" fill={G} {...sw(1.9)}/>
                      {/* body */}
                      <ellipse cx="78" cy="124" rx="26" ry="20" fill={G} {...sw(2)}/>
                      {/* head */}
                      <circle cx="78" cy="80" r="26" fill={G} {...sw(2)}/>
                      {/* round ears */}
                      <circle cx="56" cy="58" r="12" fill={G} {...sw(2)}/>
                      <circle cx="100" cy="58" r="12" fill={G} {...sw(2)}/>
                      {/* eye marks */}
                      <path d="M65 69 L68 66 L71 69" fill="none" {...sw(1.5)}/>
                      <path d="M85 69 L88 66 L91 69" fill="none" {...sw(1.5)}/>
                      {/* eyes – dot style */}
                      <circle cx="68" cy="77" r="3"   fill={S} stroke="none"/>
                      <circle cx="88" cy="77" r="3"   fill={S} stroke="none"/>
                      {/* nose */}
                      <ellipse cx="78" cy="87" rx="6"  ry="3.5" fill={S} stroke="none"/>
                      {/* smile */}
                      <path d="M68 94 Q78 102 88 94" fill="none" {...sw(2)}/>
                      {/* collar – coral/terracotta */}
                      <path d="M55 108 Q78 118 101 108" fill="none" stroke="#D4937A" strokeWidth="3.5" strokeLinecap="round"/>
                      {/* front paws */}
                      <ellipse cx="62" cy="142" rx="10" ry="5" fill={G} {...sw(1.8)}/>
                      <ellipse cx="91" cy="144" rx="10" ry="5" fill={G} {...sw(1.8)}/>

                      {/* white dog paws (ends of arms, in front) */}
                      <ellipse cx="63" cy="134" rx="8" ry="4.5" fill={W} {...sw(1.8)}/>
                      <ellipse cx="69" cy="146" rx="8" ry="4.5" fill={W} {...sw(1.8)}/>

                      {/* ── Speech bubble ── */}
                      <rect x="50" y="3" width="100" height="26" rx="9"
                        fill="rgba(255,255,255,0.88)" stroke="rgba(50,38,62,0.3)" strokeWidth="1.2"/>
                      <path d="M86 29 L91 37 L96 29"
                        fill="rgba(255,255,255,0.88)" stroke="rgba(50,38,62,0.3)" strokeWidth="1.2" strokeLinejoin="round"/>
                      <text x="100" y="20" textAnchor="middle"
                        fontSize="8.5" fontFamily="Cormorant Garamond, serif" fontStyle="italic"
                        fill="rgba(50,38,62,0.72)">
                        Add some photos~
                      </text>

                    </svg>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right: Notes & voice */}
          <div className="p-4 flex flex-col gap-3" style={{ borderLeft: `1px solid ${bg.border}` }}>
            {/* Notes block */}
            <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.52)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-secondary/60 uppercase tracking-wider">记录 · Notes</span>
              </div>
              <div className="text-primary font-medium text-sm mb-2">{memory.title}</div>
              <div className="text-secondary text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                {memory.content}
              </div>
            </div>

            {/* Author */}
            <div className="text-xs text-secondary/50 italic px-1">
              by {USER_NAMES[memory.author]}
            </div>

            {/* Voice note block */}
            {memory.voiceNote && (
              <div className="rounded-2xl p-4 flex flex-col items-center gap-2" style={{ background: 'rgba(255,255,255,0.52)' }}>
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
