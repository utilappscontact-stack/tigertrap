# CLAUDE_NEXT.md — Tiger Trap Visual Fix Plan
> Task runner for Claude Code sessions. Each task is self-contained and independently runnable.
> Do NOT implement puzzle logic, AI, audio, or asset changes in any task.

---

## 1. Diagnosis — Root Causes of Current Visual Regressions

### 1.1 Background Texture Invisible (Critical)
The Stone Skin block in `style.css` correctly sets:
```css
html, body { background-image: url("assets/bg/stone-texture.jpg"); }
```
But every `.screen` element has `position:absolute; inset:0` and a **solid opaque background**:
- `#start-screen { background:#120D07; }` — hides body texture completely
- `#game-screen  { background:#120D07; }` — same problem

The texture is painted on the `body` but the screens are full-viewport opaque divs on top. The texture is never visible. Fix Pass 2 did not address this.

**Fix direction:** Apply the texture directly to `#start-screen`, `#game-screen`, and `#tutorial-screen` using a `background-image` layer with the correct `background-size`. Remove the opaque solid background from each screen.

### 1.2 Home Screen Content Compressed Upward
Fix Pass 2 applies `justify-content:flex-start !important` and `padding-top:max(env(safe-area-inset-top),12px)`. This is too tight for desktop. The `.start-glow` div (an absolute-positioned 280×280 radial circle) is rendered but does nothing useful — it's just extra invisible space. The card area fills only a narrow band near the top of the viewport.

The old `CLAUDE.md` assumed a mobile-first narrow viewport. On a wider window (~900px), the start-screen has no max-width cap, and all elements are center-aligned with `align-items:center`, but left-over vertical space below is just dead black.

**Fix direction:** Give `#start-screen` a comfortable `padding-top` (around 20–28px) and ensure the content block has a sensible `max-width` (like 400px) so it feels like a centered card on desktop.

### 1.3 Tiger and Goat Cards Too Small
`.mode-cards { max-width:330px }` with `flex:1` cards. The card base style is only `padding:22px 10px 18px` with no `min-height`. The background images are set to `background-size:100% 100%`, so they stretch/squish to whatever the card content height turns out to be.

On most viewports, the card height resolves to around 130–150px — far too short to show the photo medallion prominently. The concept shows cards that are approximately square or taller than wide (roughly 160px tall in a 330px-wide pair, each card ~155px wide).

**Fix direction:** Add `min-height: 190px` to `.mode-card`, increase `padding` top/bottom, and check that `background-size:100% 100%` vs `cover` is intentional. (100% 100% distorts if the card aspect ratio changes — `cover` is safer for photo cards.)

### 1.4 Tabs and Run-Buttons Not Carved Stone
Three separate conflicting `.start-run-btn` rule blocks exist: lines ~46, ~647, and ~1125 in `style.css`, plus Fix Pass 2 adds a 4th at line ~1117. Later blocks partially override earlier ones but no single pass fully controls the final look.

The HTML still has emoji icons in the tab buttons (`📖`, `🗓`, `∞`) which look inconsistent against the stone theme. The concept shows text-only: `CAMPAIGN · DAILY · ENDLESS` in uppercase spaced caps — no emoji. The tab container (`.start-run-row`) is not styled as a stone tray/slab container the way the concept image shows.

**Fix direction:** In `index.html`, replace emoji `<span class="run-icon">…</span>` spans with nothing (text only). In `style.css`, add a clean final override for `.start-run-row` (as a slab container with border + dark bg) and `.start-run-btn` that overrides all earlier conflicting blocks using higher specificity or `!important` selectively.

### 1.5 Game Board Grid Lines Too Heavy/Noisy
`drawLines()` now draws two passes per line: a dark stroke (opacity 0.72–0.82) plus a 0.6px light chiselled highlight. But the `board-stone.jpg` photo already has natural texture and some darkness variation. The black strokes at 1.2–1.6px with 0.72–0.82 opacity are too dark and create a visible harsh grid.

Comparing the current screenshot (Image 4) against the concept (Image 2), the concept board lines are very faint — almost engraved, barely visible. They look more like shallow grooves in stone than drawn lines.

**Fix direction:** In `drawLines()`, reduce the dark stroke opacity to around 0.35–0.50 for diagonal lines and 0.45–0.60 for orthogonal lines. Reduce line width on diagonals to 0.9–1.0px. The highlight pass can be dimmed further (0.06–0.10). The net effect should be lines that read as carved, not painted.

### 1.6 Game Pieces Oversized Relative to Board
Current piece radii:
- Goat: `cell * 0.44` → image drawn at diameter `r * 2` = `cell * 0.88`
- Tiger: `cell * 0.52` → image drawn at `r * 2` = `cell * 1.04`

At these ratios, pieces nearly fill the full gap between board nodes. In the screenshot, goats overlap each other visually. In the concept (Image 2), pieces are clearly smaller — roughly 55–60% of the inter-node space.

**Fix direction:** In `drawGoats()`, reduce radius to `cell * 0.35`. In `drawTiger()`, reduce radius to `cell * 0.40`. These are the only two lines to change — all downstream sizing (image draw calls) scales from these multipliers.

