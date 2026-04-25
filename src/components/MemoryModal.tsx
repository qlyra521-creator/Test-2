import React, { useState } from 'react';
import { X, Edit2, Trash2, ChevronLeft, ChevronRight, Volume2, Plus, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory, MEMORY_COLORS, MEMORY_LABELS, USER_NAMES } from '../types';
import { formatDateEN } from '../utils/dateUtils';

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card w-full max-w-3xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
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
          <div className="p-6 border-r border-white/20 flex flex-col justify-between">
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
          <div className="relative bg-black/10 flex items-center justify-center overflow-hidden">
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
              <div className="flex flex-col items-center gap-2 text-white/30 p-8">
                <div className="text-4xl">✦</div>
                <div className="text-xs">无图片 · No photo</div>
              </div>
            )}
          </div>

          {/* Right: Notes & voice */}
          <div className="p-5 border-l border-white/20 flex flex-col gap-4">
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
              <div className="glass rounded-xl p-4 flex flex-col items-center gap-2">
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
