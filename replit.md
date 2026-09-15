# Med Study Tracker

Pulse is a mobile study companion for medical students that turns rotations and lectures into realistic study windows and tracks Step 2 topic progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/med-study-tracker/app/(tabs)/index.tsx` — home dashboard with today’s suggested block and study summary
- `artifacts/med-study-tracker/app/(tabs)/schedule.tsx` — weekly commitments and recovery-aware study planning
- `artifacts/med-study-tracker/app/(tabs)/progress.tsx` — Step 2 topic coverage and one-tap study logging
- `artifacts/med-study-tracker/context/StudyContext.tsx` — schedule engine, progress state, and AsyncStorage persistence
- `artifacts/med-study-tracker/constants/colors.ts` — Pulse color tokens

## Architecture decisions

- The first build is frontend-only and stores the user’s study progress locally with AsyncStorage.
- The schedule engine keeps fixed clinical commitments first and only suggests a study block when the day is not overloaded.
- The weakest topic by completion ratio is automatically selected as the next suggested focus.

## Product

- Home: weekly coverage, today’s study recommendation, Step 2 countdown, and topic pulse.
- Schedule: day-by-day commitments, recovery days for long shifts, and tappable completion states.
- Progress: topic-level coverage with one-tap 30-minute logging and persistent totals.

## User preferences

No saved preferences yet.

## Gotchas

- The Expo preview workflow owns the mobile dev server; restart it only for dependency or Metro changes.
- Study state is local to the device and is not synced across devices in this first build.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