### 1.7 In-Game HUD and Bottom Controls Partially Themed
Fix Pass 2 adds styling for `#btn-restart`, `#btn-hint`, `#btn-undo`, `#btn-howtoplay`, and `#turn-pill`. But:
- The bottom button bar still uses emoji in labels (`💡`, `↺`, `↩`, `?`) — inconsistent with stone theme
- `#btn-sound` and `#btn-pause` in the top bar use emoji (🔊, ⏸) with no stone styling
- `#mode-tag` (the "TIGER MODE / GOAT MODE" pill) has no stone-skin override in Fix Pass 2
- The `#status-row` background is transparent (looks fine), but the move-arc SVG has minimal stone styling

**Fix direction:** Keep emoji where they serve as functional icons (🔊, ⏸ are universally understood). Style `#btn-sound` and `#btn-pause` to match `.top-btn-icon`. Restyle `#mode-tag` with a carved-amber look. Update `#btn-restart` and `#btn-undo` label text to plain "RESTART" and "UNDO" (drop ↺ ↩ if they look off). Add stone-slab depth to `.btn-primary` and `.btn-secondary` overrides.

### 1.8 Tutorial Buttons Not Carved Stone Slabs
The concept (Image 2) shows:
- **SKIP**: a dark grey stone slab with chiselled edge, inset border, letter-spaced caps
- **STEP 3 →**: an amber warm stone slab with raised border and warm gradient

Current state: `#tut-skip` is a minimal borderless transparent button. `#tut-next` has a flat amber fill. Neither has the dimensional, embossed stone-slab quality of the concept. The Fix Pass 2 Stone Skin block adds a gradient to `#tut-next` but no border-bottom or box-shadow depth. `#tut-skip` is untouched in Fix Pass 2.

**Fix direction:** Add stone-slab depth to both buttons. `#tut-skip` needs: dark gradient background, visible border, `border-bottom: 2px solid` for depth, box-shadow. `#tut-next` needs: `border-bottom: 3px solid rgba(100,50,5,.7)`, amber glow box-shadow, and the gradient from Fix Pass 2 confirmed active.

---

## 2. Working Rules (for all Claude Code sessions)

- **NEVER touch puzzle logic, AI algorithms, level data arrays, or move validation**
- **NEVER modify audio code** (sound buffers, Tone.js, AudioContext)
- **NEVER modify files in `assets/`** — images are correct, paths are correct
- **Do not rename or restructure HTML elements** — only style them
- **Preserve all fallback rendering paths** in game.js (the `else` branches for missing images)
- **Preserve responsiveness** — test at both ~375px width and ~900px width
- **One task = one Claude Code session** — do not bleed into adjacent tasks
- **Prefer surgical CSS overrides** at the bottom of `style.css` over restructuring earlier rules
- **Keep all existing fallbacks intact** — every `window._xxxImg` conditional must stay
- **Do not change `trilat()`**, `nxy()`, `nR()`, `nC()`, `GRAPH`, or any game state variable
- **After each task**: confirm no JS console errors and that board interaction still works

---

## 3. Task Map

---

### Task 0 — Inspect and Verify Current Structure
**Goal:** Confirm the actual file state before any changes. Create a baseline.

**Why this task exists:** The project has three separate Stone Skin passes layered on top of each other. Before any fix, establish exactly which CSS rules are actually winning (due to cascade order) for each visual region.

**Files to inspect (read-only):**
- `style.css` — search for all rule blocks touching: `html/body`, `#start-screen`, `.mode-card`, `.start-run-btn`, `#game-screen`, `#tut-next`, `#tut-skip`
- `game.js` — confirm `drawLines()`, `drawGoats()`, `drawTiger()` current multiplier values
- `index.html` — confirm `.start-run-btn` button text content (emoji or plain)

**Changes to make:** None. Document findings only.

**Things not to change:** Everything.

**Visual acceptance checklist:**
- [ ] You have a written list of the winning CSS rule for each problem area (line numbers noted)
- [ ] You know the current `cell * X` multipliers for goat and tiger radius
- [ ] You know whether emoji are in `.start-run-btn` labels

**Stop condition before moving to Task 1:** Written summary of current state exists. Proceed.

---

### Task 1 — Fix Home Screen Background Visibility and Outer Layout Spacing

**Goal:** Make `stone-texture.jpg` visible on the home screen. Fix vertical breathing room.

**Why this task exists:** The body-level texture is completely hidden because `#start-screen` has a solid opaque background. This is the root cause of the "feels flat/digital, not stone" impression on the home screen.

**Files likely to change:** `style.css` only.

**Exact areas/selectors to inspect:**
- `html, body` base rule (~line 3) — currently `background:#120D07`
- `html, body` Stone Skin override (~line 996) — sets `background-image`
- `#start-screen` rule (~line 21) — solid `background:#120D07` kills the texture
- `#start-screen` Fix Pass 2 override (~line 1242) — padding and justify-content
- `.start-glow` — check if it contributes to layout or is just decorative noise

**Changes to make:**

Add at the very bottom of `style.css` (after all existing blocks):

