# UI Specification — Creative Challenges Platform

> Generated from the current codebase (Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase).
> This document describes the **current state** of the UI only — it is not a design spec to build toward. It is meant to be handed to an AI (or designer) to analyze and propose structural UI/UX improvements.

---

## 1. Product Summary

The app is a multi-event "creative challenge" voting platform. A visitor browses live/completed challenge **events** (e.g. "Colour Challenge"), views **contestants** within an event, votes once per event, and can optionally register interest in future events. Prospective contestants can **apply** to compete in an event. A separate **admin** area (Supabase-Auth-gated) lets an operator create events, manage contestants/images, review applications, and see vote tallies.

Three user roles interact with the UI:

1. **Anonymous voter/visitor** — public routes, no login.
2. **Prospective contestant/applicant** — public routes, submits a form.
3. **Admin** — authenticated, manages everything under `/admin`.

---

## 2. Global Design System (as implemented, not formalized)

- **Theme:** Dark only. Base background `bg-black`, panel surfaces `bg-white/5` with `border border-white/10`, rounded-2xl/3xl corners throughout.
- **Typography:** Default system/Geist sans font. Headings are bold/black weight, large sizes (`text-4xl` to `text-6xl` on hero sections). No distinct type scale is documented — sizes are chosen ad hoc per page.
- **Color accents:** Inconsistent across pages —
  - Homepage hero uses fuchsia → blue → amber gradient text.
  - Register-for-future-events page uses pink → fuchsia → purple gradient hero, different glow color/position than homepage.
  - Contestant cards use **per-contestant** gradients stored in the DB (`gradient`, `text_color` columns), effectively arbitrary per event.
  - Admin UI uses plain white/gray, no accent gradients.
  - Status badges use semantic colors (green=active/approved, blue=completed, yellow=pending, gray=draft, red=rejected) but the exact shade/opacity combo is redefined locally in each file rather than shared.
