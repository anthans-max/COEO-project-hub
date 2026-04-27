# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

- `npm run dev` — start Next.js dev server on port 3000
- `npm run build` — production build (also runs TypeScript validation via Next's compiler)
- `npm run lint` — ESLint via `next lint`
- `npx tsc --noEmit` — fast, standalone type check (faster than a full build when verifying changes)

There is no test runner configured in `package.json`.

## Environment

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project credentials, used by both the browser and server clients. Listed in `.env.example`.
- `NEXT_PUBLIC_APP_URL` — listed in `.env.example`.
- `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` — consumed by `src/middleware.ts` to gate the entire app behind HTTP Basic Auth. Not in `.env.example`; set directly in the deployment environment (e.g. Vercel project settings) and in `.env.local` for local development.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only. Used by `src/app/api/projects/[id]/docs/signed-url/route.ts` to mint short-lived signed URLs for the private `project-docs` storage bucket. Not in `.env.example`; set in the deployment environment and `.env.local`.

## Architecture

### Stack
Next.js 14 App Router + TypeScript + Tailwind + Supabase (via `@supabase/ssr`). Runs as one app with realtime reads against Supabase from the client and SSR queries from server components.

### Server vs. browser Supabase clients
Two clients with the same name but different purposes — pick based on where the code runs:
- `@/lib/supabase/server` — `async createClient()` for server components and route handlers. Reads cookies via `next/headers`.
- `@/lib/supabase/browser` — `createClient()` for client components. Used inside `"use client"` files for mutations and the realtime subscription.

### Page → list → dialog pattern
Most pages follow a consistent three-layer shape:
1. **Server component page** (e.g. `src/app/actions/page.tsx`, `src/app/projects/[id]/page.tsx`) fetches all needed data in a single `Promise.all` from Supabase and passes it as props.
2. **Client list component** (e.g. `src/components/actions/actions-list.tsx`) owns filters, local state, and subscribes to realtime updates via `useRealtime`. It performs optimistic mutations then writes through to Supabase from the browser client.
3. **Add/Edit dialog components** receive lookup data (projects, people) as props from the list and do their own Supabase insert/update on submit.

When adding a new field to a dialog that depends on another table (like the `people` dropdown on action dialogs), thread the data from the **page** → **list** → **dialog** rather than fetching inside the dialog. Look for the existing `ProjectOption` / `PersonOption` interfaces in the action components for the canonical shape.

### Realtime sync
`src/lib/hooks/use-realtime.ts` is the shared hook every list uses to stay in sync with Supabase. It:
- Seeds from a server-rendered `initialData` array, then resets when that array changes.
- Subscribes to all `INSERT` / `UPDATE` / `DELETE` on the given table and reconciles by `id`.
- Deduplicates inserts that raced with an optimistic update.

Any new list component backed by a Supabase table should use `useRealtime<T>` rather than rolling its own subscription.

### Data model
All application tables are prefixed `coeo_` to avoid collisions with other apps in the same Supabase project. Schema changes land as numbered migrations in `supabase/migrations/`; consult that directory for the current shape rather than relying on a list here. The canonical TypeScript interfaces live in `src/lib/types.ts` — read it directly for the up-to-date set (covers projects/milestones/actions, the project workspace, PMO tracker, program views, decisions, architecture layers, AI capabilities, etc.).

Note the convention: interface field names match column names exactly (snake_case), which lets `setForm`-style generic state setters work across fields. Joined/computed fields (e.g. `Action.project_name`) are marked optional.

Status/priority string enums are centralized in `src/lib/constants.ts` and matched by DB `check` constraints — update both sides together when a value changes.

### File uploads / Storage
The `project-docs` Supabase Storage bucket is private. Browser writes (upload, update, delete) go directly via the anon key — RLS policies on `storage.objects` allow those scoped to `bucket_id = 'project-docs'`. There is no anon `select` policy; reads happen only through the signed-URL route handler at `src/app/api/projects/[id]/docs/signed-url/route.ts`, which uses `SUPABASE_SERVICE_ROLE_KEY` to mint a 60-second signed URL after a path-traversal check. Mirror this pattern (anon writes + service-role-signed reads) for any future private bucket.

### Auth
HTTP Basic Auth at the edge via `src/middleware.ts`. Note the comment: middleware **must** live at `src/middleware.ts` (not `middleware.ts` at repo root) because this project uses the `src/` directory — Next only auto-detects it there. The matcher skips `_next` and static assets; all app routes require credentials.

There is currently no per-user Supabase auth; everyone who passes Basic Auth shares the anon key.

### Styling
Tailwind with a custom theme defined in `tailwind.config.ts`. Brand colors, status-badge palette, and border-radius tokens (`rounded-card`, `rounded-pill`) are defined there — prefer the tokens over hardcoded hex values. The `STATUS_BADGE_MAP` in `constants.ts` maps status strings to badge variants so status coloring stays consistent everywhere.

Reusable primitives (badges, dialogs, dropdowns, etc.) live in `src/components/ui/` — prefer them over hand-rolled markup so styling and behavior stay consistent across pages.

### Design reference
`design-reference/` contains the PRD and HTML mockups that seeded this project. When building new views or wiring up seed data, treat these as the source of truth for copy, layout, and intended project names rather than inventing your own.
