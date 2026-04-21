# Tiger Trap — Stone Skin Implementation

## Goal
Transform `tiger-trap-v6-intro.html` to match the concept images using real cropped
photo assets. Split into three files: `index.html`, `style.css`, `game.js`, plus the
existing `assets/` folder.

## Asset Map (what exists and what it's used for)
```
assets/bg/stone-texture.jpg     → body background tile
assets/bg/stone-bg.jpg          → NOT USED (ignore)
assets/bg/tiger-card-panel.jpg  → .tiger-card background-image (includes medallion)
assets/bg/goat-card-panel.jpg   → .goat-card background-image (includes medallion)
assets/bg/board-stone.jpg       → canvas board background via ctx.drawImage()
assets/pieces/tiger-piece.png   → canvas tiger token via ctx.drawImage()
assets/pieces/goat-piece.png    → canvas goat token via ctx.drawImage()
assets/pieces/amber-dot.png     → canvas jump-landing dot via ctx.drawImage()
assets/icons/                   → NOT USED (ignore entire folder)
assets/ui/                      → NOT USED (ignore entire folder)
```

---

## Task 1 — SPLIT THE MONOLITH

Extract `tiger-trap-v6-intro.html` into three files.

### index.html
- Copy the entire `<head>` **except** the `<style>` block
- Add `<link rel="stylesheet" href="style.css">` in `<head>`
- Copy the entire `<body>` **except** the closing `<script>` block
- Add `<script src="game.js"></script>` just before `</body>`
- Keep all inline `data:` manifest and icon links exactly as-is

### style.css
- Extract everything inside `<style>…</style>` verbatim
- Append the Stone Skin CSS from **Task 3** at the bottom

### game.js
- Extract everything inside `<script>…</script>` verbatim
- Apply JS modifications from Tasks 4–10 directly to this file

---

## Task 2 — REMOVE MODE ICON IMG ELEMENTS

The card panel photos already include the tiger and goat medallion artwork.
A separate `<img>` icon on top would create a double medallion.

**Find and DELETE** the following from `index.html`:

1. The `<div class="mode-icon">` wrapper and its contents inside the tiger card
2. The `<div class="mode-icon">` wrapper and its contents inside the goat card

These are the elements containing `<img class="mode-icon-img tiger-icon-img">` and
`<img class="mode-icon-img goat-icon-img">`. Remove the entire wrapper div, not just
the img tag.

Also remove these CSS rules from `style.css` if they exist (they target the removed elements):
```css
.mode-icon { … }
.mode-icon-img { … }
.tiger-icon-img { … }
.goat-icon-img { … }
```

---

## Task 3 — STONE SKIN CSS (append to style.css)