- **Buttons:** Primary action is almost always a solid white pill/rounded-xl button with black text (`bg-white text-black`, `hover:scale-[1.02]`). Destructive actions are red-tinted outline/ghost buttons. No shared `<Button>` component exists — every page redefines button classes inline.
- **Cards:** `bg-white/5 border border-white/10 rounded-2xl` is the near-universal card treatment, reused for event cards, contestant list rows, application rows, stat tiles, forms.
- **Icons:** `lucide-react`, used inconsistently (some pages have icons on labels/buttons, others don't).
- **Feedback:** Toasts via `react-hot-toast` (`<Toaster position="top-center">` mounted in root layout) for success/error on client-driven actions (voting, registration). Server-rendered forms (`useActionState`) instead show an inline red/green banner above the form — a second, different feedback pattern.
- **Modals:** `DeleteContestantButton` and `DeleteEventButton` now both use a shared `ConfirmDialog` (V3 — see §9); `EventRegistrationModal` remains a separate, bespoke implementation with its own overlay/close/click-outside logic. No single shared `<Modal>` primitive covers all three yet.
- **Loading states:** Mostly implicit (Next.js server component suspense boundary / full page navigation). A couple of client components show inline "Loading contestant..." or "Uploading..." text. No skeleton screens or spinners as a system.
- **Responsiveness:** Grids collapse `sm:`/`md:`/`xl:` breakpoints on public pages. The admin area now has a `md:flex` desktop sidebar plus a `md:hidden` sticky top bar + slide-out drawer sharing the same nav links (fixed in V2 — see §9).

---

## 3. Site Map / Route Table

### Public routes

| Route                         | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `/`                           | Homepage — lists active/completed events as cards        |
| `/events/[slug]`              | Event detail — contestant grid, voting                   |
| `/events/[slug]/leaderboard`  | Event-scoped leaderboard (ranked vote counts)            |
| `/events/[slug]/apply`        | Application form to become a contestant in this event    |
| `/events/[slug]/apply/status` | Applicant-facing application status lookup (V3)           |
| `/leaderboard`                | Index of all events, links into each event's leaderboard |
| `/register-for-future-events` | Standalone "join our community" interest form            |
| `/login`                      | Admin sign-in (public route, not under `/admin`)         |
| `/not-found` (404)            | Custom not-found page                                    |

### Admin routes (all require session; layout-level + proxy-level + server-action-level auth)

| Route                                           | Purpose                                                                     |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `/admin`                                        | Dashboard — 4 stat tiles (events, contestants, votes, pending applications) |
| `/admin/events`                                 | List all events (any status) with create button                             |
| `/admin/events/new`                             | Create-event form (long, single column, all fields exposed)                 |
| `/admin/events/[id]`                            | Edit event form + contestant management list (add/delete)                   |
| `/admin/events/[id]/contestants/new`            | Add-contestant form with image upload/URL + gradient/text-color pickers     |
| `/admin/events/[id]/contestants/[contestantId]` | Edit-contestant form + image management                                     |
| `/admin/applications`                           | Flat list of all applications across all events, approve/reject inline      |

---

## 4. Screen-by-Screen Detail

### 4.1 Homepage (`/`)

**File:** `app/page.tsx`
**Server-rendered.** Fetches events (`status in [active, completed]`), plus aggregate counts (total contestants, total votes).

**Layout (top to bottom):**

1. Decorative background: three large blurred color blobs (fuchsia/blue/amber), fixed/absolute, no interaction.
2. Small pill badge: "✨ Vote. Compete. Win."
3. H1: "Creative **Challenges**" (gradient-text second word)
4. Subtext paragraph (2 lines, static copy)
5. Stat row (Events / Contestants / Votes cast) — only rendered if `contestantCount > 0`
6. **Either:**
   - Empty state card (icon + "No active events right now" + link to register page), or
   - Responsive grid (1/2/3 cols) of event cards: cover image (or trophy-icon placeholder), featured badge, title, description (2-line clamp), contestant count, start date, status pill. Whole card is a `<Link>` to `/events/[slug]`.
7. Bottom CTA block: "Not ready to vote yet?" → "Join Future Events →" link to `/register-for-future-events`.

**States:** empty (no events), populated. No loading/error state shown (server-rendered, so a DB error would currently surface as an unhandled exception / Next.js error boundary, not a designed empty/error state).

**Primary actions:** click an event card → event page; click "Join Future Events" → registration page.

---

### 4.2 Event Detail Page (`/events/[slug]`)

**File:** `app/events/[slug]/page.tsx`
**Server-rendered**, has `generateMetadata` (OG/SEO from event title/description/cover_image).

**Layout:**

1. H1: event title
2. Event description (optional)
3. Countdown block (optional, only if `voting_ends_at` set) — a small card wrapping a `<Countdown>` client component
4. "Voting Rules" card — **static, hardcoded copy**, identical on every event regardless of event configuration (does not reflect the event's actual `max_votes_per_user`, `allow_public_voting`, etc.)
5. `EventVotingSection` (client component) — wraps the contestant grid, plus (V2): a persistent "You voted for X" banner (looked up on mount via a `getMyVote` server action keyed by `event_id` + the anonymous `user_id`) and a bordered empty state ("No contestants yet — check back soon" + link to apply) when the event has zero contestants. Each grid cell is a `ContestantCard`, now initialized with `initiallyVoted` so a returning voter sees their card already in the "Voted" state without needing to re-click.
6. Bottom link row: "View Leaderboard" · "Apply to Compete" · "Back to all events"

**No header/hero differentiation** between events beyond title/description/countdown — visually this page looks structurally identical for every event.

**States:** `notFound()` → custom 404 (see §4.9) if slug doesn't resolve. Empty-contestants and already-voted states now handled explicitly by `EventVotingSection` (V2 — previously both were silent/reactive-only, see §9).

---

### 4.3 Contestant Card (shared component, appears on event page)

**File:** `src/components/ContestantCard.tsx` (`'use client'`)

This is the most feature-dense UI element in the app:

- 2-column image thumbnail grid (if contestant has images) inside a gradient-colored card (gradient comes from DB per-contestant)
- Name, tagline, description
- **Vote button** — solid white pill, states: `Vote` → `Voting...` (pending, via `useTransition`) → `Voted` (disabled, gray). Calls `castVote` server action with a locally-generated anonymous `userId` (localStorage-based, see §6). Accepts an `initiallyVoted` prop (V2) so the parent `EventVotingSection` can pre-seed this state from a server lookup instead of only setting it reactively after a vote attempt.
- On successful vote: toast success message, `voted=true`, opens `EventRegistrationModal`, and also sets a **separate** `localStorage.voted` flag (redundant with per-event vote state — see Known Issues).
- On duplicate-vote error: toast error, sets `voted=true` defensively.
- **Fullscreen image viewer** (custom-built, not a library): clicking a thumbnail opens a fixed overlay with:
  - Close (X), prev/next chevrons, keyboard arrow/Escape support, swipe-distance-based pinch-zoom (touch), click-to-zoom (desktop), drag-to-pan when zoomed, image counter ("2 / 4").

This component alone reimplements: modal, lightbox/gallery, pinch-zoom, and vote-transaction UI — none of which are shared with any other part of the app (e.g. the admin contestant-image grid does not use this viewer at all, it's a plain static grid with a delete button).

---

### 4.4 Event Registration Modal (shared component)

**File:** `src/components/EventRegistrationModal.tsx` (`'use client'`)
Opens automatically right after a successful vote. Collects full name/email/phone/interests, inserts directly into `future_event_registrations` from the **client** using the browser Supabase client (bypassing any server action / validation layer). Duplicate-email (unique constraint) is caught and toasted as "already registered."

This form is **near-identical** to the standalone `/register-for-future-events` page form (same fields, same insert target, same duplicate-handling logic) — the copy is duplicated rather than shared (see Known Issues).

---

### 4.5 Event Leaderboard (`/events/[slug]/leaderboard`)

**File:** `app/events/[slug]/leaderboard/page.tsx`
Server-rendered, has its own `generateMetadata`.

- H1: "{event title} — Leaderboard"
- Ranked list (not numbered visually beyond an index number), each row: rank number, contestant name + color label, vote count. Row background uses the contestant's DB gradient, or falls back to `getLeaderboardStyle(color)`.
- Empty state: "No votes yet" (plain centered text, no icon/card — inconsistent with other empty states elsewhere that use a bordered card).
- No contestant images shown here (image is only shown on the event page, not leaderboard) — visual identity is gradient + name only.
- No pagination or "top N" truncation — every contestant with any vote count renders (a large field would produce a long unstyled list).

### 4.6 Global Leaderboard Index (`/leaderboard`)

**File:** `app/leaderboard/page.tsx`
Simple list of all active/completed events → link into each one's leaderboard. Structurally a lighter version of the homepage event list (different card style — plain text link block, not the rich card used on `/`).

---

### 4.7 Apply to Compete (`/events/[slug]/apply`)

**File:** `app/events/[slug]/apply/page.tsx`
Server component wrapping a client `useActionState` form (`submitApplication`).
Fields: full name*, email*, phone, instagram, portfolio URL, bio. Submit button disables + relabels while pending.

`slug` is passed through as a hidden field and `submitApplication` resolves `event_id` server-side (V2 — previously did an extra client-side Supabase round trip via a dynamically imported browser client before calling the server action; see §9).

Success state replaces the entire form with a centered checkmark + "Application Submitted!" message + links to both "Check application status" (V3, new — see §9) and back to the event. The form header also links to `/events/[slug]/apply/status` via an "Already applied?" prompt. No inline validation beyond native `required`/`type=email`; server-side error surfaces as a red banner above the form.

**New (V3): `/events/[slug]/apply/status`** — a public page (not previously documented here since it didn't exist) where an applicant enters their email and `checkApplicationStatus` looks up their `event_applications` row by `event_id` + `email`, rendering a status badge (pending/approved/rejected) with the submission date, or a "no application found" error.

---

### 4.8 Register for Future Events (`/register-for-future-events`)

**File:** `app/register-for-future-events/page.tsx`
Visually the most "designed" page in the app — a two-column hero/marketing layout (feature bullets on left, form in a card on right) with its own distinct gradient glow and gradient CTA button (pink→fuchsia), diverging from the rest of the app's flat white-button convention. Reads as a separate micro-landing-page rather than part of the same system as the homepage.

Directly inserts into `future_event_registrations` from the client (same pattern/duplication as §4.4).

---

### 4.9 404 Not Found

**File:** `app/not-found.tsx`
Centered icon (Compass) + "404" + "Page not found" + description + "Back to home" button. Consistent with the app's card/button conventions. (This was recently redesigned — previously the Next.js default.)

---

### 4.10 Admin: Login (`/login`)

**File:** `app/login/page.tsx`
Centered single card, email + password, `useActionState(loginAction)`. Error banner on failed auth. No "forgot password," no rate-limit feedback, no redirect-back-to-intended-page after login (always lands on `/admin`).

---

### 4.11 Admin: Layout & Navigation

**Files:** `app/admin/layout.tsx`, `app/admin/AdminNav.tsx`
Server layout checks session, redirects to `/login` if absent. Renders a fixed left sidebar (`w-64`, `hidden md:flex`) with: Admin Panel title, logged-in email, 3 nav links (Dashboard / Events / Applications), Sign Out button pinned at bottom via flex. Below `md` (V2), a sticky top bar with a hamburger button opens a slide-out drawer sharing the same `NavLinks` + sign-out — the parent layout switches to `flex-col md:flex-row` so the bar stacks above `<main>` instead of squeezing into the row layout (previously the sidebar simply vanished with no replacement; see §9).

Content area is a single unconstrained `<main>` — no breadcrumbs, no page-level consistent header/title treatment (each page defines its own `<h1>`), no shared "back" pattern (each nested page hand-writes its own `← Back to X` link).

---

### 4.12 Admin: Dashboard (`/admin`)

**File:** `app/admin/page.tsx`
4 stat tiles in a responsive grid (Events, Contestants, Total Votes, Pending Applications), each clickable → relevant list page. That's the entire page — no recent-activity feed, no charts, no quick-create shortcuts.

---

### 4.13 Admin: Events List (`/admin/events`)

**File:** `app/admin/events/page.tsx`
Header + "Create Event" button. List (not grid) of event rows: title, `/slug`, contestant count, status badge. Empty state card with "Create your first event" link. Whole row is a link to the event's edit page — no per-row quick actions (no inline delete/duplicate/preview from this list).

---

### 4.14 Admin: Create Event (`/admin/events/new`)

**File:** `app/admin/events/new/page.tsx`
Long single-column-ish form (2-col grid for paired fields) exposing nearly every DB column directly: title, slug (auto-generated from title but editable, regenerates on every keystroke via `key={title}` remount trick), description, cover image URL (plain text input, no preview, no upload — inconsistent with contestant images which support upload), type, theme (both freeform text inputs, not selects — invites inconsistent taxonomy), status (select: draft/active/completed), start/end datetime, voting start/end datetime, max votes per user, allow-public-voting checkbox. No `require_registration`, `winner_announced`, or `is_featured` fields on **create** (only appear later on **edit**, an inconsistency).

This is effectively a raw database-field form with no grouping/sectioning (e.g., "Basics," "Schedule," "Voting Rules" are not visually separated — it's one long flat form).

---

### 4.15 Admin: Edit Event (`/admin/events/[id]`)

**Files:** `app/admin/events/[id]/page.tsx` (server, fetches event/contestants/votes) + `EventEditForm.tsx` (client form) + `DeleteContestantButton.tsx`
A header row (V3) now has "Back to events" on the left and a "View live page" link (opens `/events/[slug]` in a new tab) on the right — previously there was no way to preview the public page from the admin flow. Below that, three sections:

1. **Edit Event form** — superset of the create form's fields, plus `is_featured` checkbox (not present on create). The dead unused `success-msg` div (permanently `hidden`, never toggled) has been removed (V2 — see §9).
2. **Contestants list** — header + "Add Contestant" button, then rows showing thumbnail (first image only), name, color, image count, vote count. Each row links to the contestant edit page; a trash icon opens the confirm-delete modal.
3. **Danger Zone** (V2) — a `DeleteEventButton` at the bottom of this page, wiring up the previously-orphaned `deleteEvent` server action. As of V3, both `DeleteEventButton` and `DeleteContestantButton` share a `ConfirmDialog` component instead of duplicating the modal markup.

No way to reorder contestants, no bulk actions, no duplicate/clone contestant.

---

### 4.16 Admin: Add Contestant (`/admin/events/[id]/contestants/new`)

**File:** `.../contestants/new/page.tsx`
Fields: name\*, colour, tagline, description, bio, then an image section supporting both file upload (to Supabase Storage) and pasted URLs, with a 3-col thumbnail grid and per-image remove (hover-reveal X).

**Colour picker (V3):** the raw "Gradient Classes" / "Text Colour Class" text inputs have been replaced by `ColorSwatchPicker` (`src/components/ColorSwatchPicker.tsx`) — a row of clickable gradient swatches built from the curated palette already in `color-utils.ts`, each auto-filling `gradient`/`text_color` on selection. A "Custom" toggle reveals the old raw text inputs for colors outside the curated set, so nothing was lost, but the default path no longer requires knowing Tailwind class syntax.

---

### 4.17 Admin: Edit Contestant (`/admin/events/[id]/contestants/[contestantId]`)

**File:** `.../contestants/[contestantId]/page.tsx`
Same field set as create, now including the same `ColorSwatchPicker` as the create page (V3 — previously this page had plain text inputs with no live preview and no color-name-driven autofill, inconsistent with create; that inconsistency is resolved). Remaining differences from create: (a) fetches its own data **client-side** in a `useEffect` (only page in the admin area that does this — every other admin page fetches server-side before render, so this one alone shows a "Loading contestant..." flash), (b) image add/remove calls server actions directly per-image (no batch save — each upload/remove is its own network round trip and revalidation).

---

### 4.18 Admin: Applications (`/admin/applications`)

**File:** `app/admin/applications/page.tsx` + `ApplicationActions.tsx`
Flat list of **all** applications across **all events** (no per-event filter, no tabs, no search) — status badge, contact info line, event name, bio excerpt, portfolio link. Pending applications get inline Approve/Reject buttons (`useTransition`); already-actioned applications show status only, no way to see reviewed_by/reviewed_at, no undo.

---

## 5. Primary User Journeys (current, as-built)

### Journey A — Anonymous voter

1. Land on `/` → browse event cards → click one → `/events/[slug]`
2. Read voting rules (static, same on every event) → view contestant images (open lightbox optionally) → click Vote
3. Toast confirms vote → registration modal auto-opens → fill in / dismiss
4. Optionally click "View Leaderboard" → `/events/[slug]/leaderboard`
5. Optionally return to `/` via "Back to all events"

**Friction points (V2 — resolved):** a returning voter now sees a persistent "You voted for X" banner and their card is pre-seeded in the "Voted" state on load, via `EventVotingSection` + `getMyVote` (see §9). Remaining: the toast itself still disappears after a few seconds, and there's no cross-device consistency since eligibility is still gated by a localStorage-only identity (see §6).

### Journey B — Prospective contestant

1. Discover an event (via `/` or a shared link) → `/events/[slug]` → "Apply to Compete" → `/events/[slug]/apply`
2. Fill form → submit → success screen → **either** "Check application status" (V3, new — `/events/[slug]/apply/status`) **or** back to the event page. Previously an applicant had no way to see their status themselves; see §9.

### Journey C — Admin — set up a new event

1. `/login` → `/admin` dashboard → `/admin/events` → "Create Event" → long form → submit → redirected to `/admin/events/[id]`
2. On the edit page, "Add Contestant" repeatedly for each contestant, each time: fill fields, pick/verify color, upload or paste images, submit → redirected back to event page
3. Toggle event `status` to `active` (via the edit form) when ready to go live
4. Monitor `/admin/applications` for incoming applications, approve/reject (approving auto-creates a contestant behind the scenes)
5. Watch vote counts from the contestant list on `/admin/events/[id]` or the public leaderboard

**Friction points (V3 — partially resolved):** the edit-event screen now has a "View live page" link, and colour selection uses a swatch picker instead of hand-authored Tailwind classes (for curated colors — a "Custom" mode still allows raw classes). Remaining: creating a multi-contestant event is still fully serial/manual (no CSV import, no clone-from-previous-event).

---

## 6. Cross-Cutting / Shared State Concerns

- **Anonymous identity:** `getUserId()` (`src/lib/user.ts`) stores a generated UUID in `localStorage` under a fixed key, used to scope one-vote-per-event server-side. This is the _only_ identity mechanism for voters — clearing localStorage or switching browsers/devices resets vote eligibility. No mention of this limitation anywhere in the UI copy.
- **Toasts vs. inline banners:** client-driven flows (voting, registration modal, standalone register page) use `react-hot-toast`; server-action-driven flows (`useActionState` forms — login, create/edit event, create/edit contestant, apply) use a hand-rolled red/green `<div>` banner above the form. Two different feedback idioms for what is conceptually the same "form submit result" pattern.
- **Duplicated marketing copy/forms:** the "future events" interest form exists twice with separate implementations (`EventRegistrationModal` and `/register-for-future-events`), each independently handling the same Supabase insert + duplicate-email error.
- **Confirm-dialog pattern:** `DeleteContestantButton` and `DeleteEventButton` now share a `ConfirmDialog` component (V3 — see §9) instead of duplicating the modal structure. `EventRegistrationModal` is still a separate, un-consolidated bespoke modal.
- **No shared design tokens/components file:** every button, card, input, and badge is restyled inline per-page with Tailwind utility strings, so visual drift (as catalogued in §2) has already occurred between the homepage, the register page, and the admin area.

---

## 7. Notable Gaps / Absent Screens

- No **search/filter** anywhere (event list, applications list, admin events list are all unpaginated flat lists).
- No **admin user management** (single implicit admin identity via Supabase Auth user; no roles/invite flow).
- No **contestant reordering** or **drag-and-drop image ordering** in admin (sort_order exists in the schema but there's no UI to change it after initial upload order).
- No **onboarding/empty-state guidance** in the admin dashboard beyond "no X yet" text (e.g., no first-run checklist for "create an event → add contestants → go live").

---

## 8. Suggested Focus Areas for Review

For an AI/design review consuming this document, the highest-leverage structural questions are likely:

1. Should there be a shared component library (`Button`, `Card`, `Badge`, `FormField`) to eliminate the remaining inline-Tailwind drift cataloged in §2 and §6? `ConfirmDialog` (V3) covers the delete-modal case; `EventRegistrationModal` and general button/card/input styling are still unconsolidated.
2. ~~Should the admin sidebar have a mobile equivalent?~~ **Done in V2.** Should the admin content area also gain breadcrumbs / a consistent page-header pattern, since each nested page still hand-writes its own `← Back to X` link?
3. ~~Is the gradient/text-color-as-raw-Tailwind-classes content model appropriate?~~ **Partially addressed in V3** via `ColorSwatchPicker` for the curated palette. Remaining question: is the "Custom" raw-class fallback still too developer-facing for colors outside the palette, or is it an acceptable escape hatch?
4. Should voter identity move beyond `localStorage` (e.g., magic-link/email-based) given it directly gates the core "one vote per event" business rule?
5. ~~Should the "Apply to Compete" flow include applicant-facing status visibility?~~ **Done in V3** (`/events/[slug]/apply/status`). Remaining: should event creation support cloning/importing contestants to reduce the fully-serial admin journey in §5C?
6. Should toasts and inline banners be unified into one feedback pattern?

---

## 9. Changelog

### V3 (this pass)

- Replaced raw Tailwind gradient/text-color text inputs with `ColorSwatchPicker`, a visual swatch picker built from the curated palette in `color-utils.ts`, on both the add- and edit-contestant forms (with a "Custom" fallback for colors outside the palette).
- Extracted a shared `ConfirmDialog` component and refactored `DeleteContestantButton`/`DeleteEventButton` to use it instead of each hand-coding the same modal.
- Added a "View live page" link on the admin edit-event screen, linking out to the public `/events/[slug]` page.
- Added applicant-facing application status lookup: a new `checkApplicationStatus` action and `/events/[slug]/apply/status` page, linked from the apply form and its post-submit success screen.

### V2

- Fixed vote counts showing zero (stale `contestant_id` references + a bad `.order('created_at', ...)` on a table without that column).
- Replaced the native `confirm()` on contestant delete with a proper modal.
- Redesigned the 404 page.
- Redesigned the homepage (hero, stat row, richer event cards, empty states).
- Added Unsplash support to the image remote patterns for event cover images.

### V2 (this pass)

- Wired up `deleteEvent` to a new `DeleteEventButton` (Danger Zone section on the edit-event page) — the action existed but had no UI.
- Added mobile navigation for `/admin/*`: sticky top bar + slide-out drawer below `md`, sharing nav links/sign-out with the desktop sidebar.
- Removed the extra client-side Supabase round trip in the apply form — `event_id` is now resolved server-side from a hidden `slug` field inside `submitApplication`.
- Removed the dead, permanently-hidden `success-msg` block from `EventEditForm.tsx`.
- Added an explicit empty state ("No contestants yet") to the public event page instead of a silent blank gap.
- Added a persistent "You voted for X" banner + pre-seeded "Voted" card state via a new `getMyVote` action and `EventVotingSection` wrapper, so returning voters no longer need to re-click Vote to discover they already have.
