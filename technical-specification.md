# Technical Specification — Creative Challenges Platform

> Describes the current technical implementation: stack, architecture, data model, auth/security model, and conventions. Written so an AI or engineer picking up this repo cold can orient quickly and extend it safely. Companion to [ui-specification.md](./ui-specification.md) (UI/UX layer) and [improvements.md](./improvements.md) (change log / backlog).

---

## 1. Stack & Versions

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js | `16.2.6` | App Router, **Turbopack is mandatory** (no webpack fallback in this version) |
| UI runtime | React | `19.2.4` | Uses `useActionState`, `useTransition`, `use()` for unwrapping async params |
| Language | TypeScript | `^5` | `strict: true` |
| Styling | Tailwind CSS | `^4` | via `@tailwindcss/postcss`, no `tailwind.config.*` file (v4 CSS-first config) |
| Backend/DB | Supabase (Postgres) | `@supabase/supabase-js ^2.105.4`, `@supabase/ssr ^0.10.3` | Auth, Storage, and Postgres all via Supabase |
| Toasts | `react-hot-toast` | `^2.6.0` | Client-side feedback only (see [ui-specification.md](./ui-specification.md#2-global-design-system-as-implemented-not-formalized)) |
| Icons | `lucide-react` | `^1.14.0` | |

**Package scripts:** `npm run dev` (Turbopack dev server), `npm run build`, `npm run start`, `npm run lint`.

### ⚠️ This is not the Next.js you know
Per [AGENTS.md](./AGENTS.md), this project pins a Next.js version with breaking changes from the training-data-era Next.js. Two load-bearing differences discovered while building this app:

1. **`middleware.ts` → `proxy.ts`.** Route-level request interception is now a file named `proxy.ts` exporting `export async function proxy(request: NextRequest)`, not `middleware.ts`/`export function middleware`. Same `config.matcher` export convention.
2. **Async `params`.** Dynamic route segments are `Promise`s: `params: Promise<{ slug: string }>`, and must be awaited (`const { slug } = await params` in server components) or unwrapped with React's `use()` in client components (see `app/events/[slug]/apply/page.tsx`).

Before assuming any Next.js API behaves like pre-16 Next.js, check `node_modules/next/dist/docs/` first — this has already caused at least one real bug in this codebase's history (fetch-caching and route-manifest assumptions did not hold).

---

## 2. Project Structure

```
proxy.ts                          # Route-level auth guard (see §4)
app/
  layout.tsx                      # Root layout — fonts, <Toaster>, footer credit
  page.tsx                        # Homepage
  not-found.tsx                   # Custom 404
  login/page.tsx                  # Admin sign-in (public route, outside /admin)
  leaderboard/page.tsx            # Index of all events → per-event leaderboards
  register-for-future-events/page.tsx
  events/[slug]/
    page.tsx                      # Event detail + generateMetadata
    leaderboard/page.tsx          # Event-scoped leaderboard + generateMetadata
    apply/page.tsx                # Application form
    apply/status/page.tsx         # Applicant-facing status lookup
  admin/
    layout.tsx                    # Session gate + AdminNav shell
    AdminNav.tsx                  # Desktop sidebar + mobile drawer (client)
    page.tsx                      # Dashboard (stat tiles + first-run onboarding checklist)
    events/page.tsx               # Event list (server, fetches + delegates to AdminEventsList)
    events/AdminEventsList.tsx    # Search/filter + list rendering (client)
    events/new/page.tsx           # Create event
    events/[id]/
      page.tsx                   # Edit event + contestant list + Danger Zone + "View live page"
      EventEditForm.tsx           # Client form (useActionState)
      DeleteEventButton.tsx       # Trigger + ConfirmDialog (client)
      DeleteContestantButton.tsx  # Trigger + ConfirmDialog (client)
      contestants/new/page.tsx    # Add contestant (image upload/URL, ColorSwatchPicker)
      contestants/[contestantId]/page.tsx  # Edit contestant (client-fetched data, ColorSwatchPicker)
    applications/page.tsx         # All applications (server, fetches + delegates to AdminApplicationsList)
    applications/AdminApplicationsList.tsx # Search/filter (name/email, status, event) + list rendering (client)
    applications/ApplicationActions.tsx    # Approve/reject buttons (client)
  actions/                        # 'use server' Server Functions — see §5
    auth.ts
    events.ts
    contestants.ts
    applications.ts
    votes.ts
src/
  lib/
    supabase-server.ts            # createServerClient — server components & Server Functions
    supabase-browser.ts           # createBrowserClient — client components
    supabase.ts                   # Legacy re-export (== supabase-browser), kept for back-compat
    color-utils.ts                # getDefaultStyles(), getLeaderboardStyle(), COLOR_PALETTE — color-name → Tailwind class lookup
    user.ts                       # getUserId() — anonymous voter identity (localStorage)
    helper.ts                     # capitalize()
  components/
    ContestantCard.tsx            # Vote button, lightbox/zoom viewer (client)
    EventVotingSection.tsx        # Wraps grid: already-voted banner + empty state (client)
    EventRegistrationModal.tsx    # "Join future events" modal (client)
    ConfirmDialog.tsx             # Shared destructive-action confirm modal (client)
    ColorSwatchPicker.tsx         # Curated-palette color picker w/ "Custom" raw-class fallback (client)
    countdown.tsx                 # Live countdown to voting_ends_at (client)
public/images/entries/            # Legacy static contestant images (pre-multi-event; still referenced by seeded Colour Challenge data)
```

---

## 3. Data Model

Source of truth: the **live Supabase schema**, captured in [database.md](./database.md) — treat that file as authoritative over any Postgres DDL that might exist elsewhere, since it was pulled directly from the running database. `README.md` also documents an aspirational/aggregated schema; where the two disagree, `database.md` wins (this has bitten the project once already — see §8).

### Tables

**`events`**
`id` (uuid, PK) · `title` · `slug` (unique) · `description` · `cover_image` · `type` · `theme` · `status` (`draft`/`active`/`completed`) · `is_featured` (bool) · `starts_at` / `ends_at` · `voting_starts_at` / `voting_ends_at` · `max_votes_per_user` (int, default 1) · `allow_public_voting` (bool) · `require_registration` (bool, unused by app code) · `winner_announced` (bool, unused by app code) · `created_by` (text, stores admin email) · `created_at` / `updated_at`.

⚠️ `type` is **NOT NULL** at the DB level (not shown as nullable in `database.md`) even though the create-event form treats it as optional — always pass a non-null value when inserting programmatically (see §8).

**`contestants`**
`id` (uuid, PK) · `name` · `bio` · `color` (free text, e.g. `"red"`) · `tagline` · `description` · `options` (`_text` — legacy array column, superseded by `contestant_images`, still read as a fallback) · `event_id` (uuid, FK → `events.id`) · `application_id` (uuid, FK → `event_applications.id`, nullable — set when a contestant originates from an approved application) · `gradient` (text — literal Tailwind gradient utility classes, e.g. `"from-red-700 to-rose-500"`) · `text_color` (text — literal Tailwind class, e.g. `"text-white"`). Both are still raw class strings at the DB level; `ColorSwatchPicker` (client) is a UI-layer convenience over `color-utils.ts`'s curated palette that writes these same columns — it does not change the schema or add a separate "curated vs custom" flag.

⚠️ **No `created_at` column.** A query ordering by `contestants.created_at` will throw Postgres error `42703` — this exact bug caused contestants to silently disappear from the admin UI earlier in this project's history (the error was swallowed and the page rendered its "no contestants" empty state instead of surfacing the failure). Order by `id` or another real column if ordering is needed.

**`contestant_images`**
`id` (uuid, PK) · `contestant_id` (uuid, FK → `contestants.id`) · `image_url` (text — either a Supabase Storage public URL or an arbitrary external URL) · `sort_order` (int) · `created_at`.

**`votes`**
`id` (uuid, PK) · `contestant_id` (uuid) · `contestant_name` / `contestant_color` (text — **denormalized snapshot** taken at vote time, not a live join) · `event_id` (uuid) · `user_id` (text — the anonymous localStorage-generated id, see §6) · `ip_address` / `user_agent` (text, captured server-side at vote time) · `created_at`.
Has a **unique constraint on `(event_id, user_id)`** (named `unique_vote_per_event` in the live DB) enforcing one vote per user per event at the database level, in addition to the application-level check in `castVote`.

**`event_applications`**
`id` (uuid, PK) · `event_id` (uuid, FK → `events.id`) · `full_name` · `email` · `phone` · `instagram` · `portfolio_url` · `bio` · `status` (`pending`/`approved`/`rejected`) · `reviewed_at` · `reviewed_by` (text, admin email) · `created_at`.

**`future_event_registrations`**
`id` (uuid, PK) · `full_name` · `email` (**unique** — violating this returns Postgres error `23505`, handled explicitly in both submission call sites) · `phone` · `interests` · `user_id` (text, same anonymous id as `votes`) · `created_at`.

**`settings`**
`id` (text, PK) · `voting_end` (timestamptz). Present in the schema but **not read or written anywhere in the current app code** — likely a leftover from a pre-multi-event single-challenge design (global voting deadline), superseded by per-event `voting_ends_at`.

### Relationships
```
events 1──* contestants 1──* contestant_images
events 1──* votes            (contestants 1──* votes, denormalized — no FK enforced join in queries)
events 1──* event_applications 1──0/1── contestants  (application_id on contestants, nullable)
(future_event_registrations and settings are not tied to events)
```

### Row Level Security
Not yet confirmed as configured in this environment — see [improvements.md](./improvements.md) for outstanding RLS policy work (public `SELECT` on `events`/`contestants`/`contestant_images`, admin-only writes; public `INSERT` + admin-only `SELECT`/`UPDATE` on `event_applications`; public `INSERT`/`SELECT` on `votes`). Until RLS is verified enabled in the Supabase dashboard, do not assume the tables are protected from direct anon-key access.

---

## 4. Auth & Security Model

Three independent layers, each of which must be maintained if admin routes or mutations change:

1. **`proxy.ts` (request-level).** Refreshes the Supabase session cookie on every matched request and redirects unauthenticated requests to `/admin/*` (excluding `/login`) to `/login`. Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and common image extensions.
2. **`app/admin/layout.tsx` (render-level).** Calls `getSession()` (wraps `supabase.auth.getUser()`) and `redirect('/login')` server-side if there's no user. This is what actually prevents the admin UI from rendering — the proxy-level redirect is a defense-in-depth/perf optimization, not the sole gate.
3. **Every Server Function in `app/actions/*.ts` that mutates data independently calls `getSession()`** and returns/throws `Unauthorized` if there's no user. This is deliberate and non-negotiable: Server Functions are directly callable HTTP endpoints regardless of which page rendered the trigger, so layout-level protection alone does not secure them. `submitApplication`, `checkApplicationStatus`, `getMyVote`, and `castVote` are the intentional exceptions — they're public-by-design (an applicant/voter is never authenticated), covering both public writes and the public reads that support them (status lookup, already-voted lookup).

**Auth provider:** Supabase Auth, email/password only (`supabase.auth.signInWithPassword`). No signup flow exists in the app — admin users must be created directly in the Supabase dashboard (Authentication → Users). No roles/permissions system; any authenticated Supabase user is treated as a full admin.

**Login flow:** `app/login/page.tsx` → `loginAction` (`app/actions/auth.ts`) → `redirect('/admin')` on success, unconditionally (no return-to-intended-page support). `logoutAction` calls `supabase.auth.signOut()` then `redirect('/login')`.

---

## 5. Server Functions Catalog (`app/actions/*.ts`)

All files start with `'use server'`. Convention: functions used by `useActionState`-driven forms take `(_prevState, formData: FormData)` and return `{ error: string | null }` (optionally `+ success: boolean`); functions called imperatively from `useTransition` (delete, vote, approve/reject) take typed positional args and either `return` a result object or `throw` on failure.

| File | Function | Auth required | Side effects |
|---|---|---|---|
| `auth.ts` | `getSession()` | — | Reads current Supabase user (used everywhere as the auth check) |
| | `loginAction` | — | `signInWithPassword`, redirects to `/admin` |
| | `logoutAction` | — | `signOut`, redirects to `/login` |
| `events.ts` | `createEvent` | ✅ | Inserts `events` row, `revalidatePath('/admin/events')` + `('/')`, redirects to the new event's admin page |
| | `updateEvent` | ✅ | Updates `events` row, revalidates admin events list + detail + homepage |
| | `deleteEvent` | ✅ | Deletes `events` row (cascades to `contestants`/`votes`/`event_applications` at the DB level, presumed FK `ON DELETE CASCADE` — verify in Supabase if adding new child tables), revalidates + redirects to `/admin/events` |
| `contestants.ts` | `createContestant` | ✅ | Inserts `contestants` row, bulk-inserts `contestant_images` from `image_urls[]` form field, revalidates event detail page |
| | `updateContestant` | ✅ | Updates `contestants` row, revalidates event + contestant detail |
| | `deleteContestant` | ✅ | Looks up `contestant_images`, extracts storage paths via regex on `image_url`, calls `storage.remove()`, deletes `contestant_images` rows, then the `contestants` row |
| | `addContestantImage` | ✅ | Inserts one `contestant_images` row, **returns `{ id }`** (the real inserted row id — the client uses this instead of a throwaway UUID so the image can be immediately reordered/removed without a page reload), revalidates contestant detail page |
| | `removeContestantImage` | ✅ | Deletes the storage object (if the URL matches the storage path pattern) + the `contestant_images` row |
| | `reorderContestantImage` | ✅ | Fetches all of a contestant's images ordered by `sort_order`, finds the target and its `up`/`down` neighbor, swaps their `sort_order` values (two updates) |
| `applications.ts` | `submitApplication` | ❌ (public) | Resolves `event_id` from a `slug` form field server-side, inserts `event_applications`, maps unique-violation (`23505`) to a friendly "already applied" message |
| | `checkApplicationStatus` | ❌ (public) | Read-only: resolves `event_id` from `slug`, looks up `event_applications` by `event_id` + `email` (`maybeSingle()`), returns `{ status, submittedAt }` or an error if not found. Powers `/events/[slug]/apply/status` |
| | `updateApplicationStatus` | ✅ | Updates `event_applications.status` + `reviewed_at`/`reviewed_by`; **on `approved`, also inserts a new `contestants` row** linked via `application_id` (this is the only place a contestant is created outside the admin "Add Contestant" form) |
| `votes.ts` | `getMyVote` | ❌ (public) | Read-only lookup: given `eventId` + the anonymous `userId`, returns the voted `contestant_id` or `null`. Powers the persistent "already voted" banner |
| | `castVote` | ❌ (public) | Application-level duplicate check (`event_id` + `user_id`) before insert (backed by the DB's `unique_vote_per_event` constraint as a second line of defense), captures `x-forwarded-for` and `user-agent` from `headers()`, inserts a **denormalized** vote row (name/color snapshotted, not joined later) |

**Storage path extraction pattern** (used in `deleteContestant` and `removeContestantImage`): `image_url.match(/contestant-images\/(.+)$/)`. This assumes the URL contains the literal substring `contestant-images/` followed by the storage object path — true for Supabase Storage public URLs, but means **externally-pasted image URLs that happen to contain that substring would be misinterpreted**, and URLs that don't match simply skip storage cleanup silently (safe failure mode, but worth knowing).

---

## 6. Anonymous Identity & Voting Mechanics

There is no auth for voters/applicants. The only identity is `getUserId()` (`src/lib/user.ts`): generates a `crypto.randomUUID()` on first call and persists it in `localStorage` under the key `user_id`, reusing it on subsequent calls. This id is the sole key for:
- One-vote-per-event enforcement (`votes.user_id` + the `unique_vote_per_event` DB constraint)
- The "already voted" lookup (`getMyVote`)

Note: duplicate-registration prevention on `future_event_registrations` is actually keyed by **email** (unique constraint), not `user_id` — `user_id` is stored on that table but isn't what the uniqueness check targets.

**Consequences:** clearing browser storage, using a different browser, or using a different device resets a user's voting eligibility entirely — there is no server-side identity to fall back on. IP address and user agent are captured on every vote (`castVote`) but are **not currently used** for any additional duplicate-prevention logic — they're stored for potential future fraud analysis only.

**Vote flow:** `ContestantCard` (client) → `useTransition` wraps `castVote(...)` → on success, `toast.success`, sets local `voted` state, opens `EventRegistrationModal`. `EventVotingSection` (parent wrapper, client) independently calls `getMyVote` on mount to pre-seed `initiallyVoted` on the matching card and render a persistent "You voted for X" banner — this is a **separate, uncoordinated read** from the mutation path (i.e., voting doesn't push into the banner's state in the same render pass; the banner becomes accurate on next navigation/reload via the mount-time lookup, while the button's own "Voted" state updates immediately via local component state).

---

## 7. Image Handling

Two supported sources, both stored identically as a URL string in `contestant_images.image_url` / `events.cover_image`:
1. **Supabase Storage upload** — client-side (`supabase-browser` client) uploads directly to bucket `contestant-images` under a `${eventId}/${crypto.randomUUID()}.${ext}` path, then reads `getPublicUrl()` and submits that URL. Upload happens *before* form submission (admin picks file → immediate upload → URL added to a client-side list → submitted with the rest of the form).
2. **External URL paste** — e.g. Unsplash. `next.config.ts` `images.remotePatterns` currently allow-lists `**.supabase.co` and `images.unsplash.com`; **any other external host will fail Next.js Image Optimization** (`next/image` throws for un-allow-listed hosts) — contestant thumbnails in `ContestantCard` use `next/image`, but admin list/grid thumbnails use plain `<img>` (not subject to the allow-list, but also not optimized).

If you add support for another external image host (e.g. a different stock-photo provider), you must add it to `next.config.ts`'s `remotePatterns` or `next/image` usages will throw at request time, not silently degrade.

---

## 8. Known Technical Debt / Gotchas (fix history)

These are documented here because they were each a real, non-obvious bug hit during development — future changes touching the same areas should check for regressions:

1. **Duplicate FK constraints.** `contestant_images` briefly had two foreign keys to `contestants.id` (`contestant_images_contestant_id_fkey` and a redundant `fk_contestant`). PostgREST cannot disambiguate an embedded select (`select('*, contestant_images(*)')`) when more than one relationship exists between the same two tables — it errors, and because the app code did `const { data } = await supabase...` without checking `error`, the failure was silent and rendered as an empty-state UI rather than a visible bug. **If a "no data" bug appears despite data existing in the DB, check for `{ error }` being silently dropped, and check for duplicate FKs.**
2. **`contestants.order('created_at', ...)`.** The table has no `created_at` column (see §3) — this exact call appeared in both the admin event-detail page and the public event page and caused the same silent-empty-state failure as #1, compounding it. Both call sites were fixed to drop the ordering.
3. **`events.type` is NOT NULL** at the DB level despite the create-event form treating it as optional text input. Any programmatic insert (migrations, seed scripts) must supply a non-null value.
4. **Stale `votes.contestant_id` after a contestant re-seed.** When contestants were recreated (new UUIDs) during the multi-event migration, existing `votes.contestant_id` values still pointed at the old, now-deleted contestant rows, silently zeroing out all vote counts (the join/lookup by id simply found nothing). Fixed via a one-time SQL backfill matching votes to current contestants by `color` within the same `event_id`. **Any future contestant bulk-replace/reseed must re-link existing votes by a stable attribute (color/name), not assume ids are stable.**
5. **Duplicate `NEXT_PUBLIC_SUPABASE_*` keys in `.env`.** The `.env` file has had duplicate `NEXT_PUBLIC_SUPABASE_URL` lines and both an unused `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the actually-used `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. dotenv-style loaders keep the **last** occurrence of a duplicate key, so this happens to resolve correctly today, but it's fragile — clean up `.env` if touching it, and always reference `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the name every `src/lib/supabase-*.ts` file actually imports), not `ANON_KEY`.
6. **Next.js 16 Turbopack `next start` incompatibility observed during this project:** production builds (`next build`) succeeded, but `next start` intermittently threw "Invariant: The client reference manifest does not exist" for some routes in this environment. Not resolved — treat as a known risk when moving from `next dev` to a production deploy target, and verify a real `next build && next start` cycle (or the actual deploy platform's build) before shipping, not just `next dev`.
7. **Multiple lockfiles warning.** Next.js Turbopack detects lockfiles both in this project directory and a parent directory and guesses the workspace root, emitting a warning on every dev server start. Harmless currently, but could misresolve module resolution in edge cases — consider setting `turbopack.root` explicitly in `next.config.ts` if this becomes a real problem, or removing the stray parent lockfile if it's not intentional.

---

## 9. Conventions for Extending This App

- **New event field:** add the column in Supabase, add the form field to *both* `app/admin/events/new/page.tsx` and `EventEditForm.tsx` (they currently duplicate the field set rather than sharing a component — see [ui-specification.md §4.14](./ui-specification.md)), thread it through `createEvent`/`updateEvent` in `app/actions/events.ts`, and `revalidatePath` any page that reads it.
- **New admin mutation:** always start with `const user = await getSession(); if (!user) return/throw ...` — do not rely on the layout guard alone (§4).
- **New public mutation:** decide explicitly whether it's meant to be unauthenticated (like `castVote`/`submitApplication`) — there's no default-deny at the Server Function layer, only what you write.
- **New contestant/event image source:** update `next.config.ts` `images.remotePatterns` for any new external host used with `next/image`.
- **Changing the anonymous identity model** (§6): every read (`getMyVote`) and write (`castVote`, `future_event_registrations` insert) that keys off `getUserId()` would need to move together — they're not centralized behind one interface today.
- **Adding RLS policies:** do this in the Supabase dashboard/SQL editor directly; nothing in this codebase manages migrations or policy-as-code — `database.md` should be manually refreshed after any schema change since it's a point-in-time export, not a live source.

---

## 10. Related Documents

- [ui-specification.md](./ui-specification.md) — screen-by-screen UI/UX audit, design system inconsistencies, suggested structural improvements.
- [improvements.md](./improvements.md) — running changelog of implemented fixes (V1, V2, ...).
- [database.md](./database.md) — point-in-time export of the live Supabase schema (authoritative over `README.md`'s schema section when they disagree).
- [README.md](./README.md) — project overview, setup instructions, feature list (some of it aspirational/future-facing rather than current-state — cross-check against this document and the actual code before trusting a claim in the README).