Add this entire block at the **very end** of `style.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   STONE SKIN — appended overrides
   ═══════════════════════════════════════════════════════════════ */

/* ── Body background — dark stone tile ───────────────────────── */
html, body {
  background-color: #0E0906;
  background-image: url("assets/bg/stone-texture.jpg");
  background-size: 400px auto;
  background-attachment: fixed;
  background-blend-mode: multiply;
}

/* Atmospheric vignette on start screen */
#start-screen::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%,  rgba(232,135,26,.05) 0%, transparent 70%),
    radial-gradient(ellipse 100% 40% at 50% 100%, rgba(0,0,0,.60)     0%, transparent 70%);
}
#start-screen > * { position: relative; z-index: 1; }

/* ── Title letterpress ────────────────────────────────────────── */
.start-title {
  color: #E8A84A;
  text-shadow:
    0  1px 0  rgba(255,220,140,.30),
    0 -1px 0  rgba(0,0,0,.90),
    0  0   32px rgba(200,100,20,.32),
    0  0   70px rgba(180,80,10,.12);
}

/* ── Tiger card — warm leather photo ─────────────────────────── */
.tiger-card {
  background-image: url("assets/bg/tiger-card-panel.jpg");
  background-size: cover;
  background-position: center top;
  border: 1px solid rgba(200,130,40,.55);
  box-shadow:
    0 0 28px rgba(200,100,20,.14),
    inset 0  1px 0 rgba(255,215,120,.14),
    inset 0 -1px 0 rgba(0,0,0,.65),
    inset 0  0  32px rgba(0,0,0,.42);
  border-radius: 14px;
}
.tiger-card:hover, .tiger-card:focus-visible {
  box-shadow:
    0 16px 44px rgba(200,100,20,.24),
    0  0  30px rgba(232,135,26,.18),
    inset 0  1px 0 rgba(255,220,140,.20),
    inset 0 -1px 0 rgba(0,0,0,.65),
    inset 0  0  30px rgba(0,0,0,.38);
  border-color: rgba(232,155,50,.78);
}

/* Text legibility over the photo */
.tiger-card .mode-card-title   { color: #F5C060; text-shadow: 0 1px 4px rgba(0,0,0,.9); }
.tiger-card .mode-card-desc    { color: #8A5A28; text-shadow: 0 1px 3px rgba(0,0,0,.8); }
.tiger-card .mode-card-fantasy { color: #A07040; text-shadow: 0 1px 3px rgba(0,0,0,.8); }

/* ── Goat card — cool dark slate photo ───────────────────────── */
.goat-card {
  background-image: url("assets/bg/goat-card-panel.jpg");
  background-size: cover;
  background-position: center top;
  border: 1px solid rgba(180,168,150,.30);
  box-shadow:
    0 0 24px rgba(0,0,0,.28),
    inset 0  1px 0 rgba(220,210,195,.12),
    inset 0 -1px 0 rgba(0,0,0,.68),
    inset 0  0  30px rgba(0,0,0,.52);
  border-radius: 14px;
}
.goat-card:hover, .goat-card:focus-visible {
  box-shadow:
    0 16px 42px rgba(0,0,0,.38),
    0  0  26px rgba(180,168,150,.10),
    inset 0  1px 0 rgba(220,210,195,.18),
    inset 0 -1px 0 rgba(0,0,0,.68),
    inset 0  0  28px rgba(0,0,0,.48);
  border-color: rgba(210,200,180,.44);
}

/* Text legibility over the photo */
.goat-card .mode-card-title   { color: #D8D0C0; text-shadow: 0 1px 4px rgba(0,0,0,.9); }
.goat-card .mode-card-desc    { color: #5A4A38; text-shadow: 0 1px 3px rgba(0,0,0,.8); }
.goat-card .mode-card-fantasy { color: #807060; text-shadow: 0 1px 3px rgba(0,0,0,.8); }

/* Card needs extra top padding now that icon is removed —
   so the title doesn't sit too high in the card */
.tiger-card,
.goat-card {
  padding-top: 32px;
}

/* ── PLAY TIGER / PLAY GOAT buttons ──────────────────────────── */
.mode-card-cta {
  border-radius: 6px !important;
  letter-spacing: 2.5px;
}
.tiger-card .mode-card-cta {
  background: linear-gradient(175deg, #2E1A08 0%, #1E1006 100%);
  border: 1px solid rgba(200,120,40,.50);
  border-bottom: 2px solid rgba(100,50,10,.55);
  color: #D49040;
  text-shadow: 0 1px 2px rgba(0,0,0,.8);
  box-shadow: inset 0 1px 0 rgba(255,200,100,.10), 0 2px 8px rgba(0,0,0,.45);
}
.tiger-card:hover .mode-card-cta,
.tiger-card:focus-visible .mode-card-cta {
  border-color: rgba(232,155,60,.68);
  color: #EAA848;
}
.goat-card .mode-card-cta {
  background: linear-gradient(175deg, #201C18 0%, #161310 100%);
  border: 1px solid rgba(160,148,132,.32);
  border-bottom: 2px solid rgba(0,0,0,.55);
  color: #786858;
  text-shadow: 0 1px 2px rgba(0,0,0,.8);
  box-shadow: inset 0 1px 0 rgba(200,190,175,.08), 0 2px 6px rgba(0,0,0,.45);
}
.goat-card:hover .mode-card-cta,
.goat-card:focus-visible .mode-card-cta {
  border-color: rgba(200,188,170,.48);
  color: #A09070;
}

/* ── Campaign / Daily / Endless tabs ─────────────────────────── */
.start-run-btn {
  background: linear-gradient(175deg, #1A1208 0%, #110D07 100%);
  border: 1px solid #2C1C0C;
  border-bottom: 2px solid #080604;
  box-shadow:
    inset 0  1px 0 rgba(255,210,120,.06),
    inset 0 -1px 0 rgba(0,0,0,.5),
    0 2px 6px rgba(0,0,0,.5);
  border-radius: 10px;
  color: #4A3018;
}
.start-run-btn.active {
  background: linear-gradient(175deg, #241608 0%, #1C1108 100%);
  border-color: rgba(200,130,40,.58);
  border-bottom-color: rgba(140,80,20,.45);
  color: #EDE0C4;
  box-shadow:
    inset 0  1px 0 rgba(255,210,120,.14),
    inset 0 -1px 0 rgba(0,0,0,.5),
    0 0 18px rgba(200,100,20,.12),
    0 2px 8px rgba(0,0,0,.5);
}
.start-run-btn:hover:not(.active) {
  color: #A07838;
  border-color: rgba(232,135,26,.28);
  background: rgba(232,135,26,.05);
}

/* ── Streak bar ───────────────────────────────────────────────── */
#streak-bar {
  background: linear-gradient(180deg, rgba(28,16,8,.82) 0%, rgba(14,9,5,.92) 100%);
  border: 1px solid rgba(200,130,40,.24);
  box-shadow:
    inset 0  1px 0 rgba(255,210,120,.06),
    inset 0 -1px 0 rgba(0,0,0,.45),
    0 4px 16px rgba(0,0,0,.32);
}

/* ── Context card on start screen ────────────────────────────── */
.start-context {
  background: linear-gradient(180deg, rgba(28,18,8,.95) 0%, rgba(16,11,7,.98) 100%);
  border: 1px solid rgba(200,130,40,.20);
  box-shadow:
    0 8px 24px rgba(0,0,0,.25),
    inset 0 1px 0 rgba(255,210,120,.06);
}

/* ── In-game bottom buttons ───────────────────────────────────── */
.btn {
  background: linear-gradient(175deg, #1A1208 0%, #100D07 100%);
  border: 1px solid #2E1E0C;
  border-bottom: 2px solid #080604;
  box-shadow: inset 0 1px 0 rgba(255,200,100,.06), 0 2px 6px rgba(0,0,0,.5);
}
.btn:active {
  transform: translateY(1px);
  border-bottom-width: 1px;
  box-shadow: inset 0 1px 0 rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.5);
}
.btn-primary {
  background: linear-gradient(175deg, #252010 0%, #1A1608 100%);
  border-color: rgba(200,180,120,.30);
  border-bottom-color: rgba(80,60,20,.5);
  color: #EDE0C4;
  box-shadow: inset 0 1px 0 rgba(255,230,160,.09), 0 2px 8px rgba(0,0,0,.5);
}

/* ── Win/lose overlay button ──────────────────────────────────── */
#overlay-btn {
  background: linear-gradient(175deg, #F09020 0%, #C07010 100%);
  border: 1px solid rgba(255,200,100,.32);
  border-bottom: 3px solid rgba(120,60,5,.8);
  box-shadow: inset 0 1px 0 rgba(255,240,180,.26), 0 6px 24px rgba(200,100,10,.36);
  text-shadow: 0 1px 2px rgba(0,0,0,.5);
}
#overlay-btn:hover {
  background: linear-gradient(175deg, #F8A030 0%, #D08020 100%);
  box-shadow: inset 0 1px 0 rgba(255,240,180,.32), 0 10px 32px rgba(200,100,10,.46);
}
#overlay-btn:active { transform: translateY(1px); border-bottom-width: 1px; }

/* ── Settings sheet ───────────────────────────────────────────── */
#settings-sheet {
  background:
    url("assets/bg/stone-texture.jpg") repeat,
    linear-gradient(180deg, #1E140A 0%, #100B07 100%);
  background-blend-mode: multiply;
  background-size: 400px auto, auto;
}

/* ── Level select card ────────────────────────────────────────── */
.level-select-card {
  background:
    url("assets/bg/stone-texture.jpg") repeat,
    linear-gradient(180deg, #1E1409 0%, #120D07 100%);
  background-blend-mode: multiply;
  background-size: 400px auto, auto;
  border: 1px solid rgba(200,130,40,.30);
  box-shadow: 0 24px 60px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,210,120,.08);
}

/* ── Tutorial screen ──────────────────────────────────────────── */
#tutorial-screen {
  background:
    url("assets/bg/stone-texture.jpg") repeat,
    linear-gradient(175deg, #130C05 0%, #0D0903 100%);
  background-blend-mode: multiply;
  background-size: 400px auto, auto;
}
#tut-next {
  background: linear-gradient(175deg, #F09020 0%, #C07010 100%);
  border-bottom: 3px solid rgba(100,50,5,.7);
  box-shadow: inset 0 1px 0 rgba(255,235,170,.26), 0 4px 16px rgba(200,100,10,.26);
  text-shadow: 0 1px 2px rgba(0,0,0,.5);
}
```

