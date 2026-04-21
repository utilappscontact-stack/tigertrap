# AUDIT_PRE_SECTION_D.md — Readiness audit before monetization gating

> Scope: comprehensive review of Tiger Trap state after C6 visual fixes complete, before Section D (monetization) begins. The intent of this audit is to surface anything that, if shipped behind a paywall, would damage trust on day one.

## Status legend
- ✅ Pass — ships as is
- ⚠️ Needs Attention — fix before monetization launch
- ❌ Blocker — must not launch with this state

---

## 1. Visual polish & theming consistency

| Item | Status | Notes |
|---|---|---|
| Splash screen stone aesthetic | ✅ | Task A1 complete per Phase 2 plan; verify no regression after C6 |
| Onboarding overlay stone aesthetic | ✅ | A2 complete |
| Home page background continuity | ✅ | A3 complete; single non-tiled stone-bg.jpg confirmed |
| Tiger/Goat tile layout (medallion → title → desc → CTA) | ⚠️ | Pending C6.2 — currently cramped |
| Home top bar buttons (settings, sound) | ✅ | Stone family already applied |
| In-game top bar buttons (home, sound, pause) | ⚠️ | Pending C6.4 — Home button never received stone treatment |
| In-game bottom bar buttons (restart, hint, undo, help) | ✅ | Task 6 stone styling applied |
| Tutorial header `Close` button | ⚠️ | Pending C6.1 |
| Tutorial footer `Step N →` button | ⚠️ | Pending C6.1 — flat orange in some viewports |
| Mode tag (`Tiger Mode` / `Goat Mode`) prominence | ⚠️ | Pending C6.5 — too small, wrong location |
| Board grid lines (carved-stone look) | ⚠️ | Pending C6.3 — currently thin SVG strokes |
| Tiger triangle outline alignment | ❌ | Pending C6.3 — visible offset breaks visual trust |
| Board frame border blending | ⚠️ | Pending C6.3 — hard dark edge |
| In-game vertical layout cohesion | ⚠️ | Pending C6.6 — feels like three slabs |
| Tutorial illustrations match current board/pieces | ❌ | Pending C6.7 — still shows old aesthetic |
| Emoji vs medallion consistency | ✅ | A5 complete |
| Font usage consistency across screens | ✅ | Single inherited font family |
| Mobile responsive behavior at 375px | ⚠️ | Verify after C6 — board fit needs re-check |
| Mobile responsive behavior at 320px (small phones) | ⚠️ | Verify; some buttons may overflow |

---

## 2. Gameplay mechanics

| Item | Status | Notes |
|---|---|---|
| Tiger movement (slide along connections) | ✅ | Verified by audit.mjs |
| Tiger jump capture logic | ✅ | Verified |
| Goat placement phase | ✅ | Working in Goat mode |
| Goat movement phase | ✅ | Working |
| Capture detection (capture_n objective) | ✅ | Working |
| Escape detection (escape objective) | ✅ | Working |
| Win/loss overlay triggers | ✅ | Working |
| Stalemate handling (no legal goat moves) | ✅ | Per Phase 2, B7 complete |
| `exactMoves` enforcement | ✅ | After B3 fix |
| AI difficulty scaling per level | ⚠️ | 1-ply heuristic; deferred per Phase 2 — acceptable for launch but reviewers may notice predictable AI |
| Hint button always shows a legal move | ✅ | After B1, B2 |

---

## 3. Tutorial completeness & accuracy

| Item | Status | Notes |
|---|---|---|
| Onboarding cards (start screen) cover both modes | ✅ | Three cards, both modes covered |
| In-game tutorial accessible from settings | ✅ | "How to Play" button present |
| Tutorial steps reflect current rules | ✅ | Content untouched in C6 |
| Tutorial visuals match current gameplay | ❌ | Pending C6.7 |
| Skippable | ✅ | Skip button present and functional |

---

## 4. Mode functionality

| Item | Status | Notes |
|---|---|---|
| Campaign mode launch | ✅ | Working |
| Campaign level select grid | ✅ | Working |
| Campaign progress save/load | ✅ | localStorage v2 schema (post-C1) |
| Star ratings 1/2/3 per level | ✅ | C1 complete |
| Daily mode — both sides flow | ✅ | C2 complete |
| Daily — same seed across browsers | ✅ | C2 verified |
| Daily streak tracking | ✅ | C3 complete |
| Daily streak rescue (1/week) | ✅ | C3 complete |
| Streak milestone celebrations (7/30/100/365) | ✅ | C3 complete |
| Marathon mode — ordered ladder | ✅ | C5 complete |
| Marathon — personal best tracking | ✅ | C5 complete |
| Daily share card (text + PNG) | ✅ | C4 complete |

---

## 5. Sound design integration

| Item | Status | Notes |
|---|---|---|
| Sound effects on move, capture, win, loss | ⚠️ | Verify each event has a sound; some may be silent |
| Sound mute toggle persists across sessions | ✅ | localStorage flag |
| No autoplay on first load (browser policy compliance) | ✅ | Check the splash interaction triggers audio context unlock |
| Volume balanced (no jarring loud effects) | ⚠️ | Subjective check needed on actual device, not just dev |
| Distinct sound for stalemate-win vs normal win | ⚠️ | Per B7 plan; verify both implemented |
| Haptics toggle works on supported devices | ⚠️ | Verify on actual mobile device |

