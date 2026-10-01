# 03: System design

## Constraints that shape everything
- Solo builder, free tiers only
- Students on flaky data, mostly low-end Android
- No integration with SARIS (webview button only)
- AI is rate-limited (see 06)

## Architecture: static reads, queued writes

```
            ┌──────────────────────────────┐
            │  Supabase (Postgres + RLS)   │  source of truth
            └──────┬───────────────┬───────┘
     scheduled     │               │  direct writes (small, authed)
     export job    ▼               ▲
   ┌───────────────────┐           │
   │ Static JSON bundle│           │
   │ (CDN / Pages)     │           │
   └─────────┬─────────┘           │
             ▼                     │
   ┌─────────────────────────────────────────┐
   │ PWA: cache + IndexedDB + write queue    │
   └─────────────────────────────────────────┘
             │ AI requests
             ▼
   Edge Function (key held server-side, quotas, cache) → OpenRouter
```

**Reads** come from versioned static JSON bundles (timetable, announcements, map, events, decks). They're cheap, cacheable and work offline.

**Writes** (votes, form submissions, posts, RSVPs) go to Supabase directly. They're small and authenticated. When offline they sit in a local queue and sync later.

**Batch updates:** a scheduled job (GitHub Actions cron or Supabase cron) exports changed data into JSON bundles every N hours. The app polls a tiny `manifest.json` (version numbers per bundle) and downloads only what changed.

## Data model (core tables)
| Table | Purpose |
|-------|---------|
| profiles | user id, role, programme, year, interests |
| announcements | title, body, scope, pinned, author, expires_at |
| forms / form_responses | schema as JSON, responses linked to user |
| polls / poll_options / poll_ballots | see 05 |
| events / venues | map pins, RSVPs |
| courses / timetable_entries | admin-managed |
| decks / cards | study content, shared decks |
| ai_usage | per-user and global request counts |
| audit_log | who did what (admin and leader actions) |

## Roles and scopes
- `student`: read public + own scope, write own responses/votes
- `leader`: create announcements/polls/forms inside their assigned scope, read aggregate stats
- `admin`: manage roles, official data, moderation
Enforced by Postgres row-level security, not just the UI.

## Sync strategy
- Manifest versioning, then ETag-style conditional fetch
- Write queue with idempotency keys so retries never double-submit
- Conflict rule: server wins for official data; last-write-wins for personal notes
- Exponential backoff, and a visible status per item

## Offline pack
Target under 15 MB for first install: timetable, map vector tiles for campus only, current announcements, core decks. Everything else lazy-loads and caches on use.

## Non-functional targets
| Quality | Target |
|---------|--------|
| First load on 3G | under 5 s to interactive |
| Cold start from cache | under 1.5 s |
| Offline coverage | all read features |
| Sync success | over 99% within 24 h of reconnecting |
| Availability | static reads independent of Supabase uptime |

## Failure modes
| Failure | Behaviour |
|---------|-----------|
| Supabase down | Reads fine from cache; writes queue |
| AI quota hit | Fallback to on-device model, then deterministic features |
| Bad data bundle | Keep previous bundle, report to admin |
| Duplicate submission | Idempotency key rejects it |

## Scaling path
Supabase free tier pauses inactive projects and has size limits, so check current limits and set up a keep-alive and a backup export early. If Yuni grows past the pilot, move to a paid tier before adding features.
