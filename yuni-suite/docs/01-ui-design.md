# 01: UI design

## Direction
Campus-native, calm but energetic. Feels like a student's own app, not an admin portal. Uses the **MUHAS colour palette** (not the logo or crest).

## Design tokens
Source of truth: **Yuni Brand Suite v1**. Palette is MUHAS shield colours pushed to Gen-Z (more saturation, more whitespace). Never hardcode a hex in a component.

```css
:root {
  --yuni-blue:   #2347C5;  /* primary: trust, CTAs, active states */
  --yuni-sun:    #FFD60A;  /* the smile: joy, badges, empty states (never muted) */
  --yuni-teal:   #10B981;  /* MUHAS health green: success, verified, wellness */
  --yuni-sky:    #38BDF8;  /* ribbon blue: light accents */
  --yuni-alert:  #EF4444;  /* softened MUHAS red: urgent/live only */
  --ink:         #0F172A;  /* text and UI, not harsh black */
  --text-muted:  #475569;  --text-faint: #64748B;
  --surface:     #FFFFFF;  --surface-2: #F8FAFC;  --border: #E2E8F0;
  --radius-btn:  24px;     --radius-phone: 36px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px;
}
/* Dark theme: derive from brand ink (#0F172A, #111C34, #1E293B) */
:root[data-theme="dark"] { --surface:#0F172A; --surface-2:#111C34; --border:#1E293B; --text:#F1F5F9; --text-muted:#94A3B8; }
```

Gradients in the suite: **Focus** (primary CTAs, active states), **Joy** (smile accents, badges), **Health** (success, verified).

Rules: check every brand-on-surface pairing for contrast (WCAG AA, 4.5:1 for body text). Yellow `#FFD60A` on white fails contrast, so use it as a fill behind ink text, never as text on light. Sky `#38BDF8` on white is also weak for body text.

## Logo rules (from the suite)
- Wordmark is **lowercase "yuni" always**. The pin is the campus compass, the smile is the "hop".
- Never stretch, recolour, stroke, shadow or gradient the icon. The smile stays yellow.
- Icon stays 1:1; use on a rounded square. Wordmark at least 88px wide.
- Never separate the badge from the text in the lockup. White version goes on Yuni Blue.

## Typography
- Pairing from the suite: **Plus Jakarta Sans** (Nunito as the rounded alternative) for display and headings, **Inter** for reading. Self-host the font files so they work offline (no CDN fonts).
- Suite scale: Display 56 / ExtraBold / -0.03em, H1 40 / ExtraBold, H2 24 / Bold, Body 15 / Medium. On phones, scale Display down.
- Body never below 14
- Numbers (GPA, countdowns) use tabular figures

## Layout
- Mobile first, one-hand reach. Bottom nav with 5 tabs: **Home, Study, Map, Feed, Me**
- 8-pt spacing grid
- Cards for content, sheets for actions, full pages only for deep content

## Core components
| Component | Notes |
|-----------|-------|
| Next-class card | Countdown, room, "Directions" button |
| Announcement card | Pinned/urgent variants, scope chip (Year 3, Football, All) |
| Poll card | Options, live-ish results after voting, closes-in label |
| Form sheet | Stepper for long forms, autosave draft |
| Flashcard | Flip, swipe right/left, progress ring |
| Agent bubble | Distinct from user bubble, "Proposed action" card with Approve / Edit / Dismiss |
| Sync badge | Synced / Pending / Failed, always visible on queued items |
| Empty/offline states | Illustrated, with a clear next action |

## Motion
- 150 to 250 ms, ease-out. Motion confirms actions (card flips, XP gain), never decorates.
- Respect `prefers-reduced-motion`.

## Gamification visuals
Streak flame, XP bar, badges. Keep them playful but never block core tasks behind them.

## Role-specific UI
- **Student:** consumption-first
- **Leader:** a "Create" button on the Feed tab (announcement, poll, form), plus a stats view
- **Admin:** a web dashboard on desktop, since moderation and data uploads are bad on a phone

## Accessibility
Minimum 44px touch targets, visible focus states, screen-reader labels, no information by colour alone, Swahili and English strings from day one.

## Deliverables
Figma (or code-first) component library, a token file, and 8 key screens: onboarding, home, timetable, map, feed, poll, flashcards, agent chat.
