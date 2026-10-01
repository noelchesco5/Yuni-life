# Yuni: spec pack

An all-in-one, offline-first student app for MUHAS. Built solo, on free tiers, as a pilot.

## Files
| # | File | Covers |
|---|------|--------|
| 01 | ui-design.md | Visual language, MUHAS palette tokens, components |
| 02 | ux.md | Flows, information architecture, accessibility, offline UX |
| 03 | system-design.md | Architecture, data flow, batch updates, roles |
| 04 | tech-stack.md | Chosen tools and why |
| 05 | voting-and-polls.md | Pre-vote polls, opinions, elections |
| 06 | ai-agent-architecture.md | Study agent on free OpenRouter plus on-device |
| 07 | security-privacy.md | Auth, RLS, threat model, data handling |
| 08 | testing-cicd-ops.md | Tests, pipelines, monitoring, rollout |

## Product principles
1. **Offline first.** If it needs data to open, it's broken.
2. **Layer, don't replace.** SARIS stays the source of truth; Yuni opens it in a webview and nothing more.
3. **Cheap by design.** Everything runs on free tiers. Every feature has a "what happens at the limit" answer.
4. **Agent proposes, human approves.** The agent never changes anything without a tap.
5. **Three roles, least privilege.** Student, student gov leader, admin.
6. **No patient data. Ever.**

## Scope
**v1 (ship):** onboarding, personalised feed, announcements, forms, timetable, campus map, SARIS button, flashcards, study agent (tiered), polls, offline sync.

**v2:** elections (binding), sports and clubs, safety toolkit, marketplace.

**v3:** peer tutoring, shared deck marketplace, semester "wrapped".

## Open decisions
- PWA vs native wrapper (recommended: PWA first, Capacitor later if needed)
- Whether elections are ever binding (needs student affairs / electoral body sign-off)
- Where official timetable and results data will come from