```css
/* ═══ TASK 1: BACKGROUND TEXTURE FIX ═══ */

/* Remove opaque bg from start-screen so body texture shows through */
#start-screen {
  background-color: transparent !important;
  background-image: url("assets/bg/stone-texture.jpg");
  background-size: 500px auto;
  background-attachment: fixed;
  /* Keep layout rules from Fix Pass 2: */
  padding-top: 22px !important;
  padding-bottom: 24px !important;
}

/* Re-darken the screen so texture reads as dark stone, not raw photo */
#start-screen::after {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(8, 5, 2, 0.68);
  pointer-events: none;
  z-index: 0;
}

/* Ensure all direct children sit above the darkening overlay */
#start-screen > * {
  position: relative;
  z-index: 1;
}

/* Atmospheric warm glow at top (subtle) */
#start-screen::before {
  display: block !important;
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(200,100,20,.07) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
}

/* Remove the .start-glow div visual contribution (it's decorative noise) */
.start-glow {
  display: none;
}

/* Add sensible vertical padding and max-width centring for desktop */
#start-screen {
  align-items: center;
  padding-left: 18px;
  padding-right: 18px;
}
```

**Things not to change:**
- Do NOT change `html, body` base rule
- Do NOT modify the Stone Skin `html,body` block (it is correct for other screens)
- Do NOT touch `#game-screen` or `#tutorial-screen` in this task
- Do NOT change `.screen` base rule

**Visual acceptance checklist:**
- [ ] Stone texture visible on home screen background
- [ ] Texture dark enough that text remains readable without overlay
- [ ] Subtle warm amber glow at top of screen (not obvious, just there)
- [ ] No abrupt white or bright flash on screen transitions
- [ ] All existing layout proportions preserved (cards still where they were)

**Functional regression checklist:**
- [ ] Clicking TIGER card still starts tiger campaign
- [ ] Clicking GOAT card still starts goat campaign
- [ ] Streak bar still renders

**Stop condition:** Stone texture visible on home screen. Move to Task 2.

---

### Task 2 — Fix Tiger/Goat Card Sizing and Visual Hierarchy

**Goal:** Cards are taller, photos fill them properly, title and CTA have clear hierarchy.

**Why this task exists:** Cards are too short for the photo backgrounds to read as medallion panels. The concept shows cards that are approximately 190–210px tall in a ~330px wide container. Currently they render at ~130–150px.

**Files likely to change:** `style.css` only.

**Exact areas/selectors to inspect:**
- `.mode-card` base rule (~line 61) — `padding:22px 10px 18px`, no min-height
- `.mode-cards` container (~line 41) — `max-width:330px`
- `.tiger-card`, `.goat-card` Stone Skin rules (~lines 1024, 1051) — `background-size:100% 100%`
- `.tiger-card, .goat-card` padding-top override (~line 1079) — currently `padding-top:32px`

**Changes to make:**

Add at the bottom of `style.css`:

```css
/* ═══ TASK 2: CARD SIZING AND HIERARCHY ═══ */

/* Make the card container slightly wider on larger screens */
.mode-cards {
  max-width: 360px !important;
  gap: 12px !important;
}

/* Give cards a proper minimum height so the photo reads */
.mode-card {
  min-height: 200px !important;
  padding: 28px 12px 20px !important;
  justify-content: space-between !important;
}

/* Switch from 100% 100% (distorting) to cover (correct cropping) */
.tiger-card {
  background-size: cover !important;
  background-position: center top !important;
}
.goat-card {
  background-size: cover !important;
  background-position: center top !important;
}

/* Dark scrim so text stays readable over the photo */
.tiger-card::before,
.goat-card::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0.10) 0%,
    rgba(0,0,0,0.45) 100%
  ) !important;
  pointer-events: none !important;
  z-index: 0 !important;
  box-shadow: none !important; /* override the existing inset box-shadow pseudo */
}

/* Ensure card children sit above scrim */
.mode-card > * {
  position: relative;
  z-index: 1;
}

/* Title sizing bump */
.mode-card-title {
  font-size: 17px !important;
  letter-spacing: 3px !important;
}

/* CTA button */
.mode-card-cta {
  margin-top: 6px !important;
  padding: 9px 14px !important;
  font-size: 10px !important;
  letter-spacing: 2px !important;
  width: 100% !important;
  text-align: center !important;
}
```

**Things not to change:**
- Do NOT change `.mode-card` width/flex logic
- Do NOT change border-radius on cards
- Do NOT alter `.mode-card::after` (the hover shimmer animation)
- Do NOT change any hover/active transition logic

**Visual acceptance checklist:**
- [ ] Each card is at least 190px tall
- [ ] Tiger card photo visible with warm leather texture
- [ ] Goat card photo visible with cool dark slate texture
- [ ] Card title (TIGER / GOAT) readable above photo
- [ ] Description text readable
- [ ] PLAY TIGER / PLAY GOAT buttons visible at card bottom
- [ ] No photo distortion (aspect ratio correct)

**Functional regression checklist:**
- [ ] Clicking either card navigates to correct mode
- [ ] Hover animation still works
- [ ] Card tap/focus state still visible

**Stop condition:** Both cards are visually prominent photo panels. Move to Task 3.

---

### Task 3 — Fix Home Tabs, Run-Buttons, and Streak Slab Styling

**Goal:** Campaign/Daily/Endless tabs look like carved stone buttons. Streak bar looks like a stone panel. No emoji in tab labels.