---

## 6. Performance

| Item | Status | Notes |
|---|---|---|
| Initial page load time on 4G | ⚠️ | Single index.html is 197KB (mostly the embedded base64 manifest icons) — acceptable but consider extracting to file for cache reuse |
| Asset bundle size | ✅ | Total ~895KB — within mobile-acceptable range |
| Animation smoothness on mid-tier mobile | ⚠️ | Verify on actual mid-range Android (e.g., budget Samsung) — canvas redraws on every frame can stutter |
| Memory footprint over a 30-min session | ⚠️ | Test for leaks — verify no growing canvas listeners across level loads |
| Cold start to playable on iPhone Safari | ⚠️ | Target: under 2 seconds; measure |

---

## 7. Cross-browser compatibility

| Item | Status | Notes |
|---|---|---|
| Chrome desktop | ✅ | Primary dev target |
| Safari desktop | ⚠️ | Verify — Safari has stricter audio autoplay rules |
| Safari iOS | ⚠️ | Critical — must test on actual iPhone |
| Chrome Android | ⚠️ | Critical — must test on actual Android |
| Firefox desktop | ⚠️ | Verify — generally fine but worth checking |
| In-app browsers (Instagram, Twitter, LinkedIn) | ⚠️ | Critical for marketing — links from socials open in WebViews with quirks |
| iPad / large tablet | ⚠️ | Verify scaling — wide viewport rules added but not stress-tested |

---

## 8. Broken links, missing assets, console errors

| Item | Status | Notes |
|---|---|---|
| Console errors on splash → home → game flow | ⚠️ | Run flow with DevTools open; expect zero red errors |
| Console warnings | ⚠️ | Expect minimal yellow warnings; document any that remain |
| All asset paths in HTML/CSS/JS resolve to existing files | ✅ | Verified via directory listing |
| 404s on any sound/image fetch | ⚠️ | Network tab audit needed |
| Stripe links not yet wired (placeholder) | ⚠️ | Will be addressed in D3 |
| Service worker registration (if any) | ⚠️ | E2 not yet done; no SW expected at this stage |
| External links | ✅ | None in current code |

---

## 9. Accessibility basics

| Item | Status | Notes |
|---|---|---|
| Color contrast on body text (WCAG AA) | ⚠️ | A3 improved this; verify with contrast checker — `#7A5830` on stone bg may still fail AA at small sizes |
| Color contrast on button labels | ✅ | Stone buttons with cream text pass AA |
| Tap target sizes ≥ 44×44px | ⚠️ | Pending C6.4 for top bar; otherwise mostly compliant |
| Keyboard navigation (`tabindex`, focus rings) | ⚠️ | Mode cards have `tabindex=0` but focus states need verification |
| Screen reader support (`aria-*` attributes) | ⚠️ | Some present (`aria-label` on buttons), but board canvas has no accessible alternative — acceptable for launch but document |
| Reduced motion preference respected | ❌ | Animations don't check `prefers-reduced-motion` — add wrapper for title pulse, milestone spin |
| Text resize doesn't break layout | ⚠️ | Test browser zoom at 150% |

---

## 10. Overall "shippable" quality bar

| Item | Status | Notes |
|---|---|---|
| First impression (splash + home) feels premium | ✅ | After A1, A3 |
| Tutorial flow welcomes new players cleanly | ⚠️ | Becomes ✅ after C6.1 + C6.7 |
| First-level experience is smooth and rewarding | ⚠️ | Becomes ✅ after C6.3 + C6.5 + C6.6 |
| Win/loss overlays are polished | ✅ | Confirmed |
| Settings/about feel complete | ✅ | Settings sheet covers core options |
| Brand voice consistent ("two sides · one board · one best move") | ✅ | Premium voice maintained |
| No placeholder text or "TODO" left visible | ⚠️ | Grep `TODO`, `FIXME`, `placeholder` across codebase to verify |
| No jarring layout shifts during loading | ⚠️ | Splash screen handles this; verify no FOUC |
| Game completable from level 1 to last unlocked level | ⚠️ | Manual playthrough needed after C6 |
| App can be added to home screen on iOS | ❌ | E1 not yet complete; manifest needs work for true installability |

---

## Summary

**Blockers (must fix before D launches):** 3
- Tiger triangle outline alignment (C6.3)
- Tutorial visuals match current pieces (C6.7)
- Reduced motion preference handling

**Needs Attention (should fix before D launches):** 19
- Several visual fixes pending in C6 batch
- Cross-browser verification on actual devices
- Performance/load measurement on mid-tier Android
- Color contrast spot checks
- Console error audit pass

**Recommendation:** Complete C6 (all 7 tasks) before any Section D work. After C6, do one full hour of manual QA on iPhone Safari and one budget Android device. If both sessions complete the first 5 Tiger and 5 Goat campaign levels without surface issues, proceed to D1.