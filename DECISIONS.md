# Decisions

> One paragraph per choice: context, decision, consequences.

## 2026-10-02: PWA over native

**Context:** Needed to choose between PWA, React Native, or Flutter. Solo builder, free tiers, targeting low-end Android.

**Decision:** Start with PWA (React + Vite). Add Capacitor later only if the SARIS in-app browser or push notifications require it.

**Consequences:** One codebase, no app-store review friction, instant updates. iOS push and background sync are limited. On-device LLMs need WebGPU which is patchy on cheap phones.

## 2026-10-02: Vanilla CSS with token system

**Context:** The brand suite already ships with a complete token and component CSS system. Could add Tailwind, CSS Modules, or styled-components on top.

**Decision:** Use the existing vanilla CSS token system (`tokens.css` + `components.css`). No additional CSS framework.

**Consequences:** Zero extra build tooling for styles. Direct 1:1 mapping with the brand suite. Trade-off: need discipline to not hardcode hex values.

## 2026-10-02: Dexie for offline storage

**Context:** Needed a queryable, structured offline storage solution. Options: Dexie, localForage, idb, raw IndexedDB.

**Decision:** Dexie — structured, queryable, good React hooks (`dexie-react-hooks`), large quota.

**Consequences:** Good DX, auto-versioned schema. Adds ~15KB to bundle. Storage can be evicted under pressure, so keep a re-download path.

## 2026-10-02: Route Cloud AI to NVIDIA Nemotron models

**Context:** Cloud AI requests on OpenRouter free tier are constrained by daily allowances. We needed a model family with generous context windows, high reasoning capability for medical/health sciences curricula, fast latency, and zero token costs on the `:free` tier.

**Decision:** Route all Cloud AI requests (AI Tutor, Flashcard generation, Agent nudges) to NVIDIA Nemotron models, prioritizing `nvidia/nemotron-3.5-lightning:free` (1,000,000 token context window, free tier) with automatic fallback across `nvidia/nemotron-3-super-120b-a12b:free` and `nvidia/nemotron-3-ultra-550b-a55b:free`. Support optional BYOK (Bring Your Own Key) in client storage.

**Consequences:** Huge context capacity (1M tokens) enables ingesting large lecture notes, past exams, or complex clinical cases without truncation. 1,000 daily free requests on the account tier ensure sustainable student usage without per-token charges. Model fallback chain ensures high uptime if an individual provider endpoint is queued.