**Why this task exists:** Three conflicting `.start-run-btn` rule blocks exist in the CSS. The HTML uses emoji icons that break the stone theme. The concept shows plain uppercase text with a clear active indicator.

**Files likely to change:** `index.html`, `style.css`.

**Exact areas/selectors to inspect in index.html:**
- Lines 119–121: `.start-run-btn` buttons with `<span class="run-icon">📖</span>` etc.

**Exact areas/selectors to inspect in style.css:**
- `.start-run-row` rule (~line 43) and at ~line 646 and ~line 1117
- `.start-run-btn` rules at ~lines 46, 647, 1125 — three competing blocks
- Fix Pass 2 `.start-run-btn` at ~line 1125 — 4th block

**Changes to make in index.html:**

Find the three `.start-run-btn` buttons and replace `<span class="run-icon">📖</span>Campaign` with just `Campaign`, etc.:
```html
<!-- BEFORE -->
<button class="start-run-btn active" id="run-campaign"><span class="run-icon">📖</span>Campaign</button>
<button class="start-run-btn" id="run-daily"><span class="run-icon">🗓</span>Daily</button>
<button class="start-run-btn" id="run-endless"><span class="run-icon">∞</span>Endless</button>

<!-- AFTER -->
<button class="start-run-btn active" id="run-campaign">Campaign</button>
<button class="start-run-btn" id="run-daily">Daily</button>
<button class="start-run-btn" id="run-endless">Endless</button>
```

**Changes to make in style.css** — add at very bottom:

```css
/* ═══ TASK 3: TABS AND STREAK SLAB ═══ */

/* Tab container — stone tray look */
.start-run-row {
  background: linear-gradient(180deg, #1A1007 0%, #110C06 100%) !important;
  border: 1px solid rgba(180,110,30,.30) !important;
  border-radius: 10px !important;
  padding: 4px !important;
  gap: 3px !important;
  width: 100% !important;
  max-width: 360px !important;
  box-shadow: inset 0 1px 0 rgba(255,200,80,.04), 0 2px 8px rgba(0,0,0,.4) !important;
}

/* Tab buttons — inactive state */
.start-run-btn {
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: 7px !important;
  color: #4A3018 !important;
  font-size: 9px !important;
  letter-spacing: 2.5px !important;
  text-transform: uppercase !important;
  padding: 9px 6px !important;
  position: relative !important;
  font-family: inherit !important;
  cursor: pointer !important;
  box-shadow: none !important;
}

/* Active tab — raised stone slab */
.start-run-btn.active {
  background: linear-gradient(175deg, #2E1E0A 0%, #201408 100%) !important;
  border-color: rgba(200,130,40,.45) !important;
  color: #EDE0C4 !important;
  box-shadow:
    inset 0 1px 0 rgba(255,210,120,.12),
    0 2px 6px rgba(0,0,0,.45) !important;
}

/* Active indicator dot */
.start-run-btn.active::after {
  content: '' !important;
  position: absolute !important;
  bottom: -7px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 5px !important;
  height: 5px !important;
  border-radius: 50% !important;
  background: #E8871A !important;
  box-shadow: 0 0 6px rgba(232,135,26,.65) !important;
}

/* Hover on inactive */
.start-run-btn:hover:not(.active) {
  color: #8A6030 !important;
  background: rgba(232,135,26,.06) !important;
}

/* Streak bar — stone panel */
#streak-bar {
  background: linear-gradient(180deg, #1C1208 0%, #140E07 100%) !important;
  border: 1px solid rgba(200,130,40,.32) !important;
  border-radius: 10px !important;
  width: 100% !important;
  max-width: 360px !important;
  box-shadow: inset 0 1px 0 rgba(255,210,120,.05), 0 3px 10px rgba(0,0,0,.35) !important;
}
```

**Things not to change:**
- Do NOT change the `id` attributes on the run buttons (`run-campaign`, `run-daily`, `run-endless`)
- Do NOT remove the `.active` class logic in game.js
- Do NOT change `.run-icon` CSS rule (just make the HTML not use it)

**Visual acceptance checklist:**
- [ ] Tabs show CAMPAIGN / DAILY / ENDLESS in uppercase spaced caps, no emoji
- [ ] Active tab (Campaign by default) has raised stone slab appearance with amber indicator dot
- [ ] Inactive tabs are visibly dimmer
- [ ] Streak bar reads as a contained dark stone panel

**Functional regression checklist:**
- [ ] Clicking Daily tab switches context to Daily mode
- [ ] Clicking Endless tab switches context to Endless mode
- [ ] Streak count still displays correctly in streak bar

**Stop condition:** Tabs look like carved stone buttons with clean text. Move to Task 4.

---

### Task 4 — Fix Gameplay Board Framing and Reduce Grid Clutter

**Goal:** Board lines are subtle carved grooves, not heavy black grid. Background texture visible on game screen.

**Why this task exists:** `#game-screen { background:#120D07 }` hides the body texture. Grid lines are at 0.72–0.82 opacity, which is too dark over the stone board photo.

**Files likely to change:** `style.css`, `game.js`.

**Exact areas/selectors to inspect:**
- `#game-screen` rule in style.css (~line 126 and Fix Pass 2 override ~line 1286)
- `drawLines()` in game.js (~line 2109) — strokeStyle opacity values and lineWidth values
- `#board-container` sizing in style.css (~line 200ish)