---

## Task 4 — BOARD BACKGROUND (game.js)

Find the `render()` function. Near its top, find this exact block:

```js
const bg=ctx.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz*.73);
bg.addColorStop(0,P.bg1); bg.addColorStop(1,P.bg0);
ctx.fillStyle=bg; ctx.fillRect(0,0,sz,sz);
```

**Replace it entirely with:**

```js
// ── Stone board background ──
if (window._boardImg && window._boardImg.complete && window._boardImg.naturalWidth > 0) {
  ctx.drawImage(window._boardImg, 0, 0, sz, sz);
  // Vignette to improve piece readability
  const vig = ctx.createRadialGradient(sz/2, sz/2, sz*0.15, sz/2, sz/2, sz*0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0.08)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, sz, sz);
} else {
  const bg = ctx.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz*.73);
  bg.addColorStop(0, P.bg1); bg.addColorStop(1, P.bg0);
  ctx.fillStyle = bg; ctx.fillRect(0,0,sz,sz);
}
```

---

## Task 5 — PRELOAD IMAGES (game.js)

Find the `document.addEventListener('DOMContentLoaded', …)` block at the bottom of
`game.js`. **At the very start** of that callback, before any existing code, add:

```js
// ── Preload stone-skin assets ──
const _loadImg = (src) => { const img = new Image(); img.src = src; return img; };
window._boardImg      = _loadImg('assets/bg/board-stone.jpg');
window._tigerPieceImg = _loadImg('assets/pieces/tiger-piece.png');
window._goatPieceImg  = _loadImg('assets/pieces/goat-piece.png');
window._amberDotImg   = _loadImg('assets/pieces/amber-dot.png');
```

