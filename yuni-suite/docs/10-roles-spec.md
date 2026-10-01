# 10: ROLES SPEC (every role, in depth)

Replaces section 8 of the fix doc (09). Section 8 gave titles and a coarse matrix, which was too shallow to build from. This doc specs **each role individually**: purpose, scope, how it's obtained, every capability, limits, approvals, Console tiles, workflows and tests.

> **Important assumption.** I could not find the MUHASSO constitution online, so I derived duties from the **titles on the organogram** and from how other Tanzanian student organisations are structured (government + cabinet, ministries and deputies, plus bodies like a Students' Baraza and a representatives council). Everything in section 5 is **configurable data**, not code. Before building, check each ministry's duties against the actual MUHASSO constitution and edit the grants. Open items are in section 12.

Legend used in matrices: **✓** allowed · **S** only inside own scope · **G** only if a grant is attached by admin · **A** allowed but needs approval · **R** restricted by a special rule (explained) · blank = not allowed.

---

## 1. Principles

1. **Power comes from capabilities, never from titles in code.** A role is a named bundle of capabilities. Titles are data.
2. **Every power has a scope.** Global, ministry, portfolio, programme, cohort, course, club/team, election, venue-group.
3. **Deny by default; the server decides.** The UI hides what you can't do, but row-level security enforces it.
4. **No cross-ministry reach.** Sports can't touch Welfare's venues, and so on, unless an admin grants it.
5. **Everything powerful is logged, and everything sensitive is rationed.**
6. **Terms expire.** Every assignment has start and end dates.
7. **Admins run the system; they don't govern.** Admins can't post as leaders or see ballots through the app.

---

## 2. Scope model

| Scope type | Example | Notes |
|-----------|---------|-------|
| `global` | All users | Rarest |
| `ministry:<id>` | Sports and Entertainment | Minister and deputies |
| `portfolio:<id>` | Football, within Sports | Optional sub-scope for a deputy |
| `programme:<id>` | MD, BPharm | |
| `cohort:<programme+year>` | MD Year 2 | CR scope |
| `course:<id>` | Anatomy Y1 | Course rep scope |
| `team:<id>` / `club:<id>` | Football team | Captains and club leaders |
| `election:<id>` | Class rep elections 2026 | Election officers only |
| `venue_group:<id>` | Hostel venues | Venue grants |

**Resolution rules**
- Capabilities from multiple roles **union**, but each keeps its own scope
- A narrower scope never grants wider reach
- **Acting as:** users with several roles pick one per action; the post is stamped with that title
- **Deny wins:** a suspension or revocation overrides any grant

---

## 3. Capability catalog

| Key | Meaning |
|-----|---------|
| `feed.read` | See feed items addressed to you |
| `feed.post.community` | Post to the open community feed (rate-limited, moderated) |
| `feed.post.scoped` | Post an official announcement within own scope |
| `feed.post.global` | Post an official announcement to every user |
| `feed.post.emergency` | Urgent broadcast with push; strongest gate in the app |
| `feed.pin` | Pin or unpin posts in scope |
| `feed.moderate` | Hide, remove, review reports in scope |
| `chat.dm` | Direct message others (per their privacy setting) |
| `chat.group.create` | Create groups (limits apply) |
| `chat.group.official` | Create read-only official channels in scope |
| `chat.group.moderate` | Remove messages, mute, remove members in scope |
| `poll.create` | Create polls in scope |
| `poll.results.view` | See results for polls you own or in scope |
| `election.officiate` | Run an election (setup, roll, schedule) |
| `election.certify` | Certify results (two-person rule) |
| `venue.manage` | Add, edit, remove venues and locations in scope |
| `venue.window.open` | Open and close claim windows |
| `venue.claim` | Claim a venue inside an open window you're eligible for |
| `venue.claim.decide` | Approve, reject, override, cancel claims |
| `inbox.<type>.read` / `.respond` | Access a typed inbox (academic, loans, welfare, complaints, incident, safe_report, partnership, fundraising, appeals) |
| `content.<type>.edit` | Edit structured content (menus, fixtures, library docs, health info, hostel board, partner directory, opportunities) |
| `role.request` | Request a leadership role |
| `role.recommend` | Nominate someone for a role in your scope (admin confirms) |
| `role.assign` / `role.revoke` | Make or end assignments |
| `role.acting.set` | Name an acting deputy for a limited time |
| `people.search` | Search by name |
| `people.lookup.regno` | Look up by registration number |
| `analytics.view` | Aggregate dashboards in scope |
| `audit.view` | Read the audit log |
| `moderation.user` | Suspend or ban users |
| `config.manage` | System settings, grants, rate limits |
| `studly.use` | Use Studly |
| `studly.official.publish` | Publish approved decks/summaries for official course material |

---

## 4. Global rules for leaders

| Rule | Default |
|------|---------|
| Official ribbon | Every leader post shows the exact title it was posted under |
| Two-factor | Mandatory for every leader and admin account |
| Global announcements | Max 3 per leader per day |
| Emergency broadcasts | Max 1 per leader per day; confirm step with reason and severity; test label available; a second leader sees an alert instantly |
| Polls | Max 5 active per scope |
| Group creation | Max 10 active official groups per leader |
| Approvals | Deputy's global posts need their Minister; a Minister without a global grant needs the Chief Secretary |
| Conflict of interest | Candidates can't officiate their own election; nobody approves their own request |
| Handover | At term end all content stays; permissions end; the outgoing leader keeps read access to their own posts only |
| Misconduct | Anyone can report a leader post; the Constitution ministry reviews; **only an admin can revoke** (on written instruction) |
| Audit | Posting, approving, overriding, role changes and inbox access are all logged |

---

## 5. Summary of Roles

1. **Guest (unverified)**
2. **Student (verified)**
3. **Class Representative (CR)**
4. **Course Representative**
5. **Team Captain / Club Leader**
6. **President & Vice President**
7. **Chief Secretary**
8. **Prime Minister & Deputy Prime Minister**
9. **Ministers & Deputy Ministers (13 Ministries)**
10. **Election Officers (min 2)**
11. **App Admin**
12. **Moderators**
