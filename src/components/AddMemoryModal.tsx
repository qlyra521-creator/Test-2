import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Mic, MicOff, MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory, MemoryType, MEMORY_COLORS, MEMORY_LABELS } from '../types';
import { dayOfJourney, toDateStr } from '../utils/dateUtils';

interface Props {
  defaultDate: string;
  onClose: () => void;
}

const TYPES: MemoryType[] = ['daily', 'travel', 'anniversary', 'special', 'note'];

export default function AddMemoryModal({ defaultDate, onClose }: Props) {
  const { currentUser, addMemory } = useApp();
  const [date, setDate] = useState(defaultDate);
  const [type, setType] = useState<MemoryType>('daily');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = toDateStr(new Date());

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
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
        const reader = new FileReader();
        reader.onloadend = () => setVoiceNote(reader.result as string);
        reader.readAsDataURL(blob);
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

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('浏览器不支持定位 · Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=zh`
          );
          const data = await res.json();
          const place =
            data.locality ||
            data.city ||
            data.principalSubdivision ||
            data.countryName ||
            `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
          setLocation(place);
        } catch {
          setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        alert('无法获取位置，请检查浏览器权限 · Location access denied');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }, []);

  const handleSave = async () => {
    if (!currentUser) return;
    if (!title.trim()) { alert('请填写标题'); return; }
    setSaving(true);

    const memory: Memory = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      date,
      author: currentUser,
      type,
      title: title.trim(),
      content: content.trim(),
      photos,
      voiceNote,
      location: location.trim() || undefined,
      dayOfJourney: dayOfJourney(date),
    };

    addMemory(memory);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card w-full max-w-xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <h2 className="font-serif text-xl font-light text-primary">记录这一天 · Record This Day</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={17} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
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
              onClick={detectLocation}
              disabled={locating}
              title="获取当前位置 · Detect location"
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
              <Navigation
                size={13}
                className={`text-secondary ${locating ? 'animate-pulse' : ''}`}
              />
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
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p} alt="" className="rounded-lg" />
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
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
                  onClick={() => setVoiceNote(undefined)}
                  className="text-xs text-secondary/60 hover:text-red-400 transition-colors"
                >
                  删除 · Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm text-secondary hover:text-primary transition-colors"
          >
            取消 · Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-6 py-2 rounded-full text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #C97EA0, #D4937A)' }}
          >
            {saving ? '保存中 · Saving…' : '保存记忆 · Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