---

## Task 6 — DRAW GOATS (game.js)

Find `function drawGoats()`. **Replace the entire function body** with:

```js
for (const n of S.goats) {
  const p = nxy(n);
  const r = cell * 0.44;
  const sel = (S.mode === 'goat' && S.selected === n);
  const beat = 0.5 + 0.5 * Math.sin(animT * 0.0025 + n * 1.4);

  // Selection ring
  if (sel) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 5 + 2 * beat, 0, Math.PI * 2);
    ctx.strokeStyle = P.selGold;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  if (window._goatPieceImg && window._goatPieceImg.complete && window._goatPieceImg.naturalWidth > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(window._goatPieceImg, p.x - r, p.y - r, r * 2, r * 2);
    ctx.restore();
  } else {
    // Fallback: original circle
    ctx.beginPath(); ctx.arc(p.x+1, p.y+2, r*.48, 0, Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,.33)'; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, r*.48, 0, Math.PI*2);
    ctx.fillStyle=sel?'#FFF9EC':P.goat; ctx.fill();
    ctx.strokeStyle=sel?P.selGold:P.goatStroke; ctx.lineWidth=1.5; ctx.stroke();
  }
}
```

---

## Task 7 — DRAW TIGER (game.js)

Find `function drawTiger()`. **Replace the entire function body** with:

