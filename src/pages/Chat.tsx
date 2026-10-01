import { useState, useRef, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserRole } from '../context/RoleContext';
import { Graffiti } from '../components/ui/Graffiti';
import { MapSheet } from '../components/ui/MapSheet';
import {
  MapPinIcon,
  LandmarkIcon,
  UsersIcon,
} from '../components/ui/Icons';
import './Chat.css';

interface Channel {
  id: string;
  name: string;
  category: 'official' | 'cohort' | 'dm';
  avatarInitials: string;
  ringColor: 'blue' | 'sun' | 'teal';
  subtitle: string;
  badgeLabel?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  channelId: string;
  senderName: string;
  senderHandle: string;
  senderRoleBadge?: string;
  isMe: boolean;
  time: string;
  body: string;
  imageUrl?: string;
  sticker?: string;
  location?: { name: string; venueId: string };
  voiceNote?: { duration: string; waveform: number[] };
  reactions?: Record<string, number>;
  userReaction?: string;
}

export function ChatPage() {
  const { currentProfile } = useUserRole();
  const [filter, setFilter] = useState<'all' | 'official' | 'cohort' | 'dm'>('all');
  const [activeChannelId, setActiveChannelId] = useState<string>('class-md2');
  const [composerText, setComposerText] = useState('');
  const [showStickerTray, setShowStickerTray] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTargetVenue, setMapTargetVenue] = useState('lt-3');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Channels list
  const channels: Channel[] = [
    {
      id: 'off-welfare',
      name: 'Welfare Ministry',
      category: 'official',
      avatarInitials: 'WM',
      ringColor: 'teal',
      subtitle: 'Official announcements & emergency notices',
      badgeLabel: 'Official',
      unreadCount: 1,
    },
    {
      id: 'class-md2',
      name: 'MD Year 2 Cohort',
      category: 'cohort',
      avatarInitials: 'MD',
      ringColor: 'blue',
      subtitle: 'Class discussions · Moderated by CR David',
      badgeLabel: 'Cohort',
      unreadCount: 2,
    },
    {
      id: 'anat-grp',
      name: 'Anatomy L4 Dissection',
      category: 'cohort',
      avatarInitials: 'AN',
      ringColor: 'sun',
      subtitle: 'Histology & Gross Anatomy spot prep',
      badgeLabel: 'Practical',
    },
    {
      id: 'dm-noel',
      name: 'Minister Noel Chesco',
      category: 'dm',
      avatarInitials: 'NC',
      ringColor: 'teal',
      subtitle: 'Welfare & emergency allocations desk',
      badgeLabel: 'Leader',
    },
    {
      id: 'sports-fc',
      name: 'MUHAS Football Club',
      category: 'cohort',
      avatarInitials: 'FC',
      ringColor: 'blue',
      subtitle: 'Fixtures, team training & derby roster',
      badgeLabel: 'Sports',
    },
  ];

  // Channel-specific messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      channelId: 'class-md2',
      senderName: 'David Kweka',
      senderHandle: '@CR_David',
      senderRoleBadge: 'Class Rep',
      isMe: false,
      time: '11:15',
      body: 'Habari everyone! Please note that Physiology lecture has shifted to LT 3 at 12:00 today due to laboratory maintenance.',
      location: { name: 'Lecture Theatre 3 (LT 3)', venueId: 'lt-3' },
      reactions: { 'Hop!': 14, 'Spot': 8 },
    },
    {
      id: 'm-2',
      channelId: 'class-md2',
      senderName: 'Dr. Mwakyoma',
      senderHandle: '@Mwakyoma_Anat',
      senderRoleBadge: 'Faculty',
      isMe: false,
      time: '11:20',
      body: 'Anatomy dissection hall specimens are ready for spot revision. Bring clean coats and gloves.',
      imageUrl: '/images/anatomy_lab.jpg',
      location: { name: 'Histology & Pathology Lab', venueId: 'path-lab' },
      reactions: { 'Hop!': 22, 'Sawa': 19 },
    },
    {
      id: 'm-3',
      channelId: 'class-md2',
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      isMe: true,
      time: '11:22',
      body: 'Asante sana! Are the practical dissection manuals ready at the campus bookshop?',
      reactions: { 'Hop!': 3 },
    },
    {
      id: 'm-4',
      channelId: 'off-welfare',
      senderName: 'Noel Chesco',
      senderHandle: '@Minister_Welfare',
      senderRoleBadge: 'Minister',
      isMe: false,
      time: '09:00',
      body: 'Official notice: Mid-semester lecture theatre booking window opens at 12:00 today for all registered Class Representatives.',
      imageUrl: '/images/campus_students.jpg',
      location: { name: 'Clinical Complex LT 3', venueId: 'lt-3' },
    },
    {
      id: 'm-5',
      channelId: 'sports-fc',
      senderName: 'Sports Ministry',
      senderHandle: '@Sports_Desk',
      senderRoleBadge: 'Sports',
      isMe: false,
      time: '08:30',
      body: 'Kickoff at 16:30! MD Year 2 takes on BPharm in the inter-faculty derby.',
      imageUrl: '/images/football_derby.jpg',
      location: { name: 'Main Football Pitch', venueId: 'pitch-main' },
    },
    {
      id: 'm-6',
      channelId: 'dm-noel',
      senderName: 'Noel Chesco',
      senderHandle: '@Minister_Welfare',
      senderRoleBadge: 'Minister',
      isMe: false,
      time: 'Yesterday',
      body: 'Habari Emmanuel! Let me know if your cohort requires extra evening lighting for the clinical exam preparation rooms.',
    },
  ]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const filteredChannels = channels.filter((c) => {
    if (filter === 'official') return c.category === 'official';
    if (filter === 'cohort') return c.category === 'cohort';
    if (filter === 'dm') return c.category === 'dm';
    return true;
  });

  const visibleMessages = messages.filter((m) => m.channelId === activeChannelId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length, activeChannelId]);

  const handleSendMessage = () => {
    if (!composerText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      channelId: activeChannelId,
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: composerText.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setComposerText('');
  };

  const handleSendSticker = (stickerTag: string) => {
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      channelId: activeChannelId,
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: '',
      sticker: stickerTag,
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowStickerTray(false);
  };

  const handleSendVoiceNote = () => {
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      channelId: activeChannelId,
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: 'Clinical voice note: Cranial Nerve examination findings',
      voiceNote: {
        duration: '0:22',
        waveform: [20, 45, 80, 60, 95, 40, 70, 85, 30, 65, 90, 50, 35, 75, 55],
      },
      reactions: { 'Hop!': 1 },
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleMessageReaction = (msgId: string, reactionKey: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const currentCount = msg.reactions?.[reactionKey] || 0;
        const isSelected = msg.userReaction === reactionKey;
        const nextReactions = {
          ...(msg.reactions || {}),
          [reactionKey]: isSelected ? Math.max(0, currentCount - 1) : currentCount + 1,
        };
        return {
          ...msg,
          userReaction: isSelected ? undefined : reactionKey,
          reactions: nextReactions,
        };
      })
    );
  };

  return (
    <>
      <TopBar
        title="Chat"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="badge badge--synced" style={{ fontSize: 10.5 }}>
              Live
            </span>
          </div>
        }
      />

      <div className="chat-canvas">
        {/* Top Channel Rail (Circles) */}
        <div className="chat-circles-strip" role="tablist" aria-label="Channels">
          {filteredChannels.map((c) => {
            const isActive = activeChannelId === c.id;
            return (
              <button
                key={c.id}
                className={`chat-circle-node ${isActive ? 'chat-circle-node--active' : ''}`}
                onClick={() => setActiveChannelId(c.id)}
                type="button"
                role="tab"
                aria-selected={isActive}
              >
                <div className={`chat-circle-avatar chat-circle-avatar--${c.ringColor}`}>
                  <span>{c.avatarInitials}</span>
                  {c.unreadCount && <span className="chat-circle-unread">{c.unreadCount}</span>}
                </div>
                <span className="chat-circle-title">{c.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Channel Categories Filter */}
        <div className="chat-filter-bar">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'official', label: 'Official' },
              { key: 'cohort', label: 'Cohort' },
              { key: 'dm', label: 'Direct' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              className={`chat-filter-chip ${filter === t.key ? 'chat-filter-chip--active' : ''}`}
              onClick={() => setFilter(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active Channel Banner */}
        <div className="chat-channel-banner">
          <div className="chat-channel-banner__info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {activeChannel.category === 'official' ? (
                <LandmarkIcon size={14} color="var(--yuni-blue)" strokeWidth={2.2} />
              ) : (
                <UsersIcon size={14} color="var(--ink)" strokeWidth={2} />
              )}
              <h2 className="chat-channel-banner__title">{activeChannel.name}</h2>
            </div>
            <p className="chat-channel-banner__sub">{activeChannel.subtitle}</p>
          </div>
          {activeChannel.badgeLabel && (
            <span className="badge badge--blue" style={{ fontSize: 10 }}>
              {activeChannel.badgeLabel}
            </span>
          )}
        </div>

        {/* Conversation Stream (Wall Style) */}
        <div className="chat-wall-stream" role="log">
          {visibleMessages.length === 0 ? (
            <div className="chat-empty-state">
              <p className="text-faint">No messages in this channel yet.</p>
              <span style={{ fontSize: 12, color: 'var(--yuni-blue)' }}>Start the conversation below</span>
            </div>
          ) : (
            visibleMessages.map((m) => (
              <article key={m.id} className="chat-message-row">
                <div className="chat-message-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="chat-sender-name">{m.senderName}</span>
                    {m.senderRoleBadge && (
                      <span className="chat-role-badge">{m.senderRoleBadge}</span>
                    )}
                  </div>
                  <span className="chat-timestamp">{m.time}</span>
                </div>

                {/* Message Body */}
                {m.body && (
                  <div className="chat-bubble">
                    <p className="chat-bubble-text">{m.body}</p>
                    {/* Your messages get a small yellow smile-underline (Spec 09 Section 7) */}
                    {m.isMe && (
                      <div style={{ marginTop: 2 }}>
                        <Graffiti type="smile-underline" color="var(--yuni-sun)" width={50} height={7} />
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Image Attachment */}
                {m.imageUrl && (
                  <div className="chat-image-wrap">
                    <img src={m.imageUrl} alt="Attachment" className="chat-image" loading="lazy" />
                  </div>
                )}

                {/* Sticker Dispatch */}
                {m.sticker && (
                  <div className="chat-sticker-render">
                    <span className="chat-sticker-tag">{m.sticker}</span>
                  </div>
                )}

                {/* Location Attachment */}
                {m.location && (
                  <button
                    className="chat-location-pill"
                    onClick={() => {
                      setMapTargetVenue(m.location!.venueId);
                      setIsMapOpen(true);
                    }}
                    type="button"
                  >
                    <MapPinIcon size={14} color="var(--yuni-blue)" strokeWidth={2.2} />
                    <span>{m.location.name}</span>
                    <span className="chat-location-cta">Directions →</span>
                  </button>
                )}
                {/* Voice Note Player (Spec 09 §7) */}
                {m.voiceNote && (
                  <div className="chat-voice-note-card">
                    <button className="chat-voice-play-btn btn-hop" type="button" aria-label="Play voice note">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                    <div className="chat-waveform-container">
                      {m.voiceNote.waveform.map((height, wIdx) => (
                        <span
                          key={wIdx}
                          className="chat-waveform-bar"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <span className="chat-voice-duration">{m.voiceNote.duration}</span>
                  </div>
                )}

                {/* Tactile Message Reactions */}
                <div className="chat-msg-reactions">
                  {['Hop!', 'Spot', 'Sawa'].map((rk) => {
                    const count = m.reactions?.[rk] || 0;
                    const isSelected = m.userReaction === rk;
                    return (
                      <button
                        key={rk}
                        type="button"
                        className={`chat-reaction-chip btn-hop ${isSelected ? 'chat-reaction-chip--active sticker-slapped' : ''}`}
                        onClick={() => handleMessageReaction(m.id, rk)}
                      >
                        <span>{rk}</span>
                        {count > 0 && <span style={{ opacity: 0.85, fontSize: 10 }}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Clean Composer Bar */}
        <div className="chat-composer-deck">
          {/* Collapsible Sticker Tray */}
          {showStickerTray && (
            <div className="chat-sticker-tray">
              {['Hop!', 'Mambo!', 'Poa', 'Sawa!', 'Vipi', 'Tuko LT 3', 'On My Way', 'Spot Exam'].map((s) => (
                <button
                  key={s}
                  className="chip chip--sm btn-hop"
                  onClick={() => handleSendSticker(s)}
                  type="button"
                  style={{ fontSize: 11.5 }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat-composer-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <button
              type="button"
              className={`chat-sticker-toggle btn-hop ${showStickerTray ? 'chat-sticker-toggle--active' : ''}`}
              onClick={() => setShowStickerTray(!showStickerTray)}
              title="Campus Quick Tags"
              aria-label="Toggle stickers"
            >
              <Graffiti type="sparkle" color="var(--yuni-sun)" width={14} height={14} />
            </button>

            <button
              type="button"
              className="chat-sticker-toggle btn-hop"
              onClick={handleSendVoiceNote}
              title="Send clinical case voice note"
              aria-label="Voice note"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <input
              className="chat-composer-input"
              type="text"
              placeholder={`Message ${activeChannel.name}...`}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
            />

            <button
              className="chat-send-btn btn-hop"
              type="submit"
              disabled={!composerText.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* MapSheet */}
      <MapSheet
        isOpen={isMapOpen}
        mode="navigate"
        targetVenueId={mapTargetVenue}
        onClose={() => setIsMapOpen(false)}
      />
    </>
  );
}
