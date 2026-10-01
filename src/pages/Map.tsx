import { TopBar } from '../components/layout/TopBar';
import './Map.css';

export function MapPage() {
  return (
    <>
      <TopBar
        title="Campus Map"
        actions={
          <input
            className="input"
            placeholder="Search LT, lab, hostel..."
            style={{ maxWidth: 200, minHeight: 36, fontSize: 13 }}
            aria-label="Search campus locations"
          />
        }
      />
      <div className="page__content">
        {/* Map placeholder — will be replaced with MapLibre GL */}
        <div className="map-container">
          <div className="map-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <p style={{ marginTop: 12, fontWeight: 600 }}>Campus map coming soon</p>
            <p className="text-faint" style={{ fontSize: 13, marginTop: 4 }}>
              MapLibre + offline GeoJSON tiles
            </p>
          </div>
        </div>

        {/* Quick Places */}
        <section style={{ marginTop: 'var(--space-5)' }}>
          <h3>Quick places</h3>
          <div className="map-places">
            {[
              { name: 'Lecture Theatre 1', type: 'LT', distance: '2 min' },
              { name: 'Main Library', type: 'Library', distance: '5 min' },
              { name: 'Cafeteria', type: 'Food', distance: '3 min' },
              { name: 'Admin Block', type: 'Office', distance: '4 min' },
            ].map((place) => (
              <div key={place.name} className="card card--flat map-place-card">
                <div>
                  <p style={{ fontWeight: 600 }}>{place.name}</p>
                  <p className="text-faint" style={{ fontSize: 13 }}>{place.type}</p>
                </div>
                <span className="badge badge--scope">{place.distance}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