```js
for (const n of S.tigers) {
  const p = nxy(n);
  const r = cell * 0.52;
  const beat = 0.5 + 0.5 * Math.sin(animT * 0.0028);
  const isTigerPlayer = (S.mode === 'tiger');

  // Ambient glow
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.8);
  g.addColorStop(0, `rgba(232,135,26,${(0.28+0.08*isTigerPlayer)*(0.7+0.3*beat)})`);
  g.addColorStop(1, 'rgba(232,135,26,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(p.x, p.y, r*2.8, 0, Math.PI*2); ctx.fill();

  // Player selection ring
  if (isTigerPlayer) {
    ctx.beginPath(); trilat(p.x, p.y, r+4+2*beat);
    ctx.strokeStyle = `rgba(255,212,60,${0.5+0.3*beat})`;
    ctx.lineWidth = 2; ctx.stroke();
  }

  if (window._tigerPieceImg && window._tigerPieceImg.complete && window._tigerPieceImg.naturalWidth > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.60)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.drawImage(window._tigerPieceImg, p.x - r, p.y - r*1.05, r*2, r*2.1);
    ctx.restore();
  } else {
    // Fallback: original triangle
    ctx.save(); ctx.translate(p.x+1.5, p.y+2.5); trilat(0,0,r*1.06);
    ctx.fillStyle='rgba(0,0,0,.36)'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(p.x, p.y); trilat(0,0,r);
    ctx.fillStyle=P.tiger; ctx.fill();
    ctx.strokeStyle='#F06010'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(p.x, p.y-r*.12); trilat(0,0,r*.37);
    ctx.fillStyle=P.tigerHi; ctx.fill(); ctx.restore();
  }
}
```

---

## Task 8 — AMBER LANDING DOTS (game.js)

In `drawHighlights()`, find the comment `// Amber landing` and the drawing code that
follows it (two lines: a radial gradient fill and an arc fill). **Replace those two lines**
with:

```js
// Amber landing dot
const pLand = nxy(j.to);
const dotR  = cell * 0.22;
const gHalo = ctx.createRadialGradient(pLand.x, pLand.y, 0, pLand.x, pLand.y, dotR*2.2);
gHalo.addColorStop(0, `rgba(232,135,26,${0.10*pulse})`);
gHalo.addColorStop(1, 'rgba(232,135,26,0)');
ctx.fillStyle = gHalo;
ctx.beginPath(); ctx.arc(pLand.x, pLand.y, dotR*2.2, 0, Math.PI*2); ctx.fill();

if (window._amberDotImg && window._amberDotImg.complete && window._amberDotImg.naturalWidth > 0) {
  const dr = dotR * (0.74 + 0.10 * pulse);
  ctx.drawImage(window._amberDotImg, pLand.x - dr, pLand.y - dr, dr*2, dr*2);
} else {
  ctx.beginPath(); ctx.arc(pLand.x, pLand.y, dotR*(0.74+0.10*pulse), 0, Math.PI*2);
  ctx.fillStyle = `rgba(240,180,92,${0.30+0.18*pulse})`; ctx.fill();
}
```

---

