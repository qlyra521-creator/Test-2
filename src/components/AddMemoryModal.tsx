import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Mic, MicOff, MapPin, Map } from 'lucide-react';
import MapPicker from './MapPicker';
import { useApp } from '../context/AppContext';
import { Memory, MemoryType, MEMORY_COLORS, MEMORY_LABELS } from '../types';
import { dayOfJourney, toDateStr } from '../utils/dateUtils';
import { supabase, MEDIA_BUCKET } from '../lib/supabase';

interface PhotoItem { url: string; file?: File }
interface VoiceItem { url: string; blob?: Blob }

interface Props {
  defaultDate: string;
  onClose: () => void;
  editMemory?: Memory;
}

const TYPES: MemoryType[] = ['daily', 'travel', 'anniversary', 'special', 'note'];

export default function AddMemoryModal({ defaultDate, onClose, editMemory }: Props) {
  const { currentUser, addMemory, updateMemory } = useApp();
  const [date, setDate] = useState(editMemory?.date ?? defaultDate);
  const [type, setType] = useState<MemoryType>(editMemory?.type ?? 'daily');
  const [title, setTitle] = useState(editMemory?.title ?? '');
  const [content, setContent] = useState(editMemory?.content ?? '');
  const [location, setLocation] = useState(editMemory?.location ?? '');
  const [photos, setPhotos] = useState<PhotoItem[]>(
    editMemory?.photos.map(url => ({ url })) ?? []
  );
  const [voiceNote, setVoiceNote] = useState<VoiceItem | undefined>(
    editMemory?.voiceNote ? { url: editMemory.voiceNote } : undefined
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = toDateStr(new Date());

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      setPhotos(prev => [...prev, { url: URL.createObjectURL(file), file }]);
    });
    e.target.value = '';
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceNote({ url: URL.createObjectURL(blob), blob });
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      alert('无法访问麦克风，请检查浏览器权限。');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    if (!title.trim()) { alert('请填写标题'); return; }
    setSaving(true);

    try {
      const memoryId = editMemory?.id ?? `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const photoUrls: string[] = [];
      for (const item of photos) {
        if (item.file) {
          const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const path = `photos/${memoryId}/${Date.now()}-${safeName}`;
          const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, item.file);
          if (!error) {
            const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
            photoUrls.push(data.publicUrl);
          }
        } else {
          photoUrls.push(item.url);
        }
      }

      let voiceNoteUrl: string | undefined;
      if (voiceNote?.blob) {
        const path = `voice/${memoryId}/${Date.now()}.webm`;
        const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, voiceNote.blob);
        if (!error) {
          const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
          voiceNoteUrl = data.publicUrl;
        }
      } else {
        voiceNoteUrl = voiceNote?.url;
      }

      if (editMemory) {
        updateMemory({
          ...editMemory,
          type,
          title: title.trim(),
          content: content.trim(),
          photos: photoUrls,
          voiceNote: voiceNoteUrl,
          location: location.trim() || undefined,
        });
      } else {
        addMemory({
          id: memoryId,
          date,
          author: currentUser,
          type,
          title: title.trim(),
          content: content.trim(),
          photos: photoUrls,
          voiceNote: voiceNoteUrl,
          location: location.trim() || undefined,
          dayOfJourney: dayOfJourney(date),
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-xl animate-slide-up flex flex-col"
        style={{
          maxHeight: '90vh',
          background: 'rgba(255, 251, 247, 0.97)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 18,
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 40px rgba(80, 60, 100, 0.13)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(200, 190, 210, 0.25)' }}>
          <h2 className="font-serif text-xl font-light text-primary">{editMemory ? '编辑记忆 · Edit Memory' : '记录这一天 · Record This Day'}</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={17} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Date */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-xs text-secondary/60 uppercase tracking-wider mb-1.5 block">日期 · Date</label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            {dayOfJourney(date) > 0 && (
              <div className="glass rounded-xl px-4 py-2 text-center mt-5">
                <div className="font-serif text-2xl text-primary">{dayOfJourney(date)}</div>
                <div className="text-xs text-secondary">第几天 · Day</div>
              </div>
            )}
          </div>

          {/* Type selector */}
          <div>
            <label className="text-xs text-secondary/60 uppercase tracking-wider mb-2 block">类型 · Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    type === t ? 'text-white' : 'text-secondary hover:text-primary glass'
                  }`}
                  style={type === t ? { background: MEMORY_COLORS[t] } : {}}
                >
                  {MEMORY_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-secondary/60 uppercase tracking-wider mb-1.5 block">标题 · Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="给这个记忆起个名字 · Name this memory"
              maxLength={50}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs text-secondary/60 uppercase tracking-wider mb-1.5 block">内容 · Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="写下今天发生的故事 · Write your story…"
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-secondary shrink-0" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="地点 Location（可选 optional）"
            />
            <button
              onClick={() => setShowMap(true)}
              title="在地图上选择 · Pick on map"
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
              <Map size={13} className="text-secondary" />
            </button>
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-secondary/60 uppercase tracking-wider">照片 · Photos</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
              >
                <Camera size={13} /> 添加照片 · Add photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map((item, i) => (
                  <div key={i} className="relative group">
                    <img src={item.url} alt="" className="rounded-lg" />
                    <button
                      onClick={() => setPhotos(prev => {
                        const p = prev[i];
                        if (p.file) URL.revokeObjectURL(p.url);
                        return prev.filter((_, j) => j !== i);
                      })}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voice recording */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                  isRecording ? 'animate-pulse' : 'hover:scale-110'
                }`}
                style={{ background: isRecording ? '#C97EA0' : '#9AACAA' }}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <div className="flex-1">
                {isRecording ? (
                  <div className="text-sm text-primary">
                    录音中 · Recording… {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
                  </div>
                ) : voiceNote ? (
                  <div className="text-sm text-primary">已录制 · Recorded</div>
                ) : (
                  <div className="text-sm text-secondary">语音备忘 · Voice memo (optional)</div>
                )}
              </div>
              {voiceNote && !isRecording && (
                <button
                  onClick={() => {
                    if (voiceNote.blob) URL.revokeObjectURL(voiceNote.url);
                    setVoiceNote(undefined);
                  }}
                  className="text-xs text-secondary/60 hover:text-red-400 transition-colors"
                >
                  删除 · Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid rgba(200, 190, 210, 0.25)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm transition-all hover:opacity-80"
            style={{
              color: 'rgba(140, 120, 145, 0.85)',
              background: 'rgba(210, 195, 225, 0.2)',
              border: '1px solid rgba(200, 185, 215, 0.35)',
            }}
          >
            取消 · Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-6 py-2 rounded-full text-sm text-white transition-all hover:opacity-90 disabled:opacity-35 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #C97EA0 0%, #9AACAA 100%)', boxShadow: '0 2px 12px rgba(201,126,160,0.3)' }}
          >
            {saving ? '上传中… Uploading' : '✦ 保存记忆 · Save'}
          </button>
        </div>
      </div>

      {showMap && (
        <MapPicker
          onSelect={name => setLocation(name)}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
