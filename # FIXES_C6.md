# FIXES_C6.md — Visual polish pass before Section D

> Run each task as a separate Claude Code session. Commit after each. Do not chain tasks. After every task, do a manual walkthrough on a 375px viewport. The aesthetic target is the medallion-stone reference image — premium, carved, ancient, not modern flat UI. If a task starts requiring file refactors beyond what's listed, stop and ask.

---

## Task C6.1 — Tutorial overlay buttons converted to stone family

**Goal:** The tutorial header `Close` button and the tutorial footer `Step N →` button must visually match the in-game stone button family already established for `.btn-primary` / `.btn-secondary` (style.css lines ~1720–1768) and the home page CTAs.

**Why this task exists:** Image 1 shows `Close` rendered as a thin pill outline and `Step 2 →` as a flat orange rectangle. Both contradict the stone aesthetic the rest of the game now uses. The current rules at style.css lines 471–476 (`#tut-close`) and 507–512 (`#tut-next`) win specificity battles against newer Task 7 overrides at lines ~1748–1768 in some viewports, leaving the tutorial as the only screen where buttons still look like a different app.

**Files to edit:** `style.css` only.

**Exact changes:**
1. Locate the `#tut-close` rule at style.css ~line 471 and replace it with:
```css
   #tut-close {
     background: linear-gradient(175deg, #1E1408 0%, #140E06 100%);
     border: 1px solid rgba(180,120,40,.35);
     border-bottom: 2px solid rgba(0,0,0,.5);
     color: #A07838;
     border-radius: 999px;
     padding: 8px 16px;
     font-size: 10px;
     letter-spacing: 2px;
     text-transform: uppercase;
     cursor: pointer;
     font-family: inherit;
     box-shadow: inset 0 1px 0 rgba(255,200,80,.06), 0 2px 5px rgba(0,0,0,.4);
     min-height: 36px;
     transition: border-color .18s, color .18s;
   }
   #tut-close:hover, #tut-close:focus-visible {
     outline: none;
     color: #E8A030;
     border-color: rgba(232,135,26,.5);
   }
   #tut-close:active { transform: translateY(1px); border-bottom-width: 1px; }
```
2. Verify `#tut-skip` and `#tut-next` already pick up the Task 7 overrides at lines ~1748–1768. If the `!important` rules there are not winning (test in dev tools), increase specificity by prefixing with `#tutorial-screen #tut-skip` and `#tutorial-screen #tut-next`.
3. Confirm the dot indicators `.tut-dot.active` at style.css ~line 470 still match the orange accent — leave untouched.

**Acceptance criteria:**
- Tutorial `Close` and footer buttons share the same stone family as in-game `Restart` / `Hint` / `Undo` / `Help`.
- No flat orange rectangle anywhere in the tutorial.
- Tutorial walked through on 375px viewport with consistent button styling on every step.

**Stop condition:** Side-by-side screenshot comparison of tutorial buttons and home CTAs shows visual continuity. Commit.

---

## Task C6.2 — Home screen Tiger/Goat tile vertical layout

**Goal:** The Tiger and Goat mode cards on the home screen must lay out vertically as: medallion image at top with breathing room → title below it → fantasy/description text below title → CTA button anchored at the bottom. No element overlaps another. Targets the layout shown in the founder's reference image.

**Why this task exists:** Image 3 shows the Tiger and Goat tiles with the medallion bleeding into the title text and the description nearly touching the CTA. The cards feel cramped because `.mode-card` (style.css ~line 61, refined later at lines ~1175–1215) uses padding that hasn't been adjusted for the medallion image insertion done in A5.

**Files to edit:** `style.css` only.

**Exact changes:**
1. Audit current `.mode-card`, `.mode-card-title`, `.mode-card-fantasy`, `.mode-card-cta`, `.mode-progress` rules. Identify whichever rule has the highest specificity for layout (likely the Stone Skin override block).
2. Add a single layout block that wins specificity:
```css
   #start-screen .mode-card {
     display: flex !important;
     flex-direction: column !important;
     align-items: center !important;
     justify-content: flex-start !important;
     padding: 18px 12px 14px !important;
     min-height: 232px !important;
     gap: 0 !important;
   }
   #start-screen .mode-card .mode-card-medallion,
   #start-screen .mode-card::before {
     /* whichever is the medallion source */
     margin-top: 4px !important;
     margin-bottom: 14px !important;
     flex: 0 0 auto !important;
   }
   #start-screen .mode-card .mode-card-title {
     margin-top: 0 !important;
     margin-bottom: 8px !important;
     flex: 0 0 auto !important;
   }
   #start-screen .mode-card .mode-card-fantasy {
     margin-bottom: 14px !important;
     flex: 0 0 auto !important;
     line-height: 1.45 !important;
   }
   #start-screen .mode-card .mode-card-cta {
     margin-top: auto !important;
     margin-bottom: 0 !important;
   }
   #start-screen .mode-card .mode-progress {
     margin-top: 10px !important;
     padding-top: 8px !important;
     border-top: 1px solid rgba(180,120,40,.18) !important;
   }
```
3. If A5 inserted the medallion as `background-image` on `.mode-card::before`, give the pseudo-element an explicit `height` (e.g., 64px) so it claims layout space rather than overlapping content.

