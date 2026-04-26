import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Search, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Props {
  onSelect: (name: string) => void;
  onClose: () => void;
}

const MARKER_ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const MARKER_SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

export default function MapPicker({ onSelect, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedName, setSelectedName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [reversing, setReversing] = useState(false);

  const placeMarker = useCallback((L: typeof import('leaflet'), lat: number, lng: number, name: string) => {
    const map = mapRef.current;
    if (!map) return;
    const icon = L.icon({ iconUrl: MARKER_ICON_URL, shadowUrl: MARKER_SHADOW_URL, iconSize: [25, 41], iconAnchor: [12, 41] });
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
      const map = L.map(mapContainerRef.current!).setView([31.2304, 121.4737], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setReversing(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh`,
            { headers: { 'Accept-Language': 'zh' } }
          );
          const data = await res.json();
          const name =
            data.address?.tourism ||
            data.address?.amenity ||
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

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&accept-language=zh`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const selectResult = useCallback((result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name.split(',')[0].trim();
    import('leaflet').then(L => {
      mapRef.current?.setView([lat, lng], 14);
      placeMarker(L, lat, lng, name);
    });
    setSearchResults([]);
    setSearchQuery('');
  }, [placeMarker]);

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div
        className="glass-card w-full max-w-lg animate-slide-up flex flex-col overflow-hidden"
        style={{ height: '80vh', maxHeight: 580 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20 shrink-0">
          <h3 className="font-serif text-lg font-light text-primary">选择地点 · Pick Location</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-2 shrink-0 relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="搜索地点 · Search a place…"
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #9AACAA, #7DAFC8)' }}
            >
              {searching ? <Loader size={13} className="animate-spin" /> : <Search size={13} />}
            </button>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full z-50 glass-card overflow-hidden shadow-lg" style={{ marginTop: 2 }}>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-white/30 transition-colors border-b border-white/10 last:border-0 truncate"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="relative flex-1">
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
