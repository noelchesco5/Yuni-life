# Yuni Life

> The offline-first student app for MUHAS.

## Quick start

```bash
npm install
npm run dev
```

## Project structure

```
src/
├── components/
│   ├── layout/      App shell, bottom nav, top bar
│   └── ui/          Reusable UI components
├── context/         React contexts (theme, auth)
├── hooks/           Custom hooks
├── lib/             Utilities (database, SM-2, sync)
├── pages/           Tab pages (Home, Study, Map, Feed, Me)
└── styles/          Design system (tokens, components, layout)

yuni-suite/          Brand suite, design system source, spec docs
```

## Design system

Never hardcode hex values. Use CSS custom properties from `src/styles/tokens.css`.

## Key principles

1. **Offline first.** If it needs data to open, it's broken.
2. **Layer, don't replace.** SARIS stays the source of truth.
3. **Cheap by design.** Everything runs on free tiers.
4. **Agent proposes, human approves.** No changes without a tap.
5. **Three roles, least privilege.** Student, leader, admin.
6. **No patient data. Ever.**

## Stack

- React + Vite + TypeScript (PWA)
- Supabase (Postgres + RLS + Auth + Edge Functions)
- Dexie (IndexedDB for offline)
- Workbox (service worker)
- MapLibre GL (campus map)
- OpenRouter `:free` (AI via Edge Function)
