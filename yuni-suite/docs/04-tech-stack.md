# 04: Tech stack

## Selection criteria
Free or near-free, offline-capable, solo-maintainable, low-end-phone friendly, boring where possible.

## Recommended stack
| Layer | Choice | Why |
|-------|--------|-----|
| App shell | **PWA** (React + Vite, or SvelteKit) | One codebase, installable, no app-store review, instant updates |
| Optional native wrapper | Capacitor | Gives a proper in-app browser for SARIS, push, store presence later |
| Styling | CSS variables + Tailwind (or plain CSS modules) | Token-driven theming |
| Offline storage | IndexedDB via Dexie | Structured, queryable, large quota |
| Caching | Service worker via Workbox | Precache shell, runtime cache bundles |
| Backend | **Supabase** (Postgres, Auth, RLS, Edge Functions) | Free tier, SQL, row-level security |
| Static hosting | Cloudflare Pages or GitHub Pages | Free CDN for JSON bundles and the app |
| Scheduled jobs | GitHub Actions cron | Free batch export, no server |
| Maps | MapLibre GL with a small self-hosted campus tile set / GeoJSON | Offline, no API key |
| AI (cloud) | OpenRouter `:free` models behind an Edge Function | See 06 |
| AI (on-device) | WebLLM (WebGPU) or Transformers.js for small tasks | Offline and private, device permitting |
| Study scheduling | SM-2 style algorithm, plain TypeScript | No AI needed |
| Notifications | Local notifications first; web push later | Works without a server |
| Error tracking | Sentry free tier | Crash visibility |
| Analytics | Privacy-friendly, minimal (self-hosted or Plausible-style) | Fewer permissions, less data |

## The SARIS button
- In a **PWA**, open SARIS in a new tab or system browser. Embedding it in an iframe will usually be blocked by the site's framing headers.
- In **Capacitor**, use the in-app browser plugin for a webview-like experience.
- Yuni never reads, stores or proxies SARIS credentials or pages.

## Language and tooling
- TypeScript everywhere (app, Edge Functions, scripts)
- Zod for runtime validation of API payloads and AI outputs
- Vitest (unit), Playwright (end-to-end), ESLint + Prettier
- Supabase CLI for migrations, so schema lives in git

## Alternatives considered
| Option | Why not (for now) |
|--------|-------------------|
| Flutter / React Native | Better native feel, but slower solo iteration and store friction; revisit if PWA limits bite |
| Firebase | Great offline sync, but NoSQL and rules are harder to reason about for roles and voting |
| Self-hosted backend | Operational burden for one person |
| Cloud-only AI | Rate limits and privacy; hybrid is more robust |

## PWA limitations to know
- iOS push and background sync are more limited than Android
- On-device LLMs need WebGPU, which is patchy on cheap phones, so treat as optional
- Storage can be evicted under pressure, so keep a "re-download pack" path

## Decision log
Keep a short `DECISIONS.md` (one paragraph per choice: context, decision, consequences) so future you remembers why.
