# 09: FIX DOC (overhaul)

Continues from specs 00 to 08. Where this doc conflicts with an earlier file, **this doc wins**. Section 15 lists every earlier decision it overrides.

---

## 1. What went wrong (honest review)

**Home screen.** The earlier spec described Home as a stack of cards: next class, due soon, agent nudge, daily brief. That is a feature checklist, not an experience. It had:
- no single primary action, so everything competed
- no hierarchy, no states (before class / in class / exam week / empty), no personality
- no interaction spec: nothing about gestures, motion, haptics or what changes when you tap

**Map.** I specced it as a tab with study-spot finders, crowd levels and offline vector tiles. That was feature padding. A map is a *function* other features call, not a destination.

**Feed and chat.** Feed was a list of cards. Chat was barely specced. Neither had a point of view.

**Why the build came out flat.** The spec pack described *what exists*, never *how it moves or feels*, and had no acceptance criteria and no "not this" examples. Specs written for a reader are not build prompts. That is mostly on me as the spec author. Section 13 fixes how you brief the building agent.

(I haven't seen the built app, so this review covers the specs and what you told me.)

---

## 2. Visual direction: white + graffiti

**Base:** white dominant (`#FFFFFF`; `--surface-2` only for cards and inputs). Graffiti is the personality layer on top.

**Graffiti kit v1** (draw originals; do not copy real artists' tags or any brand):
- ~8 arrows and pointers, ~6 underlines/scribbles/circles, ~6 stars and bursts, ~4 spray splats, ~6 doodle icons, ~4 hand-lettered tags
- Tag words with local flavour: "Hop!", "Mambo!", "Poa", "Sawa", "yuni"
- Palette only: Yuni Blue, Sunshine, Teal, Sky, Ink, Alert (sparingly)
- Format: inline SVG sprite, under 30 KB total, no raster images

**Where it goes:** Home header, section dividers, empty states, onboarding, success moments, sticker packs, loading screens, Console tiles.

**Where it never goes:** behind body text, forms, chat message areas, Studly reading content, map tiles, anything needing precision.

**Rules**
1. At most 2 or 3 graffiti elements above the fold per screen
2. Decorative layer sits behind content and never reduces text contrast below WCAG AA
3. Entrance animation: stroke "draw-on", about 400 ms, once per screen visit
4. `prefers-reduced-motion`: show static art
5. Graffiti never blocks taps (`pointer-events: none`)

Dark theme is deprioritised. Ship white first.

---

## 3. Navigation

**Everyone (3 tabs):** **Chat** (left) · **Home** (centre) · **Me** (right)

**Leaders (4 tabs):** Chat · Home · **Console** · Me

**Study** is no longer a tab. Studly is the big launcher on Home and opens full screen (section 9). SARIS stays a button under Me, opening in the in-app browser.

*(You first said home/study/me, then chat-left/home-centre/me-right. I went with the second and moved Study onto Home. Tell me if you want Study as its own tab instead.)*

**Global rule: nothing opens outside the app.** All web content (SARIS, Google search, links in posts) opens in an **in-app browser** layer with a Done bar. That means the app ships inside a native shell (Capacitor, using its Browser plugin), not as a bare PWA. Google pages usually refuse to be framed, so a real in-app browser is needed, not an iframe. Test on real devices.

---

## 4. Home screen (redesign)

**Job of Home:** answer "what should I do right now?" in one glance, then let me wander.

```
┌─────────────────────────────┐
│ Mambo, Amina ✦  [Student]   │  greeting + role badge + sync dot (graffiti underline)
│                             │
│ ┌─────── NOW ─────────────┐ │  ONE hero card; morphs by context
│ │ Physiology · LT 3       │ │
│ │ starts in 23 min        │ │
│ │ [ Take me there ]       │ │  opens MapSheet in navigate mode
│ └─────────────────────────┘ │  swipe sideways to peek next 3 things
│                             │
│ What do you need right now? │  STUDLY launcher
│ (Flashcards)(Exam)(Summary) │  chips jump straight into Studly
│                             │
│ ── Pulse ──  ➜              │  horizontal strip of live things:
│ [Venue window 12:00 ◔ 4m]   │  claim windows, polls closing,
│ [Poll closes tonight]       │  events today
│                             │
│ ── Campus feed ──           │  filter chips + posts
│ (All)(My year)(Sports)(Off.)│
│  post cards...              │
└─────────────────────────────┘
```

**NOW card states**
| Context | Card shows | Primary action |
|---------|-----------|----------------|
| Class in under 60 min | Class, room, countdown | Take me there (map) |
| In class | "In class until 10:00" | Open notes / Studly |
| Free gap (30+ min) | "20 free minutes" | Flashcards from last deck |
| Exam within 7 days | Countdown ring | Start exam practice |
| Nothing scheduled | Friendly graffiti empty state | Browse feed |

**Interactions**
- Pull to refresh: the pin-smile hops across the screen with a light haptic
- Swipe the NOW card to see the next items; long-press for quick actions
- Pulse tiles have live countdowns that update each second while on screen
- Sticker reactions on feed posts (section 6)
- Skeleton states and offline cache labels ("Updated 2 h ago") everywhere

**Acceptance:** one primary action visible without scrolling; works offline with cached data; every tappable thing gives instant visual feedback within 100 ms.

---

## 5. Map as a function (Leaflet + OpenStreetMap)

There is **no Map tab**. There is a `MapSheet` component that other features open:

| Mode | Opened from | What it does |
|------|-------------|--------------|
| `navigate` | NOW card, timetable, event | Shows route line, distance, walking time |
| `view-venue` | Venue card, claim result | Shows pin, capacity, photos, bookings |
| `claim-venue` | Console / CR claim flow | Lists claimable venues and live availability |
| `pick-location` | Feed or chat composer | User drops a pin to attach |
| `show-location` | A shared pin in feed or chat | Read-only pin with "navigate" |

**Stack**
- **Leaflet** (pin the version) with OpenStreetMap raster tiles, free and no API key
- Venues are your own **GeoJSON/Supabase data** drawn over the tiles (OSM's coverage of lecture halls and rooms may be thin, so your venue table is the source of truth; also consider improving the campus on OSM itself)
- Restrict the map to campus bounds (`maxBounds`, min zoom ~15)
- Marker clustering plugin when pins overlap; custom brand pin as `DivIcon`
- Geolocation via the Capacitor Geolocation plugin, permission asked only when needed
- Keep a text list of places beside the map for accessibility

**Tile policy (important).** OSM's public tile servers are donation-funded, have no service guarantee, and are meant for light use. They require visible attribution ("© OpenStreetMap contributors"), proper request identification and respect for caching headers, and can block abusive traffic. They are not a place to send an entire app's traffic, and you should not bulk-download tiles from them.
- **Pilot:** public tiles are fine for a small campus pilot, with attribution always visible
- **Make the tile URL a config value** from day one
- **Production path:** generate a campus-only tile set from OSM data (for example a PMTiles file on free static hosting), or use a provider you have an account with. This also gives real offline maps.

**Directions v1:** straight-line route with a walking-time estimate (distance ÷ ~4.5 km/h). Real routing (OpenRouteService or similar) is optional later; check its free limits first, and don't use public demo routing servers in production.

**Location sharing:** v1 shares a **static pin** only (feed and chat). Live location sharing is deferred to the safety phase. Precise location is opt-in; suggest venue names before raw coordinates.

---

## 6. Feed (inside Home)

- **Post types:** announcement, notice, poll, event, venue-window, lost and found, community post
- **Scopes:** everyone, programme, year-cohort, class, club/team
- **Official ribbon:** posts by leaders show the exact title they posted under (for example "Minister, Welfare, Ceremonies and Disaster Management")
- **Reactions:** sticker reactions from a small set (about 6), plus a "hop"; tapping "slaps" the sticker onto the post with a short animation
- **Location chip:** a post can carry a pin; tapping opens `MapSheet` in `show-location`
- **Comments:** flat, moderated, rate-limited
- **Community posts by students:** allowed with rate limits and a moderation queue. *(Decision flagged; can start leaders-only.)*
- **Urgent/pinned:** top of feed, with a distinct treatment
- Offline: cached reads; new posts queue with a visible "Pending" badge

---

## 7. Chat (left tab)

**Concept:** a hybrid of an Instagram-style top rail and a WhatsApp-style list, **without stories**. Nothing disappears; nothing is a feed.

**Layout**
```
[ search: find a person or group ]
( ◯ ◯ ◯ ◯ ◯ ◯ ➜ )   top rail "Circles": pinned groups, recent DMs, official channels
                      ring colour = unread (blue) / mention (sun) / official (teal)
── Official ──        leader channels, read-only for students
── Groups & forums ── class, course, clubs, topics
── Direct ──
```

**Conversation view: "wall" style (not left/right bubbles)**
- Single column, everyone left-aligned, with a colour-coded handle chip per person
- Your messages get a small yellow smile-underline instead of sitting on the right
- Replies collapse into small threads
- Photos and stickers may sit at a slight tilt (max ±1.5°); text never tilts
- Composer: text, emoji, **sticker tray** (bundled Yuni packs), **GIF**, image attach, location pin (via `MapSheet`), and quick poll (leaders and group admins)

**Conversation types**
| Type | Created by | Who can post |
|------|-----------|--------------|
| Class group | Auto per programme-year cohort | Members; CR moderates |
| Course group | Course rep | Members; course rep moderates |
| Official channel | Leader (scoped) | Leaders only; students read and react |
| Forum | Admin / leaders | Anyone who joins, moderated |
| Club / team | Captain or club leader | Members |
| Custom group | Any student (limits apply) | Members |
| Direct message | Anyone, per recipient's privacy setting | Both |

**Find and message people:** search by name (and programme-year). Registration number lookup is restricted to admins and a CR within their own cohort. Searches are rate-limited to stop scraping. Discoverability setting: everyone / my programme / leaders only.

**Join and contribute:** open groups join in one tap; others by request or invite. Permission levels per member: read, post, moderate.

**GIFs:** the Tenor API was shut down on 30 June 2026. Use Giphy (needs approval for production) or Klipy (free tier), or ship bundled sticker packs only for v1. Decide before building the picker.

**Backend:** chat needs **Supabase Realtime**. This is the one place the "no live backend" principle is relaxed. Check Realtime connection and message limits on the free tier before launch.

**Data model:** `conversations`, `conversation_members(role, last_read_at)`, `messages(kind: text|image|sticker|gif|location|poll, body, meta jsonb, reply_to, deleted_at)`, `message_reactions`, `blocks`, `reports`.

**Safety:** report and block on every message and profile, spam rate limits, image size caps and client-side compression, leaders cannot read DMs. No end-to-end encryption in v1, and the privacy notice must say so plainly.

---

## 8. Roles and student government

### 8.1 Organogram (titles scraped from the MUHASSO Cabinet 2026/2027 chart)

**Executive (5):** President · Vice President · Chief Secretary · Prime Minister · Deputy Prime Minister

**Ministries (13), each with one Minister and 1 to 3 Deputy Ministers:**
| # | Ministry | Minister title | Deputies shown |
|---|----------|----------------|:--:|
| 1 | Education and School Coordination | Minister for Education and School Coordination | 3 |
| 2 | Information, Communication and Library Services | Minister for Information, Communication and Library Services | 3 |
| 3 | Finance and Investment | Minister for Finance and Investment | 1 |
| 4 | Constitution, Laws and Good Governance | Minister for Constitution, Laws and Good Governance | 1 |
| 5 | Loans and Grants | Minister for Loans and Grants | 3 |
| 6 | Sports and Entertainment | Minister for Sports and Entertainment | 3 |
| 7 | Gender and Internal Affairs | Minister for Gender and Internal Affairs | 2 |
| 8 | Health and Environment | Minister for Health and Environment | 3 |
| 9 | Research and Innovation | Minister for Research and Innovation | 3 |
| 10 | Welfare, Ceremonies and Disaster Management | Minister for Welfare, Ceremonies and Disaster Management | 3 |
| 11 | Accommodation and Security | Minister for Accommodation and Security | 3 |
| 12 | External Affairs and Collaboration | Minister for External Affairs and Collaboration | 3 |
| 13 | Food and Cafeteria Services | Minister for Food and Cafeteria Services | 3 |

Deputy title pattern: "D/Minister for <ministry>". That is 52 positions in total (5 + 13 + 34). Names and phone numbers from the chart are deliberately **not** copied into this doc or the app seed data; leaders add their own contact details if they choose.

**Additional roles the app needs (not in the chart):**
- **Class Representative (CR):** per programme-year cohort
- **Course Representative:** per course (as you described)
- **Team Captain / Club Leader:** scoped under Sports and Entertainment or a club
- **Election Officer / Returning Officer:** runs elections; cannot be a candidate in that election
- **App Admin:** you plus at least one backup

Positions are **data, not code**. The cabinet changes every year, so every assignment has a start and end date.

### 8.2 RBAC model

- **Role template:** a named bundle of capabilities (for example "Minister")
- **Scope:** where the power applies: `global`, `ministry:<id>`, `programme:<id>`, `cohort:<programme+year>`, `course:<id>`, `club:<id>`
- **Assignment:** `user + role + scope + valid_from + valid_to + granted_by + status`
- **Capability check:** one SQL function, `has_capability(user, capability, scope)`, used by row-level security. The UI hides things, but the **server decides**.

```
roles(id, name, kind)  capabilities(id, key)  role_capabilities(role_id, capability_id)
role_assignments(user_id, role_id, scope_type, scope_id, valid_from, valid_to, status, granted_by)
role_requests(user_id, requested_role_id, scope, evidence_url, status, reviewed_by, note)
audit_log(actor_id, action, target, before, after, at)
```

### 8.3 Capabilities and who gets them (defaults; all editable by admin)

| Capability | Student | CR / Course Rep | Deputy Minister | Minister | Executive | Admin |
|------------|:--:|:--:|:--:|:--:|:--:|:--:|
| Read feed, join groups, vote | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Community post | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Announce to own cohort/course | | ✓ | | | | |
| Announce within own ministry scope | | | ✓ | ✓ | ✓ | |
| Announce globally (all users) | | | | per grant | ✓ | ✓ |
| Create polls (own scope) | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create group / forum | limited | ✓ | ✓ | ✓ | ✓ | ✓ |
| Moderate groups in own scope | | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Add/edit venues and locations** | | | per grant | **per grant** | ✓ | ✓ |
| **Open a venue claim window** | | | per grant | **per grant** | ✓ | ✓ |
| **Claim a venue** | | ✓ | | | | |
| Approve/override claims | | | per grant | per grant | ✓ | ✓ |
| Run elections | | | | Constitution Minister (per grant) | | Election Officer |
| Review role requests, assign/revoke roles | | | | | | ✓ |
| View audit log | | | | | | ✓ |

"Per grant" means the capability is attached to a role by an admin, not hardcoded. Default grant for **venues and claim windows: Welfare, Ceremonies and Disaster Management** (the venue allocation problem you described), with Accommodation and Security able to be granted hostel venues. Sports gets its own grants for pitches and halls, bound to its own scope, so no role can touch another role's venues.

### 8.4 How roles get assigned

1. **Onboarding:** pick "Student" or "I hold a leadership position". A leader picks the exact position from the list above (the picker is driven by the roles table), adds evidence (for example an appointment letter photo), and submits. Until approved, they use the app as a student.
2. **Admin queue:** approve, reject, or edit scope and dates. The user gets a notification.
3. **Direct assign and revoke** by admin, plus a **yearly bulk import** (CSV) for a new cabinet.
4. **Term expiry:** a nightly job ends assignments past `valid_to`.
5. **Elections:** certified results create *pending* assignments that an admin confirms.
6. **Safeguards:** no self-approval, two or more admins, every change in `audit_log`, leaders can only act within scope, and a single user can hold several roles (an "acting as" switcher shows which one a post uses).

### 8.5 Me tab (profile)
- Badge: **Student** or **Leader**, plus verified state
- Role cards: title, scope, term dates
- Settings, discoverability, SARIS button, sync status, Studly history

---

## 9. Studly (study mode)

**Not a chat.** No multi-turn conversation. The flow is: **choose documents → choose what you need → get a rendered result.**

**Flow**
1. **Onboarding click:** "What do you need right now?" → Flashcards · Exam · Summary · Key terms · Cheat sheet · **Auto** (type one line; the model picks)
2. **Attach:** multi-select documents (PDF, DOCX, PPTX, TXT/MD). Suggested limits per run: 5 documents, 25 MB, ~100 pages (config).
3. **Extract on device:** read text locally (for example pdf.js for PDFs), strip boilerplate, split by headings.
4. **One request** through a Supabase Edge Function to Nemotron on OpenRouter.
5. **Tool call → native UI:** the model returns structured tool calls and the app renders them with real components (not markdown).

**Tools the model may call** (validate every payload with Zod)
| Tool | Payload (abridged) | Renders as |
|------|--------------------|-----------|
| `render_flashcards` | `deck_title, cards[{front, back, source_ref, difficulty}]` | Swipe deck, local spaced repetition |
| `render_exam` | `title, duration_min, questions[{type: mcq/short/true_false, stem, options, answer, explanation, source_ref}]` | Timed exam, marking, review |
| `render_summary` | `title, sections[{heading, bullets[]}], key_terms[]` | Collapsible summary |
| `render_glossary` | `terms[{term, definition, source_ref}]` | Searchable glossary |
| `render_cheatsheet` | `blocks[{heading, items[]}]` | One-page compact view |
| `render_error` | `reason` | Friendly failure (unreadable doc, too large) |

**Model and routing (checked on OpenRouter, verify again at build time)**
- **Primary:** `nvidia/nemotron-3-ultra-550b-a55b:free`, listed with a 1,000,000-token context and tool calling (`tools`, `tool_choice`)
- **Fallbacks (config list):** other free Nemotron variants such as Nemotron 3 Super (about 262K context) and Nano Omni (256K context, tool calling). Use OpenRouter's `models` fallback array, since free models rotate without warning. Keep model IDs in config.
- Large context means most course documents go in **one request**, with no chunk-and-merge. This matters because free limits count *requests*.
- Use `tool_choice: required` for the chosen modes; `auto` for Auto mode
- On invalid output: one automatic repair retry, then a clear error that keeps the user's document selection
- Generation can be slow: show progress states, run in the background, and notify "Your deck is ready"

**Follow-ups without chat:** every card, answer and summary paragraph has **"Not clear? Search this"**, which opens Google in the in-app browser with a query built from that text. This is the "follow-up" path; nothing else.

**Quota reality.** Free models allow 20 requests/minute, and 50/day for the whole account (1,000/day after a one-time $10 credit purchase). Limits are per account, not per key. Studly will burn through 50 a day almost immediately. Plan:
- Do the **$10 top-up** (permanent 1,000/day)
- Per-user cap (for example 3 generations a day)
- Cache results **per user** by document hash. Do **not** share caches across students: uploaded notes may be private or copyrighted. Only admin-approved official course material can have shared pre-generated decks.
- Optional bring-your-own-key for power users

**Privacy.** The free Nemotron endpoint states that usage is logged and used to improve NVIDIA products. Show a consent screen before the first upload, and never upload anything containing personal or patient information.

**Quality.** Cards and questions carry `source_ref` (document and page) so users can check against their slides. Add a "this is a revision aid, verify against your course material" line on clinical content. Keep a 50-prompt eval set (see 06) and re-run it whenever you change model or prompt.

---

## 10. Console (leaders only)

A launchpad of tiles shown according to the user's capabilities, with an **"Acting as: <title> · <scope>"** chip at the top.

| Tile | Needs capability | What it does |
|------|-----------------|--------------|
| Announce | announce.* | Post to feed (scoped or global), with optional pin and push |
| Venues | venue.manage | Add venue, add location (pin on `MapSheet`), edit details |
| Claim windows | venue.window.open | Open, schedule, close windows; pick eligible cohorts and fairness mode |
| Claims | venue.approve | See, approve, override, cancel claims |
| Polls and elections | poll.create / election.run | Create and monitor (section 12) |
| Groups | group.create / moderate | Create and manage channels |
| People | admin only | Role requests, assignments, audit log |
| Reports | moderation | Review reported content |

Every post made from Console is stamped with the official title it used.

---

## 11. Venue allocation (flagship leader feature)

**Problem:** venue allocation at MUHAS is chaotic and contested. Make it fair, fast and visible.

**Flow**
1. A leader with `venue.manage` adds venues (name, building, capacity, type, pin on map, photos).
2. A leader with `venue.window.open` opens a **claim window**: venues, date range, eligible cohorts (for example all CRs, or Year 3 only), limits per class, and **fairness mode**:
   - *First come first served*, or
   - *Lottery* within the window (everyone who claims in the window enters; a draw assigns conflicts), which avoids phone-speed bias
3. Eligible CRs get a push notification. Claim cards show a live countdown and live availability.
4. A CR picks venue, time slot, class and purpose, then submits (**online only**, because it's a contested resource).
5. The database prevents double-booking with an exclusion constraint, so two claims for the same venue and overlapping time cannot both succeed.
6. Status: pending → confirmed / rejected / waitlisted → cancelled. Cancellations free the slot and promote the waitlist.
7. Confirmed bookings show on the class timetable, the venue's page and the map.

```
venues(id, name, geo, building, capacity, type, owner_scope)
venue_windows(id, venue_ids, opens_at, closes_at, eligible_scope, rules jsonb, fairness, created_by)
venue_claims(id, venue_id, window_id, claimant_id, cohort, starts_at, ends_at, purpose, status)
-- EXCLUDE USING gist (venue_id WITH =, tstzrange(starts_at, ends_at) WITH &&) WHERE status IN ('pending','confirmed')
```

**"Venue Rush" moment:** when a window opens, the Pulse tile flips to a live countdown ring; at zero there is a haptic tap and the tile becomes a "Claim" button with slots filling in real time. This is the signature wow interaction.

Same engine serves sports pitches, halls and ceremony spaces, each bound to its own owner scope.

---

## 12. Elections and polling

Builds on spec 05 and adds the role lifecycle.

**Phases**
1. **Setup:** Election Officer creates the election, positions, eligibility (by roster) and dates
2. **Nominations and vetting:** candidates apply; officers verify
3. **Campaign:** candidate profile and manifesto cards in feed; **pre-vote polls** and **opinion polls** are open to everyone eligible
4. **Voting:** secret ballot (separate receipt and ballot tables), one vote per person, queued offline votes show "not counted yet" until confirmed
5. **Results and certification:** Election Officer certifies; results post to feed
6. **Handover:** certified winners create pending role assignments for an admin to confirm, with term dates

**Rules**
- Binding elections only with sign-off from student affairs or the electoral body; otherwise labelled **pilot / non-binding**
- A candidate cannot be an officer of their own election
- Minimum response thresholds before showing small-group breakdowns
- Full audit log; published procedure

---

## 13. Interactivity spec and how to brief the build agent

**Signature interactions (do these well instead of everything shallowly)**
1. **Hop:** every primary tap compresses and springs back with a haptic tick
2. **Draw-on graffiti** on screen entry; spray-burst on success moments (once)
3. **NOW card** morphing and swipe-peek
4. **Venue Rush** live countdown and slot-fill
5. **Studly deck** swipe physics, with a spray-can streak meter
6. **Sticker slap** reactions in feed and chat
7. **Tag a spot:** shared locations drop as a spray-tag pin with the sender's handle
8. **Pull-to-refresh** pin-hop

**Performance guardrails:** 60 fps on a low-end Android, CSS transforms or a tiny animation library (no heavy Lottie), animation budget per screen, `prefers-reduced-motion` honoured.

**Briefing template (use for every screen, one screen per prompt)**
```
SCREEN: <name>
GOAL (one sentence):
WHO / WHEN:
LAYOUT (ASCII sketch):
INTERACTIONS: gesture → result → animation → haptic
STATES: loading / empty / offline / error / permission denied / no-role
DATA: tables, queries, which role can see what
NOT THIS: (anti-examples, e.g. "not a vertical stack of identical cards")
ACCEPTANCE: 5 to 8 testable checks
```
Feed the agent **slices** of this doc, not the whole pack. After each screen, ask it to critique its own output against the acceptance list, then review a screenshot before moving on.

---

## 14. Build order

| Phase | Scope | Why this order |
|-------|-------|----------------|
| 0 | Native shell, in-app browser, design kit (white + graffiti), 3-tab nav, auth, roles schema | Everything depends on it |
| 1 | Role requests, admin queue, Console, announcements, **Home + feed** | Leaders get value immediately |
| 2 | `MapSheet` (Leaflet), venues, **claim windows** | Real campus pain, flagship feature |
| 3 | Chat (realtime, groups, DMs, stickers) | Needs roles and moderation first |
| 4 | **Studly** | Quota-limited, so ship after the $10 top-up and quotas |
| 5 | Elections | Needs trust, roles and sign-off |

---

## 15. What this supersedes

| Earlier doc | Change |
|-------------|--------|
| 00 | Tabs now Chat · Home · Me (+ Console); v1 scope reordered by section 14 |
| 01 | White-dominant with graffiti kit; Study and Map tabs removed |
| 02 | Home, flows and IA replaced by sections 3 to 4; Study is Studly, not a chat |
| 03 | Chat and venue claims use Supabase Realtime; static batch reads remain for everything else |
| 04 | Native shell (Capacitor) required for the in-app browser; MapLibre replaced by Leaflet + OSM; GIF provider changed |
| 05 | Elections extended with roles, officers and handover |
| 06 | Multi-turn study agent replaced by Studly tool-call rendering; Nemotron primary model |
| 07 | Chat privacy (no E2EE in v1), role-fraud controls, Studly upload consent added |
| 08 | Add policy tests for `has_capability`, claim double-booking and role expiry |

---

## 16. Risks

| Risk | Mitigation |
|------|-----------|
| OSM public tiles blocked or throttled | Config-driven tile URL; plan campus-only tile set |
| Free AI quota exhausted | $10 top-up, per-user caps, per-user caching |
| Fake leaders | Admin verification with evidence, audit log, scoped powers |
| Realtime free-tier limits | Check limits; throttle presence; degrade to polling |
| GIF provider terms or availability | Stickers first; pick provider deliberately |
| Moderation load | Report queues, rate limits, a second admin |
| Scope creep | Build order in section 14; one screen per prompt |

---

## 17. Open questions
1. **Tabs:** keep Study on Home, or make it a fourth tab?
2. **Who beyond you assigns roles?** A second admin is strongly advised. Should the Chief Secretary or Constitution Minister confirm cabinet assignments?
3. **GIFs:** Giphy, Klipy, or stickers only at launch?
