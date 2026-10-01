# 08: Testing, CI/CD and operations

## Testing strategy
| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit | Vitest | Spaced-repetition logic, sync queue, quota router, validators |
| Policy tests | pgTAP or SQL test scripts | Every RLS rule: who can read/write what |
| Integration | Vitest + local Supabase | Vote transaction, form submission, role scopes |
| End-to-end | Playwright | Onboarding, offline flow, voting, form fill |
| Offline | Playwright with network throttled/disabled | Cached reads, queued writes, sync recovery |
| Accessibility | axe + manual screen-reader pass | Every release |
| AI evals | Custom eval set (see 06) | Flashcard quality, tool-call accuracy, refusals |
| Device | 2 to 3 real low-end Android phones | Performance, storage, WebGPU fallbacks |

Highest-risk areas to test hardest: voting integrity, role permissions, offline sync (duplicate or lost writes).

## CI pipeline (GitHub Actions)
On every pull request:
1. Install, lint, type-check
2. Unit tests
3. Spin up local Supabase, run migrations, run policy and integration tests
4. Build the PWA; fail if the bundle contains secret patterns or exceeds the size budget
5. Playwright smoke tests
6. Preview deployment (Cloudflare Pages)

On merge to main:
1. Run the full suite
2. Apply database migrations to staging
3. Deploy the app
4. Smoke-test production

## Scheduled jobs
| Job | Frequency | Purpose |
|-----|-----------|---------|
| Data export | Every few hours | Build static JSON bundles and manifest |
| AI pre-generation | Nightly | Flashcards and summaries from approved course material |
| Backup | Daily | Database dump to storage you control |
| Keep-alive | Weekly | Prevent the free project from pausing from inactivity |
| Retention cleanup | Daily | Delete expired reports, location shares |
| Quota reset check | Daily | Reconcile AI usage counters |

## Environments
`local` (Supabase CLI) → `staging` (separate Supabase project) → `production`. Never test with production data.

## Release strategy
- Feature flags (a simple table or JSON) to switch features on per role or cohort
- Pilot with one class, then one year, then the campus
- Service worker updates: show "Update ready" instead of forcing reloads mid-task
- Database migrations are additive first; destructive changes only in a later release
- Rollback: keep the previous bundle and app build deployable in one step

## Monitoring
- Sentry for crashes and errors
- Dashboards: sync success rate, queue length, AI tier distribution, cache hit rate, quota usage, poll participation
- Alerts: export job failed, quota above 80%, error rate spike, backup missing

## Free-tier risk register
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase project pauses or hits limits | Writes fail | Keep-alive, monitor usage, paid tier before scale |
| OpenRouter free models rotate or limits change | Agent breaks | Model IDs in config, fallback list, on-device tier |
| Single maintainer unavailable (exams, rotations) | Nobody fixes outages | Runbook, automation, a second admin with access |
| Hosting limits | Slow or down | Static assets are cacheable; keep bundles small |

## Documentation to maintain
README, DECISIONS.md, a runbook (how to rotate keys, restore backups, take down a post, close a poll), and a data dictionary.

## Definition of done (per feature)
Works offline, has a Swahili/English string, passes accessibility checks, has tests for its failure path, is behind a flag, and has a metric.
