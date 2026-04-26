import React, { useState, useMemo, useEffect } from 'react';
import { X, Edit2, Trash2, ChevronLeft, ChevronRight, Volume2, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory, MemoryType, MEMORY_COLORS, MEMORY_LABELS, USER_NAMES } from '../types';
import { formatDateEN } from '../utils/dateUtils';
import AddMemoryModal from './AddMemoryModal';

// Morandi-toned card backgrounds per type
const TYPE_BG: Record<MemoryType, { card: string; mid: string; border: string }> = {
  daily:       { card: 'rgba(238, 225, 195, 0.45)', mid: 'rgba(215, 200, 165, 0.25)', border: 'rgba(200, 182, 145, 0.2)' },
  travel:      { card: 'rgba(195, 220, 235, 0.45)', mid: 'rgba(168, 198, 218, 0.25)', border: 'rgba(145, 178, 205, 0.2)' },
  anniversary: { card: 'rgba(232, 208, 222, 0.45)', mid: 'rgba(210, 180, 200, 0.25)', border: 'rgba(190, 155, 180, 0.2)' },
  special:     { card: 'rgba(238, 215, 200, 0.45)', mid: 'rgba(218, 188, 168, 0.25)', border: 'rgba(200, 165, 145, 0.2)' },
  note:        { card: 'rgba(200, 220, 215, 0.45)', mid: 'rgba(172, 202, 196, 0.25)', border: 'rgba(148, 182, 175, 0.2)' },
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
  onPrev?: () => void;
  onNext?: () => void;
}

export default function MemoryModal({ dot, onClose, onAddMemory, onPrev, onNext }: Props) {
  const { currentUser, deleteMemory, memories, viewMode } = useApp();
  const [memIdx, setMemIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [livePhotos, setLivePhotos] = useState<string[]>([]);
  const [liveVoiceNote, setLiveVoiceNote] = useState<string | undefined>(undefined);

  // Always read fresh memories from context so edits are reflected immediately
  const liveMemories = useMemo(() => {
    const forDate = memories.filter(m => m.date === dot.dateStr);
    if (!currentUser || viewMode === 'merged') return forDate;
    if (viewMode === 'mine') return forDate.filter(m => m.author === currentUser);
    return forDate.filter(m => m.author !== currentUser);
  }, [memories, dot.dateStr, currentUser, viewMode]);

  // Clamp index if memories shrink after a delete
  useEffect(() => {
    if (liveMemories.length === 0) { onClose(); return; }
    if (memIdx >= liveMemories.length) setMemIdx(liveMemories.length - 1);
  }, [liveMemories.length]);

  const memory = liveMemories[memIdx];

 useEffect(() => {
  if (!memory) return;
  setLivePhotos(memory.photos ?? []);
  setLiveVoiceNote(memory.voiceNote);
  setPhotoIdx(0);
  setAudioEl(null);
  setPlaying(false);
}, [memory?.id, memory?.photos, memory?.voiceNote]);

  if (!memory) return null;

  const canEdit = currentUser === memory.author;
  const date = new Date(dot.dateStr + 'T00:00:00');
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = date.getDate();
  const yearNum = date.getFullYear();

  const handleDelete = () => {
    if (confirm('确定要删除这条记忆吗？')) {
      deleteMemory(memory.id);
      if (liveMemories.length <= 1) {
        onClose();
      } else {
        setMemIdx(Math.max(0, memIdx - 1));
      }
    }
  };

  const togglePlay = () => {
    if (!liveVoiceNote) return;
    if (!audioEl) {
      const el = new Audio(liveVoiceNote);
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
    <>
    <div className="modal-overlay" onClick={onClose}>
      {/* Prev button */}
      {onPrev && (
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all z-10"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {/* Next button */}
      {onNext && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all z-10"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
        >
          <ChevronRight size={22} />
        </button>
      )}
      <div
        className="w-full max-w-3xl animate-slide-up overflow-y-auto"
        style={{
          background: bg.card,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 18,
          border: `1px solid ${bg.border}`,
          boxShadow: '0 8px 40px rgba(60, 40, 80, 0.15)',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${bg.border}` }}>
          <div className="flex items-center gap-3">
            {liveMemories.length > 1 && liveMemories.map((_, i) => (
              <button
                key={i}
                onClick={() => { setMemIdx(i); setPhotoIdx(0); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === memIdx ? 'bg-white scale-125' : 'bg-white/40'
                }`}
              />
            ))}
            {liveMemories.length > 1 && (
              <span className="text-xs text-secondary ml-1">
                {memIdx + 1} / {liveMemories.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleDelete}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(220,100,100,0.12)', color: 'rgba(190,70,70,0.85)' }}
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => setShowEdit(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(125,175,200,0.18)', color: 'rgba(80,130,160,0.9)' }}
                title="编辑记忆"
              >
                <Edit2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(150,140,160,0.15)', color: 'rgba(100,90,110,0.85)' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <style>{`
          @media(min-width:640px){
            .mem-left{border-right:1px solid ${bg.border}!important;border-top:none!important;}
            .mem-right{border-left:1px solid ${bg.border}!important;border-top:none!important;}
            .mem-photo{aspect-ratio:auto!important;height:100%;min-height:220px;}
          }
        `}</style>
        <div className={`grid gap-0 ${livePhotos.length > 0 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
          {/* Left: Date & stats */}
          <div className="mem-left p-4 flex flex-col gap-3" style={{ borderTop: `1px solid ${bg.border}` }}>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.52)' }}>
              <div className="font-serif italic text-3xl font-light text-primary leading-tight">
                {monthName} {dayNum}
              </div>
              <div className="text-secondary text-sm mt-1">{yearNum}</div>
            </div>

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

          {/* Middle: Photo — only rendered when photos exist */}
          {livePhotos.length > 0 && (
            <div className="relative overflow-hidden p-3 col-span-2 sm:col-span-1 order-first sm:order-none">
              <div className="mem-photo relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <img
                  src={livePhotos[photoIdx]}
                  alt="memory"
                  className="w-full h-full object-cover"
                />
                {livePhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx(i => Math.max(0, i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPhotoIdx(i => Math.min(livePhotos.length - 1, i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {livePhotos.map((_, i) => (
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
            </div>
          )}

          {/* Right: Notes & voice */}
          <div className="mem-right p-4 flex flex-col gap-3" style={{ borderTop: `1px solid ${bg.border}` }}>
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

            {/* No-photo prompt — small, at bottom */}
            {livePhotos.length === 0 && (
              <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.52)' }}>
                <img src="/dog.png" alt="dogs" className="w-20 h-auto" />
                <span className="text-xs text-secondary/50 italic leading-relaxed">Add some photos~</span>
              </div>
            )}

            {/* Author */}
            <div className="text-xs text-secondary/50 italic px-1">
              by {USER_NAMES[memory.author]}
            </div>

            {/* Voice note block */}
            {liveVoiceNote && (
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

    {showEdit && (
      <AddMemoryModal
        defaultDate={dot.dateStr}
        editMemory={memory}
        onClose={() => setShowEdit(false)}
      />
    )}
    </>
  );
}