**Changes to make in style.css** — add at bottom:

```css
/* ═══ TASK 4: GAME SCREEN AND BOARD FRAMING ═══ */

#game-screen {
  background-color: transparent !important;
  background-image: url("assets/bg/stone-texture.jpg") !important;
  background-size: 500px auto !important;
  background-attachment: fixed !important;
}

/* Dark overlay to keep game screen legible */
#game-screen::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(8, 5, 2, 0.72);
  pointer-events: none;
  z-index: 0;
}

/* Ensure game-screen children stay above overlay */
#game-screen > * {
  position: relative;
  z-index: 1;
}
```

**Changes to make in game.js** — inside `drawLines()`, update the two `strokeStyle` values:

Find and change:
```js
ctx.strokeStyle = diag ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.82)';
ctx.lineWidth   = diag ? 1.2 : 1.6;
```
Replace with:
```js
ctx.strokeStyle = diag ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.50)';
ctx.lineWidth   = diag ? 0.9 : 1.3;
```

Find and change the highlight pass:
```js
ctx.strokeStyle = diag ? 'rgba(160,120,70,0.10)' : 'rgba(160,120,70,0.16)';
ctx.lineWidth   = 0.6;
```
Replace with:
```js
ctx.strokeStyle = diag ? 'rgba(160,120,70,0.06)' : 'rgba(160,120,70,0.10)';
ctx.lineWidth   = 0.5;
```

**Things not to change:**
- Do NOT change the GRAPH iteration logic in `drawLines()`
- Do NOT change the `diag` detection formula
- Do NOT change node dot rendering (`drawNodeDots()`) in this task
- Do NOT change board-container dimensions or canvas sizing

**Visual acceptance checklist:**
- [ ] Game screen shows stone texture behind the board area
- [ ] Board lines are visible but subtle — engraved, not painted
- [ ] Diagonal lines are lighter than orthogonal lines
- [ ] Board photo still clearly visible underneath the lines

**Functional regression checklist:**
- [ ] Board renders without JS errors
- [ ] Board lines still visually connect all 25 nodes
- [ ] Game interactions (tap, move, capture) still work

**Stop condition:** Grid feels like carved stone grooves, not a black grid overlay. Move to Task 5.

---

### Task 5 — Fix Piece Scale and Positioning on Nodes

**Goal:** Pieces are clearly smaller than the full cell gap — readable, not overlapping.

**Why this task exists:** Current goat radius of `cell * 0.44` draws images at `cell * 0.88` diameter — nearly filling the full inter-node distance. This causes pieces to crowd each other and obscures the board structure.

**Files likely to change:** `game.js` only.

**Exact areas/selectors to inspect:**
- `drawGoats()` (~line 2305) — `const r = cell * 0.44`
- `drawTiger()` (~line 2343) — `const r = cell * 0.52`
- Selection ring draw call in `drawGoats()` — `r + 5 + 2 * beat` (may need adjustment)
- Ambient glow in `drawTiger()` — `r * 2.8` (should scale with r)

**Changes to make:**

In `drawGoats()`, change:
```js
const r = cell * 0.44;
```
To:
```js
const r = cell * 0.36;
```

In `drawTiger()`, change:
```js
const r = cell * 0.52;
```
To:
```js
const r = cell * 0.42;
```

**Things not to change:**
- Do NOT change the `for (const n of S.goats)` iteration
- Do NOT change selection ring logic (it uses `r` so it auto-scales)
- Do NOT change the fallback drawing branches
- Do NOT change `drawGlides()` or `drawBumps()` — they handle their own sizing

**Visual acceptance checklist:**
- [ ] Goat pieces are visibly smaller than the space between nodes
- [ ] Adjacent pieces do not overlap
- [ ] Tiger piece is slightly larger than goat pieces (as in concept)
- [ ] Pieces are still clearly visible and readable

**Functional regression checklist:**
- [ ] Tap hit detection still works (uses `nearNode()` function, not piece radius — safe)
- [ ] Glide animations still look correct
- [ ] Selection ring still visible around selected piece

**Stop condition:** Pieces are proportioned like the concept — identifiable tokens, not filled circles. Move to Task 6.

---

### Task 6 — Re-theme Gameplay HUD and Bottom Controls

**Goal:** Top bar, status row, and bottom buttons match the stone panel family. No thematic mismatches.

**Why this task exists:** Fix Pass 2 partially themed some buttons but missed `#mode-tag`, `#btn-sound`, `#btn-pause`, and some bottom button text labels. Also `#btn-reset` (the Restart button) isn't consistently styled as a stone slab.

**Files likely to change:** `style.css`, `index.html` (minimal — text only).

**Exact areas/selectors to inspect in style.css:**
- `#mode-tag` rules (~line 158–159) — has some amber/goat theming but needs stone depth
- `.top-btn-icon` and `#btn-sound` (~line ~380+) — needs stone pill look
- `#btn-hint` Fix Pass 2 (~line 1303) — has amber, check if competing rule wins
- `#btn-reset` / `#btn-restart` — confirm which selector applies

**Exact areas/selectors to inspect in index.html:**
- Bottom bar button labels: `↺ Restart`, `💡 Hint`, `↩ Undo`, `? Help`
- Top bar: `🔊`, `⏸`

