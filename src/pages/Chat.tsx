import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserRole } from '../context/RoleContext';
import { Graffiti } from '../components/ui/Graffiti';
import { MapSheet } from '../components/ui/MapSheet';
import './Chat.css';

interface Circle {
  id: string;
  name: string;
  avatar: string;
  ringColor: 'blue' | 'sun' | 'teal';
  unreadCount?: number;
}

interface Message {
  id: string;
  senderName: string;
  senderHandle: string;
  senderRoleColor: string; // CSS color for handle chip
  isMe: boolean;
  time: string;
  body: string;
  sticker?: string;
  location?: { name: string; venueId: string };
}

export function ChatPage() {
  const { currentProfile } = useUserRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannelId, setActiveChannelId] = useState<string | null>('class-md2');
  const [composerText, setComposerText] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTargetVenue, setMapTargetVenue] = useState('lt-3');

  // Top rail "Circles" (Spec 09 Section 7)
  const circles: Circle[] = [
    { id: 'off-welfare', name: 'Welfare Ministry', avatar: '🏛️', ringColor: 'teal', unreadCount: 1 },
    { id: 'class-md2', name: 'MD Year 2', avatar: '🩺', ringColor: 'blue', unreadCount: 3 },
    { id: 'anat-grp', name: 'Anatomy L4', avatar: '🧠', ringColor: 'sun', unreadCount: 2 },
    { id: 'dm-noel', name: 'Minister Noel', avatar: 'NC', ringColor: 'teal' },
    { id: 'sports-fc', name: 'MUHAS FC', avatar: '⚽', ringColor: 'blue' },
  ];

  // Wall-style conversation messages (Spec 09 Section 7: "single column, everyone left-aligned, yellow smile-underline on your messages")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      senderName: 'David Kweka',
      senderHandle: '@CR_David',
      senderRoleColor: 'var(--yuni-teal)',
      isMe: false,
      time: '11:15',
      body: 'Habari everyone! Please note that Physiology lecture has shifted to LT 3 at 12:00 due to lab setup.',
    },
    {
      id: 'm-2',
      senderName: 'Noel Chesco',
      senderHandle: '@Minister_Welfare',
      senderRoleColor: 'var(--yuni-blue)',
      isMe: false,
      time: '11:20',
      body: 'Confirmed from Ministry. Claim window for next week revisions opens on the Console at 12:00.',
      location: { name: 'Lecture Theatre 3 (LT 3)', venueId: 'lt-3' },
    },
    {
      id: 'm-3',
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      senderRoleColor: 'var(--ink)',
      isMe: true,
      time: '11:22',
      body: 'Asante sana! Are the practical dissection manuals ready at the bookshop?',
    },
  ]);

  const handleSendMessage = () => {
    if (!composerText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      senderRoleColor: 'var(--ink)',
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
      senderName: currentProfile.name,
      senderHandle: `@${currentProfile.name.split(' ')[0].toLowerCase()}`,
      senderRoleColor: 'var(--ink)',
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: '',
      sticker: stickerTag,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <>
      <TopBar
        title="Chat"
        actions={
          <span className="badge badge--synced" style={{ fontSize: 11 }}>
            Realtime
          </span>
        }
      />

      <div className="page__content chat-container">
        {/* Search Bar */}
        <div className="chat-search">
          <input
            className="input chat-search-input"
            type="text"
            placeholder="Search student, CR, or group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Top Rail Circles (Spec 09 Section 7) */}
        <div className="chat-circles-rail">
          {circles.map((c) => (
            <button
              key={c.id}
              className={`chat-circle-item ${activeChannelId === c.id ? 'chat-circle-item--active' : ''}`}
              onClick={() => setActiveChannelId(c.id)}
              type="button"
            >
              <div className={`chat-circle-avatar chat-circle-avatar--${c.ringColor}`}>
                <span>{c.avatar}</span>
                {c.unreadCount && <span className="chat-circle-badge">{c.unreadCount}</span>}
              </div>
              <span className="chat-circle-name">{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Section Header: Wall Style */}
        <div className="chat-wall-header">
          <div>
            <strong style={{ fontSize: 15 }}># MD Year 2 Cohort</strong>
            <p className="text-faint" style={{ fontSize: 12 }}>
              Official class discussion · Moderated by CR
            </p>
          </div>
          <span className="badge badge--blue" style={{ fontSize: 10 }}>Cohort</span>
        </div>

        {/* Wall Style Conversation View (Spec 09 Section 7) */}
        <div className="chat-messages-wall">
          {messages.map((m) => (
            <div key={m.id} className="chat-wall-msg">
              <div className="chat-wall-msg__meta">
                <span
                  className="chat-handle-chip"
                  style={{ borderColor: m.senderRoleColor, color: m.senderRoleColor }}
                >
                  {m.senderHandle}
                </span>
                <span className="chat-sender-name">{m.senderName}</span>
                <span className="text-faint" style={{ fontSize: 11 }}>
                  {m.time}
                </span>
              </div>

              {/* Message Body */}
              {m.body && (
                <div className="chat-wall-msg__body">
                  <p>{m.body}</p>
                  {/* Your messages get a small yellow smile-underline (Spec 09 Section 7) */}
                  {m.isMe && (
                    <div style={{ marginTop: 2 }}>
                      <Graffiti type="smile-underline" color="var(--yuni-sun)" width={60} height={8} />
                    </div>
                  )}
                </div>
              )}

              {/* Sticker Message */}
              {m.sticker && (
                <div className="chat-wall-sticker">
                  <span className="chat-sticker-large">{m.sticker}</span>
                </div>
              )}

              {/* Shared Location Pin */}
              {m.location && (
                <button
                  className="chat-location-card"
                  onClick={() => {
                    setMapTargetVenue(m.location!.venueId);
                    setIsMapOpen(true);
                  }}
                  type="button"
                >
                  📍 <strong>{m.location.name}</strong>
                  <span style={{ fontSize: 11, color: 'var(--yuni-blue)', marginLeft: 6 }}>
                    · Open Directions ➜
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Composer Bar with Sticker Tray (Spec 09 Section 7) */}
        <div className="chat-composer-box">
          <div className="chat-sticker-shortcuts">
            {['Hop!', 'Mambo!', 'Poa ✦', 'Sawa!', '🔥', '📚'].map((s) => (
              <button
                key={s}
                className="chip chip--sm"
                onClick={() => handleSendSticker(s)}
                type="button"
                style={{ fontSize: 11, minHeight: 24, padding: '0 8px' }}
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="chat-composer-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              className="input chat-composer-input"
              type="text"
              placeholder="Message #MD Year 2..."
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
            />
            <button
              className="btn btn--primary btn--sm"
              type="submit"
              disabled={!composerText.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* MapSheet for shared locations */}
      <MapSheet
        isOpen={isMapOpen}
        mode="navigate"
        targetVenueId={mapTargetVenue}
        onClose={() => setIsMapOpen(false)}
      />
    </>
  );
}
