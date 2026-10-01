# 07: Security and privacy

## What's at stake
Student identities, votes, anonymous reports, location sharing, and trust in the student government. A leak or a rigged vote would end the app.

## Data classification
| Class | Examples | Handling |
|-------|----------|----------|
| Public | Announcements, events, map | Static bundles |
| Personal | Profile, programme, notes, flashcard stats | Authed, RLS, minimal retention |
| Sensitive | Votes, anonymous reports, live location, safety contacts | Separate tables, strict access, short retention, audit logged |
| Never stored | SARIS credentials, patient data, government ID numbers | Not collected at all |

## Authentication
- Supabase Auth with university-email OTP or magic link (or admin-issued claim codes)
- No passwords to leak where avoidable
- Role stored server-side in `profiles`, never trusted from the client
- Leader and admin accounts: mandatory second factor

## Authorisation
Row-level security on every table, **deny by default**:
- Students read public rows and their own rows only
- Leaders write only inside their assigned scope
- Ballots are insert-only for students; nobody can read individual ballots through the API
- Admin actions are written to `audit_log`

Test RLS with automated policy tests; a missing policy is a data leak.

## SARIS boundary
Yuni opens SARIS in an in-app browser or the system browser and nothing more: no scraping, no credential capture, no injected scripts, no proxying. Say this plainly on the Me screen so students know.

## Threat model (STRIDE-lite)
| Threat | Example | Mitigation |
|--------|---------|-----------|
| Spoofing | Fake leader posts announcements | Server-side roles, 2FA for leaders |
| Tampering | Edited votes, changed results | RLS, insert-only ballots, audit log |
| Repudiation | "I never posted that" | Audit log with actor and timestamp |
| Info disclosure | Key in app bundle, leaked reports | Secrets only in Edge Functions; encrypt sensitive columns |
| Denial of service | Poll spam, AI quota drain | Rate limits, per-user quotas, CAPTCHA on sign-up |
| Elevation | Student becomes admin | Roles not editable by users, tested policies |
| Prompt injection | Malicious announcement text targets the agent | Untrusted-content rules, approve-before-act |

## Secrets
- Never commit keys; use environment secrets in Supabase and GitHub
- OpenRouter key only in an Edge Function
- Rotate keys if leaked, and have a runbook for it

## Privacy
- Collect the minimum; every field must power a visible feature
- Plain-language privacy notice, in English and Swahili
- Consent for notifications, location sharing and analytics, each separately
- Retention: anonymous reports and location shares auto-delete on a schedule; account deletion is possible and tested
- Check local data protection law (Tanzania's Personal Data Protection Act) and the university's policy before launch
- AI: tell users that cloud AI calls go to third-party model providers and may be logged

## Safety feature cautions
- Location sharing is opt-in, time-limited, and revocable
- "Walk me home" alerts must say what they can and can't do; they don't replace emergency services
- Anonymous reporting needs a human who actually reads and acts on reports; do not ship it without one

## Content moderation
Report buttons on posts, comments and marketplace items, an admin takedown path, and blocked-term filtering for comments.

## Pre-launch checklist
- [ ] RLS policies tested
- [ ] No secrets in client bundle (scan the build)
- [ ] Dependency audit
- [ ] Backup and restore tested
- [ ] Privacy notice live
- [ ] Incident contact and runbook written
