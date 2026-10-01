import { useState, useRef } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserRole } from '../context/RoleContext';
import { useInAppBrowser } from '../context/InAppBrowserContext';
import { Graffiti } from '../components/ui/Graffiti';
import { MapSheet } from '../components/ui/MapSheet';
import { StudlyModal, type StudlyMode } from '../components/ui/StudlyModal';
import {
  MapPinIcon,
  ArrowRightIcon,
  ClockIcon,
  LayersIcon,
  FileCheckIcon,
  AlignLeftIcon,
  BookOpenIcon,
  SparklesIcon,
  LandmarkIcon,
  ThumbsUpIcon,
  ChevronRightIcon,
  RadioIcon,
  TrophyIcon,
  BarChartIcon,
} from '../components/ui/Icons';
import './Home.css';

interface FeedPost {
  id: string;
  author: string;
  officialTitle?: string;
  scope: string;
  time: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  location?: { name: string; venueId: string };
  reactions: Record<string, number>;
  userReaction?: string;
}

interface NowCardState {
  id: string;
  state: 'upcoming_class' | 'in_class' | 'free_gap' | 'exam_approaching';
  stateLabel: string;
  courseCode: string;
  courseTitle: string;
  venueName: string;
  venueId: string;
  timeDetail: string;
  primaryAction: string;
  secondaryAction?: string;
  actionType: 'navigate' | 'studly' | 'resource';
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

