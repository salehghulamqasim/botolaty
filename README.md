# بطولتي — Botolaty

**Bilingual Tournament Bracket Manager** — Create, manage, and share knockout tournament brackets in both English and Arabic.

![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-12%20passed-brightgreen)

## Features

- 🌙 **Dark theme** — Athletic deep navy (`#0b1326`) with emerald green accents
- 🌐 **Bilingual** — Full English + Arabic with RTL mirroring and Cairo font
- 🎮 **Bracket generation** — Fisher-Yates shuffle with seeded deterministic mode
- 📊 **Standings table** — Auto-calculated W/D/L/Pts from match results
- 📱 **Mobile-first** — Full mobile responsiveness with bottom nav
- 🔒 **Firebase-ready** — Plugs into Firestore with graceful localStorage fallback
- 👁️ **Admin/Spectator modes** — Read-only spectator view for public sharing
- 🧪 **12 tests passing** — Zod validation + Vitest unit tests

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:3000
npm test         # 12 tests
npm run build    # Production build
```

## Architecture

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── bracket/      # BracketTree, MatchCard, RoundColumn
│   ├── dashboard/    # TournamentCreator
│   ├── layout/       # Navbar, Footer, MobileNav
│   ├── shared/       # LanguageToggle, AdminToggle, VisibilityToggle
│   └── standings/    # StandingsTable, RecentResults
├── i18n/             # English + Arabic translations
├── lib/              # bracketEngine (Fisher-Yates), tournamentStore (Zustand)
├── types/            # TypeScript domain types
├── validators/       # Zod schemas
└── __tests__/        # Vitest test suite
```

## Firebase (Optional)

Copy `.env.local.example` → `.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

Without Firebase, the app runs fully on Zustand + localStorage (no setup needed).

## License

MIT — built by [@salehghulamqasim](https://github.com/salehghulamqasim)
