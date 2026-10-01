import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserRole } from '../context/RoleContext';
import { MapSheet } from '../components/ui/MapSheet';
import { Graffiti } from '../components/ui/Graffiti';
import {
  MegaphoneIcon,
  LandmarkIcon,
  ClockIcon,
  BarChartIcon,
  UsersIcon,
  ShieldCheckIcon,
} from '../components/ui/Icons';
import type { Venue } from '../lib/venues';
import './Console.css';

interface ClaimWindow {
  id: string;
  name: string;
  venueName: string;
  opensInSec: number;
  fairness: 'First-Come First-Served' | 'Lottery Draw';
  eligible: string;
  status: 'countdown' | 'open' | 'closed';
  slotsAvailable: number;
  totalSlots: number;
}

export function ConsolePage() {
  const { currentProfile, actingTitle, setActingTitle } = useUserRole();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedVenueForClaim, setSelectedVenueForClaim] = useState<string | undefined>('lt-3');

  // Simulated live claim window for the "Venue Rush" flagship moment
  const [claimWindow, setClaimWindow] = useState<ClaimWindow>({
    id: 'win-1',
    name: 'Mid-Semester Revision Window',
    venueName: 'LT 1, LT 2, LT 3, MPH',
    opensInSec: 42,
    fairness: 'First-Come First-Served',
    eligible: 'MD Year 2 & 3 CRs',
    status: 'countdown',
    slotsAvailable: 4,
    totalSlots: 6,
  });

  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const handleClaimVenue = (venue: Venue) => {
    setClaimedNotice(`Claim confirmed for ${venue.name} on behalf of ${currentProfile.scope}. Double-booking exclusion constraint verified.`);
    setClaimWindow((prev) => ({
      ...prev,
      slotsAvailable: Math.max(0, prev.slotsAvailable - 1),
    }));
  };

  return (
    <>
      <TopBar title="Console" />
      <div className="page__content">
        {/* Acting As Header (Spec 09 Section 10) */}
        <section className="console-acting-as">
          <div className="console-acting-as__card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-faint" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                Leader Authority
              </span>
              <span className="badge badge--synced">Verified Cabinet</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <div className="avatar avatar--md">{currentProfile.avatar}</div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{actingTitle}</strong>
                <p className="text-faint" style={{ fontSize: 12 }}>
                  Scope: {currentProfile.scope}
                </p>
              </div>
            </div>

            <div className="console-scope-chips">
              <span className="chip chip--sm chip--active">Acting as: {currentProfile.kind.toUpperCase()}</span>
              {currentProfile.kind === 'minister' && (
                <button
                  className="chip chip--sm"
                  onClick={() =>
                    setActingTitle(
                      actingTitle === currentProfile.title
                        ? 'Welfare & Emergency Allocations Officer'
                        : currentProfile.title
                    )
                  }
                >
                  Switch Delegation ↻
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Claim Notice Toast */}
        {claimedNotice && (
          <div className="console-alert-toast">
            {claimedNotice}
          </div>
        )}

        {/* Venue Rush Flagship Tile (Spec 09 Section 11) */}
        <section className="console-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3>Venue Allocation Rush</h3>
              <Graffiti type="star-burst" color="var(--yuni-sun)" width={16} height={16} />
            </div>
            <span className="badge badge--pending">Live Window</span>
          </div>

          <div className="card console-venue-rush-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{claimWindow.name}</strong>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {claimWindow.venueName} · {claimWindow.fairness}
                </p>
              </div>
              <div className="console-countdown-ring">
                <span className="num" style={{ fontSize: 13, fontWeight: 800, color: 'var(--yuni-blue)' }}>
                  00:{claimWindow.opensInSec < 10 ? `0${claimWindow.opensInSec}` : claimWindow.opensInSec}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span className="text-faint" style={{ fontSize: 12 }}>
                Slots remaining: <strong>{claimWindow.slotsAvailable} / {claimWindow.totalSlots}</strong>
              </span>
              <span className="badge badge--blue" style={{ fontSize: 11 }}>{claimWindow.eligible}</span>
            </div>

            <button
              className="btn btn--primary btn--lg"
              style={{ width: '100%', marginTop: 14 }}
              onClick={() => {
                setSelectedVenueForClaim('lt-3');
                setIsMapOpen(true);
              }}
            >
              Open Live Claim Map
            </button>
          </div>
        </section>

        {/* Console Launchpad Tiles (Spec 09 Section 10) */}
        <section className="console-section">
          <h3>Leader Tools</h3>
          <div className="console-tiles-grid">
            <div className="console-tile">
              <div className="console-tile__icon" style={{ background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MegaphoneIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              </div>
              <strong>Announce</strong>
              <p className="text-faint">Post scoped notice or push</p>
            </div>

            <div
              className="console-tile"
              onClick={() => {
                setSelectedVenueForClaim('lt-1');
                setIsMapOpen(true);
              }}
            >
              <div className="console-tile__icon" style={{ background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LandmarkIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              </div>
              <strong>Venues</strong>
              <p className="text-faint">Capacity, bookings, maps</p>
            </div>

            <div className="console-tile">
              <div className="console-tile__icon" style={{ background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClockIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              </div>
              <strong>Claim Windows</strong>
              <p className="text-faint">Open FCFS or lottery draw</p>
            </div>

            <div className="console-tile">
              <div className="console-tile__icon" style={{ background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              </div>
              <strong>Polls & Voting</strong>
              <p className="text-faint">Launch scoped student poll</p>
            </div>

            <div className="console-tile">
              <div className="console-tile__icon" style={{ background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UsersIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              </div>
              <strong>Cohort Groups</strong>
              <p className="text-faint">Manage CR cohort channels</p>
            </div>

            <div className="console-tile">
              <div className="console-tile__icon" style={{ background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheckIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              </div>
              <strong>Audit Log</strong>
              <p className="text-faint">Tamper-proof capability log</p>
            </div>
          </div>
        </section>
      </div>

      {/* MapSheet for venue claiming */}
      <MapSheet
        isOpen={isMapOpen}
        mode="claim-venue"
        targetVenueId={selectedVenueForClaim}
        onClose={() => setIsMapOpen(false)}
        onClaimVenue={handleClaimVenue}
      />
    </>
  );
}