  // NOW Card swipe / carousel state (Spec 09 Section 4 & Visual Reset)
  const [nowIndex, setNowIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const nowCards: NowCardState[] = [
    {
      id: 'now-1',
      state: 'upcoming_class',
      stateLabel: 'STARTS IN 23 MIN',
      courseCode: 'PHYSIOLOGY',
      courseTitle: 'Cardiovascular & Renal Dynamics',
      venueName: 'LT 3 · Clinical Wing',
      venueId: 'lt-3',
      timeDetail: '08:30 – 10:30',
      primaryAction: 'TAKE ME THERE',
      secondaryAction: 'Open Lecture Slides',
      actionType: 'navigate',
    },
    {
      id: 'now-2',
      state: 'in_class',
      stateLabel: 'CURRENTLY IN SESSION',
      courseCode: 'GROSS ANATOMY',
      courseTitle: 'Upper Limb Dissection Practical',
      venueName: 'Histology Lab B',
      venueId: 'path-lab',
      timeDetail: '10:00 – 12:00 · 45 min left',
      primaryAction: 'VIEW LAB MANUAL',
      secondaryAction: 'Find Dissection Bench',
      actionType: 'resource',
    },
    {
      id: 'now-3',
      state: 'free_gap',
      stateLabel: '45 MIN STUDY GAP',
      courseCode: 'STUDY GAP',
      courseTitle: 'Quiet Review Window',
      venueName: 'Main Library 1st Floor Air-Con Hub',
      venueId: 'library',
      timeDetail: 'Free until 14:00 Pharmacology',
      primaryAction: 'REVIEW FLASHCARDS',
      secondaryAction: 'Find Empty Desk',
      actionType: 'studly',
    },
    {
      id: 'now-4',
      state: 'exam_approaching',
      stateLabel: 'EXAM IN 2 DAYS',
      courseCode: 'HISTOPATHOLOGY',
      courseTitle: 'Spot Identification Exam 1',
      venueName: 'Pathology Lab B · Spot Stations',
      venueId: 'path-lab',
      timeDetail: 'Friday 08:30 · 150 points',
      primaryAction: 'START EXAM DRILL',
      secondaryAction: 'Review High-Yield Specimens',
      actionType: 'studly',
    },
  ];

  // Touch swipe support for NOW card
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setNowIndex((prev) => (prev + 1) % nowCards.length);
      } else {
        // swipe right -> prev
        setNowIndex((prev) => (prev - 1 + nowCards.length) % nowCards.length);
      }
    }
    touchStartX.current = null;
  };

  // Feed filter
  const [feedFilter, setFeedFilter] = useState<'all' | 'my_cohort' | 'sports' | 'official'>('all');

  // Feed posts with professional reactions and authentic campus imagery
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: 'post-1',
      author: 'Noel Chesco',
      officialTitle: 'Minister, Welfare, Ceremonies and Disaster Management',
      scope: 'Global · MUHAS All Students',
      time: '15m ago',
      body: 'Mid-semester revision lecture theatre allocation window opens at 12:00 today. All Class Representatives (CRs) should prepare their class schedules and submit priority slot requests.',
      imageUrl: '/images/campus_students.jpg',
      imageAlt: 'MUHAS students collaborating under campus trees',
      location: { name: 'Lecture Theatre 3 (LT 3)', venueId: 'lt-3' },
      reactions: { 'Hop!': 48, 'Endorse': 32, 'Spot': 19 },
    },
    {
      id: 'post-2',
      author: 'Dr. Mwakyoma',
      officialTitle: 'Department of Anatomy',
      scope: 'MD Year 2',
      time: '1h ago',
      body: 'Cranial nerves revision specimens have been set out in Anatomy Dissection Hall B. Spot-exam practice stations are open for self-study from Friday 14:00.',
      imageUrl: '/images/anatomy_lab.jpg',
      imageAlt: 'Medical students in teal scrubs in the Anatomy practical laboratory',
      location: { name: 'Histology & Pathology Lab', venueId: 'path-lab' },
      reactions: { 'Hop!': 56, 'Endorse': 64, 'Spot': 27 },
    },
    {
      id: 'post-3',
      author: 'Sports & Entertainment Ministry',
      officialTitle: 'Minister, Sports & Entertainment',
      scope: 'Sports · All Campuses',
      time: '3h ago',
      body: 'MUHAS Inter-Year Derby kickoff is confirmed for 16:30 today at the Main Football Pitch. MD Year 2 takes on BPharm in the championship semi-final. Come support your cohort!',
      imageUrl: '/images/football_derby.jpg',
      imageAlt: 'MUHAS student football match on main pitch',
      location: { name: 'Main Football Pitch', venueId: 'pitch-main' },
      reactions: { 'Hop!': 89, 'Endorse': 42, 'Spot': 15 },
    },
  ]);

  const handleReactionClick = (postId: string, reactionKey: string) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentCount = post.reactions[reactionKey] || 0;
        const isSelected = post.userReaction === reactionKey;

        return {
          ...post,
          userReaction: isSelected ? undefined : reactionKey,
          reactions: {
            ...post.reactions,
            [reactionKey]: isSelected ? Math.max(0, currentCount - 1) : currentCount + 1,
          },
        };
      })
    );
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 17) return 'good afternoon';
    return 'good evening';
  };

  const currentNow = nowCards[nowIndex];
  const nextNow = nowCards[(nowIndex + 1) % nowCards.length];

  const handleNowPrimaryAction = () => {
    if (currentNow.actionType === 'navigate') {
      setMapTargetVenue(currentNow.venueId);
      setIsMapOpen(true);
    } else if (currentNow.actionType === 'studly') {
      setStudlyMode(currentNow.state === 'exam_approaching' ? 'exam' : 'flashcards');
      setIsStudlyOpen(true);
    } else {
      // Resource link or map fallback
      setMapTargetVenue(currentNow.venueId);
      setIsMapOpen(true);
    }
  };

  return (
    <>
      <TopBar
        title="yuni"
        actions={
          <button
            className="topbar-saris-btn"
            onClick={() => openInAppBrowser('https://saris2.muhas.ac.tz/', 'SARIS Portal · MUHAS')}
            aria-label="Open SARIS Portal"
          >
            <span>SARIS</span>
            <ArrowRightIcon size={13} strokeWidth={2.5} />
          </button>
        }
      />

      <div className="home-canvas">
        {/* 1. TOP IDENTITY & GREETING */}
        <header className="home-top-header">
          <div className="home-top-row">
            <div>
              <h1 className="home-greeting-name">
                Mambo, {currentProfile.name.split(' ')[0]}
              </h1>
              <span className="home-greeting-sub">{getGreetingTime()}</span>
            </div>

            <div className="home-identity-pill">
              <span className="home-role-tag">
                {currentProfile.isLeader ? (
                  <>
                    <LandmarkIcon size={12} strokeWidth={2.2} />
                    <span>{currentProfile.title.split(',')[0]}</span>
                  </>
                ) : (
                  <span>Student</span>
                )}
              </span>
              <span className="home-live-pulse-dot" title="Local DB live and synchronized" />
            </div>
          </div>
        </header>

        {/* 2. THE HERO: ONE DOMINANT NOW EXPERIENCE */}
        <section
          className={`home-now-stage home-now-stage--${currentNow.state}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Current priority"
        >
          {/* Subtle State Badge */}
          <div className="home-now-meta-bar">
            <div className="home-now-state-chip">
              <span className="home-now-pulse-beacon" />
              <span>{currentNow.stateLabel}</span>
            </div>

            {/* Stepper dots */}
            <div className="home-now-stepper" aria-label="Schedule item selector">
              {nowCards.map((card, i) => (
                <button
                  key={card.id}
                  className={`home-now-step-dot ${nowIndex === i ? 'home-now-step-dot--active' : ''}`}
                  onClick={() => setNowIndex(i)}
                  aria-label={`Show ${card.courseCode}`}
                />
              ))}
            </div>
          </div>

          {/* Hero Typography: The Main Priority */}
          <div className="home-now-focus">
            <h2 className="home-now-course-code">{currentNow.courseCode}</h2>
            <div className="home-now-venue-line">
              <MapPinIcon size={18} strokeWidth={2.2} color="var(--yuni-blue)" />
              <span className="home-now-venue-text">{currentNow.venueName}</span>
            </div>
            <p className="home-now-time-context">{currentNow.timeDetail}</p>
          </div>

          {/* Dominant Visual Divider */}
          <div className="home-now-divider" />

          {/* Primary Action Button — Visual Center of Gravity */}
          <div className="home-now-action-bar">
            <button
              className="home-now-primary-cta"
              onClick={handleNowPrimaryAction}
              type="button"
            >
              <span>{currentNow.primaryAction}</span>
              <ArrowRightIcon size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Peek Next Item (Tactile affordance) */}
          <div
            className="home-now-peek-row"
            onClick={() => setNowIndex((prev) => (prev + 1) % nowCards.length)}
            role="button"
            tabIndex={0}
          >
            <span className="home-now-peek-label">NEXT:</span>
            <span className="home-now-peek-title">{nextNow.courseCode} · {nextNow.venueName.split('·')[0]}</span>
            <ChevronRightIcon size={14} strokeWidth={2.5} color="var(--text-faint)" />
          </div>
        </section>

        {/* 3. STUDLY LAUNCHER: OPEN TYPOGRAPHY & TACTILE CONTROLS */}
        <section className="home-studly-launcher">
          <div className="home-subhead-row">
            <div className="home-subhead-title">
              <span className="home-subhead-text">WHAT DO YOU NEED?</span>
            </div>
            <Graffiti type="star-burst" color="var(--yuni-sun)" width={12} height={12} />
          </div>

          <div className="home-studly-pills-rail">
            <button
              className="home-studly-pill"
              onClick={() => {
                setStudlyMode('flashcards');
                setIsStudlyOpen(true);
              }}
              type="button"
            >
              <LayersIcon size={16} strokeWidth={2} />
              <span>FLASHCARDS</span>
            </button>

            <button
              className="home-studly-pill"
              onClick={() => {
                setStudlyMode('exam');
                setIsStudlyOpen(true);
              }}
              type="button"
            >
              <FileCheckIcon size={16} strokeWidth={2} />
              <span>EXAM DRILL</span>
            </button>

            <button
              className="home-studly-pill"
              onClick={() => {
                setStudlyMode('summary');
                setIsStudlyOpen(true);
              }}
              type="button"
            >
              <AlignLeftIcon size={16} strokeWidth={2} />
              <span>SUMMARY</span>
            </button>

            <button
              className="home-studly-pill"
              onClick={() => {
                setStudlyMode('keyterms');
                setIsStudlyOpen(true);
              }}
              type="button"
            >
              <BookOpenIcon size={16} strokeWidth={2} />
              <span>KEY TERMS</span>
            </button>

            <button
              className="home-studly-pill home-studly-pill--accent"
              onClick={() => {
                setStudlyMode('auto');
                setIsStudlyOpen(true);
              }}
              type="button"
            >
              <SparklesIcon size={16} strokeWidth={2} />
              <span>AUTO DRILL</span>
            </button>
          </div>
        </section>

        <div className="home-section-separator" />

        {/* 4. PULSE: LIVE CAMPUS HORIZONTAL RAIL */}
        <section className="home-pulse-section">
          <div className="home-subhead-row">
            <div className="home-pulse-header-group">
              <span className="home-subhead-text">PULSE</span>
              <RadioIcon size={14} color="var(--yuni-teal)" strokeWidth={2.2} />
            </div>
            <span className="home-subhead-action">Live campus stream →</span>
          </div>

          <div className="home-pulse-rail">
            {/* Urgent Venue Rush Tile */}
            <div
              className="home-pulse-card home-pulse-card--urgent"
              onClick={() => {
                setMapTargetVenue('lt-3');
                setIsMapOpen(true);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="home-pulse-card__meta">
                <span className="home-pulse-tag home-pulse-tag--urgent">VENUE RUSH</span>
                <span className="home-pulse-countdown">
                  <ClockIcon size={12} strokeWidth={2.2} />
                  <span>04:12</span>
                </span>
              </div>
              <h3 className="home-pulse-card__title">LT 3 Revision Booking</h3>
              <p className="home-pulse-card__desc">Allocation window opens for Class Reps</p>
            </div>

            {/* Campus Poll Tile */}
            <div className="home-pulse-card" role="button" tabIndex={0}>
              <div className="home-pulse-card__meta">
                <span className="home-pulse-tag">
                  <BarChartIcon size={11} strokeWidth={2} />
                  <span>POLL</span>
                </span>
                <span className="home-pulse-time">Closes 21:00</span>
              </div>
              <h3 className="home-pulse-card__title">Hostel Gate Curfew Vote</h3>
              <p className="home-pulse-card__desc">342 verified student votes submitted</p>
            </div>

            {/* Sports Fixture Tile */}
            <div className="home-pulse-card" role="button" tabIndex={0}>
              <div className="home-pulse-card__meta">
                <span className="home-pulse-tag home-pulse-tag--sports">
                  <TrophyIcon size={11} strokeWidth={2} />
                  <span>SPORTS</span>
                </span>
                <span className="home-pulse-time">Today 16:30</span>
              </div>
              <h3 className="home-pulse-card__title">MD Year 2 vs BPharm</h3>
              <p className="home-pulse-card__desc">MUHAS Main Football Pitch</p>
            </div>
          </div>
        </section>

        <div className="home-section-separator" />

        {/* 5. CAMPUS FEED: OPEN EDITORIAL POSTS (ZERO EMOJIS) */}
        <section className="home-feed-section">
          <div className="home-subhead-row">
            <span className="home-subhead-text">CAMPUS FEED</span>
            <div className="home-feed-filter-group">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'my_cohort', label: 'My Cohort' },
                  { key: 'official', label: 'Official' },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  className={`home-feed-filter-btn ${feedFilter === f.key ? 'home-feed-filter-btn--active' : ''}`}
                  onClick={() => setFeedFilter(f.key)}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="home-feed-stream">
            {feedPosts.map((post) => (
              <article key={post.id} className="home-post-item">
                {/* Official Leader Ribbon */}
                {post.officialTitle && (
                  <div className="home-post-official-banner">
                    <LandmarkIcon size={12} strokeWidth={2.2} />
                    <span>{post.officialTitle}</span>
                  </div>
                )}

                <div className="home-post-header">
                  <span className="home-post-author">{post.author}</span>
                  <span className="home-post-meta">
                    {post.scope} · {post.time}
                  </span>
                </div>

                <p className="home-post-body">{post.body}</p>

                {/* Optional Campus Photo Attachment */}
                {post.imageUrl && (
                  <div className="home-post-image-wrap">
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || 'Campus dispatch'}
                      className="home-post-image"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Location Attachment */}
                {post.location && (
                  <button
                    className="home-post-location-tag"
                    onClick={() => {
                      setMapTargetVenue(post.location!.venueId);
                      setIsMapOpen(true);
                    }}
                    type="button"
                  >
                    <MapPinIcon size={13} strokeWidth={2.2} />
                    <span>{post.location.name}</span>
                    <span className="home-post-location-cta">Take me there →</span>
                  </button>
                )}

                {/* Tactile Reaction Badges (Zero emojis, crisp stamps) */}
                <div className="home-post-reactions-bar">
                  {[
                    { key: 'Hop!', icon: null },
                    { key: 'Endorse', icon: <ThumbsUpIcon size={12} strokeWidth={2} /> },
                    { key: 'Spot', icon: <MapPinIcon size={12} strokeWidth={2} /> },
                  ].map(({ key, icon }) => {
                    const count = post.reactions[key] || 0;
                    const isSelected = post.userReaction === key;

                    return (
                      <button
                        key={key}
                        className={`home-reaction-stamp ${isSelected ? 'home-reaction-stamp--selected' : ''}`}
                        onClick={() => handleReactionClick(post.id, key)}
                        type="button"
                      >
                        {icon}
                        <span className="home-reaction-key">{key}</span>
                        {count > 0 && <span className="home-reaction-count">{count}</span>}
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
