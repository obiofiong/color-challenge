V1

- In the contestant section of events, the votes shows zero
- When deleting a contestant, pop up a dialog/modal to confirm delete
- The 404 404 This page could not be found. should be redesigned better.
- (UI) The home page should be more engaging, it currently looks bland.
- The challenge picture could be a public image, like an unsplash image link

V2

Sourced from ui-specification.md §6-8 (Known Issues / Notable Gaps / Suggested Focus Areas).

- [x] Wire up event deletion — `deleteEvent` server action existed but had no button anywhere in the admin UI
- [ ] Admin sidebar disappears entirely below `md` breakpoint with no mobile nav replacement
- [ ] Apply-to-compete form does an extra client-side round trip to resolve `event_id` from `slug` before submitting
- [ ] Dead unused `success-msg` div in `EventEditForm.tsx`
- [ ] Public event page has no empty state when an event has zero contestants (silent blank gap)
- [ ] No persistent "already voted" indicator — voters only learn they've voted via a failed-revote error, not on page load
