import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserRole } from '../context/RoleContext';
import { useInAppBrowser } from '../context/InAppBrowserContext';
import { Graffiti } from '../components/ui/Graffiti';
import { MapSheet } from '../components/ui/MapSheet';
import { StudlyModal, type StudlyMode } from '../components/ui/StudlyModal';
import './Home.css';

interface FeedPost {
  id: string;
  author: string;
  officialTitle?: string;
  scope: string;
  time: string;
  body: string;
  location?: { name: string; venueId: string };
  reactions: Record<string, number>;
  userReaction?: string;
}

export function HomePage() {
  const { currentProfile } = useUserRole();
  const { openInAppBrowser } = useInAppBrowser();

  // Navigation / Map Sheet state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTargetVenue, setMapTargetVenue] = useState('lt-3');

  // Studly Modal state
  const [isStudlyOpen, setIsStudlyOpen] = useState(false);
  const [studlyMode, setStudlyMode] = useState<StudlyMode>('flashcards');

  // NOW Card state carousel (Spec 09 Section 4: "swipe sideways to peek next 3 things")
  const [nowIndex, setNowIndex] = useState(0);

  const nowCards = [
    {
      type: 'upcoming_class',
      title: 'Human Physiology',
      venue: 'LT 3 · Clinical Wing',
      venueId: 'lt-3',
      timing: 'starts in 23 min',
      primaryAction: 'Take me there',
      subAction: 'Open slides',
    },
    {
      type: 'in_class',
      title: 'Gross Anatomy Practical',
      venue: 'Histology Lab · 10:00 - 12:00',
      venueId: 'path-lab',
      timing: 'Next up at 10:00',
      primaryAction: 'View Lab Manual',
      subAction: 'Take me there',
    },
    {
      type: 'free_gap',
      title: '45 min Study Gap',
      venue: 'Main Library Air-Conditioned Hub',
      venueId: 'library',
      timing: 'Free until 14:00',
      primaryAction: 'Review Flashcards',
      subAction: 'Find Desk',
    },
  ];

  // Feed filter
  const [feedFilter, setFeedFilter] = useState<'all' | 'my_year' | 'sports' | 'official'>('all');

  // Feed posts with sticker slap reactions (Spec 09 Section 6 & 13)
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: 'post-1',
      author: 'Noel Chesco',
      officialTitle: 'Minister, Welfare, Ceremonies and Disaster Management',
      scope: 'Global · MUHAS All Students',
      time: '15m ago',
      body: '📢 Mid-semester revision lecture theatre allocation window opens at 12:00 today. All Class Representatives (CRs) should prepare their class schedules.',
      location: { name: 'Lecture Theatre 3 (LT 3)', venueId: 'lt-3' },
      reactions: { 'Hop!': 38, '🔥': 24, '❤️': 12 },
    },
    {
      id: 'post-2',
      author: 'Dr. Mwakyoma',
      officialTitle: 'Department of Anatomy',
      scope: 'MD Year 2',
      time: '1h ago',
      body: 'Cranial nerves revision specimens have been placed in Anatomy Dissection Hall B. Spot-exam practice begins Friday 14:00.',
      location: { name: 'Pathology & Histology Lab', venueId: 'path-lab' },
      reactions: { '👀': 45, '🔥': 19, '⭐': 15 },
    },
  ]);

  const handleStickerSlap = (postId: string, sticker: string) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentCount = post.reactions[sticker] || 0;
        const isRemoving = post.userReaction === sticker;

        return {
          ...post,
          userReaction: isRemoving ? undefined : sticker,
          reactions: {
            ...post.reactions,
            [sticker]: isRemoving ? Math.max(0, currentCount - 1) : currentCount + 1,
          },
        };
      })
    );
  };

  const currentNow = nowCards[nowIndex];

  return (
    <>
      <TopBar
        title="yuni"
        actions={
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => openInAppBrowser('https://saris.muhas.ac.tz', 'SARIS Portal · MUHAS')}
            aria-label="Open SARIS"
          >
            SARIS ↗
          </button>
        }
      />

      <div className="page__content">
        {/* Header Greeting with Graffiti underline (Spec 09 Section 4) */}
        <header className="home-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2 className="home-greeting__title">
                  Mambo, {currentProfile.name.split(' ')[0]} ✦
                </h2>
              </div>
              <Graffiti
                type="underline-scribble"
                color="var(--yuni-sun)"
                width={130}
                height={12}
                style={{ position: 'absolute', bottom: -6, left: 0 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge--blue" style={{ fontSize: 11, fontWeight: 700 }}>
                {currentProfile.title.split(',')[0]}
              </span>
              <span className="home-sync-dot" title="Local Dexie DB Synced" />
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 10 }}>
            {currentProfile.scope}
          </p>
        </header>

        {/* ONE HERO NOW CARD (Spec 09 Section 4) */}
        <section className="home-section">
          <div className="home-now-card">
            <div className="home-now-card__badge-row">
              <span className="home-now-pill">NOW</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="text-faint" style={{ fontSize: 11 }}>
                  {nowIndex + 1} of {nowCards.length}
                </span>
                <div className="home-now-dots">
                  {nowCards.map((_, i) => (
                    <span
                      key={i}
                      className={`home-now-dot ${nowIndex === i ? 'home-now-dot--active' : ''}`}
                      onClick={() => setNowIndex(i)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="home-now-card__body">
              <h3 className="home-now-card__title">{currentNow.title}</h3>
              <p className="home-now-card__venue">{currentNow.venue}</p>
              <div className="home-now-card__timing">
                <span className="badge badge--synced">{currentNow.timing}</span>
              </div>
            </div>

            <div className="home-now-card__actions">
              <button
                className="btn btn--primary btn--lg home-now-btn"
                onClick={() => {
                  if (currentNow.primaryAction === 'Take me there') {
                    setMapTargetVenue(currentNow.venueId);
                    setIsMapOpen(true);
                  } else {
                    setStudlyMode('flashcards');
                    setIsStudlyOpen(true);
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                </svg>
                {currentNow.primaryAction}
              </button>

              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setNowIndex((prev) => (prev + 1) % nowCards.length)}
              >
                Peek next ➜
              </button>
            </div>
          </div>
        </section>

        {/* STUDLY LAUNCHER (Spec 09 Section 4) */}
        <section className="home-section studly-launcher-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="studly-launcher-title">What do you need right now?</span>
            <Graffiti type="sparkle" color="var(--yuni-sun)" width={16} height={16} />
          </div>

          <div className="studly-chips-row">
            {(
              [
                { label: '⚡ Flashcards', mode: 'flashcards' },
                { label: '📝 Exam', mode: 'exam' },
                { label: '📋 Summary', mode: 'summary' },
                { label: '📖 Key terms', mode: 'keyterms' },
                { label: '✨ Auto', mode: 'auto' },
              ] as const
            ).map((chip) => (
              <button
                key={chip.mode}
                className="chip studly-launcher-chip"
                onClick={() => {
                  setStudlyMode(chip.mode);
                  setIsStudlyOpen(true);
                }}
                type="button"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* PULSE STRIP (Spec 09 Section 4) */}
        <section className="home-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-header-tag">── Pulse ──</span>
              <Graffiti type="star-burst" color="var(--yuni-teal)" width={14} height={14} />
            </div>
            <span className="text-faint" style={{ fontSize: 12 }}>Live campus activity</span>
          </div>

          <div className="pulse-strip">
            <div
              className="pulse-tile pulse-tile--urgent"
              onClick={() => {
                setMapTargetVenue('lt-3');
                setIsMapOpen(true);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge--pending" style={{ fontSize: 10 }}>Venue Window</span>
                <span className="num" style={{ fontSize: 12, fontWeight: 700 }}>12:00 ◔ 4m</span>
              </div>
              <strong style={{ fontSize: 13, marginTop: 6, display: 'block' }}>LT 3 Revision Booking</strong>
              <span className="text-faint" style={{ fontSize: 11 }}>Tap to inspect availability</span>
            </div>

            <div className="pulse-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge--blue" style={{ fontSize: 10 }}>Poll</span>
                <span className="text-faint" style={{ fontSize: 11 }}>Closes 21:00</span>
              </div>
              <strong style={{ fontSize: 13, marginTop: 6, display: 'block' }}>Hostel Gate Curfew Vote</strong>
              <span className="text-faint" style={{ fontSize: 11 }}>342 votes submitted</span>
            </div>

            <div className="pulse-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge--synced" style={{ fontSize: 10 }}>Sports</span>
                <span className="text-faint" style={{ fontSize: 11 }}>Today 16:30</span>
              </div>
              <strong style={{ fontSize: 13, marginTop: 6, display: 'block' }}>MUHAS Inter-Year Derby</strong>
              <span className="text-faint" style={{ fontSize: 11 }}>Main Football Pitch</span>
            </div>
          </div>
        </section>

        {/* CAMPUS FEED (Spec 09 Section 4 & 6) */}
        <section className="home-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="pulse-header-tag">── Campus feed ──</span>
            <span className="text-faint" style={{ fontSize: 12 }}>Updated 2h ago</span>
          </div>

          {/* Filter Chips */}
          <div className="home-feed-filters">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'my_year', label: 'My Year' },
                { key: 'sports', label: 'Sports' },
                { key: 'official', label: 'Official' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                className={`chip ${feedFilter === f.key ? 'chip--active' : ''}`}
                onClick={() => setFeedFilter(f.key)}
                type="button"
                style={{ minHeight: 30, fontSize: 12 }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed Post Cards */}
          <div className="home-feed-posts">
            {feedPosts.map((post) => (
              <article key={post.id} className="card home-post-card">
                {post.officialTitle && (
                  <div className="home-post__official-ribbon">
                    <span className="badge badge--blue" style={{ fontSize: 10, fontWeight: 700 }}>
                      🏛️ {post.officialTitle}
                    </span>
                  </div>
                )}

                <div className="home-post__header">
                  <div>
                    <strong>{post.author}</strong>
                    <p className="text-faint" style={{ fontSize: 12 }}>
                      {post.scope} · {post.time}
                    </p>
                  </div>
                </div>

                <p className="home-post__body">{post.body}</p>

                {/* Location Chip opens MapSheet (Spec 09 Section 5) */}
                {post.location && (
                  <button
                    className="home-post__location-chip"
                    onClick={() => {
                      setMapTargetVenue(post.location!.venueId);
                      setIsMapOpen(true);
                    }}
                    type="button"
                  >
                    📍 {post.location.name} <span style={{ color: 'var(--yuni-blue)' }}>· View on Map →</span>
                  </button>
                )}

                {/* Sticker Slap Reactions (Spec 09 Section 6 & 13) */}
                <div className="home-post__stickers-row">
                  {['Hop!', '🔥', '❤️', '⭐', '👀', '🎉'].map((sticker) => {
                    const count = post.reactions[sticker] || 0;
                    const isSelected = post.userReaction === sticker;

                    return (
                      <button
                        key={sticker}
                        className={`home-sticker-btn ${isSelected ? 'home-sticker-btn--slapped' : ''}`}
                        onClick={() => handleStickerSlap(post.id, sticker)}
                        type="button"
                      >
                        <span>{sticker}</span>
                        {count > 0 && <span className="home-sticker-count">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* MapSheet in navigate or view-venue mode */}
      <MapSheet
        isOpen={isMapOpen}
        mode="navigate"
        targetVenueId={mapTargetVenue}
        onClose={() => setIsMapOpen(false)}
      />

      {/* Studly Native Revision Mode */}
      <StudlyModal
        isOpen={isStudlyOpen}
        initialMode={studlyMode}
        onClose={() => setIsStudlyOpen(false)}
      />
    </>
  );
}
