import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import './Feed.css';

type FeedFilter = 'all' | 'announcements' | 'polls' | 'events';

export function FeedPage() {
  const [filter, setFilter] = useState<FeedFilter>('all');

  const filters: { key: FeedFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'polls', label: 'Polls' },
    { key: 'events', label: 'Events' },
  ];

  return (
    <>
      <TopBar title="Feed" />
      <div className="page__content">
        {/* Filter Chips */}
        <div className="feed-filters">
          {filters.map((f) => (
            <button
              key={f.key}
              className="chip"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Pinned Announcement */}
        <div className="card card--urgent feed-card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="feed-card__meta">
            <span className="badge badge--live">Urgent</span>
            <span className="badge badge--scope">All students</span>
          </div>
          <h3 style={{ marginTop: 8 }}>Exam timetable published</h3>
          <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
            The end-of-semester exam timetable for 2026/27 has been released. Check SARIS for your personal schedule.
          </p>
          <p className="text-faint" style={{ fontSize: 12, marginTop: 8 }}>
            Academic Office · 2 hours ago
          </p>
        </div>

        {/* Poll Card */}
        <div className="card feed-card">
          <div className="feed-card__meta">
            <span className="badge badge--scope">Year 2</span>
          </div>
          <h3 style={{ marginTop: 8 }}>Which topic should we review first?</h3>
          <div className="feed-poll-options">
            <button className="poll-option" role="radio" aria-checked="true">
              <span className="poll-option__fill" style={{ '--pct': '62%' } as React.CSSProperties} />
              <span>Anatomy</span>
              <span className="num">62%</span>
            </button>
            <button className="poll-option" role="radio" aria-checked="false">
              <span className="poll-option__fill" style={{ '--pct': '38%' } as React.CSSProperties} />
              <span>Physiology</span>
              <span className="num">38%</span>
            </button>
          </div>
          <div className="feed-poll-meta">
            <span className="text-faint" style={{ fontSize: 12 }}>48 votes · Closes in 2 days</span>
            <span className="badge badge--synced">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Voted
            </span>
          </div>
        </div>

        {/* Regular Announcement */}
        <div className="card feed-card">
          <div className="feed-card__meta">
            <span className="badge badge--scope">Football</span>
          </div>
          <h3 style={{ marginTop: 8 }}>Inter-faculty tournament this Saturday</h3>
          <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
            MUHAS vs UDSM at the main pitch. Come support the team! Kickoff at 3 PM.
          </p>
          <p className="text-faint" style={{ fontSize: 12, marginTop: 8 }}>
            Sports Committee · 5 hours ago
          </p>
        </div>

        {/* Another Announcement */}
        <div className="card feed-card">
          <div className="feed-card__meta">
            <span className="badge badge--scope">Year 3</span>
          </div>
          <h3 style={{ marginTop: 8 }}>Clinical rotation schedule update</h3>
          <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
            Rotation groups for Muhimbili National Hospital have been updated. Check the notice board or ask your class rep.
          </p>
          <p className="text-faint" style={{ fontSize: 12, marginTop: 8 }}>
            Dean's Office · Yesterday
          </p>
        </div>
      </div>
    </>
  );
}
