import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserRole } from '../context/RoleContext';
import { MapSheet } from '../components/ui/MapSheet';
import {
  MegaphoneIcon,
  ClockIcon,
  BarChartIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  BookOpenIcon,
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

interface VenueClaimRequest {
  id: string;
  crName: string;
  cohort: string;
  venue: string;
  slot: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AcademicClashTicket {
  id: string;
  cohort: string;
  subject: string;
  description: string;
  status: 'open' | 'resolving' | 'resolved';
  submittedBy: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
}

export function ConsolePage() {
  const { currentProfile, actingTitle, setRoleKind, allRolePresets } = useUserRole();

  // Active module modal states
  const [activeModal, setActiveModal] = useState<
    'announce' | 'emergency' | 'window-manager' | 'academic-desk' | 'safe-reports' | 'audit' | 'elections' | null
  >(null);

  // Map Sheet
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedVenueForClaim, setSelectedVenueForClaim] = useState<string | undefined>('lt-3');

  // Simulated live claim window for the "Venue Rush"
  const [claimWindow, setClaimWindow] = useState<ClaimWindow>({
    id: 'win-1',
    name: 'Mid-Semester Revision Window',
    venueName: 'LT 1, LT 2, LT 3, MPH',
    opensInSec: 38,
    fairness: 'First-Come First-Served',
    eligible: 'MD Year 2 & 3 CRs',
    status: 'countdown',
    slotsAvailable: 4,
    totalSlots: 6,
  });

  // Election certification state (Spec 12)
  const [electionCertified, setElectionCertified] = useState(false);

  // Incoming Venue Claim Requests (Welfare Minister view)
  const [claimsQueue, setClaimsQueue] = useState<VenueClaimRequest[]>([
    { id: 'clm-1', crName: 'David Kweka', cohort: 'MD Year 2', venue: 'LT 3', slot: 'Thursday 12:00 - 14:00', status: 'pending' },
    { id: 'clm-2', crName: 'Sarah M.', cohort: 'BPharm Year 1', venue: 'LT 1', slot: 'Thursday 12:00 - 14:00', status: 'approved' },
  ]);

  // Academic Clash Tickets (Education Ministry view)
  const [clashes, setClashes] = useState<AcademicClashTicket[]>([
    {
      id: 't-1',
      cohort: 'MD Year 2',
      subject: 'Physiology & Anatomy Practical Overlap',
      description: 'Cardiovascular lecture clashes with Gross Anatomy Lab B dissection slot on Friday morning.',
      status: 'resolving',
      submittedBy: 'David Kweka (CR)',
    },
  ]);

  // Audit Log Entries
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    { id: 'log-1', timestamp: '11:42', actor: 'Noel Chesco', role: 'Minister, Welfare', action: 'Opened Venue Claim Window', target: 'LT 1-3 Revision 2026' },
    { id: 'log-2', timestamp: '11:45', actor: 'David Kweka', role: 'CR MD Year 2', action: 'Submitted Slot Claim', target: 'LT 3 (Thursday 12:00)' },
    { id: 'log-3', timestamp: '09:10', actor: 'Chief Secretary', role: 'Chief Secretary', action: 'Approved Global Broadcast', target: 'Mid-Semester Roster' },
  ]);

  // Form states
  const [announceScope, setAnnounceScope] = useState<'cohort' | 'ministry' | 'global'>('cohort');
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Emergency form
  const [emergencySeverity, setEmergencySeverity] = useState<'high_alert' | 'drill'>('high_alert');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSimulateRushToggle = () => {
    const isNowOpen = claimWindow.status === 'countdown';
    setClaimWindow((prev) => ({
      ...prev,
      status: isNowOpen ? 'open' : 'countdown',
      opensInSec: isNowOpen ? 0 : 38,
    }));
    showToast(isNowOpen ? '⚡ 12:00:00 REACHED! Venue Rush window is now OPEN for claims!' : 'Claim window reset to countdown state.');
  };

  const handleCertifyElection = () => {
    setElectionCertified(true);
    showToast('MUHASSO Presidential Election Results Certified & Published to Feed!');
    setAuditLog((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: currentProfile.name,
        role: actingTitle,
        action: 'Certified Official Election Handover',
        target: 'MUHASSO Presidential General Election 2026/2027',
      },
      ...prev,
    ]);
  };

  const handleClaimVenue = (venue: Venue) => {
    showToast(`Claim confirmed for ${venue.name} on behalf of ${currentProfile.scope}. Double-booking constraint verified.`);
    setClaimWindow((prev) => ({
      ...prev,
      slotsAvailable: Math.max(0, prev.slotsAvailable - 1),
    }));
    setAuditLog((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: currentProfile.name,
        role: actingTitle,
        action: 'Claimed Venue on Live Map',
        target: venue.name,
      },
      ...prev,
    ]);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceBody.trim()) return;

    if (announceScope === 'global' && currentProfile.kind !== 'executive') {
      showToast('Submitted for Chief Secretary Approval. SLA: 12 hours.');
    } else {
      showToast(`Announcement dispatched to ${announceScope.toUpperCase()} scope.`);
    }

    setAuditLog((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: currentProfile.name,
        role: actingTitle,
        action: announceScope === 'global' ? 'Submitted Global Post (Pending)' : 'Published Scoped Notice',
        target: announceTitle || 'Official Announcement',
      },
      ...prev,
    ]);

    setAnnounceTitle('');
    setAnnounceBody('');
    setActiveModal(null);
  };

  const handleDispatchEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyReason.trim() || !emergencyConfirmed) return;

    showToast(`EMERGENCY BROADCAST DISPATCHED: Push notification sent to all devices.`);
    setAuditLog((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: currentProfile.name,
        role: actingTitle,
        action: `DISPATCHED EMERGENCY (${emergencySeverity.toUpperCase()})`,
        target: emergencyReason,
      },
      ...prev,
    ]);

    setEmergencyReason('');
    setEmergencyConfirmed(false);
    setActiveModal(null);
  };

  const handleDecideClaim = (claimId: string, decision: 'approved' | 'rejected') => {
    setClaimsQueue((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: decision } : c))
    );
    showToast(`Claim #${claimId} marked as ${decision.toUpperCase()}.`);
  };

  return (
    <>
      <TopBar title="Console" />

      <div className="console-canvas">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="console-toast" role="alert">
            <CheckCircleIcon size={14} color="var(--yuni-teal)" strokeWidth={2.5} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. AUTHORITY & ACTING-AS BANNER (Spec 10 Section 2) */}
        <section className="console-header-card">
          <div className="console-header-top">
            <div>
              <span className="console-header-tag">ORGANOGRAM AUTHORITY</span>
              <h2 className="console-header-title">{actingTitle}</h2>
              <p className="console-header-scope">
                Scope: <code>{currentProfile.scope}</code> · Term valid 2025/2026
              </p>
            </div>
            <div className="console-verified-badge">
              <ShieldCheckIcon size={18} color="var(--yuni-teal)" strokeWidth={2.2} />
              <span>Verified</span>
            </div>
          </div>

          <div className="console-delegation-strip" style={{ flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span className="console-acting-label" style={{ fontWeight: 800 }}>Role Switcher:</span>
            {allRolePresets.map((preset) => (
              <button
                key={preset.kind}
                className={`chip chip--sm btn-hop ${currentProfile.kind === preset.kind ? 'chip--active' : ''}`}
                onClick={() => setRoleKind(preset.kind)}
                type="button"
                style={{ fontSize: 11, padding: '3px 9px' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. LIVE VENUE RUSH ALLOCATION DESK (Spec 10 Section 8.3) */}
        <section className="console-rush-card">
          <div className="console-rush-top">
            <div>
              <span className={`badge ${claimWindow.status === 'open' ? 'badge--synced' : 'badge--pending'}`} style={{ fontSize: 10 }}>
                {claimWindow.status === 'open' ? '● Window OPEN' : 'Countdown'}
              </span>
              <h3 className="console-rush-title">{claimWindow.name}</h3>
              <p className="console-rush-sub">
                {claimWindow.venueName} · {claimWindow.fairness}
              </p>
            </div>
            <div className="console-rush-timer">
              <ClockIcon size={13} color={claimWindow.status === 'open' ? 'var(--yuni-teal)' : '#DC2626'} strokeWidth={2.2} />
              <span className="num" style={{ fontWeight: 800, color: claimWindow.status === 'open' ? 'var(--yuni-teal)' : '#DC2626' }}>
                {claimWindow.status === 'open' ? 'ACTIVE' : `00:${claimWindow.opensInSec < 10 ? `0${claimWindow.opensInSec}` : claimWindow.opensInSec}`}
              </span>
            </div>
          </div>

          <div className="console-rush-stats">
            <span className="text-faint" style={{ fontSize: 12 }}>
              Slots remaining: <strong>{claimWindow.slotsAvailable} / {claimWindow.totalSlots}</strong>
            </span>
            <span className="badge badge--blue" style={{ fontSize: 11 }}>
              {claimWindow.eligible}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              className="btn btn--ghost btn--sm btn-hop"
              onClick={handleSimulateRushToggle}
              type="button"
              style={{ fontSize: 12, flex: 1 }}
            >
              ⚡ {claimWindow.status === 'open' ? 'Reset Rush Timer' : 'Simulate 12:00 Rush'}
            </button>
            <button
              className="btn btn--primary btn--sm btn-hop"
              onClick={() => {
                setSelectedVenueForClaim('lt-3');
                setIsMapOpen(true);
              }}
              type="button"
              style={{ fontSize: 12, flex: 1 }}
            >
              Open Claim Map →
            </button>
          </div>
        </section>

        {/* 3. MINISTERIAL & LEADER TOOLS GRID */}
        <section className="console-tools-section">
          <div className="console-section-subhead">
            <span className="console-subhead-text">LEADERSHIP MODULES · SPEC 10 RBAC</span>
          </div>

          <div className="console-tools-grid">
            {/* Announce Desk */}
            <div
              className="console-tool-card"
              onClick={() => setActiveModal('announce')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon">
                <MegaphoneIcon size={20} color="var(--yuni-blue)" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Announce Desk</strong>
              <p className="console-tool-desc">Scoped post or global dispatch</p>
            </div>

            {/* Emergency Broadcast */}
            <div
              className="console-tool-card console-tool-card--emergency"
              onClick={() => setActiveModal('emergency')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircleIcon size={20} color="#DC2626" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Emergency Desk</strong>
              <p className="console-tool-desc">Urgent broadcast with instant push</p>
            </div>

            {/* Window Manager (Welfare & Sports) */}
            <div
              className="console-tool-card"
              onClick={() => setActiveModal('window-manager')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon">
                <ClockIcon size={20} color="var(--yuni-teal)" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Claim Windows</strong>
              <p className="console-tool-desc">Open FCFS or lottery booking</p>
            </div>

            {/* Academic Clashes Desk (Education) */}
            <div
              className="console-tool-card"
              onClick={() => setActiveModal('academic-desk')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon">
                <BookOpenIcon size={20} color="var(--ink)" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Academic Clashes</strong>
              <p className="console-tool-desc">Timetable overlap dispute desk</p>
            </div>

            {/* Safe Reports Desk (Gender & Internal) */}
            <div
              className="console-tool-card"
              onClick={() => setActiveModal('safe-reports')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon">
                <ShieldCheckIcon size={20} color="var(--yuni-sun)" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Safe Reports (R)</strong>
              <p className="console-tool-desc">Confidential student welfare inbox</p>
            </div>

            {/* Audit Log */}
            <div
              className="console-tool-card btn-hop"
              onClick={() => setActiveModal('audit')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon">
                <BarChartIcon size={20} color="var(--text-muted)" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Audit Log</strong>
              <p className="console-tool-desc">Immutable capability event stream</p>
            </div>

            {/* Elections & Ballots Desk (Spec 12) */}
            <div
              className="console-tool-card btn-hop"
              onClick={() => setActiveModal('elections')}
              role="button"
              tabIndex={0}
            >
              <div className="console-tool-icon" style={{ background: 'rgba(35, 71, 197, 0.1)' }}>
                <BarChartIcon size={20} color="var(--yuni-blue)" strokeWidth={2.2} />
              </div>
              <strong className="console-tool-name">Elections & Ballots</strong>
              <p className="console-tool-desc">Secret ballot voting & certifications</p>
            </div>
          </div>
        </section>

        {/* 4. ACTIVE CLAIMS REVIEW DESK (Welfare Ministry) */}
        <section className="console-claims-section">
          <div className="console-section-subhead">
            <span className="console-subhead-text">INCOMING CLAIMS QUEUE</span>
            <span className="badge badge--blue" style={{ fontSize: 10 }}>Welfare Authority</span>
          </div>

          <div className="console-claims-list">
            {claimsQueue.map((claim) => (
              <div key={claim.id} className="console-claim-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: 13.5 }}>{claim.cohort}</strong>
                    <span className="text-faint" style={{ fontSize: 11 }}>by {claim.crName}</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
                    Venue: <strong>{claim.venue}</strong> · {claim.slot}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {claim.status === 'pending' ? (
                    <>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => handleDecideClaim(claim.id, 'approved')}
                        type="button"
                        style={{ fontSize: 11 }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleDecideClaim(claim.id, 'rejected')}
                        type="button"
                        style={{ fontSize: 11 }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`badge ${claim.status === 'approved' ? 'badge--synced' : 'badge--pending'}`}
                      style={{ fontSize: 10.5, textTransform: 'capitalize' }}
                    >
                      {claim.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL 1: ANNOUNCE DESK */}
      {activeModal === 'announce' && (
        <div className="console-modal-overlay" role="dialog" aria-modal="true">
          <div className="console-modal">
            <div className="console-modal-header">
              <h3 style={{ margin: 0, font: '800 18px var(--font-display)' }}>Compose Official Notice</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="console-modal-body">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Target Audience Scope:
              </label>
              <div className="console-modal-chips">
                {(['cohort', 'ministry', 'global'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip chip--sm ${announceScope === s ? 'chip--active' : ''}`}
                    onClick={() => setAnnounceScope(s)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {announceScope === 'global' && currentProfile.kind !== 'executive' && (
                <div className="console-notice-banner">
                  <AlertCircleIcon size={14} strokeWidth={2} />
                  <span>
                    Global posts require Chief Secretary approval before broadcast (Spec 10 Section 8.2).
                  </span>
                </div>
              )}

              <input
                className="input"
                type="text"
                placeholder="Announcement Title..."
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                style={{ width: '100%', marginTop: 10 }}
                required
              />

              <textarea
                className="input"
                rows={4}
                placeholder="Official message body..."
                value={announceBody}
                onChange={(e) => setAnnounceBody(e.target.value)}
                style={{ width: '100%', marginTop: 8 }}
                required
              />

              <button className="btn btn--primary" style={{ width: '100%', marginTop: 14 }} type="submit">
                {announceScope === 'global' ? 'Submit for Chief Secretary Approval' : 'Broadcast to Scope'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EMERGENCY BROADCAST DESK */}
      {activeModal === 'emergency' && (
        <div className="console-modal-overlay" role="dialog" aria-modal="true">
          <div className="console-modal" style={{ borderTop: '4px solid #DC2626' }}>
            <div className="console-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircleIcon size={18} color="#DC2626" strokeWidth={2.5} />
                <h3 style={{ margin: 0, font: '800 18px var(--font-display)', color: '#DC2626' }}>
                  Emergency Broadcast Desk
                </h3>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handleDispatchEmergency} className="console-modal-body">
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Strongest broadcast gate in Yuni. Dispatches instant push banner to every registered student device. Max 1 per leader per day.
              </p>

              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Severity Level:</label>
                <div className="console-modal-chips" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className={`chip chip--sm ${emergencySeverity === 'high_alert' ? 'chip--active' : ''}`}
                    onClick={() => setEmergencySeverity('high_alert')}
                  >
                    High Alert (Red)
                  </button>
                  <button
                    type="button"
                    className={`chip chip--sm ${emergencySeverity === 'drill' ? 'chip--active' : ''}`}
                    onClick={() => setEmergencySeverity('drill')}
                  >
                    Campus Safety Drill (Amber)
                  </button>
                </div>
              </div>

              <textarea
                className="input"
                rows={3}
                placeholder="Emergency reason and immediate instructions..."
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                style={{ width: '100%', marginTop: 10 }}
                required
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={emergencyConfirmed}
                  onChange={(e) => setEmergencyConfirmed(e.target.checked)}
                />
                <span>I confirm this broadcast is verified with campus security authority.</span>
              </label>

              <button
                className="btn btn--primary"
                style={{ width: '100%', marginTop: 14, background: '#DC2626', borderColor: '#DC2626' }}
                disabled={!emergencyConfirmed || !emergencyReason.trim()}
                type="submit"
              >
                Dispatch Instant Emergency Alert
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AUDIT LOG VIEWER */}
      {activeModal === 'audit' && (
        <div className="console-modal-overlay" role="dialog" aria-modal="true">
          <div className="console-modal">
            <div className="console-modal-header">
              <h3 style={{ margin: 0, font: '800 18px var(--font-display)' }}>System Audit Ledger</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="console-modal-body">
              <p className="text-faint" style={{ fontSize: 12 }}>
                Tamper-proof capability log (Spec 10 Section 1.5 & Section 9):
              </p>

              <div className="console-audit-list">
                {auditLog.map((log) => (
                  <div key={log.id} className="console-audit-entry">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: 12.5 }}>{log.actor}</strong>
                      <span className="text-faint" style={{ fontSize: 11 }}>{log.timestamp}</span>
                    </div>
                    <span className="badge badge--surface" style={{ fontSize: 10, marginTop: 2, display: 'inline-block' }}>
                      {log.role}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text)' }}>
                      <strong>{log.action}</strong>: {log.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SAFE REPORTS DESK */}
      {activeModal === 'safe-reports' && (
        <div className="console-modal-overlay" role="dialog" aria-modal="true">
          <div className="console-modal">
            <div className="console-modal-header">
              <h3 style={{ margin: 0, font: '800 18px var(--font-display)' }}>Safe Reports Desk (Restricted)</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="console-modal-body">
              <div className="console-notice-banner" style={{ background: 'rgba(255, 214, 10, 0.15)', borderColor: 'var(--yuni-sun)' }}>
                <ShieldCheckIcon size={14} strokeWidth={2} />
                <span>
                  Confidential inbox. Every open is logged in the permanent audit ledger. Identifying details are auto-redacted.
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="console-claim-item">
                  <div>
                    <span className="badge badge--blue" style={{ fontSize: 10 }}>Anonymous Ticket #SR-102</span>
                    <p style={{ fontSize: 12.5, margin: '4px 0 0', color: 'var(--text)' }}>
                      Hostel block safety query regarding evening corridor lighting.
                    </p>
                    <span className="text-faint" style={{ fontSize: 11 }}>Received 2h ago · Policy acknowledged</span>
                  </div>
                  <button className="btn btn--primary btn--sm" onClick={() => showToast('Acknowledged via confidential thread.')}>
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ACADEMIC CLASHES DESK (Education Ministry) */}
      {activeModal === 'academic-desk' && (
        <div className="console-modal-overlay" role="dialog" aria-modal="true">
          <div className="console-modal">
            <div className="console-modal-header">
              <h3 style={{ margin: 0, font: '800 18px var(--font-display)' }}>Academic Clashes Desk</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="console-modal-body">
              <p className="text-faint" style={{ fontSize: 12 }}>
                Timetable and lab practical overlap reports submitted by Class Representatives:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {clashes.map((c) => (
                  <div key={c.id} className="console-claim-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <strong style={{ fontSize: 13.5 }}>{c.subject}</strong>
                      <span className="badge badge--pending" style={{ fontSize: 10, textTransform: 'capitalize' }}>
                        {c.status}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: 12.5, color: 'var(--text)' }}>{c.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: 4 }}>
                      <span className="text-faint" style={{ fontSize: 11 }}>Reported by {c.submittedBy}</span>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => {
                          setClashes((prev) =>
                            prev.map((item) => (item.id === c.id ? { ...item, status: 'resolved' } : item))
                          );
                          showToast(`Clash ticket #${c.id} marked as RESOLVED.`);
                        }}
                        style={{ fontSize: 11 }}
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ELECTIONS & BALLOTS DESK MODAL (Spec 12) */}
      {activeModal === 'elections' && (
        <div className="console-modal-overlay" role="dialog" aria-modal="true">
          <div className="console-modal-card">
            <div className="console-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge--blue">Spec 12</span>
                <h3 className="console-modal-title">Elections & Secret Ballots Desk</h3>
              </div>
              <button
                className="btn btn--ghost btn--sm btn-hop"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
              >
                Done
              </button>
            </div>

            <div className="console-modal-body">
              <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', marginBottom: 14 }}>
                <span className="badge badge--synced" style={{ fontSize: 10.5, marginBottom: 6 }}>Active Certified Ballot</span>
                <h4 style={{ font: '800 16px var(--font-display)', margin: '4px 0 2px' }}>
                  MUHASSO Presidential General Election 2026/2027
                </h4>
                <p className="text-muted" style={{ fontSize: 12.5 }}>
                  Secret ballot supervised by Constitution Ministry & Electoral Commission. 1 vote per verified student.
                </p>

                <div style={{ display: 'flex', gap: 14, marginTop: 12, padding: '10px 12px', background: '#FFFFFF', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div>
                    <span className="text-faint" style={{ fontSize: 11 }}>Turnout</span>
                    <strong style={{ display: 'block', fontSize: 15, color: 'var(--yuni-blue)' }}>68.2%</strong>
                  </div>
                  <div>
                    <span className="text-faint" style={{ fontSize: 11 }}>Verified Ballots</span>
                    <strong style={{ display: 'block', fontSize: 15 }}>1,842 / 2,700</strong>
                  </div>
                  <div>
                    <span className="text-faint" style={{ fontSize: 11 }}>Status</span>
                    <strong style={{ display: 'block', fontSize: 15, color: 'var(--yuni-teal)' }}>
                      {electionCertified ? 'Certified ✓' : 'Auditing'}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)' }}>CANDIDATE RESULTS:</span>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <strong>Hon. Josephat Mrope (MD 4)</strong>
                        <span className="text-faint" style={{ display: 'block', fontSize: 11 }}>Manifesto: Academic Excellence & Clinical Health</span>
                      </div>
                      <span className="badge badge--synced" style={{ fontSize: 12, fontWeight: 800 }}>62.4% (1,149)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <strong>Faith Kimaro (BPharm 3)</strong>
                        <span className="text-faint" style={{ display: 'block', fontSize: 11 }}>Manifesto: Student Welfare & Cafeteria Standards</span>
                      </div>
                      <span className="badge badge--blue" style={{ fontSize: 12, fontWeight: 800 }}>37.6% (693)</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn--primary btn--sm btn-hop"
                    onClick={handleCertifyElection}
                    type="button"
                    style={{ flex: 1 }}
                  >
                    {electionCertified ? '✓ Official Certification Published' : 'Certify Official Handover'}
                  </button>
                  <button
                    className="btn btn--ghost btn--sm btn-hop"
                    onClick={() => showToast('New Baraza ballot drafted. Ready for Electoral Officer sign-off.')}
                    type="button"
                    style={{ flex: 1 }}
                  >
                    Draft Baraza Ballot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MapSheet in claim-venue mode */}
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
