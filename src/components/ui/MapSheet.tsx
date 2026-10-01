import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MUHAS_CAMPUS_CENTER, MUHAS_VENUES, type Venue } from '../../lib/venues';
import './MapSheet.css';

export type MapMode = 'navigate' | 'view-venue' | 'claim-venue' | 'show-location' | 'pick-location';

interface MapSheetProps {
  isOpen: boolean;
  mode: MapMode;
  targetVenueId?: string;
  onClose: () => void;
  onClaimVenue?: (venue: Venue) => void;
}

export function MapSheet({
  isOpen,
  mode = 'view-venue',
  targetVenueId = 'lt-3',
  onClose,
  onClaimVenue,
}: MapSheetProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(
    MUHAS_VENUES.find((v) => v.id === targetVenueId) || MUHAS_VENUES[0]
  );
  const [walkingEstimate, setWalkingEstimate] = useState<{ meters: number; minutes: number } | null>(null);

  // Student mock user position near Student Centre
  const userLat = -6.8058;
  const userLng = 39.2740;

  useEffect(() => {
    if (targetVenueId) {
      const v = MUHAS_VENUES.find((item) => item.id === targetVenueId);
      if (v) setSelectedVenue(v);
    }
  }, [targetVenueId]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Fix default marker icon issues in Leaflet
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [MUHAS_CAMPUS_CENTER.lat, MUHAS_CAMPUS_CENTER.lng],
        zoom: MUHAS_CAMPUS_CENTER.zoom,
        minZoom: 15,
        maxZoom: 19,
        zoomControl: false,
      });

      // OpenStreetMap public tiles with required attribution (Spec 09 Section 5)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    setTimeout(() => map.invalidateSize(), 200);

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom DivIcon for Yuni brand pin
    const createCustomIcon = (isSelected: boolean, label: string) =>
      L.divIcon({
        className: 'yuni-map-pin',
        html: `
          <div class="yuni-pin-wrapper ${isSelected ? 'yuni-pin-wrapper--active' : ''}">
            <div class="yuni-pin-dot"></div>
            <span class="yuni-pin-label">${label}</span>
          </div>
        `,
        iconSize: [80, 36],
        iconAnchor: [40, 18],
      });

    // Render venue pins
    MUHAS_VENUES.forEach((v) => {
      const isTarget = selectedVenue?.id === v.id;
      const marker = L.marker([v.lat, v.lng], {
        icon: createCustomIcon(isTarget, v.name.split('(')[0].trim()),
      }).addTo(map);

      marker.on('click', () => {
        setSelectedVenue(v);
      });
    });

    // If navigate mode, draw route from user to target venue
    if (mode === 'navigate' && selectedVenue) {
      // User marker
      const userIcon = L.divIcon({
        className: 'yuni-user-pin',
        html: `<div class="yuni-user-dot"><div class="yuni-user-pulse"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

      // Route line
      const polyline = L.polyline(
        [
          [userLat, userLng],
          [selectedVenue.lat, selectedVenue.lng],
        ],
        {
          color: '#2347C5',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.9,
        }
      ).addTo(map);

      // Fit map bounds
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Calculate distance & walking time (4.5 km/h)
      const distMeters = map.distance([userLat, userLng], [selectedVenue.lat, selectedVenue.lng]);
      const walkMinutes = Math.max(1, Math.round((distMeters / (4500 / 60))));
      setWalkingEstimate({ meters: Math.round(distMeters), minutes: walkMinutes });
    } else if (selectedVenue) {
      map.setView([selectedVenue.lat, selectedVenue.lng], 17);
    }
  }, [isOpen, selectedVenue, mode]);

  if (!isOpen) return null;

  return (
    <div className="mapsheet-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mapsheet" onClick={(e) => e.stopPropagation()}>
        {/* Header Handle */}
        <div className="mapsheet__handle-bar">
          <div className="mapsheet__handle"></div>
        </div>

        <div className="mapsheet__top">
          <div>
            <h3 className="mapsheet__title">
              {mode === 'navigate'
                ? `Directions to ${selectedVenue?.name.split('(')[0] || 'Venue'}`
                : mode === 'claim-venue'
                ? 'Claim a Lecture Theatre'
                : 'Campus Venues & Halls'}
            </h3>
            <p className="text-faint" style={{ fontSize: 12 }}>
              MUHAS Muhimbili Campus · OpenStreetMap
            </p>
          </div>
          <button className="btn btn--ghost btn--sm mapsheet__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Navigation Banner if in navigate mode */}
        {mode === 'navigate' && walkingEstimate && (
          <div className="mapsheet__nav-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="mapsheet__walk-badge">🚶</div>
              <div>
                <strong>{walkingEstimate.minutes} min walk</strong>
                <span className="text-faint" style={{ fontSize: 12, marginLeft: 6 }}>
                  ({walkingEstimate.meters} meters)
                </span>
              </div>
            </div>
            <span className="badge badge--synced">On Time</span>
          </div>
        )}

        {/* Leaflet Map Canvas */}
        <div className="mapsheet__map-wrapper">
          <div ref={mapContainerRef} className="mapsheet__map-canvas" />
        </div>

        {/* Selected Venue Details / Claim Footer */}
        {selectedVenue && (
          <div className="mapsheet__footer">
            <div className="mapsheet__venue-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{selectedVenue.name}</strong>
                  <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                    {selectedVenue.building} · Capacity: {selectedVenue.capacity} seats
                  </p>
                </div>
                <span className="badge badge--blue">{selectedVenue.type.replace('_', ' ')}</span>
              </div>
              <p className="text-faint" style={{ fontSize: 12, marginTop: 6 }}>
                {selectedVenue.description}
              </p>
            </div>

            {mode === 'claim-venue' && (
              <button
                className="btn btn--primary btn--lg"
                style={{ width: '100%', marginTop: 12 }}
                onClick={() => {
                  onClaimVenue?.(selectedVenue);
                  onClose();
                }}
              >
                Claim {selectedVenue.name.split('(')[0]} for Class
              </button>
            )}

            {mode !== 'claim-venue' && mode !== 'navigate' && (
              <button
                className="btn btn--primary"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => {
                  // Switch to navigate mode
                  const map = mapInstanceRef.current;
                  if (map) {
                    const distMeters = map.distance([userLat, userLng], [selectedVenue.lat, selectedVenue.lng]);
                    const walkMinutes = Math.max(1, Math.round(distMeters / (4500 / 60)));
                    setWalkingEstimate({ meters: Math.round(distMeters), minutes: walkMinutes });
                  }
                }}
              >
                Take me there
              </button>
            )}
          </div>
        )}

        {/* Accessible Place List */}
        <div className="mapsheet__places-list">
          <p className="text-faint" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            Quick Places
          </p>
          <div className="mapsheet__chips">
            {MUHAS_VENUES.map((v) => (
              <button
                key={v.id}
                className={`chip chip--sm ${selectedVenue?.id === v.id ? 'chip--active' : ''}`}
                onClick={() => setSelectedVenue(v)}
                type="button"
                style={{ fontSize: 12 }}
              >
                {v.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