## Task 9 — GRID LINES STONE STYLE (game.js)

Find `function drawLines()`. **Replace its entire body** with:

```js
for (let a = 0; a < 25; a++) {
  for (const b of GRAPH[a]) {
    if (b <= a) continue;
    const pa = nxy(a), pb = nxy(b);
    const diag = Math.abs(nR(b)-nR(a))===1 && Math.abs(nC(b)-nC(a))===1;

    // Carved groove
    ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = diag ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.82)';
    ctx.lineWidth   = diag ? 1.2 : 1.6;
    ctx.stroke();

    // Highlight above groove (chiselled look)
    ctx.beginPath();
    ctx.moveTo(pa.x - 0.5, pa.y - 0.5);
    ctx.lineTo(pb.x - 0.5, pb.y - 0.5);
    ctx.strokeStyle = diag ? 'rgba(160,120,70,0.10)' : 'rgba(160,120,70,0.16)';
    ctx.lineWidth   = 0.6;
    ctx.stroke();
  }
}
```

---

## Task 10 — NODE DOTS STONE STYLE (game.js)

Find `function drawNodeDots()`. **Replace its entire body** with:

```js
const r = Math.max(2.8, cell * 0.075);
const corners  = [0, 4, 20, 24];
const edgeMids = [2, 10, 14, 22];
const center   = 12;

for (let n = 0; n < 25; n++) {
  const p = nxy(n);

  if (n === center) {
    const pulse = 0.5 + 0.5 * Math.sin(animT * 0.002);
    const gc = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r*2.2);
    gc.addColorStop(0, `rgba(200,130,40,${0.55+pulse*0.35})`);
    gc.addColorStop(1, 'rgba(200,130,40,0)');
    ctx.fillStyle = gc;
    ctx.beginPath(); ctx.arc(p.x, p.y, r*2.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, r*(1.3+pulse*0.15), 0, Math.PI*2);
    ctx.fillStyle = `rgba(200,140,60,${0.7+pulse*0.3})`; ctx.fill();

  } else if (corners.includes(n)) {
    ctx.fillStyle = 'rgba(120,80,35,0.8)';
    ctx.fillRect(p.x - 2.2, p.y - 2.2, 4.4, 4.4);

  } else {
    const isEdgeMid = edgeMids.includes(n);
    ctx.beginPath(); ctx.arc(p.x, p.y, isEdgeMid ? r*1.18 : r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(100,65,30,0.75)'; ctx.fill();
  }
}
```

---

## Verification Checklist

After Claude Code runs, open `index.html` and confirm:

- [ ] No JS errors in the console
- [ ] Body shows dark stone texture background
- [ ] Tiger card shows warm amber leather photo with tiger medallion baked in — NO separate icon image on top
- [ ] Goat card shows cool dark slate photo with goat medallion baked in — NO separate icon image on top
- [ ] TIGER / GOAT title text is legible over the card photo
- [ ] "PLAY TIGER" / "PLAY GOAT" buttons have stone-slab look
- [ ] Campaign / Daily / Endless tabs have bevelled stone look
- [ ] Streak bar has dark stone background with amber border
- [ ] Canvas board shows stone slab photo (no pieces baked into background)
- [ ] Grid lines look carved/engraved into stone
- [ ] Tiger piece on board shows real amber triangle token image
- [ ] Goat pieces on board show real silver coin token images
- [ ] Amber landing dots show the real amber glow asset
- [ ] All game interactions still work (moves, AI, win/lose)
- [ ] Tutorial screen still functions

---

## Important Notes for Claude Code

- Do NOT modify anything in `assets/`
- Do NOT change any game logic, AI, puzzle data, or audio code
- The `trilat()` function must remain unchanged — used by tiger fallback drawing
- All asset paths are relative to `index.html`
- `assets/icons/` and `assets/ui/` folders are unused — do not reference them
- Every JS task has a fallback so the game still works even if an image fails to load