**Acceptance criteria:**
- Medallion image is fully visible with at least 12px below it before the title.
- Title sits cleanly below the medallion with no character clipping by the medallion.
- Fantasy text never visually touches the CTA.
- CTA button anchored at the card bottom; "Loading…" / progress strip sits below the CTA divided by a thin separator.
- Both Tiger and Goat tiles have identical vertical rhythm.

**Stop condition:** Mobile screenshot at 375px shows vertical: medallion → title → desc → CTA → progress, no overlaps. Commit.

---

## Task C6.3 — In-game board: lines, tiger triangle outline, frame border

**Goal:** Three issues on the in-game board: (1) grid lines look like thin SVG strokes instead of carved-stone grooves; (2) the orange triangle outline around the tiger piece is offset from the piece geometry; (3) the dark border around the board frame breaks visual continuity with the dark stone background.

**Why this task exists:** Image 2 shows all three problems simultaneously. The board is the focal point of every gameplay moment; these three artifacts undermine the premium aesthetic 100% of playtime.

**Files to edit:** `game.js` (canvas drawing only — no game logic), `style.css`.

**Exact changes:**

**Sub-task A — Carved stone lines:**
1. Locate `drawLines()` in game.js (per Phase 2 plan it's around line 2109). Find the `ctx.strokeStyle` and `ctx.lineWidth` assignments.
2. Replace the current single thin stroke with a two-pass draw that creates a carved-groove illusion:
```javascript
   // Pass 1: dark inset shadow line (offset down/right by 1px)
   ctx.strokeStyle = 'rgba(8,5,2,0.85)';
   ctx.lineWidth = 2.5 * dpr;
   ctx.lineCap = 'round';
   // ... existing draw code with +1 offset
   
   // Pass 2: warm highlight line (offset up/left by 1px)
   ctx.strokeStyle = 'rgba(160,110,50,0.55)';
   ctx.lineWidth = 1.5 * dpr;
   // ... existing draw code with -1 offset
```
3. Test at devicePixelRatio 1, 2, and 3 — lines should look engraved at all DPRs.

**Sub-task B — Tiger triangle outline alignment:**
1. Locate where the tiger highlight triangle is drawn (look for `drawTiger`, `drawSelectedTiger`, or wherever the `selected` indicator renders). The orange glow visible in Image 2 sits offset from the medallion.
2. The fix is geometric: the triangle's three vertices must be computed from the same `nxy(node)` coordinate that places the tiger image, not from a separate offset constant. Search for any literal pixel offsets being added/subtracted around the triangle vertex calculation and remove them.
3. The triangle radius should be `tigerImageRadius * 1.15` (or whatever ratio looks right) — derive it from the image size, not a hardcoded number.

**Sub-task C — Board border blending:**
1. In style.css, find the `#board` rule (line 192: `#board { display:block; touch-action:none; border-radius:6px; }`).
2. Replace with:
```css
   #board {
     display: block;
     touch-action: none;
     border-radius: 10px;
     box-shadow: 0 4px 24px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(180,110,30,0.10);
   }
```
3. Remove any `border:` rule on `#board-container` or `#board` that currently produces a hard black edge. Search style.css for `#board.*border:` and `#board-container.*border:` — comment out hard-color borders.

**Things not to change:**
- Game logic: move validation, AI scoring, capture detection.
- Coordinate system, GRAPH, node positions.
- Tiger piece image asset itself.

**Acceptance criteria:**
- Board lines visibly look like carved grooves, not SVG strokes, at any DPR.
- Tiger triangle outline visually wraps the tiger medallion symmetrically with no offset.
- No hard dark line separating the board from the page background — the board reads as part of the stone surface.

**Stop condition:** Side-by-side screenshot of in-game board against Image 2 shows all three artifacts resolved. Commit.

---

## Task C6.4 — In-game top-bar buttons converted to stone family

**Goal:** The Home (`⌂`), Sound (`🔊`), and Pause (`⏸`) buttons in the in-game top bar must match the same stone medallion button family used by `.start-icon-btn` on the home page.

**Why this task exists:** Image 2 shows three small thin-bordered circles. Task 6 in style.css (lines ~1700–1715) added stone styling for `#btn-sound` and `#btn-pause` but `#btn-home` was never given the same treatment, and the existing `#btn-sound` styling at lines 384–404 may still be winning specificity battles in some viewports.

**Files to edit:** `style.css` only.

**Exact changes:**
1. Add a unified rule block:
```css
   #top-bar #btn-home,
   #top-bar #btn-sound,
   #top-bar #btn-pause {
     background: linear-gradient(175deg, #1E1408 0%, #140E05 100%) !important;
     border: 1px solid rgba(180,120,40,.32) !important;
     border-bottom: 2px solid rgba(0,0,0,.45) !important;
     border-radius: 999px !important;
     color: #A07838 !important;
     min-width: 44px !important;
     min-height: 44px !important;
     padding: 0 !important;
     display: flex !important;
     align-items: center !important;
     justify-content: center !important;
     font-size: 16px !important;
     box-shadow: inset 0 1px 0 rgba(255,200,80,.06), 0 2px 6px rgba(0,0,0,.4) !important;
     cursor: pointer;
     font-family: inherit;
   }
   #top-bar #btn-home:hover, #top-bar #btn-home:focus-visible,
   #top-bar #btn-sound:hover, #top-bar #btn-sound:focus-visible,
   #top-bar #btn-pause:hover, #top-bar #btn-pause:focus-visible {
     border-color: rgba(232,135,26,.5) !important;
     color: #E8A030 !important;
     outline: none;
   }
```
2. Confirm the `🔊` icon in the Sound button still toggles on mute correctly (this is style-only, no JS change).

**Acceptance criteria:**
- All three top-bar buttons read as carved stone medallion buttons.
- All measure ≥ 44×44px in dev tools.
- Visual continuity with the home page `⚙️` and `🔊` buttons.
- Sound mute state still visually indicated (opacity drop preserved).

**Stop condition:** In-game top bar screenshot side-by-side with home page top bar shows identical button family. Commit.

---

## Task C6.5 — In-game `Tiger Mode` / `Goat Mode` label: relocation and typography

**Goal:** Move the `TIGER MODE` / `GOAT MODE` label out of the top-center cluster (where it competes with the level name and goal text) and place it on its own line between the top bar and the status row containing `Your Turn` and the move counter. Increase its size and apply the game's serif/display typography style.

**Why this task exists:** In Image 2 the `TIGER MODE` label is tiny, jammed under the goal text, and visually subordinate. It should be a clear context anchor — players need to know which side they're playing without hunting for a tag.

**Files to edit:** `index.html`, `style.css`. Possibly minor JS class toggle if mode-tag insertion happens dynamically.

**Exact changes:**
1. In `index.html`, locate `#top-center` (around line 156). Move `<div id="mode-tag" class="goat">Goat</div>` out of `#top-center`, and place it as a new sibling element between `#top-bar` and `#status-row`:
```html
   </div> <!-- end #top-bar -->
   
   <div id="mode-tag-row">
     <div id="mode-tag" class="goat">Goat Mode</div>
   </div>
   
   <div id="status-row">
```
2. In style.css, add a fresh rule block (the existing `#mode-tag` rules at lines 154, 249, 1701 will still apply for color/border):
```css
   #mode-tag-row {
     flex: 0 0 auto;
     display: flex;
     justify-content: center;
     padding: 6px 0 8px;
   }
   #mode-tag-row #mode-tag {
     font-size: 12px !important;
     letter-spacing: 3px !important;
     padding: 6px 16px !important;
     margin: 0 !important;
   }
```
3. If JS sets `tag.textContent = 'Tiger Mode'`, leave it. If it sets just `'Tiger'`, update to include `' Mode'`.

**Acceptance criteria:**
- Mode tag sits on its own row between top bar and status row.
- Larger and more prominent than current ~9px display.
- No longer overlaps or competes with `Level X · Breakout` and goal text.
- Color/border still differs by tiger vs goat (existing classes preserved).

**Stop condition:** In-game screenshot shows mode tag clearly visible as a context anchor at the top of the play area. Commit.

---

## Task C6.6 — In-game vertical layout: unify three sections into one cohesive screen

**Goal:** The current in-game screen visually reads as three separate slabs (top bar / board / bottom bar) with awkward dead space between them. Tighten vertical spacing and add subtle visual continuity (e.g., a faint vertical glow column or matching background scrim) so the screen reads as one carved gameplay surface.

**Why this task exists:** Image 2 shows large empty bands above and below the board that visually disconnect the HUD from the gameplay. A unified single-screen feel is one of the differentiators against off-the-shelf board game apps.

**Files to edit:** `style.css` only.

**Exact changes:**
1. Reduce vertical padding on `#top-bar` (line ~239) from `padding: 6px 0 4px` to `padding: 4px 0 2px`.
2. Reduce `#status-row` padding similarly (find current rule, target ~6px vertical).
3. Reduce `#board-container` padding from 4px to 2px vertical (style.css line ~191).
4. Reduce `#bottom-bar` top padding from 7px to 4px (line ~195).
5. Reduce `#move-band` margins to 4px vertical.
6. Add a subtle full-screen background continuity layer to `#game-screen`:
```css
   #game-screen {
     background-image: url("assets/bg/stone-bg.jpg");
     background-size: cover;
     background-position: center;
     background-repeat: no-repeat;
   }
   #game-screen::before {
     content: '';
     position: fixed; inset: 0;
     background: radial-gradient(ellipse at center, rgba(60,38,12,0.0) 0%, rgba(6,4,2,0.55) 100%);
     pointer-events: none;
     z-index: 0;
   }
```
   (Verify the existing `#game-screen::before` rule from earlier work doesn't conflict; merge if needed.)
7. Verify board still fits within available vertical space at 375×667 viewport without scroll.

**Things not to change:**
- Canvas sizing logic in `setupCanvas()`.
- Top/bottom bar element IDs and class names.

**Acceptance criteria:**
- No more than 6px of empty vertical space between any two sections.
- Background reads as one continuous stone surface from top edge to bottom edge.
- Board fills more vertical space; no clipping at 375×667.
- Top bar, board, and bottom bar visually anchor together rather than floating as separate slabs.

**Stop condition:** Screenshot at 375×667 shows a unified gameplay screen. Commit.

---

## Task C6.7 — Tutorial canvas illustrations updated to current board and piece art

**Goal:** The tutorial canvas (`#tut-canvas`, drawn by `_drawTutFrame`, `_drawTutGoatAt`, `_drawTutTiger`) currently still shows an older board look and a primitive triangle for the tiger with an oversized misaligned outline. Update all tutorial illustrations to use: (a) the current board grid styling, (b) the medallion goat image, (c) the medallion tiger image, (d) any selection/escape outline drawn precisely fit to the piece radius with no offset.

**Why this task exists:** Image 1 shows the tutorial board still rendering with the old aesthetic — circles for goats, triangle for tiger, thin lines. This contradicts what the player sees in actual gameplay and is jarring on first impression.

**Files to edit:** `game.js` only.

**Exact changes:**
1. Locate `_drawTutFrame()` (Phase 2 doc says ~line 1066). Apply the same two-pass carved-groove line draw from Task C6.3 sub-task A.
2. Locate `_drawTutGoatAt()` (~line 1166). If A5 is complete, this should already use `ctx.drawImage(goatImg, ...)`. Verify. If still drawing primitive circles, replace with image draw using the same `assets/pieces/goat-piece.png` reference loaded in main game init.
3. Locate `_drawTutTiger()` (~line 1174). Replace the primitive triangle draw with `ctx.drawImage(tigerImg, ...)`. The image's bounding box and the highlight outline (if any) must use the same `pieceRadius` constant — eliminate any hardcoded outline offset.
4. Image sizing in tutorial canvas: tutorial board is smaller than gameplay board, so derive `pieceRadius` from `tutCanvas.width / GRID_SIZE * 0.4` rather than a fixed pixel count.
5. Test all tutorial steps render the same piece art the player sees in real gameplay.

**Things not to change:**
- Tutorial step content (text, sequencing, animation timing).
- Tutorial flow logic.
- Image asset filenames.

**Acceptance criteria:**
- Tutorial board lines look identical to in-game board lines.
- Tutorial goats are medallion images, not white circles.
- Tutorial tiger is medallion image, not orange triangle.
- Any selection/highlight outline precisely wraps the piece with no offset.
- Walked through all tutorial steps with no visual regression.

**Stop condition:** Tutorial walkthrough shows visual continuity with in-game board on every step. Commit.