**Changes to make in index.html:**

In the bottom bar, update button labels for cleaner typography:
```html
<!-- BEFORE -->
<button class="btn btn-secondary" id="btn-reset">↺ Restart</button>
<button class="btn btn-primary"   id="btn-hint">💡 Hint</button>
<button class="btn btn-primary"   id="btn-undo">↩ Undo</button>
<button class="btn btn-secondary" id="btn-howtoplay">? Help</button>

<!-- AFTER -->
<button class="btn btn-secondary" id="btn-reset">Restart</button>
<button class="btn btn-primary"   id="btn-hint">Hint</button>
<button class="btn btn-primary"   id="btn-undo">Undo</button>
<button class="btn btn-secondary" id="btn-howtoplay">Help</button>
```

**Changes to make in style.css** — add at bottom:

```css
/* ═══ TASK 6: GAMEPLAY HUD AND CONTROLS ═══ */

/* Mode tag pill — carved amber badge */
#mode-tag {
  background: linear-gradient(175deg, #1E1208 0%, #140E06 100%) !important;
  border: 1px solid rgba(200,130,40,.35) !important;
  color: #C08030 !important;
  letter-spacing: 2px !important;
  font-size: 9px !important;
  border-radius: 999px !important;
  padding: 4px 10px !important;
  box-shadow: inset 0 1px 0 rgba(255,200,80,.08) !important;
}
#mode-tag.tiger { color: #E8871A !important; border-color: rgba(232,135,26,.45) !important; }
#mode-tag.goat  { color: #A08858 !important; border-color: rgba(180,150,90,.30) !important; }

/* Top bar buttons — consistent stone pill */
#btn-sound, #btn-pause {
  background: linear-gradient(175deg, #1E1408 0%, #140E05 100%) !important;
  border: 1px solid #3A2410 !important;
  border-radius: 999px !important;
  color: #7A5030 !important;
  box-shadow: inset 0 1px 0 rgba(255,200,80,.05) !important;
}

/* Bottom bar buttons — full stone slab treatment */
.btn {
  border-radius: 8px !important;
  font-size: 10px !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  font-family: inherit !important;
  border-bottom: 2px solid rgba(0,0,0,.5) !important;
  box-shadow: inset 0 1px 0 rgba(255,200,80,.05), 0 2px 5px rgba(0,0,0,.4) !important;
}
.btn-primary {
  background: linear-gradient(175deg, #2A1E0A 0%, #1E1508 100%) !important;
  border-color: rgba(200,140,40,.40) !important;
  color: #E8A030 !important;
}
.btn-secondary {
  background: linear-gradient(175deg, #1A1208 0%, #100D07 100%) !important;
  border-color: #2E1E0C !important;
  color: #7A5020 !important;
}
```

**Things not to change:**
- Do NOT remove `id="btn-reset"`, `id="btn-hint"`, `id="btn-undo"`, `id="btn-howtoplay"` — game.js uses these
- Do NOT change any click handlers
- Do NOT change `#btn-sound` ID — it's used by audio toggle logic

**Visual acceptance checklist:**
- [ ] Mode tag (TIGER MODE / GOAT MODE) is an amber stone pill
- [ ] Top bar buttons match stone pill family
- [ ] Bottom buttons are clearly stone slabs with depth
- [ ] HINT button is visually distinct (amber primary) from RESTART / UNDO / HELP (dark secondary)

**Functional regression checklist:**
- [ ] Hint button still shows hint on click
- [ ] Restart button still restarts level
- [ ] Undo button still undoes last move
- [ ] Sound toggle still works
- [ ] Pause still works

**Stop condition:** HUD controls match the stone theme family coherently. Move to Task 7.

---

### Task 7 — Re-theme Tutorial Screen Panels and Buttons

**Goal:** Tutorial skip/next buttons are carved stone slabs matching the concept. Tutorial background shows texture.

**Why this task exists:** `#tut-next` is a flat amber fill. `#tut-skip` is nearly invisible. The concept shows two clearly dimensional stone buttons — one dark, one amber — that match the rest of the stone family.

**Files likely to change:** `style.css` only.

**Exact areas/selectors to inspect:**
- `#tutorial-screen` rule (~line 455) and Stone Skin override (~line 1223)
- `#tut-next` rule (~line 507) — `background:#E8871A; color:#120A04` — and stone skin override (~line 1230)
- `#tut-skip` rule (~line 501) — `background:none; border:1px solid #362410`
- `.tut-footer` rule (~line 496) — `border-top:1px solid #1E1208`
- `.tut-header` Fix Pass 2 (~line 1347) and `.tut-footer` Fix Pass 2 (~line 1351)
- `#tutorial-screen` — confirm background-image is working (same issue as start/game screens)

**Changes to make in style.css** — add at bottom:

```css
/* ═══ TASK 7: TUTORIAL SCREEN AND BUTTONS ═══ */

/* Tutorial screen background texture */
#tutorial-screen {
  background-color: transparent !important;
  background-image: url("assets/bg/stone-texture.jpg") !important;
  background-size: 500px auto !important;
  background-attachment: fixed !important;
}

#tutorial-screen::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(8, 5, 2, 0.74);
  pointer-events: none;
  z-index: 0;
}

#tutorial-screen > * {
  position: relative;
  z-index: 1;
}

/* Tutorial header */
.tut-header {
  background: rgba(14, 9, 4, 0.92) !important;
  border-bottom: 1px solid rgba(180,110,30,.22) !important;
}

/* Tutorial footer */
.tut-footer {
  background: rgba(14, 9, 4, 0.92) !important;
  border-top: 1px solid rgba(180,110,30,.20) !important;
  gap: 12px !important;
  padding: 12px 16px max(env(safe-area-inset-bottom), 14px) !important;
}

/* SKIP button — dark stone slab */
#tut-skip {
  background: linear-gradient(175deg, #1E1508 0%, #141008 100%) !important;
  border: 1px solid rgba(180,120,40,.28) !important;
  border-bottom: 2px solid rgba(0,0,0,.55) !important;
  border-radius: 8px !important;
  color: #8A6840 !important;
  letter-spacing: 2.5px !important;
  text-transform: uppercase !important;
  font-size: 10px !important;
  padding: 13px 0 !important;
  box-shadow: inset 0 1px 0 rgba(255,200,80,.05), 0 2px 6px rgba(0,0,0,.4) !important;
  font-family: inherit !important;
  cursor: pointer !important;
}
#tut-skip:active {
  transform: translateY(1px) !important;
  border-bottom-width: 1px !important;
}

/* NEXT button — amber stone slab */
#tut-next {
  background: linear-gradient(175deg, #C07818 0%, #8A5210 100%) !important;
  border: 1px solid rgba(230,170,60,.38) !important;
  border-bottom: 3px solid rgba(80,45,5,.75) !important;
  border-radius: 8px !important;
  color: #FFF0D0 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  font-size: 11px !important;
  padding: 13px 0 !important;
  box-shadow:
    inset 0 1px 0 rgba(255,230,150,.18),
    0 4px 14px rgba(200,100,10,.28) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,.55) !important;
  font-family: inherit !important;
  font-weight: bold !important;
  cursor: pointer !important;
}
#tut-next:active {
  transform: translateY(1px) !important;
  border-bottom-width: 1px !important;
}
```

**Things not to change:**
- Do NOT change `#tut-next` click handler or tutorial step progression logic
- Do NOT change `#tut-skip` click handler
- Do NOT change tut canvas sizing or tutorial step data
- Do NOT change `.tut-dot` animation logic

**Visual acceptance checklist:**
- [ ] Tutorial screen background shows stone texture
- [ ] SKIP button has visible dark stone slab depth
- [ ] NEXT/STEP button has amber stone slab depth with warm glow
- [ ] Both buttons have clearly different visual weight (NEXT = primary, SKIP = secondary)
- [ ] Tutorial header and footer have subtle stone panel look

**Functional regression checklist:**
- [ ] NEXT advances through all tutorial steps
- [ ] SKIP dismisses tutorial and starts game
- [ ] Tutorial canvas renders board correctly
- [ ] Tutorial dot indicators (active/done/idle) still work

**Stop condition:** Tutorial buttons match the concept's carved stone button family. Move to Task 8.

---

### Task 8 — Polish Pass for Consistency and Responsiveness

**Goal:** Check for visual inconsistencies across all screens at both narrow (~375px) and wider (~768px) viewports.

**Why this task exists:** Individual task fixes may create slight mismatches when viewed across viewports. This pass finds and patches remaining outliers.

**Files likely to change:** `style.css` only. Possibly minor `index.html` tweaks.

**Exact areas/selectors to inspect:**
- Home screen on narrow viewport: card min-height, tab row wrapping, streak bar overflow
- Game screen on narrow viewport: bottom bar wrapping, HUD overflow/clipping
- Tutorial screen on narrow viewport: footer buttons wrapping
- Overlay win/lose screen (`#overlay`, `#overlay-title`, `#overlay-btn`) — check stone theme consistency
- Settings sheet (`#settings-sheet`) — check stone theme
- Level select card (`.level-select-card`) — check stone theme

**Changes to make:**
Add targeted media query patches and any missing responsive overrides at bottom of `style.css`. This task should be small — no more than 20–30 lines of CSS total.

**Things not to change:**
- Do NOT restructure any layout systems
- Do NOT change flex/grid direction
- Do NOT add new breakpoints (only refine existing behaviour)

**Visual acceptance checklist:**
- [ ] Home screen usable and attractive at 375px width
- [ ] Home screen centred and not stretched at 768px+ width
- [ ] Game screen HUD doesn't clip on narrow screens
- [ ] Tutorial screen footer buttons don't wrap on narrow screens
- [ ] Win/lose overlay has consistent stone look

**Functional regression checklist:**
- [ ] All game interactions still work on narrow viewport
- [ ] No horizontal scroll on home screen

**Stop condition:** No obvious visual mismatches between screens or viewports. Move to Task 9.

---

### Task 9 — Final Visual QA Checklist

**Goal:** Confirm the complete visual pass is done. No code changes in this task.

**Why this task exists:** End-to-end verification that all 8 tasks' acceptance criteria are met simultaneously, no regressions were introduced, and the game is playable.

**Files to change:** None.

**Checklist:** See Section 5 (Verification Master Checklist) below.

