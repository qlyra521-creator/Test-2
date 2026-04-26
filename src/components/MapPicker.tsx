import React, { useState, useRef, useCallback } from 'react';
import { X, Loader, MapPin, Search } from 'lucide-react';

interface Props {
  onSelect: (name: string) => void;
  onClose: () => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

const DEFAULT_EMBED = 'https://maps.google.com/maps?q=Amsterdam&output=embed&z=12&hl=zh-CN';

export default function MapPicker({ onSelect, onClose }: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [embedSrc, setEmbedSrc] = useState(DEFAULT_EMBED);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6`,
        { headers: { 'Accept-Language': 'zh,en' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedName(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const selectSuggestion = (r: NominatimResult) => {
    const name = r.display_name.split(',')[0].trim();
    setQuery(name);
    setSelectedName(name);
    setSuggestions([]);
    setShowSuggestions(false);
    setEmbedSrc(
      `https://maps.google.com/maps?q=${encodeURIComponent(r.display_name.split(',').slice(0, 3).join(','))}&output=embed&z=15&hl=zh-CN`
    );
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setSuggestions([]);
    setShowSuggestions(false);
    setEmbedSrc(
      `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&z=14&hl=zh-CN`
    );
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up flex flex-col"
        style={{
          height: '80vh',
          maxHeight: 600,
          background: 'rgba(255, 251, 247, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 40px rgba(80, 60, 100, 0.15)',
          overflow: 'visible',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(200,190,210,0.2)', borderRadius: '20px 20px 0 0' }}>
          <h3 className="font-serif text-lg font-light text-primary">选择地点 · Pick Location</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-2 shrink-0 relative" style={{ zIndex: 10 }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="搜索地点或邮编 · Search place or postcode…"
                style={{ marginBottom: 0, paddingRight: 36 }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 pointer-events-none">
                {searching ? <Loader size={13} className="animate-spin" /> : <MapPin size={13} />}
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C97EA0, #9AACAA)' }}
            >
              <Search size={14} />
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute left-4 right-4 rounded-xl overflow-hidden shadow-lg"
              style={{
                top: 'calc(100% - 4px)',
                zIndex: 50,
                background: 'rgba(255,251,247,0.98)',
                border: '1px solid rgba(200,190,210,0.3)',
              }}
            >
              {suggestions.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={e => { e.preventDefault(); selectSuggestion(r); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-purple-50/60 transition-colors flex items-start gap-2"
                  style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(200,190,210,0.15)' : 'none' }}
                >
                  <MapPin size={12} className="shrink-0 mt-0.5 text-secondary/50" />
                  <span className="truncate">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Google Maps iframe */}
        <div className="flex-1 mx-4 mb-0 rounded-xl overflow-hidden" style={{ zIndex: 0 }}>
          <iframe
            key={embedSrc}
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 shrink-0 flex items-center gap-3" style={{ borderTop: '1px solid rgba(200,190,210,0.2)' }}>
          <div className="flex-1 text-sm text-secondary truncate">
            {selectedName
              ? <><span className="mr-1">📍</span>{selectedName}</>
              : <span className="italic text-secondary/60">搜索并确认地点 · Search and confirm</span>
            }
          </div>
          <button
            onClick={() => { if (selectedName.trim()) { onSelect(selectedName.trim()); onClose(); } }}
            disabled={!selectedName.trim()}
            className="shrink-0 px-5 py-2 rounded-full text-sm text-white disabled:opacity-40 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C97EA0, #D4937A)' }}
          >
            确认 · Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
