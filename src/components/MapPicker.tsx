import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Loader, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Props {
  onSelect: (name: string) => void;
  onClose: () => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

export default function MapPicker({ onSelect, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedName, setSelectedName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const placeMarker = useCallback((L: typeof import('leaflet'), lat: number, lng: number, name: string) => {
    const map = mapRef.current;
    if (!map) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#C97EA0,#7DAFC8);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    }
    setSelectedName(name);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import('leaflet').then(L => {
      const map = L.map(mapContainerRef.current!, { zoomControl: false }).setView([31.2304, 121.4737], 10);

      // CartoDB Positron — modern, clean, minimal
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setReversing(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'zh,en' } }
          );
          const data = await res.json();
          const name =
            data.address?.tourism ||
            data.address?.amenity ||
            data.address?.shop ||
            data.address?.road ||
            data.address?.suburb ||
            data.address?.city_district ||
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.display_name?.split(',')[0] ||
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          placeMarker(L, lat, lng, name);
        } catch {
          placeMarker(L, lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
          setReversing(false);
        }
      });

      navigator.geolocation?.getCurrentPosition(({ coords }) => {
        map.setView([coords.latitude, coords.longitude], 13);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [placeMarker]);

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
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const selectSuggestion = useCallback((result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name.split(',')[0].trim();
    import('leaflet').then(L => {
      mapRef.current?.setView([lat, lng], 14);
      placeMarker(L, lat, lng, name);
    });
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchQuery(name);
  }, [placeMarker]);

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div
        className="glass-card w-full max-w-lg animate-slide-up flex flex-col"
        style={{ height: '80vh', maxHeight: 580, overflow: 'visible' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20 shrink-0">
          <h3 className="font-serif text-lg font-light text-primary">选择地点 · Pick Location</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search bar with autocomplete */}
        <div className="px-4 pt-3 pb-2 shrink-0 relative z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={e => { if (e.key === 'Escape') { setShowSuggestions(false); } }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="搜索地点或邮编 · Search place or postcode…"
              style={{ marginBottom: 0, paddingRight: 36 }}
            />
            <div className="absolute right-3 text-secondary/60 pointer-events-none">
              {searching
                ? <Loader size={13} className="animate-spin" />
                : <MapPin size={13} />
              }
            </div>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute left-4 right-4 glass-card overflow-hidden shadow-lg"
              style={{ top: 'calc(100% - 4px)', zIndex: 50 }}
            >
              {suggestions.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={e => { e.preventDefault(); selectSuggestion(r); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-white/30 transition-colors border-b border-white/10 last:border-0"
                  style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <span className="text-secondary/50 mr-1.5" style={{ fontSize: 11 }}>📍</span>
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="relative flex-1" style={{ overflow: 'hidden' }} onClick={() => setShowSuggestions(false)}>
          <div ref={mapContainerRef} className="w-full h-full" />
          {reversing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="glass rounded-full px-4 py-2 text-xs text-secondary flex items-center gap-2">
                <Loader size={11} className="animate-spin" />
                获取地名中…
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/20 shrink-0 flex items-center gap-3">
          <div className="flex-1 text-sm text-secondary truncate">
            {selectedName
              ? <><span className="mr-1">📍</span>{selectedName}</>
              : <span className="italic opacity-70">点击地图选点 · Tap the map to pin</span>
            }
          </div>
          <button
            onClick={() => { if (selectedName) { onSelect(selectedName); onClose(); } }}
            disabled={!selectedName}
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
