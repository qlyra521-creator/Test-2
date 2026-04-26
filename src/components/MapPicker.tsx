import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Loader, MapPin, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  onSelect: (name: string) => void;
  onClose: () => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function MapPicker({ onSelect, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  // Init Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      placeMarker(map, lat, lng);
      setReversing(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'zh,en' } }
        );
        const data = await res.json();
        const name =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          data.display_name?.split(',')[0] ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setSelectedName(name);
        setQuery(name);
      } catch {
        const name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setSelectedName(name);
        setQuery(name);
      } finally {
        setReversing(false);
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  function placeMarker(map: L.Map, lat: number, lng: number) {
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng]).addTo(map);
    map.panTo([lat, lng]);
  }

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
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (mapRef.current) {
      placeMarker(mapRef.current, lat, lng);
      mapRef.current.setView([lat, lng], 14);
    }
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
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(200,190,210,0.2)' }}>
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
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="搜索地点 · Search，或直接在地图上点击"
                style={{ marginBottom: 0, paddingRight: 36 }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 pointer-events-none">
                {searching || reversing ? <Loader size={13} className="animate-spin" /> : <MapPin size={13} />}
              </div>
            </div>
            <button
              onClick={() => fetchSuggestions(query)}
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

        {/* Leaflet map */}
        <div className="flex-1 mx-4 rounded-xl overflow-hidden" style={{ minHeight: 0 }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 shrink-0 flex items-center gap-3" style={{ borderTop: '1px solid rgba(200,190,210,0.2)' }}>
          <div className="flex-1 text-sm text-secondary truncate">
            {reversing
              ? <span className="italic text-secondary/60">获取位置中…</span>
              : selectedName
                ? <><span className="mr-1">📍</span>{selectedName}</>
                : <span className="italic text-secondary/60">搜索地点，或点击地图选择</span>
            }
          </div>
          <button
            onClick={() => { if (selectedName.trim()) { onSelect(selectedName.trim()); onClose(); } }}
            disabled={!selectedName.trim() || reversing}
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

