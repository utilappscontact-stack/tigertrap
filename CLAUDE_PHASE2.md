# CLAUDE_PHASE2.md

> Phase 2 instruction file for Tiger Trap. Each task block in the Task Map is sized for one Claude Code session. Foundation fixes (Sections A and B), retention features (Section C), monetization (Section D), and store readiness (Section E) are isolated. **Logic fixes and UI feature tasks are never combined in a single block.**

---

## Working Rules

These constraints apply to every task in this file. Violating any of them is grounds to stop and ask.

1. **Premium stone aesthetic is non-negotiable.** Every visual change must match the home screen reference (the target image saved as `assets/bg/preview.webp` if available, otherwise the founder's Image 5). No flat black backgrounds, no neon, no generic Material/Bootstrap defaults.
2. **Puzzle integrity is non-negotiable.** Never modify a level's `tigers`, `goats`, `escapeNodes`, `moveLimit`, `objective`, `target`, or `maxCaptures` without re-running the solver to verify the puzzle is still well-formed (solvable, par matches claim, hint is a legal move).
3. **No backend.** Tiger Trap is a pure frontend JS game. Do not introduce server-side code, databases, or anything requiring deployment infrastructure beyond static hosting. Stripe Payment Links + localStorage is the entire payment stack.
4. **Browser-first, app-store-ready.** All code must work in a vanilla browser. PWA wrapping and Capacitor are layered on top, not built into the core.
5. **No predatory monetization.** No countdown timers, no false scarcity, no "limited offer" badges, no retry paywalls, no ads, no energy systems, no coins, no XP, no battle passes. Period.
6. **Touch this codebase one task at a time.** Each task block below is a single Claude Code session. Do not chain B1 + B2 + B3 in one run. Run, verify acceptance criteria, commit, then start the next.
7. **Re-run `audit.mjs` after every Section B task.** The audit script (or its equivalent) is the source of truth for puzzle correctness. If it regresses, revert.
8. **Do not break working features.** If a change risks affecting a feature outside the task's stated scope, stop and ask. Examples of out-of-scope: AI difficulty scaling, daily seed function, undo behavior, level unlock progression.
9. **Save before structural edits.** Before any task that touches `game.js` structurally (B5 cull, C2 daily restructure), commit the current state.
10. **Do not invent assets.** Every image reference must point to a file that exists in `assets/`. If a new image is needed, flag it for the founder rather than generating a placeholder.
11. **Preserve localStorage backward compatibility.** Existing players have `STORAGE_KEY = 'tiger_trap_progress_v1'`. Any schema change must include a migration path or a versioned key.
12. **All copy is in English, premium voice.** Match the existing tone: terse, slightly literary ("Two sides · One board · One best move"). No exclamation marks except on win/lose moments. No emoji in body copy after Section A5 ships.

---

## Task Map

---

### SECTION A — VISUAL FIXES (founder feedback)

These tasks address the five visual issues raised in the founder's most recent feedback. They are UI-only — no game logic changes. Do all of A before any of B if visual work is the priority; otherwise A and B can run in parallel since they touch mostly different files.

---

#### Task A1 — Splash screen stone theme

**Goal:** Restyle the splash screen so it visually matches the home screen aesthetic.

**Why this task exists:** Founder feedback item 1. The splash currently looks dark and flat — the player's first impression of the game contradicts the premium positioning before the home screen even loads.

**Files likely to change:** `index.html`, `style.css`.

**Exact areas to inspect:**
- `index.html` lines 19–31 (`#splash-screen`, `.splash-bg-glow`, `.splash-icon-wrap`, `.splash-title`, `.splash-sub`, `.splash-divider`, `.splash-progress-wrap`, `.splash-progress-bar`, `.splash-progress-label`, `.splash-tap-hint`).
- `style.css` rules for `#splash-screen` and all `.splash-*` classes.
- Compare to `.start-glow`, `.start-title`, `.start-sub`, `#start-topbar` rules — these already have the stone aesthetic and serve as the reference.
- Asset folder: `assets/bg/stone-bg.jpg`, `assets/bg/stone-texture.jpg`, `assets/pieces/tiger-piece.png`.

**Changes to make:**
- Apply `assets/bg/stone-bg.jpg` (or whichever stone background the home page uses) as the splash background, with `background-size: cover; background-position: center; background-repeat: no-repeat;`.
- Match `.splash-title` typography to `.start-title` exactly (font family, weight, size, color, letter-spacing, text-shadow if any).
- Match `.splash-sub` to `.start-sub` typography.
- Replace any embedded base64 splash icon with a reference to `assets/pieces/tiger-piece.png` (the medallion tiger), sized appropriately.
- Restyle `.splash-progress-bar` to use the same accent color as the home page primary buttons.
- Restyle `.splash-tap-hint` to match home page secondary text.

**Things not to change:**
- Splash timing logic in `game.js` (whatever drives `#splash-bar` width and the tap-to-begin handler).
- The `splash-screen` element's ID or its presence in the DOM.
- Asset filenames.

**Visual/functional acceptance checklist:**
- [ ] Splash and home screen rendered side by side use the same background texture with no visible difference in tone.
- [ ] Title typography is indistinguishable from the home title.
- [ ] Tiger icon is the medallion art, not an emoji or generic illustration.
- [ ] No visible tile seam on the background at any viewport.
- [ ] Tap-to-begin behavior unchanged.

**Stop condition before next task:** Visual match to home page palette confirmed at three viewport sizes (mobile 375px, tablet 768px, desktop 1280px). Commit.

---

#### Task A2 — Intro tutorial theme alignment

**Goal:** Restyle the onboarding intro overlay (`#onboard-overlay`) so it matches the stone home aesthetic, including replacing the off-theme orange "Next →" button.

**Why this task exists:** Founder feedback item 2. The onboard cards currently look like a different app — flat black background, emoji icons, primary-orange button color that does not appear anywhere else in the game.

**Files likely to change:** `index.html`, `style.css`.

**Exact areas to inspect:**
- `index.html` lines 80–91 (`#onboard-overlay`, `#onboard-cards`, `.ob-card`, `.ob-icon`, `.ob-title`, `.ob-body`, `#ob-next`, `#ob-skip`, `.ob-dots`, `.ob-dot`).
- `style.css` rules for all `.ob-*` and `#onboard-*` selectors.
- Reference: home page primary button style (the "PLAY TIGER" / "PLAY GOAT" buttons in the target Image 5).

**Changes to make:**
- Replace the flat black overlay background with the stone background (matching A1).
- Replace the three emoji icons (🐐, 🐯, ⚡) with images: goat-piece.png, tiger-piece.png, and a stone-themed spark/lightning equivalent (flag for founder if no asset exists — do not invent).
- Restyle `#ob-next` to use the same stone-button family as home page primary buttons (no flat orange).
- Restyle `#ob-skip` to match the home page secondary/ghost text style.
- Apply `.start-title` typography to `.ob-title` and `.start-sub` typography to `.ob-body`.
- Restyle `.ob-dot` to use the stone palette.

**Things not to change:**
- Number of onboard cards (3).
- Tutorial flow logic in `game.js`.
- Card progression and dot synchronization logic.
- Card content (headlines and body text).

**Visual/functional acceptance checklist:**
- [ ] Overlay uses the stone background, not flat black.
- [ ] All three icons are images, not emoji.
- [ ] Next button is visually indistinguishable from the home PLAY buttons.
- [ ] Skip text matches home secondary text style.
- [ ] Dot indicators use stone palette.
- [ ] Tutorial flow walks through end-to-end without visual regression.

**Stop condition before next task:** Tutorial walked through end-to-end on mobile viewport with consistent styling on every card. Commit.

---

#### Task A3 — Home page background, contrast, and layout fixes

**Goal:** Eliminate the visible background tile repeat, increase text contrast on the Tiger/Goat cards, fix the medallion-overlapping-text issue, and fix the compressed CAMPAIGN/DAILY/MARATHON row and DAILY STREAK row.

**Why this task exists:** Founder feedback item 3. Comparing the founder's current Image 2 to the target Image 5 shows clear regression: tile seams visible, title text bleeding into medallion, body text too dark, mode tabs and streak row visually compressed.

**Files likely to change:** `index.html`, `style.css`.

**Exact areas to inspect:**
- `index.html` lines 93+ (`.screen #start-screen`, `.start-glow`, `#start-topbar`, `.start-title`, `.start-sub`, plus the Tiger/Goat card markup, the CAMPAIGN/DAILY/ENDLESS tab row, and the DAILY STREAK row markup).
- `style.css` rules for `#start-screen` background, `.start-card`, `.start-card-tiger`, `.start-card-goat`, `.start-mode-row`, `.start-streak-row`, and the play-button class.
- Background asset: ensure `assets/bg/stone-bg.jpg` is large enough to be served as a single non-repeating background; if not, flag for founder.

**Changes to make:**
- Background: change from tiled small texture to single large stone-bg with `background-size: cover; background-repeat: no-repeat;`. Eliminate the visible seam at any viewport.
- Tiger/Goat card text: either move title text below the medallion (per Image 5 layout) OR add a subtle dark gradient overlay behind the title text only. Title must not visually overlap the medallion.
- Increase color contrast on TIGER and GOAT card titles (currently fading into background).
- Increase contrast on body copy ("Play the predator…" / "Command the herd…") — they should be clearly readable, not ghost text.
- CAMPAIGN/DAILY/MARATHON tab row: ensure each tab uses equal flex-basis, has min-height matching Image 5 (~48px), and consistent padding. Active tab should have the visual emphasis shown in Image 5 (background fill, accent underline).
- DAILY STREAK row: increase panel padding, brighten the streak title, restyle the PLAY DAILY button to the stone family from Image 5.

**Things not to change:**
- Click handlers on Tiger/Goat tiles, mode tabs, or PLAY DAILY button.
- Section IDs or class names that game.js depends on.
- The presence of the streak/progress text below the cards.

**Visual/functional acceptance checklist:**
- [ ] Background appears as one continuous stone surface with no visible seam at 375px / 768px / 1280px viewports.
- [ ] TIGER and GOAT titles are fully readable and do not overlap the medallion.
- [ ] Body copy is readable in normal lighting.
- [ ] CAMPAIGN/DAILY/MARATHON row matches Image 5 proportions and active-state styling.
- [ ] Daily streak row shows readable streak number and a stone-themed PLAY DAILY button.
- [ ] Side-by-side comparison with Image 5 shows substantial parity.

**Stop condition before next task:** Founder visual review confirms parity with Image 5 at three viewport sizes. Commit.

---

#### Task A4 — In-game board alignment, button styling, vertical spacing, tutorial illustration

**Goal:** Fix the tiger triangle alignment, eliminate the double-grid effect on the board, restyle top and bottom button rows to the stone family, fix vertical spacing above and below the board, and replace the off-theme tutorial GIF.

**Why this task exists:** Founder feedback item 4. Multiple alignment and theming issues in active gameplay (Image 1): triangle escape indicator floats separate from the board, the matrix appears doubled (likely board image grid + drawn grid both visible), top/bottom buttons are too small and out of theme, excess empty vertical space, and the tutorial GIF uses old-style flat circles instead of medallion art.

**Files likely to change:** `index.html`, `style.css`, `game.js` (only for canvas sizing/positioning offsets — not game logic).

**Exact areas to inspect:**
- The `canvas#board` element and its container in `index.html`.
- `style.css` rules for the board container, top button row, bottom button row, mode-tag styling.
- `game.js` `setupCanvas()` lines 2017–2030, `nxy()` line 2031, `drawLines()` line 2109, `drawEscape()` line 2133.
- Tutorial canvas drawing functions: `getTutStepsAnimated()` line ~945, `_drawTutFrame()` line ~1066, `_drawTutGoatAt()` line ~1166, `_drawTutTiger()` lines ~1174–1196.

**Changes to make:**
- Audit whether `assets/bg/board-stone.jpg` has a grid baked into the image AND `drawLines()` is also drawing one. If yes, choose one source of truth: either (a) replace the board image with a clean stone surface and let `drawLines()` draw the only grid, or (b) suppress `drawLines()` when the image is loaded and rely on the baked grid. Recommendation: option (a) — gives you crisp anti-aliased lines at any DPR.
- Tiger triangle escape indicator (the gold triangle in the corner): position it relative to the canvas grid coordinate of the corner node (use `nxy()`), not as an absolute pixel offset.
- Top button row (Home, Sound, Pause): restyle to match the stone medallion buttons from the home page top bar. Increase to minimum 44×44px touch targets.
- Bottom button row (Restart, Hint, Undo, Help): restyle to the same stone button family. Match Image 5's button proportions.
- Vertical spacing: reduce the empty bands above and below the board container so the board occupies more of the available vertical space without clipping.
- Tutorial illustration: replace the old animated GIF with either a still image set or a canvas-drawn animation that uses medallion art for tiger and goat. Coordinate with A5.

**Things not to change:**
- Game logic: move validation, AI scoring, win/lose detection.
- Canvas coordinate system: do not modify `nxy()`, `GRAPH`, or any geometry constants.
- Tutorial step content (text, sequencing).

**Visual/functional acceptance checklist:**
- [ ] No visible double-grid on the board at any DPR.
- [ ] Triangle escape indicator visually attached to its corner node, scales with the board.
- [ ] All in-game buttons share visual family with home page buttons.
- [ ] All in-game buttons measure at least 44×44px in dev tools.
- [ ] Board fills more of the vertical space; no awkward empty bands.
- [ ] Tutorial illustrations match stone theme and use medallion-style pieces.
- [ ] A full level can be played from start to win without any visual artifact.

**Stop condition before next task:** A complete level played from start to win on mobile viewport with no visual artifacts. Commit.

---

#### Task A5 — Replace emoji with medallion art everywhere

**Goal:** Every tiger emoji (🐯) and goat emoji (🐐) in the codebase replaced with medallion art references (`assets/pieces/tiger-piece.png`, `assets/pieces/goat-piece.png`), or the splash medallion variant where appropriate.

**Why this task exists:** Founder feedback item 5. Visual consistency is broken every time emoji appear next to the medallion art. Examples confirmed in the code:
- `game.js` line 1493: mode tag textContent uses 🐯/🐐.
- `game.js` line 1932: showOverlay icon for tiger win uses 🐯.
- `index.html` lines 81, 84, 87: onboard cards use 🐐, 🐯, ⚡.
- Tutorial canvas in `_drawTutTiger` line 1174 draws a primitive triangle (visible orange triangle in founder Image 3).

**Files likely to change:** `index.html`, `style.css`, `game.js`.

**Exact areas to inspect:**
- Run `grep -n "🐯\|🐐" *.html *.css *.js` to enumerate every occurrence.
- Mode tag: `game.js` line 1493 (`tag.textContent = curMode==='tiger' ? '🐯 Tiger Mode' : '🐐 Goat Mode'`).
- Overlay icons in `showOverlay()` calls — search `game.js` for emoji string literals.
- Onboard card `<div class="ob-icon">` content in `index.html`.
- Tutorial drawing: `_drawTutGoatAt` line 1166, `_drawTutTiger` line 1174 (currently draws a triangle for tiger).

**Changes to make:**
- Mode tag: replace text emoji with a span using a small medallion-style background image (CSS background-image on the span, or an inline `<img>` swapped via JS). Preserve the "Tiger Mode" / "Goat Mode" text label.
- Overlay icons: replace tiger/goat emoji with small `<img>` references to medallion art. Other emoji used for mood (🔒, 💨, ⏱, 🏃) — flag these for the founder before touching; they may be intentional and not part of this task.
- Onboard cards: replace 🐐 and 🐯 with `<img src="assets/pieces/goat-piece.png">` and `<img src="assets/pieces/tiger-piece.png">`. The ⚡ on the third card — flag for founder.
- Tutorial canvas: load the medallion images on game init and use `ctx.drawImage()` in `_drawTutGoatAt` and `_drawTutTiger` instead of drawing primitive shapes.

**Things not to change:**
- Other emoji in the game that are not tiger or goat — flag separately.
- Asset file paths or filenames.
- Mode-switching logic.

**Visual/functional acceptance checklist:**
- [ ] `grep "🐯\|🐐"` across all source files returns zero matches in user-facing strings.
- [ ] Mode tag in-game shows medallion image, not emoji.
- [ ] Tutorial illustrations show medallion-styled pieces, not generic shapes.
- [ ] Onboard cards show medallion piece art.
- [ ] Win/lose overlays use medallion art for tiger/goat references.

**Stop condition before next task:** Manual walkthrough of splash → home → onboard → tutorial → game shows medallion art consistently wherever a piece is referenced. Commit.

---

### SECTION B — FOUNDATION LOGIC FIXES (Part 1)

These tasks fix puzzle correctness, AI edge cases, and content quality issues found by the audit harness. Logic-only — no UI changes. Run `audit.mjs` (or equivalent solver harness) after every task in this section to confirm no regression.

---

#### Task B1 — Replace TIGER_CORE_LEVELS[14] "East Corridor" (unplayable)

**Goal:** Replace the East Corridor level with a solver-verified position where the tiger has at least one legal move on turn 1 and the puzzle requires approximately the listed move count.

**Why this task exists:** Audit harness confirmed the current position has zero legal moves on turn 1. Tiger at node 0 with all three neighbours (1, 5, 6) occupied by goats and all three jump landings (2, 10, 12) also occupied — instant lose with no input. Affects campaign positions 15 and 40 (Dawn and Dusk variants).

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- `game.js` lines 363–376 — the current East Corridor block.
- `solveTigerState()` lines 1678–1739 — use to verify any replacement.
- `tigerMovesFrom()` lines 1555–1574 — use to confirm at least one legal move.

**Changes to make:**
- Pick a new tiger position and goat configuration where:
  - `tigerMovesFrom(tigers[0], goats)` returns at least one slide or jump.
  - `solveTigerState(...)` returns `ok:true` with par equal to or close to `moveLimit:6`.
  - The escape direction (east edge nodes [4,9,14,19,24]) is reachable via the solver.
  - The 180° rotation (variant 2) yields a position with at least one legal first move (otherwise document that this level cannot have a Dusk variant).
- Update `hint` to a verified legal first move from the solver's returned move.
- Keep the title "East Corridor" and goal "Escape east edge" if east is still the correct exit direction after replacement.

**Things not to change:**
- Other 24 tiger cores.
- Solver functions.
- Variant transformation logic (B4 covers that separately).

**Visual/functional acceptance checklist:**
- [ ] Audit script no longer flags TIGER_CORE_LEVELS[14] as unsolvable.
- [ ] `tigerMovesFrom(lvl.tigers[0], lvl.goats)` returns at least one move.
- [ ] Audit script hint sanity check passes for index 14.
- [ ] Manual play of the position confirms reasonable difficulty.

**Stop condition before next task:** One full audit script run shows zero unplayable levels and East Corridor's hint is legal. Commit.

---

#### Task B2 — Fix six broken tiger hints

**Goal:** Re-derive valid `hint` coordinates for TIGER_CORE_LEVELS indices 14 (covered by B1), 16, 17, 18, 20, 21.

**Why this task exists:** Audit confirmed each `hint.from → hint.to` is not a legal move from the starting position. The Hint button currently glows an unreachable square.

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- TIGER_CORE_LEVELS array lines 179–487 — specifically the hint blocks for indices 16, 17, 18, 20, 21 (14 was fixed in B1).
- `tigerMovesFrom()` lines 1555–1574 — enumerate legal moves from each starting position.
- `solveTigerState()` lines 1678–1739 — find the move that progresses toward solution; that move IS the hint.

**Changes to make:**
- For each of the 5 remaining levels (16, 17, 18, 20, 21):
  - Run `tigerMovesFrom(tigers[0], goats)` to enumerate legal moves.
  - Run `solveTigerState(...)` to get the optimal first move.
  - Replace the `hint` object with `{from: tigers[0], to: <verified destination>}`.

**Things not to change:**
- Tiger or goat positions on these levels (they're playable; only the hint is wrong).
- `moveLimit`, `objective`, `target`, `escapeNodes`.

**Visual/functional acceptance checklist:**
- [ ] Audit script HINT SANITY section reports zero failures for tiger cores.
- [ ] Tapping Hint in each of these 5 levels glows a legal square.

**Stop condition before next task:** Audit script HINT SANITY section shows all six previously-broken hints as OK. Commit.

---

#### Task B3 — Fix TIGER_CORE_LEVELS[9] "Great Escape" par claim

**Goal:** Resolve the conflict where Great Escape claims `exactMoves:true` with `moveLimit:7` but the solver finds par = 3.

**Why this task exists:** Audit found the par claim is a lie. With `exactMoves:true`, the level expects par to equal moveLimit, but the solver wins it in 3.

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- `game.js` lines 299–311 (Great Escape block).
- `isExactCampaignLevel()` function lines 2481–2495 (the enforcement code).

**Changes to make (founder picks one option):**
- **Option A (preserve par=7 intent):** Add or move goats so the 3-move solution is blocked. Re-verify with solver that minimum is exactly 7. Recommended if Great Escape is meant to be a late-campaign challenge.
- **Option B (accept actual par=3):** Set `moveLimit:3` and update `goal` to match. Recommended if the position is intended as a quick capstone.
- **Option C (least preferred):** Set `exactMoves:false`, leave `moveLimit:7` as a generous budget. Only use if neither A nor B is feasible — silently degrades the puzzle's promise.

**Things not to change:**
- Other levels.
- The `exactMoves` enforcement system itself.
- The level's title.

**Visual/functional acceptance checklist:**
- [ ] Audit script no longer flags Great Escape as "exactMoves true but solvable in N (par claims M)".
- [ ] Either par equals moveLimit, or `exactMoves` is explicitly false with a justified moveLimit.

**Stop condition before next task:** One audit script run shows Great Escape as OK. Commit.

---

#### Task B4 — Fix Dusk variant goal-text rotation

**Goal:** When variant 2 (180° rotation) is applied to an escape level, transform the `goal` text direction to match the rotated escape nodes.

**Why this task exists:** Audit found 8 escape levels show wrong direction text in their Dusk variant. `transformLevel()` correctly rotates `escapeNodes` but leaves the `goal` string untouched. Player sees "Escape south" but the actual exit is north.

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- `transformLevel()` function lines 728–749.
- Affected core levels: 5, 6, 9 (after B3), 13, 14 (after B1), 16, 20, 23.

**Changes to make:**
- In `transformLevel()`, when `variant === 2` and `base.objective === 'escape'`:
  - Apply a string substitution on the `goal` field: swap "south" ↔ "north", "east" ↔ "west" (case-insensitive, preserve original case).
- For variants other than 2 (currently only variant 0 is in active use), leave `goal` unchanged.

**Things not to change:**
- Node transformation logic.
- `escapeNodes` transformation (already correct).
- Hint transformation.
- Non-escape goals (capture_n levels — their goal text is direction-independent).

**Visual/functional acceptance checklist:**
- [ ] Audit script ESCAPE GOAL-TEXT MISMATCH section shows zero mismatches after rebuild.
- [ ] Spot-check 2–3 Dusk variants of escape levels in browser — the displayed goal text matches the actual escape edge highlighted on the board.

**Stop condition before next task:** All 8 listed Dusk variants show correct direction text. Commit.

---

#### Task B5 — Cull duplicate positions

**Goal:** Remove duplicate tiger+goat layouts from GOAT_CORE_LEVELS and TIGER_CORE_LEVELS, keeping the best version of each.

**Why this task exists:** Audit found 5 sets of duplicates in goat cores (collapsing 11 levels to 5 unique positions) and 1 set in tiger cores. Players currently see the same board twice with different titles and inflated difficulty labels — destroys the perception of campaign depth.

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- GOAT_CORE_LEVELS lines 51–177:
  - [6] Braided Net + [18] Closing Net (identical position)
  - [12] Crescent + [20] Crescent Lock (identical)
  - [13] Deep Seal + [21] Night Trap (identical)
  - [14] Master Trap + [23] Final Seal + [24] Grand Trap (three identical)
  - [17] Canyon Wall + [22] Slow Siege (identical)
- TIGER_CORE_LEVELS lines 179–487:
  - [11] Sweep + [19] Quick Strike (identical)

**Changes to make:**
- For each duplicate set, keep the version with the most appropriate `moveLimit` / `maxCaptures` and delete the others.
- Default kept versions (founder may override):
  - Goat: keep [6] Braided Net (drop 18), [12] Crescent (drop 20), [13] Deep Seal (drop 21), [14] Master Trap (drop 23 and 24), [17] Canyon Wall (drop 22).
  - Tiger: keep [11] Sweep (drop 19).
- After deletion, reorder the remaining levels by ascending difficulty for a smooth ramp.
- Update `difficulty` values if needed to ensure monotonic non-decreasing progression within each pool.

**Things not to change:**
- The Dawn/Dusk variant doubling system (`buildCampaignLevels`, `transformLevel`).
- Any non-duplicate level's position, hint, or goal.

**Visual/functional acceptance checklist:**
- [ ] Audit script DUPLICATE POSITIONS section shows zero entries.
- [ ] Goat cores reduced from 25 to ~20.
- [ ] Tiger cores reduced from 25 to 24.
- [ ] Difficulty values are monotonically non-decreasing within each pool.
- [ ] All remaining levels still pass solvability.

**Stop condition before next task:** Audit reports zero duplicates and all remaining levels validate. Commit.

---

#### Task B6 — Re-tune misleading goat "Trap in N" puzzles

**Goal:** For surviving goat campaign levels labeled "Trap in 2/3/4" but actually solvable in 1, either change the position to genuinely require multi-move OR honestly relabel as "Trap in 1".

**Why this task exists:** Audit found 10 goat levels where par << moveLimit. Player wins in 1 move, sees "Solved in 1 move of 4" — destroys trust in the difficulty labels.

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- Re-run audit AFTER B5 culling completes — the surviving level indices will have shifted.
- Identify which surviving goat levels still report par << moveLimit.
- `solveGoatState()` lines 1634–1676 — verify minimum solve depth.

**Changes to make:**
- For each surviving level with par << moveLimit:
  - **Option A (recommended for early levels):** Set `goal`, `moveLimit`, and `exactMoves:true` to honestly match par. Example: `goal:'Trap in 1', moveLimit:1, exactMoves:true`.
  - **Option B (recommended for late levels):** Add or reposition goats so a genuine multi-move setup is required. Re-run solver to verify new par equals new moveLimit.

**Things not to change:**
- Solver functions.
- Levels where par already matches moveLimit.
- The `exactMoves` enforcement system.

**Visual/functional acceptance checklist:**
- [ ] Audit script solvability section shows par equals moveLimit (within tolerance) for every goat campaign level.
- [ ] Manual play of three sample re-tuned levels confirms the move-count goal feels honest.

**Stop condition before next task:** No goat campaign level reports par << moveLimit after audit re-run. Commit.

---

#### Task B7 — Add stalemate detection in runGoatAI

**Goal:** When the goat AI in tiger mode finds no legal move (`bGoat === -1`), end the level explicitly rather than silently skipping the goats' turn until moveLimit times out.

**Why this task exists:** Audit identified a soft-stalemate where goats can't move, the tiger continues alone, and the player waits for the moveLimit timeout — feels like a bug.

**Files likely to change:** `game.js` only.

**Exact areas to inspect:**
- `runGoatAI()` function lines 1955–2001.
- Specifically the `if (bGoat !== -1)` branch at line 1976 — the else case currently does nothing.

**Changes to make:**
- Add an else branch handling the no-legal-goat-move case:
  - If the tiger has already met its objective (`capturedGoats >= target` or reached `escapeNodes`), the existing win logic handles it — no change needed there.
  - Otherwise, treat the position as a tiger win (goats have no agency) and trigger the same win flow as a normal capture/escape. Use a distinct overlay subtitle: "The goats have no moves left."
- Add a distinct haptic and sound event for stalemate (or reuse the win haptic with a flag).

**Things not to change:**
- The 1-ply AI heuristic itself (deferred to a later phase).
- `tigerAIMoveFrom()`, `runTigerAI()`.
- Win conditions for capture_n and escape objectives.

**Visual/functional acceptance checklist:**
- [ ] Construct a manual test position where all goats are immobile (e.g. all goats in corners surrounded by other goats). The level ends within 1–2 frames, not at moveLimit timeout.
- [ ] No console errors.
- [ ] Distinct overlay copy shown for the stalemate-win case.

**Stop condition before next task:** Manually-engineered stalemate position resolves immediately. Commit.

---

### SECTION C — RETENTION FEATURES (Part 2)

These tasks build the daily-driven retention loop. They depend on Section B being complete because retention metrics (par, stars, streaks) are only meaningful when puzzle data is correct.

---

#### Task C1 — Star ratings per campaign level

**Goal:** Track and display star rating per campaign level using the rule: 1 star = solved, 2 stars = solved at par, 3 stars = solved at par on first attempt with no hints used.

**Why this task exists:** Part 2 retention. Gives players a reason to replay levels and signals real mastery without inventing fake currency.

**Files likely to change:** `game.js`, `index.html`, `style.css`.

**Exact areas to inspect:**
- `registerCampaignWin()` function lines ~609–639.
- `loadProgress()` / `saveProgress()` lines 552–578.
- `STORAGE_KEY = 'tiger_trap_progress_v1'` line 522.
- `openLevelSelect()` line 669 — where stars will render.
- `loadLevel()` line 1465 — reset hint counter and increment attempt counter here.
- `getHintMove()` / `showHintMove()` lines 1741, ~2880 — increment hint counter.

**Changes to make:**
- Migrate to a versioned storage key: introduce `tiger_trap_progress_v2` with a one-time migration from v1. Schema additions:
  - `progress.stars[mode][levelIdx]`: integer 0–3.
  - `progress.attemptCount[mode][levelIdx]`: integer.
  - `progress.hintsUsedThisLevel`: integer (transient, reset on `loadLevel`).
- In `loadLevel()`: reset `hintsUsedThisLevel` to 0; increment `attemptCount[mode][lvlIdx]`.
- In `showHintMove()`: increment `hintsUsedThisLevel`.
- In `registerCampaignWin()`: compute new star count using the rule above. Update stored stars to `Math.max(existing, newStars)` so re-plays only improve, never degrade.
- In level select rendering: display 1–3 stone-styled star icons next to each completed level.

**Things not to change:**
- Win/lose detection logic.
- Existing unlock progression.
- Daily / Marathon modes (campaign only for stars).

**Visual/functional acceptance checklist:**
- [ ] Solving a level for the first time at par with no hints awards 3 stars.
- [ ] Solving with hint awards a maximum of 2 stars.
- [ ] Solving above par awards 1 star.
- [ ] Stars persist after page refresh.
- [ ] Level select shows star count visually next to each level.
- [ ] v1-to-v2 migration runs once and does not lose existing progress.

**Stop condition before next task:** All three star tiers reachable through play and persist in localStorage. Commit.

---

#### Task C2 — Two-Side Daily structure

**Goal:** Convert the Daily Puzzle from single-side play to "solve as Goat, then solve as Tiger" with a shared seed. Daily is complete only when both sides are solved.

**Why this task exists:** Part 2. The asymmetric two-side daily is the unique angle no other Bagh Chal app has and is the foundation of the share loop in C4.

**Files likely to change:** `game.js`, `index.html`, `style.css`.

**Exact areas to inspect:**
- `getActiveLevel()` function lines 769–782 — daily seeding logic.
- `markDailySolved()` / `isDailySolvedToday()` lines 532–547.
- `DAILY_KEY = 'tiger_trap_daily_v1'` line 524.
- Daily UI in start screen and the in-game HUD.
- `daySeed()` line 751 — leave the seed function alone, just call it once per day for both sides.

**Changes to make:**
- Daily mode now generates ONE position per day (single seed call) used for both sides.
- Define a Daily run flow: open Daily → solve as Goat → on Goat win, transition to Tiger side of the same position → on Tiger win, mark daily complete and show share card (C4).
- Track in localStorage: `daily.goatSolved[YYYY-MM-DD]`, `daily.tigerSolved[YYYY-MM-DD]`. Daily complete = both true for today's date.
- Update `markDailySolved` and `isDailySolvedToday` to take a `side` parameter.
- Streak (C3) advances only when both sides are solved.

**Things not to change:**
- Campaign and Marathon mode logic.
- `daySeed()` function — UTC date as seed remains.
- Storage key for daily; bump to v2 if schema breaks.

**Visual/functional acceptance checklist:**
- [ ] Opening Daily on the same date in two browsers shows identical puzzle position for both sides.
- [ ] Solving the Goat side automatically transitions the player to the Tiger side of the same position.
- [ ] Daily is marked complete only when both sides solved.
- [ ] Daily resets at UTC midnight (existing behavior preserved).

**Stop condition before next task:** Full daily flow playable end-to-end with both sides verified. Commit.

---

#### Task C3 — Streak system with one rescue per week

**Goal:** Add a daily streak counter, milestone celebrations at 7/30/100/365 days, and a one-rescue-per-week mechanic that lets a player save their streak by completing yesterday's puzzle within a 24-hour grace window.

**Why this task exists:** Part 2. Streaks drive return, but only when fairness is preserved — the rescue prevents accidental breaks from travel, illness, or busy days.

**Files likely to change:** `game.js`, `index.html`, `style.css`.

**Exact areas to inspect:**
- `getStreak()` / `updateStreak()` lines 910–932.
- `renderStreak()` line 1318.
- `STREAK_KEY = 'tiger_trap_streak_v1'` line 525.
- Existing streak UI in home screen.

**Changes to make:**
- Migrate streak storage to v2 schema:
  - `streak.count`: integer.
  - `streak.lastDate`: YYYY-MM-DD string.
  - `streak.rescuesUsedThisWeek`: integer (0 or 1).
  - `streak.weekStart`: YYYY-MM-DD string of the most recent Monday UTC.
- On daily complete (both sides — see C2):
  - If `lastDate` is yesterday → increment count.
  - If `lastDate` is older → check rescue eligibility.
- Rescue logic: if the player solves yesterday's puzzle within 24h grace AND `rescuesUsedThisWeek < 1`, restore streak.
- Reset `rescuesUsedThisWeek` to 0 every Monday UTC.
- Yesterday-rescue UI: small banner on Daily screen — "Save your X-day streak — solve yesterday's puzzle." Visible only when eligible.
- Streak milestones (7, 30, 100, 365 days): each triggers a distinct overlay animation. Reward unlock hooks here for Phase 4 cosmetic system — for now, just the visual celebration.

**Things not to change:**
- Daily completion logic (use C2's both-sides-solved trigger).
- C2's daily storage schema.

**Visual/functional acceptance checklist:**
- [ ] Solving daily two days in a row shows streak = 2.
- [ ] Skipping a day, then completing yesterday within grace, preserves the streak and increments rescue counter.
- [ ] Skipping two days resets the streak to 0 even with rescue available.
- [ ] Rescue limited to 1 per week (Mon–Sun UTC).
- [ ] Hitting a milestone triggers a distinct animation.
- [ ] Manual time-travel test (stub `Date.now`) confirms all streak transitions.

**Stop condition before next task:** All streak transitions verified via stubbed time test. Commit.

---

#### Task C4 — Shareable result card

**Goal:** After Daily completion (both sides), present a Wordle-style shareable card with text and PNG export options.

**Why this task exists:** Part 2. Drives organic acquisition through social sharing — players send their result to friends, which seeds installs.

**Files likely to change:** `game.js`, `index.html`, `style.css`.

**Exact areas to inspect:**
- Existing share text logic `getShareText()` lines 2758–2797.
- `drawResultCard()`, `showResultCard()`, `hideResultCard()` lines 2631–2757.
- `_copyText()` function line 2798.

**Changes to make:**
- Build a 2-row text card on daily completion:
  ```
  Tiger Trap · Daily YYYY-MM-DD
  🐐 Goat: ★★★ (3 moves)
  🐯 Tiger: ★★ (5 moves)
  tigertrap.app
  ```
  - **Note:** keep emoji in the *shareable text* output for cross-platform rendering (recipients won't have your medallion images). The in-game UI elsewhere uses medallion art per A5.
- Add a Copy button that uses `_copyText()` to put the formatted text on the clipboard.
- When `navigator.share` is available (mobile), add a Share button invoking the native share sheet.
- Add a Download PNG option: render the card on a canvas using medallion art (not emoji) and stone-themed background, export as PNG.
- Card includes streak count if streak is active.

**Things not to change:**
- Result overlay structure for non-daily wins.
- Existing share logic for campaign/marathon (defer).
- Daily seed logic.

**Visual/functional acceptance checklist:**
- [ ] Completing daily (both sides) shows the shareable card.
- [ ] Copy button puts the formatted text on the clipboard.
- [ ] On mobile, Share button invokes the native share sheet.
- [ ] Download PNG produces a stone-themed image with medallion art.
- [ ] Real share sent via WhatsApp or iMessage renders correctly.

**Stop condition before next task:** Real share sent and verified renders correctly on at least one external app. Commit.

---

#### Task C5 — Endless → Marathon rebrand and ordered ladder

**Goal:** Rename "Endless" mode to "Marathon", convert from random repeat-prone shuffle to a fixed difficulty-ordered ladder, and track personal best.

**Why this task exists:** Part 2. Current "endless" repeats by play 7–8 (50-position pool, birthday paradox). Honest rebrand and ladder structure ship fast and fix the broken promise. Procedural generation is deferred to Phase 4.

**Files likely to change:** `game.js`, `index.html`, `style.css`.

**Exact areas to inspect:**
- `getActiveLevel()` function lines 769–782 — the endless branch.
- `RUN_TYPES` line 517.
- `SAFE_VARIANTS` line 518.
- Endless UI labels in start screen and HUD.

**Changes to make:**
- Replace user-facing "Endless" labels with "Marathon" across all UI strings.
- Keep the internal `RUN_TYPES` key as `'endless'` for backwards localStorage compatibility, OR migrate to a new key with a one-time copy of any existing best.
- Convert random selection to ordered ladder: marathon level N → `pool[N % pool.length]` in difficulty-ascending order. Pool is the union of all verified Dawn variants (skip Dusk for marathon to avoid the rotation-symmetry repeats).
- Track personal best in localStorage:
  - `marathon.longestRun`: integer (most levels cleared in a single run before failure).
  - `marathon.bestTime`: integer milliseconds for fastest clear of first N levels.
- HUD shows "Marathon — Run 7 — Best: 23".
- Home screen Marathon row shows current PB.

**Things not to change:**
- Daily logic.
- Campaign logic.
- Level data (other than the renaming/ordering).

**Visual/functional acceptance checklist:**
- [ ] Marathon plays through positions in difficulty-ascending order.
- [ ] Personal best persists in localStorage.
- [ ] No repeat positions until the ladder fully cycles.
- [ ] Home screen shows "Marathon" (not "Endless") and current PB.
- [ ] 5 consecutive marathon runs show ascending difficulty and PB updates correctly.

**Stop condition before next task:** Marathon run played end-to-end with ordering and PB verified. Commit.

---

### SECTION D — MONETIZATION (Part 3)

These tasks introduce the demo gate and Stripe-based one-time purchase. Do not start D until Section B is complete — locking buggy content damages trust.

---

#### Task D1 — Demo gate (lock content beyond Act 1)

**Goal:** Lock campaign content beyond Act 1 (levels 1–10 each side) until a `progress.purchased` flag is true. Daily and Marathon remain partially playable in demo.

**Why this task exists:** Part 3. Establishes the demo line at a generous point that lets thinking-puzzle players feel the game's depth before buying.

**Files likely to change:** `game.js`, `index.html`, `style.css`.

**Exact areas to inspect:**
- `openLevelSelect()` function line 669.
- `getUnlockedCount()` line 589, `setCurrentIndex()` line 600.
- Campaign level rendering in the level select grid.
- The progress storage from C1 (v2 schema).

**Changes to make:**
- Add `progress.purchased` boolean, defaults `false`.
- Define `DEMO_LIMIT = 10` per side as a constant near the top of `game.js`.
- In level select rendering: levels with `idx >= DEMO_LIMIT` (and `progress.purchased === false`) display as locked tiles with a stone-styled padlock overlay.
- Tapping a locked tile opens the D2 lock overlay — does not attempt to load the level.
- Marathon: cap at level 10 in demo (after that, show D2 lock overlay).
- Daily: today's puzzle remains free; archive of past dailies (when built) is gated.

**Things not to change:**
- Free-tier progression for levels 1–10.
- Tutorial and settings access.
- Star tracking (works on free or paid).

**Visual/functional acceptance checklist:**
- [ ] Without `purchased` flag, levels 11+ show locked tiles.
- [ ] Setting `progress.purchased = true` via dev console makes all levels playable.
- [ ] Marathon stops at level 10 in demo.
- [ ] Locked tile tap opens D2 overlay (or a placeholder if D2 not yet built).

**Stop condition before next task:** Manually toggling `progress.purchased` switches between locked and unlocked correctly. Commit.

---

#### Task D2 — Stone-themed unlock overlay UI

**Goal:** Build the overlay shown when the player taps a locked level. Stone aesthetic, no dark patterns.

**Why this task exists:** Part 3. This is the conversion moment — must feel premium, not predatory.

**Files likely to change:** `index.html`, `style.css`, `game.js`.

**Exact areas to inspect:**
- Existing overlay system `showOverlay()` line 2808.

**Changes to make:**
- New overlay variant for the unlock prompt with this content (premium voice, no urgency tactics):
  - **Title:** "Tiger Trap · Full Game"
  - **Body:** "40 more puzzles. Marathon mode. Daily archive. Unlock once, keep forever."
  - **Price line:** "$3.99 · one-time"
  - **Primary button:** "Unlock"
  - **Secondary button:** "Restore purchase"
  - **Tertiary text link:** "Maybe later"
- Style: stone background, medallion-button family from A1–A5. No countdown, no "limited time", no bonus offer, no scarcity language.
- Primary button click handler: placeholder for D3 (logs intent for now).
- Secondary button: placeholder for D4.
- Tertiary: dismiss overlay.

**Things not to change:**
- Existing overlay system internals.
- Other overlays (win, lose, settings sheet).

**Visual/functional acceptance checklist:**
- [ ] Lock overlay matches home screen aesthetic.
- [ ] All three CTAs styled consistently with the rest of the game.
- [ ] No dark patterns: no countdown, no false scarcity.
- [ ] Founder review confirms premium tone.

**Stop condition before next task:** Visual review against Image 5 confirms stylistic match. Commit.

---

#### Task D3 — Stripe Payment Link integration

**Goal:** Wire the D2 Unlock button to a Stripe Payment Link with no backend; on success, write the unlock flag to localStorage via a success page.

**Why this task exists:** Part 3. Zero-backend monetization for browser-first launch.

**Files likely to change:** `index.html`, new `success.html`, new `cancel.html` (optional), `game.js`, `style.css`.

**Exact areas to inspect:**
- D2 lock overlay button handler.
- Existing `progress` localStorage layer.
- The founder's Stripe dashboard (founder creates the Payment Link manually and provides the URL).

**Changes to make:**
- Founder action (out of scope for Claude Code): create a Stripe Payment Link priced at $3.99 with success URL pointing to `/success.html?session_id={CHECKOUT_SESSION_ID}` and cancel URL to `/`.
- D2 Unlock button handler: `window.location.href = STRIPE_PAYMENT_LINK_URL` (URL stored as a constant near top of `game.js`).
- Create `success.html`:
  - Stone-themed page matching home aesthetic.
  - On load: parse session_id from URL, write `progress.purchased = true` to localStorage v2 key.
  - Optionally store session_id for support recovery.
  - Confirmation message: "Unlocked. Welcome to the full game."
  - "Return to game" button → `window.location = '/'`.
- Create `cancel.html` (optional) or have cancel URL point straight back to `/`.

**Things not to change:**
- Stripe configuration itself (founder-managed).
- Other payment surfaces.
- Existing localStorage schema beyond adding `purchased`.

**Visual/functional acceptance checklist:**
- [ ] Click Unlock redirects to Stripe Checkout.
- [ ] Successful test payment (Stripe test mode) returns to success.html and unlocks the game.
- [ ] Cancelled payment returns to home, still locked.
- [ ] Unlock persists after page refresh.

**Stop condition before next task:** End-to-end test purchase in Stripe test mode unlocks the game. Commit.

---

#### Task D4 — Restore-purchase flow

**Goal:** Allow a player who purchased on one device to restore unlock on another by entering their email.

**Why this task exists:** Part 3. Players using the game in incognito mode, on a new device, or after clearing browser data need recovery.

**Files likely to change:** new `restore.html`, `game.js`.

**Exact areas to inspect:**
- D2's Restore button handler.
- Stripe Customer Portal capabilities (founder must enable in Stripe dashboard).

**Changes to make:**
- D2 Restore button → `window.location = '/restore.html'`.
- Create `restore.html`:
  - Stone-themed page.
  - Form: email input + Submit button.
  - On submit: redirect to a Stripe Customer Portal session for that email, OR if the founder later adds a tiny serverless function, query Stripe API to check for paid sessions.
  - Recommendation: use Stripe Customer Portal for the zero-code path. Founder configures the Portal in dashboard.
  - On confirmed paid status: write `progress.purchased = true` to localStorage.
  - On no match: graceful failure message — "We couldn't find a purchase for this email. Email support@tigertrap.app for help." (Replace email with founder's actual support address.)

**Things not to change:**
- D1 demo gate logic.
- D3 Stripe Payment Link configuration.

**Visual/functional acceptance checklist:**
- [ ] Test purchase email entered → unlock restored on a clean browser.
- [ ] Random email → graceful failure message, no console errors.
- [ ] Restore page matches stone aesthetic.

**Stop condition before next task:** Restore test passes for a known-paid email on a clean browser. Commit.

---

#### Task D5 — Tip jar in Settings

**Goal:** Add a "Support development" section in the Settings sheet with three tip-amount buttons. Captures voluntary payment from free-tier players.

**Why this task exists:** Part 3. Many free-tier players in the thinking-puzzle audience will tip voluntarily. Non-coercive, non-mechanical.

**Files likely to change:** `index.html`, `style.css`, `game.js`.

**Exact areas to inspect:**
- Settings sheet markup `index.html` lines 39–58.

**Changes to make:**
- Add a new section in the Settings sheet, below the existing rows:
  - Heading: "Support development"
  - Three tip buttons. Default amounts (founder may override based on audience currency):
    - $1.99 / $4.99 / $9.99 OR ₹150 / ₹400 / ₹800.
  - Each button opens a separate Stripe Payment Link for that tip amount (founder creates each link).
  - On success: small thank-you confirmation. **No game-mechanical reward.** No XP, no extra lives, no cosmetic — this is voluntary support, not a transaction.

**Things not to change:**
- Other settings rows.
- D1–D4 unlock flow.
- Game mechanics in any way.

**Visual/functional acceptance checklist:**
- [ ] Settings sheet shows the new tip section.
- [ ] Each tier button opens the correct Stripe link.
- [ ] Tip purchases do not affect locked/unlocked state.
- [ ] Thank-you confirmation matches stone aesthetic.

**Stop condition before next task:** Tip flow tested for one amount in Stripe test mode, no side effects on unlock state. Commit.

---

### SECTION E — STORE READINESS (Part 4 — dev portion only)

These tasks cover the dev work to make Tiger Trap installable as a PWA and ready to wrap with Capacitor for app store submission. Asset production (icons, screenshots, store listings) and store-account setup are founder tasks, not Claude Code tasks.

---

#### Task E1 — PWA manifest

**Goal:** Add a complete web app manifest enabling Add to Home Screen on iOS and Android.

**Why this task exists:** Part 4. Gateway to PWA install and prerequisite for both store wrapping paths.

**Files likely to change:** new `manifest.webmanifest`, `index.html`.

**Exact areas to inspect:**
- Existing favicon and icon setup in `index.html` head.
- `assets/pieces/tiger-piece.png` as the source for icon generation.

**Changes to make:**
- Create `manifest.webmanifest` at site root with:
  - `name`: "Tiger Trap"
  - `short_name`: "Tiger Trap"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: matches splash background.
  - `theme_color`: matches stone palette accent.
  - `orientation`: "portrait-primary"
  - `icons`: array including 192×192, 512×512, and maskable variants. Generated from the medallion tiger.
- Add `<link rel="manifest" href="/manifest.webmanifest">` to `<head>` in `index.html`.
- Add `<meta name="theme-color" content="...">` matching the manifest theme_color.
- Add `<meta name="apple-mobile-web-app-capable" content="yes">` and related Apple-specific meta tags.

**Things not to change:**
- Game logic.
- Existing meta tags (audit for conflicts only).

**Visual/functional acceptance checklist:**
- [ ] Lighthouse PWA audit passes manifest checks.
- [ ] "Add to Home Screen" prompt appears on Chrome Android.
- [ ] Installed PWA opens in standalone mode without browser chrome.
- [ ] Icons display correctly on iOS home screen.

**Stop condition before next task:** Lighthouse PWA installability score ≥ 90. Commit.

---

#### Task E2 — Service worker for offline play

**Goal:** Cache all static assets so the game functions fully offline after first load.

**Why this task exists:** Part 4. Both stores expect offline functionality for puzzle games. PWA users expect it.

**Files likely to change:** new `sw.js`, `index.html` (or `game.js` for registration).

**Exact areas to inspect:**
- All assets in `/assets/`.
- All script and style references in `index.html`.

**Changes to make:**
- Create `sw.js` implementing:
  - `install` event: precache `index.html`, `style.css`, `game.js`, `manifest.webmanifest`, all files in `/assets/`, `success.html`, `restore.html`.
  - `fetch` event: cache-first strategy for static assets; network-only for any Stripe-related URLs (never cache payment endpoints).
  - `activate` event: clear stale caches on `CACHE_VERSION` bump.
- Define `CACHE_VERSION` as a constant at the top of `sw.js`. Bump it on every meaningful release.
- Register the service worker from `index.html` or `game.js` init.

**Things not to change:**
- Network requests for Stripe (must be network-only).
- Game logic.

**Visual/functional acceptance checklist:**
- [ ] Load game online once, then disconnect network — full game still playable.
- [ ] Lighthouse PWA audit passes offline checks.
- [ ] Cache invalidates correctly on `CACHE_VERSION` bump (verify by bumping and reloading).
- [ ] Stripe payment flow correctly fails offline (does not serve a cached redirect).

**Stop condition before next task:** Full level playable in airplane mode after one online load. Commit.

---

#### Task E3 — Safe area handling

**Goal:** Ensure UI does not overlap iPhone notch, home indicator, or Android gesture bars.

**Why this task exists:** Part 4. Store reviewers reject apps where critical UI is hidden behind device chrome.

**Files likely to change:** `index.html`, `style.css`.

**Exact areas to inspect:**
- Top bar styling (`#start-topbar`, in-game top button row).
- Bottom button row in-game.
- Splash screen padding.

**Changes to make:**
- Add `viewport-fit=cover` to the existing viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Apply `padding-top: env(safe-area-inset-top)` to all top bars.
- Apply `padding-bottom: env(safe-area-inset-bottom)` to all bottom button rows.
- Apply `padding-left: env(safe-area-inset-left)` and `padding-right: env(safe-area-inset-right)` to side-edge elements where relevant (landscape iPhone).

**Things not to change:**
- Game canvas sizing logic (already adaptive).
- Internal layout — only add the safe-area insets.

**Visual/functional acceptance checklist:**
- [ ] On iPhone with notch: no UI under the notch, no UI under the home indicator.
- [ ] On Android with gesture bar: bottom buttons not overlapped.
- [ ] On older devices without safe areas: no visual regression.
- [ ] Tested on at least one iOS simulator/device and one Android emulator/device.

**Stop condition before next task:** Verified on at least one iOS and one Android device or simulator. Commit.

---

#### Task E4 — Touch target audit

**Goal:** Ensure all tappable elements meet the 44×44pt minimum touch target size required by both store accessibility guidelines.

**Why this task exists:** Part 4. Store accessibility checks. Founder Image 1 already shows top/bottom in-game buttons at sub-44px sizes.

**Files likely to change:** `style.css`, possibly `index.html`.

**Exact areas to inspect:**
- In-game top buttons (Home, Sound, Pause).
- In-game bottom buttons (Restart, Hint, Undo, Help).
- Home screen tabs (CAMPAIGN, DAILY, MARATHON).
- Settings sheet rows.
- Onboard card Next/Skip buttons.

**Changes to make:**
- Audit each tappable element's computed touch area in dev tools.
- Where below 44×44px, increase padding (visual size can stay smaller if desired; padding extends the hit area).
- Add `min-width: 44px; min-height: 44px;` to a base button class applied to all interactive elements.

**Things not to change:**
- Visual proportions of elements that already meet the size.
- Functional handlers.

**Visual/functional acceptance checklist:**
- [ ] All interactive elements measure ≥ 44×44pt in dev tools.
- [ ] Lighthouse accessibility audit passes the tap target check.
- [ ] No visual regression on the home screen.

**Stop condition before next task:** Lighthouse accessibility score for tap targets is 100. Commit.

---

## Run Order Guidance

### Tasks safe to run alone (no dependencies)

- **A1, A2, A3, A4** — visual fixes are independent of each other and of all logic work. Order them by founder priority.
- **A5** — should run *after* A1–A4 if those tasks introduce or remove image references, otherwise can run alone. Touches some of the same files.
- **B7** — stalemate detection, pure logic, no other dependencies.
- **B4** — Dusk goal-text fix, only touches `transformLevel()`.
- **E1, E2, E3, E4** — PWA/store-readiness tasks, totally independent of game changes. Can run in parallel with any other work.

### Strict dependency chains




- **B1 → B2** — B2 fixes hints; B1 replaces the broken East Corridor level whose hint is one of the six.
- **B1, B2, B3 → B5** — culling re-indexes the array; complete the per-level fixes first.
- **B5 → B6** — re-tune surviving levels only after duplicates are removed.
- **B6 → C1** — star tracking depends on accurate par values.
- **C1 → C2** — daily uses star tracking and the new progress schema.
- **C2 → C3** — streak depends on daily completion (both sides solved).
- **C2 + C3 → C4** — share card includes both sides' results plus streak count.
- **C5** — independent of C1–C4 (Marathon is its own thing). Can run anytime after Section B.
- **B5 + B6 → D1** — do not lock content that's still buggy.
- **D1 → D2** — overlay shown when the gate is hit.
- **D2 → D3** — Stripe redirect from D2 button.
- **D3 → D4** — restore depends on Stripe being set up.
- **D3 → D5** — tip jar uses the same Stripe pattern as D3.

### Recommended execution order for a solo founder


0. B7   ← warmup, builds confidence in the loop
1. B4   ← second warmup, also small, fixes 8 critical issues at once
2. A1 → A3 → A4   ← visual quick wins, in that order
3. B1 → B2 → B3 → B5 → B6   ← rest of foundation correctness
4. A2 → A5   ← remaining visual
5. E1 → E2 → E3 → E4   ← can run in parallel with section 6 below
6. C1 → C2 → C3 → C4   (C5 anytime after B6)
7. D1 → D2 → D3 → D4 → D5

1. Quick wins to fix trust and look: A1 → A3 → A4 (the most visible issues).
2. Foundation correctness: B7 → B4 → B1 → B2 → B3 → B5 → B6.
3. Remaining visual: A2 → A5.
4. Store readiness setup (can run in parallel with C work): E1 → E2 → E3 → E4.
5. Retention loop: C1 → C2 → C3 → C4. Optionally C5 anytime after B6.
6. Monetization once retention is proven: D1 → D2 → D3 → D4 → D5.

---

## Verification Master Checklist

End-state confirmation before declaring Phase 2 complete.

### Foundation correctness
- [ ] `node audit.mjs` reports zero unsolvable levels.
- [ ] `node audit.mjs` reports zero broken hints across all cores.
- [ ] `node audit.mjs` reports zero ESCAPE GOAL-TEXT MISMATCH entries.
- [ ] `node audit.mjs` reports zero duplicate positions.
- [ ] `node audit.mjs` reports par == moveLimit (or `exactMoves:false` justified) for every campaign level.
- [ ] Soft-stalemate position resolves immediately, not at moveLimit timeout.

### Visual parity
- [ ] Splash screen visually matches home page on three viewport sizes.
- [ ] Onboard tutorial uses stone background, medallion icons, stone-button family.
- [ ] Home page background appears as one continuous surface; text contrast clean; mode tabs and streak row match Image 5 proportions.
- [ ] In-game board has no visible double-grid; triangle escape indicator aligned to corner; top and bottom buttons in stone family, ≥ 44×44px; no excess vertical empty bands.
- [ ] `grep "🐯\|🐐"` in user-facing strings returns zero matches (excluding share-card text output, which intentionally keeps emoji for cross-platform rendering).

### Retention loop
- [ ] Star ratings (1/2/3) computed correctly and persist across refresh.
- [ ] v1-to-v2 progress migration runs once without losing existing progress.
- [ ] Daily Puzzle: same seed across two browsers on the same date for both sides.
- [ ] Daily completion requires both sides solved.
- [ ] Streak increments on consecutive daily completes.
- [ ] One rescue per week works; second attempt blocked.
- [ ] Streak milestones at 7/30/100/365 fire distinct animations.
- [ ] Share card copy text and PNG export both work; real share via WhatsApp/iMessage renders correctly.
- [ ] Marathon plays in difficulty-ascending order; PB persists; no repeats until ladder cycles.

### Monetization
- [ ] Levels 11+ locked without `progress.purchased`.
- [ ] D2 lock overlay matches stone aesthetic; no dark patterns.
- [ ] Stripe test-mode purchase unlocks all gated content.
- [ ] Restore purchase works on a clean browser for a known-paid email.
- [ ] Tip jar present in Settings; tips do not affect unlock state.

### Store readiness
- [ ] Lighthouse PWA installability score ≥ 90.
- [ ] Game playable in airplane mode after one online load.
- [ ] No UI overlapped by iPhone notch, home indicator, or Android gesture bars.
- [ ] Lighthouse accessibility score for tap targets is 100.

### Working rules adherence
- [ ] No backend introduced.
- [ ] No predatory monetization (no countdowns, scarcity, retry tax, ads, energy, coins, XP, battle pass).
- [ ] All level changes verified by solver before commit.
- [ ] Commits made after every task, not batched.

---

*End of CLAUDE_PHASE2.md*
