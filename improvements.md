V1 (all confirmed implemented)

- [x] In the contestant section of events, the votes shows zero — root cause was stale `contestant_id` references from before the multi-event migration plus a query bug (`contestants.order('created_at')` on a column that doesn't exist); fixed via SQL backfill + query fix
- [x] When deleting a contestant, pop up a dialog/modal to confirm delete — `DeleteContestantButton.tsx`
- [x] The 404 page should be redesigned better — `app/not-found.tsx`
- [x] (UI) The home page should be more engaging, it currently looks bland — `app/page.tsx` hero/stats/card redesign
- [x] The challenge picture could be a public image, like an unsplash image link — `images.unsplash.com` added to `next.config.ts` remote patterns

V2

Sourced from ui-specification.md §6-8 (Known Issues / Notable Gaps / Suggested Focus Areas).

- [x] Wire up event deletion — `deleteEvent` server action existed but had no button anywhere in the admin UI
- [x] Admin sidebar disappears entirely below `md` breakpoint with no mobile nav replacement
- [x] Apply-to-compete form does an extra client-side round trip to resolve `event_id` from `slug` before submitting
- [x] Dead unused `success-msg` div in `EventEditForm.tsx`
- [x] Public event page has no empty state when an event has zero contestants (silent blank gap)
- [x] No persistent "already voted" indicator — voters only learn they've voted via a failed-revote error, not on page load

V3

Sourced from ui-specification.md §7-8 (remaining Notable Gaps / Suggested Focus Areas after V2).

- [x] Gradient/text-color content model requires admins to hand-type raw Tailwind class names with no visual picker
- [x] `DeleteContestantButton` and `DeleteEventButton` are two independently-coded copies of the same confirm-modal structure
- [x] No "View live page" link from the admin edit-event screen back to the public event
- [x] No applicant-facing way to check application status after submitting

V4

Sourced from ui-specification.md §7 (remaining Notable Gaps after V3).

- [x] No search/filter on the admin applications list (flat list across all events, all statuses)
- [x] No search/filter on the admin events list
- [ ] No contestant image reordering in admin (sort_order exists but there's no UI to change it after upload)
- [ ] No onboarding guidance on the admin dashboard for a brand-new install with zero events