**Stop condition:** All items in the Verification Master Checklist are ticked. Work is complete.

---

## 4. Run Order Guidance

| Task | Can run independently? | Dependencies |
|------|------------------------|--------------|
| Task 0 | Yes — read only | None |
| Task 1 | Yes | None (but do Task 0 first for reference) |
| Task 2 | Yes | None |
| Task 3 | Yes | None |
| Task 4 | Yes | Recommend Task 1 done first (same texture fix pattern) |
| Task 5 | Yes — game.js only | None |
| Task 6 | Yes | Task 4 recommended first (game-screen bg) |
| Task 7 | Yes | Task 1 recommended first (texture pattern) |
| Task 8 | **Only after Tasks 1–7** | Needs all fixes in place to identify remaining gaps |
| Task 9 | **Only after Tasks 1–8** | Final QA only |

**Recommended session order for a usage-limited setup:**
- Session A: Task 0 + Task 1 (background fix — high impact, low risk)
- Session B: Task 2 + Task 3 (card and tab visual — contained CSS)
- Session C: Task 4 + Task 5 (board lines + piece scale — one JS, one CSS)
- Session D: Task 6 + Task 7 (HUD and tutorial — CSS only after Task 4)
- Session E: Task 8 + Task 9 (polish + QA — end-state verification)

---

## 5. Verification Master Checklist

Use this to confirm the complete visual pass is done.

### Home Screen
- [ ] Stone texture visible on background (not flat black)
- [ ] Subtle warm amber glow at top
- [ ] "TIGER TRAP" title has amber letterpress styling
- [ ] Tiger card has warm amber leather photo, tall, readable medallion area
- [ ] Goat card has cool dark slate photo, tall, readable medallion area
- [ ] Card titles (TIGER / GOAT) legible over photo
- [ ] PLAY TIGER / PLAY GOAT buttons have stone-slab depth
- [ ] Tabs show CAMPAIGN / DAILY / ENDLESS with no emoji
- [ ] Active tab has raised stone slab appearance
- [ ] Amber dot indicator below active tab
- [ ] Streak bar reads as a dark stone panel

### Game Screen
- [ ] Game screen background shows stone texture
- [ ] Board photo (board-stone.jpg) visible inside canvas
- [ ] Grid lines look engraved/carved, not painted black
- [ ] Diagonal lines are subtler than orthogonal lines
- [ ] Goat pieces are clearly coin-sized relative to board cells
- [ ] Tiger piece is slightly larger than goat pieces
- [ ] Adjacent pieces do not overlap
- [ ] Amber landing dots visible on valid jump targets
- [ ] Mode tag (TIGER MODE / GOAT MODE) is an amber stone pill
- [ ] Bottom buttons (RESTART / HINT / UNDO / HELP) are stone slabs
- [ ] HINT button is visually distinct from secondary buttons

### Tutorial Screen
- [ ] Stone texture visible on tutorial background
- [ ] Tutorial board canvas renders correctly
- [ ] SKIP button is a dark stone slab
- [ ] NEXT/STEP button is an amber stone slab
- [ ] Both buttons have visible dimensional depth (border-bottom, box-shadow)

### Functional (All Screens)
- [ ] No JS console errors on page load
- [ ] No JS console errors during gameplay
- [ ] Tiger campaign: tiger moves correctly, AI goats move
- [ ] Goat campaign: goat placement and moves correct, AI tiger moves
- [ ] Win condition triggers overlay
- [ ] Lose/timeout condition triggers overlay
- [ ] Hint button shows valid move hint
- [ ] Undo works
- [ ] Restart resets level
- [ ] Sound toggle works
- [ ] Tutorial advances through all steps
- [ ] Tutorial skip goes to game
- [ ] Daily and Endless modes accessible via tabs
- [ ] Page is usable at 375px width (no horizontal scroll)

---

## 6. Notes on Old CLAUDE.md Accuracy

The old `CLAUDE.md` is mostly accurate for intent, but has some outdated assumptions:

1. **`#start-screen::before` as vignette**: CLAUDE.md proposed a vignette on `#start-screen::before`. Fix Pass 2 then disabled it with `display:none`. The correct approach (Task 1) re-enables a `::before` vignette but adds a separate `::after` overlay for the darkening. This is a two-pseudo-element pattern — different from what CLAUDE.md described.

2. **`background-blend-mode` removal**: CLAUDE.md originally had `background-blend-mode: multiply` on the body. A later "Fix Pass 2" comment in style.css notes this was removed because "multiply on dark bg = black". That removal was correct. The Tasks above do NOT re-add `background-blend-mode`.

3. **`background-size: 100% 100%` on cards**: CLAUDE.md prescribed this for tiger-card and goat-card. Task 2 overrides it with `cover` because 100% 100% distorts the photo as card height varies. CLAUDE.md assumption was based on fixed card height — which was never enforced.

4. **Piece radius multipliers**: CLAUDE.md's Task 6 set `r = cell * 0.44` for goats. This has been identified as too large. Task 5 of CLAUDE_NEXT reduces it to `0.36`.

5. **`assets/icons/` and `assets/ui/`**: These folders don't exist in the actual zip (they were planned but not shipped). Any reference to them in CLAUDE.md is a dead reference — confirmed safe to ignore.
