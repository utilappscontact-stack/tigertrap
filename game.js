// ================================================================
//  TIGER TRAP  —  Step 4 verified puzzles + run shell
//  Fixes early solvability, softens board hints, adds smoother menu hover,
//  and adds Campaign / Daily / Endless shells using safe board symmetries.
// ================================================================


// ==============================================================
//  BOARD GRAPH  (25-node 5×5 Bagh Chal grid)
//  n = row*5 + col.  Orthogonal + alternating diagonals.
// ==============================================================

const GRAPH = (() => {
  const adj = Array.from({ length:25 }, () => []);
  const link = (a,b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };
  for (let r=0;r<5;r++) for (let c=0;c<5;c++) {
    const n=r*5+c;
    if (c<4) link(n,n+1);
    if (r<4) link(n,n+5);
  }
  // Diagonals: square top-left (r,c) gets X when (r+c)%2===0
  for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
    if ((r+c)%2===0) {
      const tl=r*5+c, tr=r*5+c+1, bl=(r+1)*5+c, br=(r+1)*5+c+1;
      link(tl,br); link(tr,bl);
    }
  }
  return adj;
})();

const nR = n => Math.floor(n/5);
const nC = n => n%5;


// ==============================================================
//  LEVEL DATA
//
//  Node reference:
//   0  1  2  3  4
//   5  6  7  8  9
//  10 11 12 13 14
//  15 16 17 18 19
//  20 21 22 23 24
// ==============================================================

// GOAT MODE — player moves goats to trap tiger; tiger AI responds
// Early campaign ramps from exact 1-move traps to deeper multi-turn boards.
const GOAT_CORE_LEVELS = [
  {
    title:'First Trap', label:'Tutorial · First Trap',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:1,
    tigers:[4], goats:[0,2,3,8,14], hint:{from:8,to:9},
  },
  {
    title:'Closing Ring', label:'Closing Ring',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:1,
    tigers:[19], goats:[9,12,14,17,20,22,23,24], hint:{from:12,to:18},
  },
  {
    title:'Twin Gate', label:'Twin Gate',
    goal:'Trap in 2', moveLimit:2, maxCaptures:1, exactMoves:false, difficulty:2,
    tigers:[23], goats:[7,9,13,14,16,17,18,22,24], hint:{from:16,to:21},
  },
  {
    title:'Forked Lane', label:'Forked Lane',
    goal:'Trap in 2', moveLimit:2, maxCaptures:1, exactMoves:false, difficulty:2,
    tigers:[6], goats:[0,1,7,8,10,11,12,15,18,20,22], hint:{from:11,to:16},
  },
  {
    title:'River Teeth', label:'River Teeth',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:2,
    tigers:[4], goats:[2,3,14,8,13,19], hint:{from:8,to:9},
  },
  {
    title:'Temple Funnel', label:'Temple Funnel',
    goal:'Trap in 3', moveLimit:3, maxCaptures:1, exactMoves:false, difficulty:3,
    tigers:[19], goats:[7,9,12,13,14,17,18,20,21,24], hint:{from:21,to:22},
  },
  {
    title:'Braided Net', label:'Braided Net',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:3,
    tigers:[9], goats:[3,4,7,13,14,17,19], hint:{from:3,to:8},
  },
  {
    title:'River Seal', label:'River Seal',
    goal:'Trap in 4', moveLimit:4, maxCaptures:1, exactMoves:false, difficulty:3,
    tigers:[24], goats:[0,1,2,8,12,13,14,18,19,21,22], hint:{from:8,to:9},
  },
  {
    title:'Cliff Lock', label:'Cliff Lock',
    goal:'Trap in 4', moveLimit:4, maxCaptures:1, exactMoves:false, difficulty:4,
    tigers:[2], goats:[1,3,4,6,8,9,10,12,14,15,22], hint:{from:1,to:0},
  },
  {
    title:'Last Gate', label:'Last Gate',
    goal:'Trap in 5', moveLimit:5, maxCaptures:2, exactMoves:false, difficulty:4,
    tigers:[5], goats:[0,2,3,6,7,9,10,17,20,21,22], hint:{from:10,to:15},
  },
  {
    title:'Side Channel', label:'Side Channel',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:4,
    tigers:[14], goats:[2,3,4,8,9,12,13,24,18], hint:{from:18,to:19},
  },
  {
    title:'Pivot Lock', label:'Pivot Lock',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:4,
    tigers:[20], goats:[5,21,22,10,16,17], hint:{from:10,to:15},
  },
  {
    title:'Crescent', label:'Crescent',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:5,
    tigers:[24], goats:[12,14,18,19,23,17], hint:{from:17,to:22},
  },
  {
    title:'Deep Seal', label:'Deep Seal',
    goal:'Trap in 2', moveLimit:2, maxCaptures:2, exactMoves:false, difficulty:5,
    tigers:[0], goats:[1,2,5,10,12,7], hint:{from:7,to:6},
  },
  {
    title:'Iron Ring', label:'Iron Ring',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:5,
    tigers:[0], goats:[1,5,6,10,12,7], hint:{from:7,to:2},
  },
  {
    title:'Squeeze Play', label:'Squeeze Play',
    goal:'Trap in 2', moveLimit:2, maxCaptures:1, exactMoves:false, difficulty:5,
    tigers:[20], goats:[10,11,15,16,17,21,22,24], hint:{from:11,to:6},
  },
  {
    title:'Canyon Wall', label:'Canyon Wall',
    goal:'Trap in 1', moveLimit:1, maxCaptures:1, exactMoves:true, difficulty:5,
    tigers:[19], goats:[9,12,13,14,17,22,23,24], hint:{from:13,to:18},
  },
  {
    title:'Master Trap', label:'Master Trap',
    goal:'Trap in 2', moveLimit:2, maxCaptures:1, exactMoves:false, difficulty:6,
    tigers:[4], goats:[1,3,7,8,13,14,17,19], hint:{from:1,to:2},
  },
  {
    title:'Tight Corner', label:'Tight Corner',
    goal:'Trap in 2', moveLimit:2, maxCaptures:1, exactMoves:false, difficulty:6,
    tigers:[20], goats:[5,7,10,11,13,14,16,17,21,23], hint:{from:23,to:22},
  },
];

const TIGER_CORE_LEVELS = [
  // d:1
  {
    title:'First Hunt',
    label:'Tutorial · First Hunt',
    goal:'Capture 1 goat',
    moveLimit:1,
    objective:'capture_n',
    target:1,
    exactMoves:true,
    difficulty:1,
    tigers:[15],
    goats:[8,9,10,18,20],
    hint:{from:15,to:5},
    tutorialKey:'tiger_intro',
    tutorialGuide:{from:15,to:5},
  },
  // d:2
  {
    title:'Break the Line',
    label:'Break the Line',
    goal:'Capture 2 goats',
    moveLimit:3,
    objective:'capture_n',
    target:2,
    exactMoves:true,
    difficulty:2,
    tigers:[14],
    goats:[5,6,15,16,17,19,21,22,24],
    hint:{from:14,to:8},
  },
  {
    title:'Split the Herd',
    label:'Split the Herd',
    goal:'Capture 2 goats',
    moveLimit:3,
    objective:'capture_n',
    target:2,
    exactMoves:true,
    difficulty:2,
    tigers:[22],
    goats:[1,4,7,21,23,24],
    hint:{from:22,to:20},
  },
  // d:3
  {
    title:'Three Cuts',
    label:'Three Cuts',
    goal:'Capture 3 goats',
    moveLimit:4,
    objective:'capture_n',
    target:3,
    exactMoves:true,
    difficulty:3,
    tigers:[15],
    goats:[0,4,7,14,18,20,21,23],
    hint:{from:15,to:16},
  },
  {
    title:'Edge Feast',
    label:'Edge Feast',
    goal:'Capture 3 goats',
    moveLimit:4,
    objective:'capture_n',
    target:3,
    exactMoves:true,
    difficulty:3,
    tigers:[24],
    goats:[1,2,8,11,16,17,21],
    hint:{from:24,to:18},
  },
  // d:4
  {
    title:'Shadow Run',
    label:'Shadow Run',
    goal:'Escape south',
    moveLimit:5,
    objective:'escape',
    exactMoves:true,
    difficulty:4,
    escapeNodes:[20,21,22,23,24],
    tigers:[4],
    goats:[1,7,9,10,12,14,15,16,20],
    hint:{from:4,to:3},
  },
  {
    title:'Breakout',
    label:'Breakout',
    goal:'Escape south',
    moveLimit:5,
    objective:'escape',
    exactMoves:true,
    difficulty:4,
    escapeNodes:[20,21,22,23,24],
    tigers:[4],
    goats:[5,7,11,12,13,15,16,17,23,24],
    hint:{from:4,to:3},
  },
  {
    title:'Sweep',
    label:'Sweep',
    goal:'Capture 3 goats',
    moveLimit:4,
    objective:'capture_n',
    target:3,
    exactMoves:false,
    difficulty:4,
    tigers:[0],
    goats:[1,5,6,11,16,21],
    hint:{from:0,to:12},
  },
  {
    title:'Diagonal Blitz', label:'Diagonal Blitz',
    goal:'Capture 3 goats',
    moveLimit:4, objective:'capture_n', target:3,
    exactMoves:false, difficulty:4,
    tigers:[0], goats:[1,3,5,7], hint:{from:0,to:2},
  },
  // d:5
  {
    title:'Four Fangs',
    label:'Four Fangs',
    goal:'Capture 4 goats',
    moveLimit:6,
    objective:'capture_n',
    target:4,
    exactMoves:true,
    difficulty:5,
    tigers:[21],
    goats:[0,2,4,5,8,13,14,19,22,23],
    hint:{from:21,to:16},
  },
  {
    title:'Rampage',
    label:'Rampage',
    goal:'Capture 4 goats',
    moveLimit:6,
    objective:'capture_n',
    target:4,
    exactMoves:true,
    difficulty:5,
    tigers:[20],
    goats:[2,6,9,10,14,15,16,17,22,24],
    hint:{from:20,to:21},
  },
  {
    title:'Tunnel Run',
    label:'Tunnel Run',
    goal:'Escape north',
    moveLimit:6,
    objective:'escape',
    escapeNodes:[0,1,2,3,4],
    exactMoves:false,
    difficulty:5,
    tigers:[22],
    goats:[7,8,9,11,12,13,16,17,18],
    hint:{from:22,to:21},
  },
  {
    title:'East Corridor',
    label:'East Corridor',
    goal:'Escape east edge',
    moveLimit:6,
    objective:'escape',
    escapeNodes:[4,9,14,19,24],
    exactMoves:false,
    difficulty:5,
    tigers:[0],
    goats:[1,2,6,7,11,12],
    hint:{from:0,to:5},
  },
  {
    title:'Western Run',
    label:'Western Run',
    goal:'Escape west edge',
    moveLimit:6, objective:'escape',
    escapeNodes:[0,5,10,15,20],
    exactMoves:false, difficulty:5,
    tigers:[24], goats:[8,9,12,13,17,18,19,23],
    hint:{from:24,to:14},
  },
  // d:6
  {
    title:'Great Escape',
    label:'Great Escape',
    goal:'Escape south',
    moveLimit:7,
    objective:'escape',
    exactMoves:true,
    difficulty:6,
    escapeNodes:[20,21,22,23,24],
    tigers:[2],
    goats:[0,1,3,6,7,8,9,11,12,13,14],
    hint:{from:2,to:4},
  },
  {
    title:'Corner to Corner',
    label:'Corner to Corner',
    goal:'Escape south',
    moveLimit:8,
    objective:'escape',
    escapeNodes:[20,21,22,23,24],
    exactMoves:false,
    difficulty:6,
    tigers:[4],
    goats:[3,6,7,8,9,11,12,13,14,15,16,17],
    hint:{from:4,to:2},
  },
  {
    title:'Triple Strike',
    label:'Triple Strike',
    goal:'Capture 3 goats',
    moveLimit:4, objective:'capture_n', target:3,
    exactMoves:false, difficulty:6,
    tigers:[24], goats:[18,22,23,13,17],
    hint:{from:24,to:12},
  },
  // d:7
  {
    title:'Chain Hunter',
    label:'Chain Hunter',
    goal:'Capture 5 goats',
    moveLimit:8,
    objective:'capture_n',
    target:5,
    exactMoves:false,
    difficulty:7,
    tigers:[12],
    goats:[1,3,5,9,15,19,21,23,0,24],
    hint:{from:12,to:6},
  },
  {
    title:'Five Fangs', label:'Five Fangs',
    goal:'Capture 5 goats',
    moveLimit:8, objective:'capture_n', target:5,
    exactMoves:false, difficulty:7,
    tigers:[0], goats:[1,3,5,6,11,15,16,21], hint:{from:0,to:2},
  },
  {
    title:'Diagonal Chase', label:'Diagonal Chase',
    goal:'Capture 4 goats',
    moveLimit:7, objective:'capture_n', target:4,
    exactMoves:false, difficulty:7,
    tigers:[0], goats:[1,3,6,7,11,12,16,21], hint:{from:0,to:2},
  },
  // d:8
  {
    title:'Grand Hunt',
    label:'Grand Hunt',
    goal:'Capture 6 goats',
    moveLimit:10,
    objective:'capture_n',
    target:6,
    exactMoves:false,
    difficulty:8,
    tigers:[12],
    goats:[0,2,4,6,8,10,14,16,18,20,22,24],
    hint:{from:12,to:7},
  },
  {
    title:'The Gauntlet',
    label:'The Gauntlet',
    goal:'Escape south',
    moveLimit:8, objective:'escape',
    escapeNodes:[20,21,22,23,24],
    exactMoves:false, difficulty:8,
    tigers:[2], goats:[1,3,6,7,8,11,12,13,16,17,18],
    hint:{from:2,to:0},
  },
  // d:9
  {
    title:'The Last Hunt',
    label:'The Last Hunt',
    goal:'Capture 7 goats',
    moveLimit:12, objective:'capture_n', target:7,
    exactMoves:false, difficulty:9,
    tigers:[0], goats:[1,2,3,4,5,6,7,8,9,10],
    hint:{from:0,to:12},
  },
  {
    title:'King of the Board',
    label:'King of the Board',
    goal:'Capture 8 goats',
    moveLimit:14, objective:'capture_n', target:8,
    exactMoves:false, difficulty:9,
    tigers:[12], goats:[1,3,5,7,9,11,13,15,17,19,21,23],
    hint:{from:12,to:6},
  },
];

const CAMPAIGN_VARIANTS = [
  { variant:0, suffix:'Dawn' },
  { variant:2, suffix:'Dusk' },
];

function buildCampaignLevels(coreLevels, prefix) {
  const out = [];
  let n = 1;
  CAMPAIGN_VARIANTS.forEach((meta, waveIdx) => {
    coreLevels.forEach(base => {
      const lvl = transformLevel(base, meta.variant, prefix);
      lvl.label = `${prefix}-${String(n).padStart(2,'0')} · ${base.title} ${meta.suffix}`;
      lvl.order = n;
      if (waveIdx > 0) {
        delete lvl.tutorialKey;
        delete lvl.tutorialGuide;
        lvl.exactMoves = false; // Rotated variants aren't solver-verified for exact par
      }
      out.push(lvl);
      n += 1;
    });
  });
  return out;
}

const GOAT_LEVELS = buildCampaignLevels(GOAT_CORE_LEVELS, 'G');
const TIGER_LEVELS = buildCampaignLevels(TIGER_CORE_LEVELS, 'T');

const RUN_TYPES = ['campaign','daily','endless'];
const SAFE_VARIANTS = [0,2];
let curRun = 'campaign';
let runtimeLevel = null;

const STORAGE_KEY    = 'tiger_trap_progress_v1';
const STORAGE_KEY_V2 = 'tiger_trap_progress_v2';
const ANALYTICS_KEY  = 'tiger_trap_analytics_v1';
const DAILY_KEY      = 'tiger_trap_daily_v1';
const DAILY_KEY_V2   = 'tiger_trap_daily_v2';
const STREAK_KEY     = 'tiger_trap_streak_v1';
const STREAK_KEY_V2  = 'tiger_trap_streak_v2';

function migrateProgressV1toV2() {
  if (localStorage.getItem(STORAGE_KEY_V2)) return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const v1 = JSON.parse(raw);
    const v2 = {
      ...v1,
      stars:        { goat: {}, tiger: {} },
      attemptCount: { goat: {}, tiger: {} },
    };
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(v2));
    // v1 key left intact as backup
  } catch(e) {}
}

// -- Daily challenge helpers (declared early — used by resetAllProgress etc.) --
function getTodayKey() {
  const d = new Date(Date.now());
  return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
}

function migrateDailyV1toV2() {
  if (localStorage.getItem(DAILY_KEY_V2)) return;
  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) return;
  try {
    const v1 = JSON.parse(raw);
    const v2 = { goatSolved: {}, tigerSolved: {} };
    for (const key of Object.keys(v1)) {
      if (key.endsWith('_goat'))  v2.goatSolved[key.slice(0, -5)]  = true;
      else if (key.endsWith('_tiger')) v2.tigerSolved[key.slice(0, -6)] = true;
    }
    localStorage.setItem(DAILY_KEY_V2, JSON.stringify(v2));
  } catch(e) {}
}

function markDailySolved(side) {
  migrateDailyV1toV2();
  try {
    const raw  = localStorage.getItem(DAILY_KEY_V2);
    const data = raw ? JSON.parse(raw) : { goatSolved: {}, tigerSolved: {} };
    if (!data.goatSolved)  data.goatSolved  = {};
    if (!data.tigerSolved) data.tigerSolved = {};
    const bucket = side === 'goat' ? 'goatSolved' : 'tigerSolved';
    data[bucket][getTodayKey()] = true;
    localStorage.setItem(DAILY_KEY_V2, JSON.stringify(data));
  } catch(e) {}
}

function isDailySolvedToday(side) {
  migrateDailyV1toV2();
  try {
    const raw = localStorage.getItem(DAILY_KEY_V2);
    if (!raw) return false;
    const data = JSON.parse(raw);
    const bucket = side === 'goat' ? 'goatSolved' : 'tigerSolved';
    return !!(data[bucket] && data[bucket][getTodayKey()]);
  } catch(e) { return false; }
}

function isDailyCompleteToday() {
  return isDailySolvedToday('goat') && isDailySolvedToday('tiger');
}

let progress = loadProgress();
let levelSelectMode = 'goat';
let activeTutorialMode = null;

function loadProgress() {
  migrateProgressV1toV2();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      goatUnlocked: Math.max(1, parsed.goatUnlocked || 1),
      tigerUnlocked: Math.max(1, parsed.tigerUnlocked || 1),
      goatCurrent: Math.max(0, parsed.goatCurrent || 0),
      tigerCurrent: Math.max(0, parsed.tigerCurrent || 0),
      goatCleared: Math.max(0, parsed.goatCleared || 0),
      tigerCleared: Math.max(0, parsed.tigerCleared || 0),
      goatPar: parsed.goatPar || {},
      tigerPar: parsed.tigerPar || {},
      tutorials: {
        goat: !!(parsed.tutorials && parsed.tutorials.goat),
        tiger: !!(parsed.tutorials && parsed.tutorials.tiger),
      },
      stars:        { goat: parsed.stars?.goat || {}, tiger: parsed.stars?.tiger || {} },
      attemptCount: { goat: parsed.attemptCount?.goat || {}, tiger: parsed.attemptCount?.tiger || {} },
      hintsUsedThisLevel: 0,
    };
  } catch (e) {
    return { goatUnlocked:1, tigerUnlocked:1, goatCurrent:0, tigerCurrent:0, goatCleared:0, tigerCleared:0, goatPar:{}, tigerPar:{}, tutorials:{goat:false,tiger:false}, stars:{goat:{},tiger:{}}, attemptCount:{goat:{},tiger:{}}, hintsUsedThisLevel:0 };
  }
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(progress)); } catch(e) {}
}

function trackEvent(name, payload = {}) {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const data = raw ? JSON.parse(raw) : { counts:{}, last:{} };
    data.counts[name] = (data.counts[name] || 0) + 1;
    data.last[name] = Object.assign({ at: Date.now() }, payload);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (e) {}
}

function getUnlockedCount(mode) {
  const total = getModeLevels(mode).length;
  return Math.max(1, Math.min(total, mode==='goat' ? progress.goatUnlocked : progress.tigerUnlocked));
}

function getCurrentIndex(mode) {
  const total = getModeLevels(mode).length;
  const idx = mode==='goat' ? progress.goatCurrent : progress.tigerCurrent;
  return Math.max(0, Math.min(total-1, idx || 0));
}

function setCurrentIndex(mode, idx) {
  const total = getModeLevels(mode).length;
  const safeIdx = Math.max(0, Math.min(total-1, idx));
  if (mode==='goat') progress.goatCurrent = safeIdx;
  else progress.tigerCurrent = safeIdx;
  saveProgress();
  renderStartProgress();
}

function registerCampaignWin() {
  if (curRun !== 'campaign') {
    if (curRun === 'daily') {
      markDailySolved(curMode);
      if (isDailyCompleteToday()) updateStreak();
    }
    return;
  }
  const total = getModeLevels(curMode).length;
  const nextUnlock = Math.min(total, lvlIdx + 2);
  // Track par (best move count)
  const parKey = curMode === 'goat' ? 'goatPar' : 'tigerPar';
  const prev = progress[parKey][lvlIdx];
  if (prev === undefined || S.moveCount < prev) {
    progress[parKey][lvlIdx] = S.moveCount;
  }
  // Compute star rating for this attempt
  const lvl = runtimeLevel;
  const atPar    = lvl && S.moveCount <= lvl.moveLimit;
  const firstTry = (progress.attemptCount[curMode][lvlIdx] || 0) === 1;
  const noHints  = (progress.hintsUsedThisLevel || 0) === 0;
  const newStars  = (atPar && firstTry && noHints) ? 3
                  : atPar                          ? 2
                  :                                  1;
  const prevStars = progress.stars[curMode][lvlIdx] || 0;
  progress.stars[curMode][lvlIdx] = Math.max(prevStars, newStars);

  if (curMode === 'goat') {
    progress.goatUnlocked = Math.max(progress.goatUnlocked, nextUnlock);
    progress.goatCurrent = Math.min(total-1, Math.max(progress.goatCurrent, Math.min(lvlIdx + 1, total-1)));
    progress.goatCleared = Math.max(progress.goatCleared, Math.min(lvlIdx + 1, total));
  } else {
    progress.tigerUnlocked = Math.max(progress.tigerUnlocked, nextUnlock);
    progress.tigerCurrent = Math.min(total-1, Math.max(progress.tigerCurrent, Math.min(lvlIdx + 1, total-1)));
    progress.tigerCleared = Math.max(progress.tigerCleared, Math.min(lvlIdx + 1, total));
  }
  saveProgress();
  renderStartProgress();
  trackEvent('level_complete', { mode:curMode, level:lvlIdx+1, run:curRun, stars:newStars });
}

function markTutorialSeen(mode) {
  progress.tutorials[mode] = true;
  saveProgress();
}

function renderStartProgress() {
  const goatEl = document.getElementById('goat-progress');
  const tigerEl = document.getElementById('tiger-progress');
  const goatCleared = Math.min(progress.goatCleared, GOAT_LEVELS.length);
  const tigerCleared = Math.min(progress.tigerCleared, TIGER_LEVELS.length);
  if (goatEl) {
    if (goatCleared === 0) goatEl.textContent = 'Start your campaign';
    else if (goatCleared === GOAT_LEVELS.length) goatEl.textContent = 'All levels mastered ✓';
    else goatEl.textContent = `${goatCleared} of ${GOAT_LEVELS.length} solved`;
  }
  if (tigerEl) {
    if (tigerCleared === 0) tigerEl.textContent = 'Start your campaign';
    else if (tigerCleared === TIGER_LEVELS.length) tigerEl.textContent = 'All levels mastered ✓';
    else tigerEl.textContent = `${tigerCleared} of ${TIGER_LEVELS.length} solved`;
  }
}

function maybeShowFirstTimeTutorial(mode) {
  if (curRun !== 'campaign' || lvlIdx !== 0 || progress.tutorials[mode]) return;
  // Use the new visual tutorial screen instead of the old text overlay
  activeTutorialMode = mode;
  openTutorial(mode, true);
}

function openLevelSelect(mode) {
  setRunType('campaign');
  levelSelectMode = mode;
  const modal = document.getElementById('level-select');
  const title = document.getElementById('level-select-title');
  const grid = document.getElementById('level-grid');
  const levels = getModeLevels(mode);
  const unlocked = getUnlockedCount(mode);
  if (title) title.innerHTML = mode === 'goat'
    ? '<img src="assets/pieces/goat-piece.png" alt="" style="width:18px;height:18px;vertical-align:middle;object-fit:contain;margin-right:6px;"> Goat Campaign'
    : '<img src="assets/pieces/tiger-piece.png" alt="" style="width:18px;height:18px;vertical-align:middle;object-fit:contain;margin-right:6px;"> Tiger Campaign';
  if (grid) {
    grid.innerHTML = levels.map((lvl, i) => {
      const locked = i >= unlocked;
      const current = i === getCurrentIndex(mode);
      const cleared = i < (mode==='goat' ? progress.goatCleared : progress.tigerCleared);
      // For tiger levels, show objective type
      let typeLabel = '';
      if (mode === 'tiger' && lvl.objective) {
        typeLabel = lvl.objective === 'escape' ? '🚪 Escape' : '<img src="assets/pieces/goat-piece.png" alt="" style="width:13px;height:13px;vertical-align:middle;object-fit:contain;margin-right:3px;"> Capture';
      }
      const goalShort = lvl.goal || '';
      // Par star
      const starCount = progress.stars?.[mode]?.[i] || 0;
      let starsHtml = '';
      if (cleared) {
        starsHtml = `<span class="level-stars" data-stars="${starCount}">${
          [1,2,3].map(s => `<span class="level-star ${s <= starCount ? 'filled' : 'empty'}">${s <= starCount ? '★' : '☆'}</span>`).join('')
        }</span>`;
      }
      return `<button class="level-btn level-btn-mission ${locked?'locked':''} ${current?'current':''} ${cleared?'cleared':''}" ${locked?'disabled':''} data-mode="${mode}" data-level="${i}"${cleared ? ` data-stars="${starCount}"` : ''}>
        <span class="lbm-num">${i+1}</span>
        ${typeLabel ? `<span class="lbm-type">${typeLabel}</span>` : ''}
        <span class="lbm-sub">${goalShort}</span>
        ${starsHtml}
      </button>`;
    }).join('');
  }
  if (modal) modal.classList.add('show');
}

function closeLevelSelect() {
  const modal = document.getElementById('level-select');
  if (modal) modal.classList.remove('show');
}

function transformNode(n, variant) {
  const r = Math.floor(n/5), c = n%5;
  let nr=r, nc=c;
  switch (variant) {
    case 0: nr=r; nc=c; break;               // identity
    case 2: nr=4-r; nc=4-c; break;           // rotate 180
    case 6: nr=c; nc=r; break;               // main diagonal
    case 7: nr=4-c; nc=4-r; break;           // anti-diagonal
    default: nr=r; nc=c; break;
  }
  return nr*5+nc;
}

function transformLevel(base, variant, labelPrefix='Variant') {
  const transformed = {
    ...base,
    label: `${labelPrefix} · ${base.label.split('·').slice(-1)[0].trim()}`,
    tigers: base.tigers.map(n=>transformNode(n, variant)),
    goats: base.goats.map(n=>transformNode(n, variant)),
    escapeNodes: (base.escapeNodes || []).map(n=>transformNode(n, variant)),
  };
  if (variant === 2 && base.objective === 'escape' && transformed.goal) {
    const oppDir = { north:'south', south:'north', east:'west', west:'east' };
    transformed.goal = transformed.goal.replace(/\b(north|south|east|west)\b/gi, (m) => {
      const opp = oppDir[m.toLowerCase()];
      return m[0] === m[0].toUpperCase() ? opp[0].toUpperCase() + opp.slice(1) : opp;
    });
  }
  if (base.hint) {
    transformed.hint = {
      from: transformNode(base.hint.from, variant),
      to: transformNode(base.hint.to, variant),
    };
  }
  if (base.tutorialGuide) {
    transformed.tutorialGuide = {
      from: transformNode(base.tutorialGuide.from, variant),
      to: transformNode(base.tutorialGuide.to, variant),
    };
  }
  return transformed;
}

function daySeed() {
  const now = new Date();
  return Number(`${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}`);
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function getModeLevels(mode) {
  return mode==='goat' ? GOAT_LEVELS : TIGER_LEVELS;
}

function getActiveLevel(idx=0) {
  const pool = getModeLevels(curMode);
  if (curRun==='campaign') return pool[idx] || pool[0];

  const seedBase = curRun==='daily'
    ? daySeed() + idx * 97
    : ((Date.now()>>>0) + idx*97 + (curMode==='goat'?7:19));

  const rand = mulberry32(seedBase);
  const base = pool[Math.floor(rand()*pool.length)] || pool[0];
  const variant = SAFE_VARIANTS[Math.floor(rand()*SAFE_VARIANTS.length)];
  const labelPrefix = curRun==='daily' ? 'Daily' : 'Endless';
  return transformLevel(base, variant, labelPrefix);
}

function setRunType(type) {
  curRun = RUN_TYPES.includes(type) ? type : 'campaign';
  ['campaign','daily','endless'].forEach(name => {
    const el = document.getElementById(`run-${name}`);
    if (el) el.classList.toggle('active', name===curRun);
  });
  renderRescueBanner();
}


// ==============================================================
//  AUDIO  (Web Audio API — pure synthesis, no files)
// ==============================================================

let _audioCtx = null;
let _masterGain = null;
let _soundEnabled = true;

function _getCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _audioCtx.createGain();
    _masterGain.gain.value = 0.55;
    _masterGain.connect(_audioCtx.destination);
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

let _audioUnlocked = false;
function _unlockAudio() {
  if (_audioUnlocked || !_audioCtx) return;
  _audioCtx.resume().then(() => { _audioUnlocked = true; }).catch(()=>{});
}

function _osc(type, freq, gainVal, dur, rampFreq, startT) {
  if (!_soundEnabled) return;
  try {
    const ctx = _getCtx();
    const t = startT !== undefined ? startT : ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(_masterGain);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (rampFreq) osc.frequency.exponentialRampToValueAtTime(rampFreq, t + dur);
    g.gain.setValueAtTime(gainVal, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  } catch(e) {}
}

function _noise(dur, gainVal, startT) {
  if (!_soundEnabled) return;
  try {
    const ctx = _getCtx();
    const t = startT !== undefined ? startT : ctx.currentTime;
    const rate = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.floor(rate * dur), rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain();
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 800;
    src.connect(filt); filt.connect(g); g.connect(_masterGain);
    g.gain.setValueAtTime(gainVal, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.start(t); src.stop(t + dur + 0.01);
  } catch(e) {}
}

const SFX = {
  tap()     { _osc('sine', 700, 0.18, 0.07, 360); },
  move()    { _osc('triangle', 280, 0.22, 0.14, 140); },
  bump()    { _osc('sine', 190, 0.09, 0.06); },
  capture() {
    _osc('sawtooth', 160, 0.5, 0.18, 45);
    _noise(0.09, 0.28);
  },
  trap() {
    if (!_soundEnabled) return;
    const ctx = _getCtx(); const now = ctx.currentTime;
    [[261.6, 0], [329.6, 0.18], [392.0, 0.36]].forEach(([freq, offset]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(_masterGain);
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + offset);
      g.gain.linearRampToValueAtTime(0.38, now + offset + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.28);
      o.start(now + offset); o.stop(now + offset + 0.30);
    });
  },
  fail() {
    if (!_soundEnabled) return;
    const ctx = _getCtx(); const now = ctx.currentTime;
    [[220, 0], [196, 0.16]].forEach(([freq, offset]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(_masterGain);
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.32, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.38);
      o.start(now + offset); o.stop(now + offset + 0.40);
    });
  },
};

// ==============================================================
//  HAPTICS
// ==============================================================

let _hapticsEnabled = true;
const vib = p => { try { if (_hapticsEnabled) { navigator.vibrate && navigator.vibrate(p); } } catch(e){} };
const haptic = {
  tap:     () => { vib(8);             SFX.tap(); },
  move:    () => { vib(12);            SFX.move(); },
  capture: () => { vib([18,8,18]);     SFX.capture(); },
  trap:    () => { vib([28,12,28,12,38]); SFX.trap(); },
  fail:    () => { vib(50);            SFX.fail(); },
  bump:    () => { vib(6);             SFX.bump(); },
};

// ==============================================================
//  STREAK TRACKING  (v2: count, lastDate, rescuesUsedThisWeek, weekStart)
// ==============================================================

const STREAK_MILESTONES = [7, 30, 100, 365];

function _getMondayKey(d) {
  // YYYY-M-D of the most recent Monday (UTC) for a given Date object
  const diff = (d.getUTCDay() + 6) % 7;
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return `${m.getUTCFullYear()}-${m.getUTCMonth()+1}-${m.getUTCDate()}`;
}

function migrateStreakV1toV2() {
  if (localStorage.getItem(STREAK_KEY_V2)) return;
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return;
  try {
    const v1 = JSON.parse(raw);
    const v2 = {
      count:               v1.count || 0,
      lastDate:            v1.last  || null,
      rescuesUsedThisWeek: 0,
      weekStart:           _getMondayKey(new Date(Date.now())),
    };
    localStorage.setItem(STREAK_KEY_V2, JSON.stringify(v2));
  } catch(e) {}
}

function getStreak() {
  migrateStreakV1toV2();
  try {
    const r = localStorage.getItem(STREAK_KEY_V2);
    if (!r) return { count: 0, lastDate: null, rescuesUsedThisWeek: 0, weekStart: null };
    return JSON.parse(r);
  } catch(e) {
    return { count: 0, lastDate: null, rescuesUsedThisWeek: 0, weekStart: null };
  }
}

function _saveStreak(s) {
  try { localStorage.setItem(STREAK_KEY_V2, JSON.stringify(s)); } catch(e) {}
}

function updateStreak() {
  const now = new Date(Date.now());
  const today = `${now.getUTCFullYear()}-${now.getUTCMonth()+1}-${now.getUTCDate()}`;
  const s = getStreak();

  // Roll over rescue counter on new week
  const curWeekStart = _getMondayKey(now);
  if (s.weekStart !== curWeekStart) {
    s.rescuesUsedThisWeek = 0;
    s.weekStart = curWeekStart;
  }

  if (s.lastDate === today) return s.count;

  const yest = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const yesterdayKey = `${yest.getUTCFullYear()}-${yest.getUTCMonth()+1}-${yest.getUTCDate()}`;
  const dby  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
  const dayBeforeYestKey = `${dby.getUTCFullYear()}-${dby.getUTCMonth()+1}-${dby.getUTCDate()}`;

  let newCount, usedRescue = false;
  if (s.lastDate === yesterdayKey) {
    newCount = s.count + 1;
  } else if (s.lastDate === dayBeforeYestKey && s.rescuesUsedThisWeek < 1) {
    newCount = s.count + 1;
    usedRescue = true;
  } else {
    newCount = 1;
  }

  s.count = newCount;
  s.lastDate = today;
  if (usedRescue) s.rescuesUsedThisWeek = 1;
  _saveStreak(s);

  if (STREAK_MILESTONES.includes(newCount)) {
    triggerMilestoneCelebration(newCount);
  }
  return newCount;
}

function isRescueEligible() {
  const s = getStreak();
  if (s.count === 0 || s.rescuesUsedThisWeek >= 1 || isDailyCompleteToday()) return false;
  const now = new Date(Date.now());
  const dby = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
  const dayBeforeYestKey = `${dby.getUTCFullYear()}-${dby.getUTCMonth()+1}-${dby.getUTCDate()}`;
  return s.lastDate === dayBeforeYestKey;
}

function renderRescueBanner() {
  const banner = document.getElementById('rescue-banner');
  if (!banner) return;
  if (curRun === 'daily' && isRescueEligible()) {
    const s = getStreak();
    const textEl = document.getElementById('rescue-banner-text');
    if (textEl) textEl.textContent = `Save your ${s.count}-day streak \u2014 solve yesterday\u2019s puzzle.`;
    banner.style.display = '';
  } else {
    banner.style.display = 'none';
  }
}

const _milestoneData = {
  7:   { label: '7-Day Streak',   sub: 'A week of daily mastery.',               glow: '#E8872A', tier: '7'   },
  30:  { label: '30-Day Streak',  sub: 'A month on the board.',                  glow: '#E8A030', tier: '30'  },
  100: { label: '100-Day Streak', sub: 'Uncommon dedication.',                   glow: '#FFD060', tier: '100' },
  365: { label: '365-Day Streak', sub: 'One full year. The board knows you.',    glow: '#FFE880', tier: '365' },
};

function triggerMilestoneCelebration(count) {
  const ov = document.getElementById('milestone-overlay');
  if (!ov) return;
  const data = _milestoneData[count] || { label: `${count}-Day Streak`, sub: 'Keep going.', glow: '#E8872A', tier: '7' };
  const labelEl = ov.querySelector('.milestone-label');
  const subEl   = ov.querySelector('.milestone-sub');
  const countEl = ov.querySelector('.milestone-count');
  if (labelEl) labelEl.textContent = data.label;
  if (subEl)   subEl.textContent   = data.sub;
  if (countEl) countEl.textContent = count;
  ov.setAttribute('data-tier', data.tier);
  ov.style.setProperty('--mg', data.glow);
  ov.classList.add('show');
  setTimeout(() => ov.classList.remove('show'), 4800);
}




// ==============================================================
//  TUTORIAL SYSTEM — animated, step-by-step reveal
// ==============================================================

let _tutMode     = 'goat';
let _tutFromGame = false;
let _tutStepIdx  = 0;
let _tutSteps    = [];
let _tutAnimId   = null;
let _tutSegIdx   = 0;
let _tutSegStart = null;

// -- Easing --
function _eio(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t; }

// -- Step definitions with animation segments ------------------
function getTutStepsAnimated(mode) {
  var G = [
    {
      num:'Step 1', heading:'Read the board',
      body:'Goats move one step along connected lines. Tap a goat to light up where it can slide.',
      anim:{ segments:[
        { dur:900,  board:{ tigers:[12], goats:[6,7,11,13,17] },                                               gp:null },
        { dur:800,  board:{ tigers:[12], goats:[6,7,11,13,17], moveableRings:[6,7,11,13,17] },                  gp:null },
        { dur:1300, board:{ tigers:[12], goats:[6,7,11,13,17], selected:7, legalSlides:[2,8] },                gp:null },
        { dur:400,  board:{ tigers:[12], goats:[6,7,11,13,17] },                                               gp:null },
      ]}
    },
    {
      num:'Step 2', heading:'Move into the open lane',
      body:'Tap the highlighted point to slide your goat. Then the tiger takes its turn automatically.',
      anim:{ segments:[
        { dur:700,  board:{ tigers:[12], goats:[6,7,11,13,17], selected:7, legalSlides:[2,8] }, gp:null },
        { dur:600,  board:{ tigers:[12], goats:[6,2,11,13,17] },  gp:{t:'goat',  from:7,  to:2} },
        { dur:500,  board:{ tigers:[12], goats:[6,2,11,13,17] },  gp:null },
        { dur:650,  board:{ tigers:[18], goats:[6,2,11,13,17] },  gp:{t:'tiger', from:12, to:18} },
        { dur:900,  board:{ tigers:[18], goats:[6,2,11,13,17] },  gp:null },
        { dur:350,  board:{ tigers:[12], goats:[6,7,11,13,17] },  gp:null },
      ]}
    },
    {
      num:'Step 3', heading:"Block the tiger's jump",
      body:'The tiger can jump over one adjacent goat into the empty space beyond, capturing it. Seal those lanes.',
      anim:{ segments:[
        { dur:1100, board:{ tigers:[8], goats:[7,13], tigerJumps:[{to:6,captured:7},{to:18,captured:13}] }, gp:null },
        { dur:650,  board:{ tigers:[6], goats:[13] },  gp:{t:'tiger', from:8, to:6}, flash:7 },
        { dur:900,  board:{ tigers:[6], goats:[13] },  gp:null },
        { dur:350,  board:{ tigers:[8], goats:[7,13] }, gp:null },
      ]}
    },
    {
      num:'Step 4', heading:'Trap the tiger',
      body:'Close every open lane. When the tiger has no legal move — no slide, no jump — you win.',
      anim:{ segments:[
        { dur:900,  board:{ tigers:[12], goats:[6,7,11,13,17,23] },              gp:null },
        { dur:650,  board:{ tigers:[12], goats:[6,7,11,13,17,18] },              gp:{t:'goat', from:23, to:18} },
        { dur:1400, board:{ tigers:[12], goats:[6,7,11,13,17,18], trapped:true },gp:null },
        { dur:350,  board:{ tigers:[12], goats:[6,7,11,13,17,23] },              gp:null },
      ]}
    },
  ];

  var T = [
    {
      num:'Step 1', heading:'You are the tiger',
      body:'Slide along any connected line, or jump over one adjacent goat to capture it.',
      anim:{ segments:[
        { dur:900,  board:{ tigers:[12], goats:[7,11,17], tigerSelected:true, legalSlides:[6,8,13,18] }, gp:null },
        { dur:1100, board:{ tigers:[12], goats:[7,11,17], tigerSelected:true, legalSlides:[6,8,13,18], tigerJumps:[{to:2,captured:7},{to:10,captured:11},{to:22,captured:17}] }, gp:null },
        { dur:400,  board:{ tigers:[12], goats:[7,11,17] }, gp:null },
      ]}
    },
    {
      num:'Step 2', heading:'Amber marks the capture',
      body:'Amber landing dots show jump captures — the goat in between is removed. Chain them to reach your target.',
      anim:{ segments:[
        { dur:900,  board:{ tigers:[12], goats:[11], tigerSelected:true, tigerJumps:[{to:10,captured:11}] }, gp:null },
        { dur:650,  board:{ tigers:[10], goats:[] }, gp:{t:'tiger', from:12, to:10}, flash:11 },
        { dur:900,  board:{ tigers:[10], goats:[] }, gp:null },
        { dur:400,  board:{ tigers:[12], goats:[11] }, gp:null },
      ]}
    },
    {
      num:'Step 3', heading:'Goats adapt after every move',
      body:'After each tiger move, one goat shifts to block your routes. Read two moves ahead.',
      anim:{ segments:[
        { dur:650,  board:{ tigers:[2], goats:[1,3,8] }, gp:{t:'tiger', from:7, to:2} },
        { dur:600,  board:{ tigers:[2], goats:[1,3,8] }, gp:null },
        { dur:650,  board:{ tigers:[2], goats:[1,3,9] }, gp:{t:'goat',  from:8, to:9} },
        { dur:950,  board:{ tigers:[2], goats:[1,3,9] }, gp:null },
        { dur:300,  board:{ tigers:[7], goats:[1,3,8] }, gp:null },
      ]}
    },
    {
      num:'Step 4', heading:'Hit your target',
      body:'Reach the glowing escape zone, or capture the required number of goats before the move limit runs out.',
      anim:{ segments:[
        { dur:1000, board:{ tigers:[4], goats:[5,6,7,8,10], tigerSelected:true, legalSlides:[3,9], escapeNodes:[20,21,22,23,24] }, gp:null },
        { dur:650,  board:{ tigers:[9], goats:[5,6,7,8,10], escapeNodes:[20,21,22,23,24] }, gp:{t:'tiger', from:4, to:9} },
        { dur:700,  board:{ tigers:[9], goats:[5,6,7,8,10], tigerSelected:true, legalSlides:[14], escapeNodes:[20,21,22,23,24] }, gp:null },
        { dur:400,  board:{ tigers:[4], goats:[5,6,7,8,10], escapeNodes:[20,21,22,23,24] }, gp:null },
      ]}
    },
  ];

  return mode === 'goat' ? G : T;
}

// -- Animation runner ------------------------------------------
const GLIDE_MS = 380;

function _startTutAnim(segments) {
  if (_tutAnimId) { cancelAnimationFrame(_tutAnimId); _tutAnimId = null; }
  _tutSegIdx = 0; _tutSegStart = null;

  const canvas = document.getElementById('tut-canvas');
  if (!canvas) return;

  function frame(ts) {
    if (!_tutSegStart) _tutSegStart = ts;
    const elapsed = ts - _tutSegStart;
    const seg = segments[_tutSegIdx];
    if (!seg) return;

    const glideT = seg.gp ? _eio(Math.min(1, elapsed / GLIDE_MS)) : 1;
    _drawTutFrame(canvas, seg.board, seg.gp, glideT, elapsed < 80 && seg.flash !== undefined ? seg.flash : undefined);

    if (elapsed >= seg.dur) {
      _tutSegIdx = (_tutSegIdx + 1) % segments.length;
      _tutSegStart = ts;
    }
    _tutAnimId = requestAnimationFrame(frame);
  }
  _tutAnimId = requestAnimationFrame(frame);
}

// -- Tutorial board renderer (animated) -----------------------
function _drawTutFrame(canvas, board, gp, glideT, flashNode) {
  const BSPC = canvas.width;
  const cx   = canvas.getContext('2d');
  const mg   = BSPC * 0.11;
  const cel  = (BSPC - 2*mg) / 4;
  const nxy  = n => ({ x: mg+(n%5)*cel, y: mg+Math.floor(n/5)*cel });

  // Background
  const bg = cx.createRadialGradient(BSPC/2,BSPC/2,0,BSPC/2,BSPC/2,BSPC*.72);
  bg.addColorStop(0,'#1E1508'); bg.addColorStop(1,'#120D07');
  cx.fillStyle=bg; cx.fillRect(0,0,BSPC,BSPC);

  // Lines
  for (let a=0;a<25;a++) for (const b of GRAPH[a]) {
    if (b<=a) continue;
    const pa=nxy(a),pb=nxy(b);
    const d=Math.abs(Math.floor(b/5)-Math.floor(a/5))===1&&Math.abs(b%5-a%5)===1;
    cx.beginPath(); cx.moveTo(pa.x,pa.y); cx.lineTo(pb.x,pb.y);
    cx.strokeStyle=d?'#261A0A':'#382815'; cx.lineWidth=d?0.9:1.3; cx.stroke();
  }
  // Node dots
  for (let n=0;n<25;n++) {
    const p=nxy(n); cx.beginPath(); cx.arc(p.x,p.y,Math.max(2,cel*.06),0,Math.PI*2);
    cx.fillStyle='#4A3218'; cx.fill();
  }
  // Escape nodes
  if (board.escapeNodes) for (const n of board.escapeNodes) {
    const p=nxy(n);
    const g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,cel*.52);
    g.addColorStop(0,'rgba(70,210,100,.38)'); g.addColorStop(1,'rgba(70,210,100,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y,cel*.52,0,Math.PI*2); cx.fill();
  }
  // Moveable goat rings
  if (board.moveableRings) for (const n of board.moveableRings) {
    const p=nxy(n); cx.beginPath(); cx.arc(p.x,p.y,cel*.27,0,Math.PI*2);
    cx.strokeStyle='rgba(255,208,96,.28)'; cx.lineWidth=1.4; cx.stroke();
  }
  // Legal slides
  if (board.legalSlides) for (const n of board.legalSlides) {
    const p=nxy(n);
    const g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,cel*.36);
    g.addColorStop(0,'rgba(126,207,197,.22)'); g.addColorStop(1,'rgba(126,207,197,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y,cel*.36,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.arc(p.x,p.y,cel*.13,0,Math.PI*2);
    cx.fillStyle='rgba(126,207,197,.78)'; cx.fill();
  }
  // Tiger jump indicators
  if (board.tigerJumps) for (const j of board.tigerJumps) {
    const pc=nxy(j.captured);
    cx.beginPath(); cx.arc(pc.x,pc.y,cel*.23,0,Math.PI*2);
    cx.strokeStyle='rgba(220,80,30,.68)'; cx.lineWidth=1.7; cx.stroke();
    const p=nxy(j.to);
    const g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,cel*.36);
    g.addColorStop(0,'rgba(232,135,26,.24)'); g.addColorStop(1,'rgba(232,135,26,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y,cel*.36,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.arc(p.x,p.y,cel*.14,0,Math.PI*2);
    cx.fillStyle='rgba(240,155,40,.85)'; cx.fill();
  }

  // Gliding piece: exclude it from static draw
  const skipGoat  = gp && gp.t==='goat'  ? gp.to : -1;
  const skipTiger = gp && gp.t==='tiger' ? gp.to : -1;

  // Static goats
  const goats = board.goats || [];
  for (const n of goats) {
    if (n === skipGoat) continue;
    const p=nxy(n); const r=cel*.2; const sel=board.selected===n;
    if (sel) { cx.beginPath(); cx.arc(p.x,p.y,r+3.5,0,Math.PI*2); cx.strokeStyle='#FFD060'; cx.lineWidth=2; cx.stroke(); }
    cx.beginPath(); cx.arc(p.x+.8,p.y+2,r,0,Math.PI*2); cx.fillStyle='rgba(0,0,0,.32)'; cx.fill();
    cx.beginPath(); cx.arc(p.x,p.y,r,0,Math.PI*2);
    cx.fillStyle=sel?'#FFF8E8':'#EDE0C4'; cx.fill();
    cx.strokeStyle=sel?'#FFD060':'#A08050'; cx.lineWidth=1.4; cx.stroke();
    cx.beginPath(); cx.arc(p.x,p.y,r*.28,0,Math.PI*2); cx.fillStyle='rgba(80,50,15,.25)'; cx.fill();
  }
  // Static tigers
  for (const n of (board.tigers||[])) {
    if (n === skipTiger) continue;
    _drawTutTiger(cx, nxy(n), cel, board.tigerSelected, board.trapped);
  }

  // Gliding piece at interpolated position
  if (gp && glideT <= 1) {
    const from=nxy(gp.from), to=nxy(gp.to);
    const x=from.x+(to.x-from.x)*glideT, y=from.y+(to.y-from.y)*glideT;
    if (gp.t==='goat')  _drawTutGoatAt(cx,x,y,cel);
    else                _drawTutTigerXY(cx,x,y,cel,board.tigerSelected||false);
  }

  // Capture flash ring
  if (flashNode !== undefined) {
    const p=nxy(flashNode);
    cx.beginPath(); cx.arc(p.x,p.y,cel*.3,0,Math.PI*2);
    cx.strokeStyle='rgba(255,120,30,.85)'; cx.lineWidth=2.5; cx.stroke();
    const g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,cel*.32);
    g.addColorStop(0,'rgba(255,160,40,.5)'); g.addColorStop(1,'rgba(255,100,20,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y,cel*.32,0,Math.PI*2); cx.fill();
  }
}

function _drawTutGoatAt(cx,x,y,cel) {
  const r = cel * 0.2;
  if (window._goatPieceImg && window._goatPieceImg.complete && window._goatPieceImg.naturalWidth > 0) {
    cx.save();
    cx.shadowColor = 'rgba(0,0,0,0.50)';
    cx.shadowBlur = 6;
    cx.shadowOffsetY = 2;
    cx.drawImage(window._goatPieceImg, x - r, y - r, r * 2, r * 2);
    cx.restore();
  } else {
    cx.beginPath(); cx.arc(x+.8,y+2,r,0,Math.PI*2); cx.fillStyle='rgba(0,0,0,.32)'; cx.fill();
    cx.beginPath(); cx.arc(x,y,r,0,Math.PI*2); cx.fillStyle='#EDE0C4'; cx.fill();
    cx.strokeStyle='#A08050'; cx.lineWidth=1.4; cx.stroke();
    cx.beginPath(); cx.arc(x,y,r*.28,0,Math.PI*2); cx.fillStyle='rgba(80,50,15,.25)'; cx.fill();
  }
}

function _drawTutTiger(cx, p, cel, isTigerPlayer, trapped) {
  _drawTutTigerXY(cx, p.x, p.y, cel, isTigerPlayer, trapped);
}

function _drawTutTigerXY(cx, px, py, cel, isTigerPlayer, trapped) {
  const rad = cel * 0.25;
  // Ambient glow
  const grd = cx.createRadialGradient(px,py,0,px,py,rad*2.7);
  grd.addColorStop(0, `rgba(232,135,26,${isTigerPlayer ? .35 : .22})`);
  grd.addColorStop(1, 'rgba(232,135,26,0)');
  cx.fillStyle = grd; cx.beginPath(); cx.arc(px,py,rad*2.7,0,Math.PI*2); cx.fill();
  // Selection ring
  if (isTigerPlayer) {
    cx.beginPath();
    cx.moveTo(px, py-(rad+3)); cx.lineTo(px+(rad+3)*.866, py+(rad+3)*.5); cx.lineTo(px-(rad+3)*.866, py+(rad+3)*.5); cx.closePath();
    cx.strokeStyle='rgba(255,210,60,.55)'; cx.lineWidth=1.8; cx.stroke();
  }
  if (window._tigerPieceImg && window._tigerPieceImg.complete && window._tigerPieceImg.naturalWidth > 0) {
    cx.save();
    cx.shadowColor = 'rgba(0,0,0,0.55)';
    cx.shadowBlur = 8;
    cx.shadowOffsetY = 3;
    cx.drawImage(window._tigerPieceImg, px - rad, py - rad * 1.05, rad * 2, rad * 2.1);
    cx.restore();
  } else {
    cx.save(); cx.translate(px+1.4,py+2.4); cx.beginPath(); cx.moveTo(0,-rad); cx.lineTo(rad*.866,rad*.5); cx.lineTo(-rad*.866,rad*.5); cx.closePath(); cx.fillStyle='rgba(0,0,0,.34)'; cx.fill(); cx.restore();
    cx.save(); cx.translate(px,py); cx.beginPath(); cx.moveTo(0,-rad); cx.lineTo(rad*.866,rad*.5); cx.lineTo(-rad*.866,rad*.5); cx.closePath(); cx.fillStyle='#E8871A'; cx.fill(); cx.strokeStyle='#F06010'; cx.lineWidth=1.4; cx.stroke(); cx.restore();
    cx.save(); cx.translate(px,py-rad*.12); cx.beginPath(); cx.moveTo(0,-rad*.37); cx.lineTo(rad*.37*.866,rad*.37*.5); cx.lineTo(-rad*.37*.866,rad*.37*.5); cx.closePath(); cx.fillStyle='rgba(255,200,90,.38)'; cx.fill(); cx.restore();
  }
  if (trapped) {
    cx.beginPath(); cx.arc(px,py,rad*2,0,Math.PI*2);
    cx.strokeStyle='rgba(80,210,80,.78)'; cx.lineWidth=2.5; cx.setLineDash([5,4]); cx.stroke(); cx.setLineDash([]);
  }
}

// -- Tutorial navigation ---------------------------------------
function openTutorial(mode, fromGame=false) {
  _tutMode = mode || curMode || 'goat';
  _tutFromGame = fromGame;
  _tutStepIdx = 0;
  _tutSteps = getTutStepsAnimated(_tutMode);

  const kicker = document.getElementById('tut-mode-kicker');
  if (kicker) kicker.innerHTML = _tutMode==='tiger'
    ? '<img src="assets/pieces/tiger-piece.png" alt="" style="width:16px;height:16px;vertical-align:middle;object-fit:contain;margin-right:5px;"> Tiger Mode'
    : '<img src="assets/pieces/goat-piece.png" alt="" style="width:16px;height:16px;vertical-align:middle;object-fit:contain;margin-right:5px;"> Goat Mode';

  // Size canvas to available space
  const bodyArea = document.getElementById('tut-body-area');
  const availW   = Math.min(window.innerWidth - 36, 400);
  const availH   = Math.min(availW, window.innerHeight * 0.46);
  const BSPC     = Math.round(Math.max(200, availH) * (window.devicePixelRatio||1));
  const canvas   = document.getElementById('tut-canvas');
  canvas.width = canvas.height = BSPC;
  const cssSize  = Math.round(BSPC / (window.devicePixelRatio||1));
  canvas.style.width = canvas.style.height = cssSize + 'px';

  _buildTutDots();
  _goToTutStep(0, false);

  document.getElementById('tutorial-screen').classList.remove('hidden');
  if (fromGame) document.getElementById('game-screen').classList.add('hidden');
  else          document.getElementById('start-screen').classList.add('hidden');
}

function closeTutorial() {
  if (_tutAnimId) { cancelAnimationFrame(_tutAnimId); _tutAnimId = null; }
  document.getElementById('tutorial-screen').classList.add('hidden');
  if (_tutFromGame) document.getElementById('game-screen').classList.remove('hidden');
  else              document.getElementById('start-screen').classList.remove('hidden');
}

function _buildTutDots() {
  const el = document.getElementById('tut-dots');
  if (!el) return;
  el.innerHTML = _tutSteps.map((_,i) => `<div class="tut-dot" data-di="${i}"></div>`).join('');
}

function _updateTutDots(idx) {
  document.querySelectorAll('.tut-dot').forEach((d,i) => {
    d.className = 'tut-dot' + (i<idx ? ' done' : i===idx ? ' active' : '');
  });
}

function _goToTutStep(idx, animate=true) {
  const step = _tutSteps[idx];
  if (!step) return;
  _tutStepIdx = idx;

  const bodyArea = document.getElementById('tut-body-area');

  const doUpdate = () => {
    document.getElementById('tut-num').textContent      = step.num;
    document.getElementById('tut-heading').textContent  = step.heading;
    document.getElementById('tut-body-text').textContent = step.body;
    _updateTutDots(idx);
    // Update next button
    const nb = document.getElementById('tut-next');
    if (nb) nb.textContent = idx >= _tutSteps.length-1
      ? (_tutFromGame ? 'Back to game →' : 'Start playing →')
      : `Step ${idx+2} →`;
    // Step 1 is non-skippable for first-time players
    const skipBtn = document.getElementById('tut-skip');
    if (skipBtn) skipBtn.style.visibility = (idx === 0) ? 'hidden' : 'visible';
    const closeBtn = document.getElementById('tut-close');
    if (closeBtn) {
      // Hide close on step 1 only for first-time tutorials (not when opened from game via Help)
      const isFirstTime = !progress.tutorials[_tutMode];
      closeBtn.classList.toggle('step1-hidden', idx === 0 && isFirstTime && _tutFromGame);
    }
    // Start animation
    _startTutAnim(step.anim.segments);
    if (bodyArea) { bodyArea.classList.remove('fading'); bodyArea.style.transition='opacity .22s ease, transform .22s ease'; }
  };

  if (animate && bodyArea) {
    bodyArea.classList.add('fading');
    bodyArea.style.transition = 'opacity .18s ease, transform .18s ease';
    setTimeout(doUpdate, 195);
  } else {
    doUpdate();
  }
}

// -- Tutorial button wiring ------------------------------------
document.getElementById('tut-close').addEventListener('click', () => {
  markTutorialSeen(_tutMode); closeTutorial();
});
document.getElementById('tut-skip').addEventListener('click', () => {
  markTutorialSeen(_tutMode); closeTutorial();
  if (!_tutFromGame && _tutStepIdx === 0) startMode(_tutMode);
});
document.getElementById('tut-next').addEventListener('click', () => {
  if (_tutStepIdx < _tutSteps.length - 1) {
    _goToTutStep(_tutStepIdx + 1, true);
  } else {
    markTutorialSeen(_tutMode);
    closeTutorial();
    if (!_tutFromGame) startMode(_tutMode);
  }
});


// -- Reset all progress ---------------------------------------
function resetAllProgress() {
  showOverlay('⚠️','Reset Everything?','All levels, streaks, and progress will be wiped. This cannot be undone.',
    'Yes, reset all',
    () => {
      try {
        [STORAGE_KEY, STORAGE_KEY_V2, ANALYTICS_KEY, STREAK_KEY, STREAK_KEY_V2, DAILY_KEY, DAILY_KEY_V2].forEach(k => localStorage.removeItem(k));
      } catch(e) {}
      hideOverlay();
      location.reload();
    },
    'Cancel',
    () => hideOverlay()
  );
}

function renderStreak() {
  const s = getStreak();
  const el = document.getElementById('streak-count');
  const bar = document.getElementById('streak-bar');
  const labelMain = document.getElementById('streak-label-main');
  const labelSub = document.getElementById('streak-label-sub');
  const flame = document.getElementById('streak-flame');
  if (!el) return;
  if (s.count > 0) {
    el.textContent = s.count;
    if (labelMain) labelMain.textContent = `${s.count}-Day Streak`;
    if (labelSub) labelSub.textContent = s.count >= 7 ? 'On fire. Keep it going.' : 'Play daily to grow it.';
    if (bar) {
      bar.style.borderColor = s.count >= 7 ? 'rgba(232,135,26,.4)' : 'rgba(232,135,26,.14)';
      bar.style.background  = s.count >= 7 ? 'rgba(232,135,26,.12)' : 'rgba(232,135,26,.06)';
    }
    if (flame) flame.textContent = s.count >= 7 ? '🔥' : s.count >= 3 ? '🔥' : '🌱';
  } else {
    el.textContent = '';
    if (labelMain) labelMain.textContent = 'Daily Streak';
    if (labelSub) labelSub.textContent = 'Play the daily to start one.';
    if (flame) flame.textContent = '🔥';
    if (bar) {
      bar.style.borderColor = '';
      bar.style.background = '';
    }
  }
  renderRescueBanner();
}




// ==============================================================
//  EFFECTS STATE
// ==============================================================

// Screen shake
const shake = { on:false, end:0, dur:0, mag:0 };
function triggerShake(mag=8, dur=300) {
  shake.on=true; shake.end=performance.now()+dur; shake.dur=dur; shake.mag=mag;
}

// Capture flash rings
const flashes = [];
function addFlash(node, rgba) {
  flashes.push({ node, end:performance.now()+520, rgba });
}

// Invalid-tap bump rings
const bumps = {};
function triggerBump(node) { bumps[node]=performance.now()+320; haptic.bump(); }

// AI move hint (dashed line for brief moment)
let aiHint = null;
let playerHint = null;
let isPaused = false;

// -- GLIDE ANIMATION ------------------------------------------
// Pieces animate smoothly from one node to another
const PIECE_GLIDE_MS = 160; // duration in ms
const glides = []; // [{fromXY, toXY, piece:'tiger'|'goat', color, start, endMs}]

function startGlide(fromNode, toNode, piece, type) {
  const from = nxy(fromNode);
  const to   = nxy(toNode);
  const now  = performance.now();
  glides.push({ from, to, piece, start:now, end:now+PIECE_GLIDE_MS, isJump:(type==='jump') });
}

function drawGlides() {
  const now = performance.now();
  for (let i = glides.length-1; i >= 0; i--) {
    const g = glides[i];
    const rem = g.end - now;
    if (rem <= 0) { glides.splice(i,1); continue; }
    const t = 1 - rem/PIECE_GLIDE_MS;
    // ease in-out
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    let x = g.from.x + (g.to.x - g.from.x) * ease;
    let y = g.from.y + (g.to.y - g.from.y) * ease;
    if (g.isJump) {
      const arc = Math.sin(Math.PI * t);
      y -= arc * cell * 0.55;
    }
    if (g.piece === 'tiger') {
      _drawTigerAt(x, y, false);
    } else {
      _drawGoatAt(x, y, false);
    }
  }
}

function _drawGoatAt(x, y, sel) {
  const r = cell*.21;
  ctx.beginPath(); ctx.arc(x+1,y+2,r,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,.33)'; ctx.fill();
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=P.goat; ctx.fill();
  ctx.strokeStyle=P.goatStroke; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(x,y,r*.3,0,Math.PI*2);
  ctx.fillStyle=P.goatInner; ctx.fill();
}

function _drawTigerAt(x, y, isTigerPlayer) {
  const rad = cell*.27;
  const g=ctx.createRadialGradient(x,y,0,x,y,rad*2.7);
  g.addColorStop(0,`rgba(232,135,26,0.26)`); g.addColorStop(1,'rgba(232,135,26,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,rad*2.7,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.translate(x+1.5,y+2.5); trilat(0,0,rad*1.06);
  ctx.fillStyle='rgba(0,0,0,.36)'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x,y); trilat(0,0,rad);
  ctx.fillStyle=P.tiger; ctx.fill(); ctx.strokeStyle='#F06010'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(x,y-rad*.12); trilat(0,0,rad*.37);
  ctx.fillStyle=P.tigerHi; ctx.fill(); ctx.restore();
}


// ==============================================================
//  GAME STATE
// ==============================================================

let curMode   = 'goat';  // 'goat'|'tiger'
let lvlIdx    = 0;
let S         = null;    // current state
let history   = [];

function mkState(lvl, mode) {
  return {
    mode,
    tigers:       [...lvl.tigers],
    goats:        [...lvl.goats],
    selected:     mode==='tiger' ? lvl.tigers[0] : null,
    legalSlides:  [],
    legalJumps:   [],
    moveCount:    0,
    moveLimit:    lvl.moveLimit,
    capturedGoats:0,
    maxCaptures:  lvl.maxCaptures || 99,
    objective:    lvl.objective   || null,
    target:       lvl.target      || 0,
    escapeNodes:  lvl.escapeNodes ? [...lvl.escapeNodes] : [],
    phase:        'player',
    pendingAI:    false,
    aiAt:         0,
  };
}

function loadLevel(idx) {
  lvlIdx = idx;
  const lvl = getActiveLevel(idx);
  runtimeLevel = lvl;
  S = mkState(lvl, curMode);
  history = []; aiHint = null; playerHint = null; isPaused = false;

  if (curRun === 'campaign') {
    progress.hintsUsedThisLevel = 0;
    const ac = progress.attemptCount[curMode];
    ac[idx] = (ac[idx] || 0) + 1;
    saveProgress();
  }

  // Daily mode board identity
  const bc = document.getElementById('board-container');
  if (bc) bc.classList.toggle('daily-mode', curRun === 'daily');

  let _lvlDisplay;
  if (curRun === 'campaign') {
    _lvlDisplay = `Level ${lvlIdx+1} · ${lvl.title||lvl.label}`;
  } else if (curRun === 'daily') {
    const d = new Date();
    const stamp = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const sideLabel = curMode === 'goat' ? 'Goat' : 'Tiger';
    _lvlDisplay = `Daily · ${stamp} · ${sideLabel}`;
  } else {
    _lvlDisplay = 'Endless Mode';
  }
  document.getElementById('level-label').textContent = _lvlDisplay;
  // Build richer goal display
  let _goalDisplay = lvl.goal;
  document.getElementById('goal-text').textContent = _goalDisplay;
  updateHUD();

  const tag = document.getElementById('mode-tag');
  tag.innerHTML = curMode==='tiger'
    ? '<img src="assets/pieces/tiger-piece.png" alt="" style="width:16px;height:16px;vertical-align:middle;object-fit:contain;margin-right:4px;"> Tiger Mode'
    : '<img src="assets/pieces/goat-piece.png" alt="" style="width:16px;height:16px;vertical-align:middle;object-fit:contain;margin-right:4px;"> Goat Mode';
  tag.className   = curMode;

  if (curMode==='tiger') computeTigerMoves();
  updateHUD();
  refreshPips();
  hideOverlay();
  if (curRun === 'campaign') setCurrentIndex(curMode, idx);
  trackEvent('level_start', { mode:curMode, level:idx+1, run:curRun });

  // Level entry micro-moment
  const wrapper = document.getElementById('game-wrapper');
  if (wrapper) {
    wrapper.classList.remove('level-entering');
    void wrapper.offsetWidth; // force reflow
    wrapper.classList.add('level-entering');
    setTimeout(() => wrapper.classList.remove('level-entering'), 380);
  }
  _maybeShowSwipeHint();
}

function snap() {
  return {
    mode:S.mode, tigers:[...S.tigers], goats:[...S.goats],
    selected:null, legalSlides:[], legalJumps:[],
    moveCount:S.moveCount, moveLimit:S.moveLimit,
    capturedGoats:S.capturedGoats, maxCaptures:S.maxCaptures,
    objective:S.objective, target:S.target, escapeNodes:[...S.escapeNodes],
    phase:'player', pendingAI:false, aiAt:0,
  };
}


// ==============================================================
//  SHARED MOVE PRIMITIVES
// ==============================================================

function occupied(node) { return S.tigers.includes(node)||S.goats.includes(node); }

// Tiger moves: slides to empty adjacent nodes + jump-captures over goats
function tigerMoves(tn) {
  const slides=[], jumps=[];
  for (const adj of GRAPH[tn]) {
    if (!occupied(adj)) {
      slides.push(adj);
    } else if (S.goats.includes(adj)) {
      const dr=nR(adj)-nR(tn), dc=nC(adj)-nC(tn);
      const lr=nR(adj)+dr, lc=nC(adj)+dc;
      if (lr>=0&&lr<5&&lc>=0&&lc<5) {
        const land=lr*5+lc;
        if (GRAPH[adj].includes(land)&&!occupied(land))
          jumps.push({to:land, captured:adj});
      }
    }
  }
  return {slides,jumps};
}

// Goat moves: slide to adjacent empty nodes only
function goatMoves(gn) { return GRAPH[gn].filter(n=>!occupied(n)); }


function tigerMovesFrom(tiger, goats) {
  const occ = new Set([tiger, ...goats]);
  const goatSet = new Set(goats);
  const slides = [], jumps = [];
  for (const adj of GRAPH[tiger]) {
    if (!occ.has(adj)) {
      slides.push(adj);
    } else if (goatSet.has(adj)) {
      const dr = nR(adj) - nR(tiger), dc = nC(adj) - nC(tiger);
      const lr = nR(adj) + dr, lc = nC(adj) + dc;
      if (lr>=0 && lr<5 && lc>=0 && lc<5) {
        const land = lr*5 + lc;
        if (GRAPH[adj].includes(land) && !occ.has(land)) {
          jumps.push({to:land, captured:adj});
        }
      }
    }
  }
  return {slides, jumps};
}

function goatMovesFrom(tiger, goats, goat) {
  const occ = new Set([tiger, ...goats]);
  return GRAPH[goat].filter(n=>!occ.has(n));
}

function tigerAIMoveFrom(tiger, goats) {
  const {slides, jumps} = tigerMovesFrom(tiger, goats);
  let move = null;
  if (jumps.length) {
    let best = null, bestScore = -1;
    for (const j of jumps) {
      const nextGoats = goats.filter(g=>g!==j.captured);
      const future = tigerMovesFrom(j.to, nextGoats);
      const score = future.slides.length + future.jumps.length*2;
      if (score > bestScore) {
        bestScore = score;
        best = {type:'jump', ...j};
      }
    }
    move = best;
  }
  if (!move && slides.length) {
    let best = slides[0], bestConn = -1;
    const occ = new Set([tiger, ...goats]);
    for (const s of slides) {
      const conn = GRAPH[s].filter(n=>!occ.has(n)).length;
      if (conn > bestConn) {
        bestConn = conn;
        best = s;
      }
    }
    move = {type:'slide', to:best};
  }
  return move;
}

function goatAIMoveFrom(tiger, goats) {
  const {jumps} = tigerMovesFrom(tiger, goats);
  const landings = jumps.map(j=>j.to);
  let bestGoat = -1, bestDest = -1, bestScore = -Infinity;
  for (const goat of goats) {
    for (const dest of goatMovesFrom(tiger, goats, goat)) {
      let score = 0;
      if (landings.includes(dest)) score += 9;
      if (GRAPH[tiger].includes(dest)) score += 4;
      const oldD = Math.abs(nR(goat)-nR(tiger)) + Math.abs(nC(goat)-nC(tiger));
      const newD = Math.abs(nR(dest)-nR(tiger)) + Math.abs(nC(dest)-nC(tiger));
      score += (oldD-newD)*2;
      if (score > bestScore) {
        bestScore = score;
        bestGoat = goat;
        bestDest = dest;
      }
    }
  }
  return bestGoat === -1 ? null : {from:bestGoat, to:bestDest};
}

function solveGoatState(tiger, goats, movesLeft, capturesSoFar, maxCaptures, memo = new Map()) {
  const key = `${tiger}|${goats.slice().sort((a,b)=>a-b).join(',')}|${movesLeft}|${capturesSoFar}|${maxCaptures}`;
  if (memo.has(key)) return memo.get(key);

  for (const goat of goats.slice().sort((a,b)=>a-b)) {
    for (const dest of goatMovesFrom(tiger, goats, goat)) {
      const nextGoats = goats.slice();
      nextGoats[nextGoats.indexOf(goat)] = dest;

      const {slides, jumps} = tigerMovesFrom(tiger, nextGoats);
      if (!slides.length && !jumps.length) {
        const res = {ok:true, move:{from:goat, to:dest}};
        memo.set(key, res);
        return res;
      }

      if (movesLeft <= 1) continue;

      const ai = tigerAIMoveFrom(tiger, nextGoats);
      if (!ai) continue;

      let tigerNext = ai.to;
      let goatsAfter = nextGoats.slice();
      let capturesNext = capturesSoFar;
      if (ai.type === 'jump') {
        goatsAfter = goatsAfter.filter(g=>g!==ai.captured);
        capturesNext += 1;
        if (capturesNext >= maxCaptures) continue;
      }

      const next = solveGoatState(tigerNext, goatsAfter, movesLeft-1, capturesNext, maxCaptures, memo);
      if (next.ok) {
        const res = {ok:true, move:{from:goat, to:dest}};
        memo.set(key, res);
        return res;
      }
    }
  }

  const fail = {ok:false};
  memo.set(key, fail);
  return fail;
}

function solveTigerState(tiger, goats, movesLeft, objective, targetRemaining, escapeNodes, memo = new Map()) {
  const esc = [...escapeNodes].sort((a,b)=>a-b);
  const key = `${tiger}|${goats.slice().sort((a,b)=>a-b).join(',')}|${movesLeft}|${objective}|${targetRemaining}|${esc.join(',')}`;
  if (memo.has(key)) return memo.get(key);

  const {slides, jumps} = tigerMovesFrom(tiger, goats);
  if (!slides.length && !jumps.length) {
    const fail = {ok:false};
    memo.set(key, fail);
    return fail;
  }

  const moves = [
    ...jumps.map(j=>({type:'jump', to:j.to, captured:j.captured})),
    ...slides.map(to=>({type:'slide', to}))
  ];

  for (const move of moves) {
    let tigerNext = move.to;
    let goatsAfter = goats.slice();
    let nextTarget = targetRemaining;

    if (move.type === 'jump') {
      goatsAfter = goatsAfter.filter(g=>g!==move.captured);
      if (objective === 'capture_n') {
        nextTarget -= 1;
        if (nextTarget <= 0) {
          const res = {ok:true, move:{from:tiger, to:move.to}};
          memo.set(key, res);
          return res;
        }
      }
    }

    if (objective === 'escape' && escapeNodes.includes(move.to)) {
      const res = {ok:true, move:{from:tiger, to:move.to}};
      memo.set(key, res);
      return res;
    }

    if (movesLeft <= 1) continue;

    const goatAI = goatAIMoveFrom(tigerNext, goatsAfter);
    if (goatAI) {
      goatsAfter[goatsAfter.indexOf(goatAI.from)] = goatAI.to;
    }

    const future = tigerMovesFrom(tigerNext, goatsAfter);
    if (!future.slides.length && !future.jumps.length) continue;

    const next = solveTigerState(tigerNext, goatsAfter, movesLeft-1, objective, nextTarget, escapeNodes, memo);
    if (next.ok) {
      const res = {ok:true, move:{from:tiger, to:move.to}};
      memo.set(key, res);
      return res;
    }
  }

  const fail = {ok:false};
  memo.set(key, fail);
  return fail;
}

function getHintMove() {
  if (!S || S.phase !== 'player') return null;
  const movesLeft = Math.max(S.moveLimit - S.moveCount, 0);
  if (movesLeft <= 0) return runtimeLevel?.hint || null;

  if (S.mode === 'goat') {
    const solved = solveGoatState(S.tigers[0], S.goats.slice(), movesLeft, S.capturedGoats, S.maxCaptures);
    return solved.ok ? solved.move : (runtimeLevel?.hint || null);
  }

  const targetRemaining = S.objective === 'capture_n'
    ? Math.max(S.target - S.capturedGoats, 0)
    : S.target;

  const solved = solveTigerState(
    S.tigers[0],
    S.goats.slice(),
    movesLeft,
    S.objective,
    targetRemaining,
    S.escapeNodes.slice()
  );
  return solved.ok ? solved.move : (runtimeLevel?.hint || null);
}



// ==============================================================
//  GOAT MODE  (player = goats; tiger AI runs after each player move)
// ==============================================================

function goatModeTap(node) {
  if (S.phase!=='player') return;
  if (S.selected!==null) {
    if (S.legalSlides.includes(node)) {
      history.push(snap());
      execGoatMove(S.selected, node);
      return;
    }
    if (S.goats.includes(node)) { selectGoat(node); return; }
    S.selected=null; S.legalSlides=[];
    updateHUD();
    return;
  }
  if (S.goats.includes(node)) { selectGoat(node); }
  else { triggerBump(node); }
}

function selectGoat(node) {
  S.selected=node;
  S.legalSlides=goatMoves(node);
  if (S.legalSlides.length===0) triggerBump(node);
  updateHUD();
}

function execGoatMove(from, to) {
  startGlide(from, to, 'goat');
  const i=S.goats.indexOf(from); S.goats[i]=to;
  S.selected=null; S.legalSlides=[];
  S.moveCount++;
  haptic.move();
  updateHUD();

  // Immediate win check (tiger trapped before it can move)
  const {slides,jumps}=tigerMoves(S.tigers[0]);
  if (!slides.length&&!jumps.length) {
    S.phase='won'; triggerShake(12,500); haptic.trap();
    addFlash(S.tigers[0],'rgba(80,210,80,0.85)');
    const m=S.moveCount;
    registerCampaignWin();
    const _doWinOverlay = () => showOverlay('🔒','Trapped!',
      curRun==='daily'
        ? `Goat side done in ${m} move${m>1?'s':''}. Now play as Tiger.`
        : `Solved in ${m} move${m>1?'s':''}.`,
      (curRun==='campaign' && lvlIdx<GOAT_LEVELS.length-1) ? 'Next →'
        : curRun==='daily' ? 'Play Tiger →'
        : 'Play Again',
      (curRun==='campaign' && lvlIdx<GOAT_LEVELS.length-1)
        ? () => showLevelIntro(lvlIdx+1, () => startMode(curMode, lvlIdx+1))
        : curRun==='daily' ? startDailyTigerSide
        : () => startMode(curMode, 0),
      'Menu', showStart,
      {mode:'goat',title:'Trapped!',moves:m,moveLimit:S.moveLimit,won:true,run:curRun},
      'up'
    );
    triggerTrapSequence(S.tigers[0], m, _doWinOverlay);
    return;
  }

  // Schedule tiger AI turn (brief pause so player sees the board)
  S.phase='ai'; S.pendingAI=true; S.aiAt=performance.now()+420;
  updateHUD();
}

// Tiger AI heuristic (runs inside the render loop when aiAt is reached)
function runTigerAI() {
  S.pendingAI=false;
  const tn=S.tigers[0];
  // Use the shared pure function — no state mutation during simulation
  const move = tigerAIMoveFrom(tn, S.goats);
  if (!move) { S.phase='player'; return; }

  aiHint={from:tn,to:move.to};
  setTimeout(()=>{aiHint=null;},700);
  startGlide(tn, move.to, 'tiger', move.type==='jump' ? 'jump' : 'slide');

  if (move.type==='jump') {
    S.goats.splice(S.goats.indexOf(move.captured),1);
    S.capturedGoats++;
    triggerShake(10,340); haptic.capture();
    addFlash(move.captured,'rgba(232,135,26,0.88)');
    refreshPips();
  }
  S.tigers[0]=move.to;
  S.phase='player';
  updateHUD();

  // Fail: too many goats captured
  if (S.capturedGoats>=S.maxCaptures) {
    S.phase='lost'; haptic.fail();
    trackEvent('level_fail', { mode:curMode, level:lvlIdx+1, run:curRun });
    setTimeout(()=>showOverlay('💨','Escaped','The tiger broke through.',
      'Try Again',()=>loadLevel(lvlIdx),'Menu',showStart, null, 'down'),420);
    return;
  }
  // Fail: move limit hit
  if (S.moveCount>=S.moveLimit) {
    S.phase='lost'; haptic.fail();
    trackEvent('level_fail', { mode:curMode, level:lvlIdx+1, run:curRun });
    setTimeout(()=>showOverlay('⏱','Too Slow','Tiger wasn\'t trapped in time.',
      'Try Again',()=>loadLevel(lvlIdx),'Menu',showStart, null, 'down'),420);
  }
}


// ==============================================================
//  TIGER MODE  (player = tiger; goat AI runs after each tiger move)
// ==============================================================

function computeTigerMoves() {
  const {slides,jumps}=tigerMoves(S.tigers[0]);
  S.legalSlides=slides; S.legalJumps=jumps; S.selected=S.tigers[0];
  updateHUD();
}

function tigerModeTap(node) {
  if (S.phase!=='player') return;
  if (S.legalSlides.includes(node)) { history.push(snap()); execTigerSlide(node); return; }
  const jmp=S.legalJumps.find(j=>j.to===node);
  if (jmp) { history.push(snap()); execTigerJump(jmp); return; }
  if (S.tigers.includes(node)) { haptic.tap(); return; }
  triggerBump(node);
}

function execTigerSlide(to) {
  S.tigers[0]=to; S.moveCount++;
  S.legalSlides=[]; S.legalJumps=[];
  haptic.move();
  updateHUD();
  if (S.objective==='escape'&&S.escapeNodes.includes(to)) {
    S.phase='won'; triggerShake(10,400); haptic.trap();
    addFlash(to,'rgba(80,210,80,0.85)');
    registerCampaignWin();
    const _doEscOverlay = () => {
      const _dailyDone = curRun==='daily' && isDailyCompleteToday();
      showOverlay('🏃',
        _dailyDone ? 'Daily Complete!' : 'Escaped!',
        _dailyDone
          ? `Tiger side done in ${S.moveCount} move${S.moveCount>1?'s':''}. Both sides solved!`
          : 'You broke free!',
        (curRun==='campaign' && lvlIdx<TIGER_LEVELS.length-1) ? 'Next →'
          : _dailyDone ? 'Back to Menu'
          : 'Play Again',
        () => {
          if (curRun==='campaign' && lvlIdx<TIGER_LEVELS.length-1) {
            showLevelIntro(lvlIdx+1, () => startMode(curMode, lvlIdx+1));
          } else { showStart(); }
        },
        'Menu', showStart,
        {mode:'tiger',title:'Escaped!',moves:S.moveCount,moveLimit:S.moveLimit,won:true,run:curRun},
        'up'
      );
    };
    setTimeout(_doEscOverlay, 650);
    return;
  }
  schedGoatAI();
}

function execTigerJump(jmp) {
  const fromNode = S.tigers[0];
  S.goats.splice(S.goats.indexOf(jmp.captured),1);
  S.capturedGoats++;
  S.tigers[0]=jmp.to; S.moveCount++;
  S.legalSlides=[]; S.legalJumps=[];
  triggerShake(10,340); haptic.capture();
  addFlash(jmp.captured,'rgba(232,135,26,0.88)');
  refreshPips();
  startGlide(fromNode, jmp.to, 'tiger', 'jump');
  updateHUD();
  if (S.objective==='capture_n'&&S.capturedGoats>=S.target) {
    S.phase='won'; triggerShake(14,500); haptic.trap();
    registerCampaignWin();
    const _captCount = S.capturedGoats;
    const _doCapOverlay = () => {
      const _dailyDone = curRun==='daily' && isDailyCompleteToday();
      showOverlay('<img src="assets/pieces/tiger-piece.png" alt="" style="width:52px;height:52px;object-fit:contain;">',
        _dailyDone ? 'Daily Complete!' : 'Tiger!',
        _dailyDone
          ? `Tiger side done in ${S.moveCount} move${S.moveCount>1?'s':''}. Both sides solved!`
          : `Captured ${_captCount} goat${_captCount>1?'s':''}!`,
        (curRun==='campaign' && lvlIdx<TIGER_LEVELS.length-1) ? 'Next →'
          : _dailyDone ? 'Back to Menu'
          : 'Play Again',
        () => {
          if (curRun==='campaign' && lvlIdx<TIGER_LEVELS.length-1) {
            showLevelIntro(lvlIdx+1, () => startMode(curMode, lvlIdx+1));
          } else { showStart(); }
        },
        'Menu', showStart,
        {mode:'tiger',title:'Captured!',moves:S.moveCount,moveLimit:S.moveLimit,won:true,run:curRun},
        'up'
      );
    };
    triggerTrapSequence(S.tigers[0], S.moveCount, _doCapOverlay);
    return;
  }
  schedGoatAI();
}

function schedGoatAI() {
  S.phase='ai'; S.pendingAI=true; S.aiAt=performance.now()+380;
  updateHUD();
}

// Goat AI: move the one goat that best interferes with the tiger
function runGoatAI() {
  S.pendingAI=false;
  const tn=S.tigers[0];
  const {jumps:tigerJumps}=tigerMoves(tn);
  const tigerLandings=tigerJumps.map(j=>j.to);

  let bGoat=-1, bDest=-1, bScore=-Infinity;
  for (const goat of S.goats) {
    for (const dest of goatMoves(goat)) {
      let score=0;
      // Block a tiger jump landing (highest priority)
      if (tigerLandings.includes(dest)) score+=9;
      // Occupy a node adjacent to tiger (helps trap it)
      if (GRAPH[tn].includes(dest)) score+=4;
      // Move closer to tiger (Manhattan)
      const oldD=Math.abs(nR(goat)-nR(tn))+Math.abs(nC(goat)-nC(tn));
      const newD=Math.abs(nR(dest)-nR(tn))+Math.abs(nC(dest)-nC(tn));
      score+=(oldD-newD)*2;
      if (score>bScore){bScore=score; bGoat=goat; bDest=dest;}
    }
  }
  if (bGoat!==-1) {
    const i=S.goats.indexOf(bGoat);
    aiHint={from:bGoat,to:bDest};
    setTimeout(()=>{aiHint=null;},700);
    S.goats[i]=bDest;
  } else {
    // Stalemate: goats have no legal moves — tiger wins immediately
    S.phase='won'; triggerShake(10,400); haptic.trap();
    registerCampaignWin();
    trackEvent('level_win', { mode:curMode, level:lvlIdx+1, run:curRun, stalemate:true });
    setTimeout(()=>{
      const _dailyDone = curRun==='daily' && isDailyCompleteToday();
      showOverlay('🔒',
        _dailyDone ? 'Daily Complete!' : 'Stalemate!',
        _dailyDone
          ? 'Goats had no moves. Both sides solved!'
          : 'The goats have no moves left.',
        (curRun==='campaign' && lvlIdx<TIGER_LEVELS.length-1) ? 'Next →'
          : _dailyDone ? 'Back to Menu'
          : 'Play Again',
        () => {
          if (curRun==='campaign' && lvlIdx<TIGER_LEVELS.length-1) { loadLevel(lvlIdx+1); }
          else { showStart(); }
        },
        'Menu', showStart);
    }, 480);
    return;
  }

  S.phase='player';
  computeTigerMoves();

  // Fail: tiger trapped (no moves)
  if (!S.legalSlides.length&&!S.legalJumps.length) {
    S.phase='lost'; haptic.fail(); triggerShake(8,300);
    trackEvent('level_fail', { mode:curMode, level:lvlIdx+1, run:curRun });
    setTimeout(()=>showOverlay('🔒','Trapped!','The goats closed in.',
      'Try Again',()=>loadLevel(lvlIdx),'Menu',showStart),520);
    return;
  }
  // Fail: move limit
  if (S.moveCount>=S.moveLimit) {
    S.phase='lost'; haptic.fail();
    trackEvent('level_fail', { mode:curMode, level:lvlIdx+1, run:curRun });
    setTimeout(()=>showOverlay('⏱','Time\'s Up','Didn\'t reach the goal in time.',
      'Try Again',()=>loadLevel(lvlIdx),'Menu',showStart),420);
  }
}

// Undo
function undoMove() {
  if (!history.length||S.phase==='ai') return;
  S=history.pop(); aiHint=null;
  if (S.mode==='tiger') computeTigerMoves();
  updateHUD();
  refreshPips(); hideOverlay();
}


// ==============================================================
//  CANVAS RENDERING
// ==============================================================

const canvas=document.getElementById('board');
const ctx=canvas.getContext('2d');
let cssSz=0, cell=0, mg=0, dpr=1;

function setupCanvas() {
  const c=document.getElementById('board-container');
  const sz=Math.max(200,Math.min(c.clientWidth-16,c.clientHeight-16));
  cssSz=sz; dpr=Math.min(window.devicePixelRatio||1,3);
  canvas.style.width=sz+'px'; canvas.style.height=sz+'px';
  canvas.width=Math.round(sz*dpr); canvas.height=Math.round(sz*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  mg=sz*.13; cell=(sz-2*mg)/4;
}

function nxy(n){return{x:mg+nC(n)*cell, y:mg+nR(n)*cell};}

// Colors
const P={
  bg0:'#16100A', bg1:'#1E1508',
  line:'#3C2A16', lineDiag:'#281C0C',
  nodeDot:'#4A3218',
  tiger:'#E8871A', tigerHi:'rgba(255,200,90,0.4)', tigerGlow:'rgba(232,135,26,0.25)',
  goat:'#EDE0C4', goatStroke:'#A08050', goatInner:'rgba(80,50,15,0.25)',
  selGold:'#FFD060',
  teal:'#7ECFC5',  tealGlow:'rgba(126,207,197,0.18)',
  amber:'#E8971A', amberGlow:'rgba(232,135,26,0.22)',
  escape:'rgba(70,210,100,0.32)',
};

let animT=0;

function render(ts) {
  animT=ts;
  requestAnimationFrame(render);
  if (!S) return;

  // Fire pending AI
  if (!isPaused && S.pendingAI&&animT>=S.aiAt) {
    if (S.mode==='goat') runTigerAI(); else runGoatAI();
  }

  const sz=cssSz;
  ctx.clearRect(0,0,sz,sz);
  // ── Stone board background ──
  if (window._boardImg && window._boardImg.complete && window._boardImg.naturalWidth > 0) {
    // Center-crop the landscape image to a square before drawing
    const bW = window._boardImg.naturalWidth;   // 1536
    const bH = window._boardImg.naturalHeight;  // 1024
    const bSq = Math.min(bW, bH);               // 1024
    const bSx = Math.floor((bW - bSq) / 2);     // 256 (horizontal crop)
    const bSy = 0;
    ctx.drawImage(window._boardImg, bSx, bSy, bSq, bSq, 0, 0, sz, sz);
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

  // Shake
  let shaking=false;
  if (shake.on) {
    const rem=shake.end-animT;
    if (rem<=0){shake.on=false;}
    else {
      const d=Math.pow(rem/shake.dur,.6);
      ctx.save(); ctx.translate((Math.random()-.5)*shake.mag*d,(Math.random()-.5)*shake.mag*d);
      shaking=true;
    }
  }

  drawLines();
  drawEscape();
  drawAIHintLine();
  drawPlayerHint();
  drawHighlights();
  drawMovableGoatHints();
  drawNodeDots();
  drawFlashes();
  drawBumps();
  drawGoats();
  drawTiger();
  drawGlides();   // gliding pieces render on top

  if (shaking) ctx.restore();
}

function drawLines() {
  for (let a = 0; a < 25; a++) {
    for (const b of GRAPH[a]) {
      if (b <= a) continue;
      const pa = nxy(a), pb = nxy(b);
      const diag = Math.abs(nR(b)-nR(a))===1 && Math.abs(nC(b)-nC(a))===1;

      // Carved groove
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = diag ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.50)';
      ctx.lineWidth   = diag ? 0.9 : 1.3;
      ctx.stroke();

      // Highlight above groove (chiselled look)
      ctx.beginPath();
      ctx.moveTo(pa.x - 0.5, pa.y - 0.5);
      ctx.lineTo(pb.x - 0.5, pb.y - 0.5);
      ctx.strokeStyle = diag ? 'rgba(160,120,70,0.06)' : 'rgba(160,120,70,0.10)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
  }
}

function drawEscape() {
  if (!S.escapeNodes.length) return;
  const pulse=.5+.5*Math.sin(animT*.004);
  for (const n of S.escapeNodes) {
    const p=nxy(n);
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,cell*.56);
    g.addColorStop(0,`rgba(70,210,100,${.3*pulse})`); g.addColorStop(1,'rgba(70,210,100,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,cell*.56,0,Math.PI*2); ctx.fill();
  }
}

function drawAIHintLine() {
  if (!aiHint) return;
  const pa=nxy(aiHint.from),pb=nxy(aiHint.to);
  ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
  ctx.strokeStyle='rgba(170,130,50,0.48)'; ctx.lineWidth=2.5;
  ctx.setLineDash([4,5]); ctx.stroke(); ctx.setLineDash([]);
}


function activeGuideHint() {
  if (playerHint) {
    const rem = playerHint.end - performance.now();
    if (rem > 0) return playerHint;
    playerHint = null;
    updateHUD();
  }
  if (!runtimeLevel?.tutorialGuide || curRun!=='campaign' || !S || S.phase!=='player') return null;
  if (S.moveCount>0) return null;
  return { ...runtimeLevel.tutorialGuide, tutorial:true };
}

function drawPlayerHint() {
  const hint = activeGuideHint();
  if (!hint) return;
  const pulse = .45 + .55*Math.sin(animT*.006);
  const from = nxy(hint.from), to = nxy(hint.to);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = hint.tutorial
    ? `rgba(255,208,96,${0.16 + pulse*0.12})`
    : `rgba(255,208,96,${0.35 + pulse*0.25})`;
  ctx.lineWidth = hint.tutorial ? 2.1 : 2.6;
  ctx.setLineDash(hint.tutorial ? [5,6] : [6,5]);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const p of [from, to]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, cell*(hint.tutorial ? (.15 + pulse*.03) : (.18 + pulse*.04)), 0, Math.PI*2);
    ctx.strokeStyle = hint.tutorial
      ? `rgba(255,208,96,${0.16 + pulse*0.16})`
      : `rgba(255,208,96,${0.38 + pulse*0.28})`;
    ctx.lineWidth = hint.tutorial ? 1.6 : 2;
    ctx.stroke();
  }
}


function drawHighlights() {
  if (S.phase!=='player') return;
  const pulse=.55+.45*Math.sin(animT*.0042);
  const dotR=cell*.165;

  for (const n of S.legalSlides) {
    const p=nxy(n);
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,cell*.38);
    g.addColorStop(0,`rgba(126,207,197,${.08*pulse})`); g.addColorStop(1,'rgba(126,207,197,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,cell*.38,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x,p.y,dotR*(0.72+.10*pulse),0,Math.PI*2);
    ctx.fillStyle=`rgba(168,224,216,${.26+.18*pulse})`; ctx.fill();
  }

  for (const j of S.legalJumps) {
    // Danger ring on capturable goat
    const pc=nxy(j.captured);
    ctx.beginPath(); ctx.arc(pc.x,pc.y,cell*.22,0,Math.PI*2);
    ctx.strokeStyle=`rgba(220,110,40,${.26+.18*pulse})`; ctx.lineWidth=1.6; ctx.stroke();
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
  }
}
function drawMovableGoatHints() {
  if (!S || S.mode!=='goat' || S.phase!=='player' || S.selected!==null) return;
  const pulse=.45+.55*Math.sin(animT*.004);
  for (const n of movableGoats()) {
    const p=nxy(n);
    ctx.beginPath(); ctx.arc(p.x,p.y,cell*.26 + pulse*1.0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,208,96,${0.08 + pulse*0.08})`;
    ctx.lineWidth=1.2;
    ctx.stroke();
  }
}


function drawNodeDots() {
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
}

function drawFlashes() {
  const now=performance.now();
  for (let i=flashes.length-1;i>=0;i--) {
    const f=flashes[i];
    const rem=f.end-now;
    if (rem<=0){flashes.splice(i,1); continue;}
    const t=1-rem/520;
    const p=nxy(f.node);
    const rr=cell*(.22+t*.6);
    const a=(1-t)*.82;
    ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,Math.PI*2);
    ctx.strokeStyle=f.rgba.replace(/[\d.]+\)$/,`${a})`);
    ctx.lineWidth=2.5*(1-t)+0.5; ctx.stroke();
    if (t<.25) {
      ctx.beginPath(); ctx.arc(p.x,p.y,rr*.45,0,Math.PI*2);
      ctx.fillStyle=f.rgba.replace(/[\d.]+\)$/,`${(.25-t)*3}`+')'); ctx.fill();
    }
  }
}

function drawBumps() {
  const now=performance.now();
  for (const [ns,endT] of Object.entries(bumps)) {
    const rem=endT-now;
    if (rem<=0){delete bumps[ns]; continue;}
    const t=1-rem/320;
    const p=nxy(+ns);
    ctx.beginPath(); ctx.arc(p.x,p.y,cell*(.24+t*.18),0,Math.PI*2);
    ctx.strokeStyle=`rgba(220,65,25,${(1-t)*.62})`; ctx.lineWidth=2; ctx.stroke();
  }
}

function drawGoats() {
  for (const n of S.goats) {
    const p = nxy(n);
    const r = cell * 0.36;
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
      // Use natural aspect ratio to avoid stretching (293×310, ratio≈0.945)
      const gRatio = window._goatPieceImg.naturalWidth / window._goatPieceImg.naturalHeight;
      const gH = r * 2;
      const gW = gH * gRatio;
      ctx.drawImage(window._goatPieceImg, p.x - gW/2, p.y - gH/2, gW, gH);
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
}

function drawTiger() {
  for (const n of S.tigers) {
    const p = nxy(n);
    const r = cell * 0.42;
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
      // Use natural aspect ratio to avoid stretching (409×353, ratio≈1.16 — wider than tall)
      const tRatio = window._tigerPieceImg.naturalWidth / window._tigerPieceImg.naturalHeight;
      const tW = r * 2;           // full width
      const tH = tW / tRatio;     // correct height (narrower)
      ctx.drawImage(window._tigerPieceImg, p.x - tW/2, p.y - tH/2, tW, tH);
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
}

// Upward equilateral triangle, circumradius r, centred at (cx,cy)
function trilat(cx,cy,r) {
  ctx.beginPath();
  ctx.moveTo(cx,cy-r);
  ctx.lineTo(cx+r*.866,cy+r*.5);
  ctx.lineTo(cx-r*.866,cy+r*.5);
  ctx.closePath();
}


// ==============================================================
//  STATUS (goat life pips)
// ==============================================================

function updateHUD() {
  const info=document.getElementById('move-info');
  const detail=document.getElementById('move-detail');
  const used=S?S.moveCount:0;
  const limit=S?S.moveLimit:0;
  const left=Math.max(limit-used,0);
  if (info) { const span=info.querySelector('[data-mv]'); if(span) span.textContent=`${left} left`; }
  if (detail) detail.textContent = `of ${limit}`;

  // SVG Arc gauge (Change 5)
  const arcFill = document.getElementById('move-arc-fill');
  const arcNum  = document.getElementById('move-arc-num');
  const arcOf   = document.getElementById('move-arc-of');
  if (arcFill && arcNum) {
    const r = 17, circ = 2 * Math.PI * r;
    const pct = limit > 0 ? left / limit : 1;
    arcFill.style.strokeDasharray  = circ;
    arcFill.style.strokeDashoffset = circ * (1 - pct);
    arcNum.textContent = left;
    if (arcOf) arcOf.textContent = `of ${limit}`;
    arcFill.style.stroke = pct > 0.5 ? '#E8871A' : pct > 0.25 ? '#FFD060' : '#D05030';
  }

  // Legacy pip row (hidden, kept for safety)
  const moveMeter=document.getElementById('move-meter');
  if (moveMeter) {
    const limitCount=Math.max(1, Math.min((S?.moveLimit)||0, 12));
    moveMeter.innerHTML = Array.from({length:limitCount},(_,i)=>
      `<div class="mpip ${(S&&i<left)?'on':'off'}"></div>`).join('');
  }

  const turn=document.getElementById('turn-pill');
  if (turn) {
    const aiTurn=S?.phase==='ai';
    turn.textContent = aiTurn ? (S?.mode==='goat' ? 'Tiger turn' : 'Goat turn') : (isPaused ? 'Paused' : 'Your turn');
    turn.className = aiTurn ? 'ai' : 'player';
  }

  const statusLabel=document.getElementById('status-label');
  const goatPips=document.getElementById('goat-pips');

  if (statusLabel && goatPips) {
    if (curMode==='goat') {
      statusLabel.textContent = 'Tiger';
      const total = Math.max((runtimeLevel?.tigers.length)||1, 1);
      goatPips.innerHTML = Array.from({length:total},()=>`<div class="hud-icon-pill tiger"></div>`).join('');
    } else if (S?.objective === 'escape') {
      statusLabel.textContent = 'Escape';
      const exits = S.escapeNodes?.length || 0;
      goatPips.innerHTML = Array.from({length:Math.min(exits,5)},()=>`<div class="hud-icon-pill escape"></div>`).join('');
    } else {
      statusLabel.textContent = 'Capture';
      const total=Math.max(runtimeLevel?.target || 0, 1);
      const done=Math.min(S?.capturedGoats || 0, total);
      goatPips.innerHTML=Array.from({length:total},(_,i)=>`<div class="hud-icon-pill ${i<done?'done':'goal'} ${i<done?'':'off'}"></div>`).join('');
    }
  }

  const coach=document.getElementById('coach-text');
  if (coach) coach.textContent = getCoachText();
}

function refreshPips() { updateHUD(); }

function updateStartMeta(validationText='') {
  const el = document.getElementById('launch-counts');
  if (!el) return;
  const goatCleared  = Math.min(progress.goatCleared,  GOAT_LEVELS.length);
  const tigerCleared = Math.min(progress.tigerCleared, TIGER_LEVELS.length);
  const total = GOAT_LEVELS.length + TIGER_LEVELS.length;
  const done  = goatCleared + tigerCleared;
  if (done === 0) {
    el.textContent = `${GOAT_LEVELS.length + TIGER_LEVELS.length} puzzles to master`;
  } else {
    el.textContent = `${done} of ${total} puzzles solved`;
  }
  renderStartProgress();
}

function isExactCampaignLevel(mode, lvl) {
  if (!lvl || !lvl.exactMoves) return true;
  if (mode === 'goat') {
    if (!solveGoatState(lvl.tigers[0], lvl.goats.slice(), lvl.moveLimit, 0, lvl.maxCaptures || 99).ok) return false;
    for (let m=1; m<lvl.moveLimit; m++) {
      if (solveGoatState(lvl.tigers[0], lvl.goats.slice(), m, 0, lvl.maxCaptures || 99).ok) return false;
    }
    return true;
  }
  if (!solveTigerState(lvl.tigers[0], lvl.goats.slice(), lvl.moveLimit, lvl.objective, lvl.target || 0, (lvl.escapeNodes || []).slice()).ok) return false;
  for (let m=1; m<lvl.moveLimit; m++) {
    if (solveTigerState(lvl.tigers[0], lvl.goats.slice(), m, lvl.objective, lvl.target || 0, (lvl.escapeNodes || []).slice()).ok) return false;
    }
  return true;
}

function validateCampaignLevel(mode, lvl) {
  return isExactCampaignLevel(mode, lvl);
}

function validateCampaignPools() {
  // Dev QA tool — silent in production. Logs only on actual failures during development.
  const goatValid  = GOAT_LEVELS.filter(lvl => validateCampaignLevel('goat',  lvl)).length;
  const tigerValid = TIGER_LEVELS.filter(lvl => validateCampaignLevel('tiger', lvl)).length;
  // Only warn if more than 20% of verified (exactMoves:true) levels fail
  const goatCore  = GOAT_LEVELS.filter(l=>l.exactMoves).length;
  const tigerCore = TIGER_LEVELS.filter(l=>l.exactMoves).length;
  if (goatValid < goatCore * 0.8 || tigerValid < tigerCore * 0.8) {
    console.warn('[TigerTrap] puzzle validation below threshold — check level data');
  }
}

function getCoachText() {
  if (!S) return '';
  if (isPaused) return 'Game paused';
  if (playerHint && playerHint.end > performance.now()) return 'Hint shown';

  if (runtimeLevel?.tutorialKey === 'goat_intro') {
    if (S.phase==='ai') return 'The tiger responds after your move';
    if (S.selected===null) return 'Tap a glowing goat to select it';
    return 'Now tap a lit space to block the tiger';
  }

  if (runtimeLevel?.tutorialKey === 'tiger_intro') {
    if (S.phase==='ai') return 'Goats respond to your move';
    if (S.legalJumps.length) return 'Amber = tap to capture a goat';
    return 'Tap a lit spot to move the tiger';
  }

  if (curRun!=='campaign') {
    return curRun==='daily' ? 'One seeded puzzle today' : 'Fresh board every run';
  }

  if (S.mode==='goat') {
    if (S.phase==='ai') return 'Tiger responds';
    if (S.moveCount===0 && S.selected===null) return 'Tap a glowing goat to start';
    if (S.moveCount===0 && S.selected!==null) return 'Now tap a lit spot to move there';
    if (S.moveCount>=1 && S.selected===null) return 'Finish the trap';
    return '';
  }

  if (S.mode==='tiger') {
    if (S.phase==='ai') return 'Goats responding…';
    if (S.moveCount===0) return 'Tap the tiger, then tap where to move';
    if (S.objective==='escape') return 'Head toward the green exit';
    if (S.legalJumps.length) return 'Amber = capture available';
    return 'Keep the tiger moving';
  }
  return '';
}

function movableGoats() {
  if (!S || S.mode!=='goat' || S.phase!=='player' || S.selected!==null) return [];
  return S.goats.filter(g=>goatMoves(g).length);
}


// ==============================================================
//  INPUT
// ==============================================================

function ppos(e) {
  const r=canvas.getBoundingClientRect(), s=e.changedTouches?e.changedTouches[0]:e;
  return{x:s.clientX-r.left, y:s.clientY-r.top};
}
function nearNode(x,y) {
  const thr=cell*.44; let best=null,bd=Infinity;
  for (let n=0;n<25;n++){const p=nxy(n),d=Math.hypot(x-p.x,y-p.y); if(d<thr&&d<bd){bd=d;best=n;}}
  return best;
}
function handleTap(n) {
  if (isPaused || document.getElementById('overlay').classList.contains('show')) return;
  (S?.mode==='tiger'?tigerModeTap:goatModeTap)(n);
}
canvas.addEventListener('touchstart',e=>{e.preventDefault();const{x,y}=ppos(e);const n=nearNode(x,y);if(n!==null)handleTap(n);},{passive:false});
canvas.addEventListener('click',e=>{const{x,y}=ppos(e);const n=nearNode(x,y);if(n!==null)handleTap(n);});


// ==============================================================
//  OVERLAY
// ==============================================================

// CHANGE 3: Trap cinematic sequence
function triggerTrapSequence(tigerNode, moves, callback) {
  // Phase 1 (0-200ms): flash all neighbors
  const neighbors = GRAPH[tigerNode] || [];
  neighbors.forEach(n => addFlash(n, 'rgba(80,210,80,0.45)'));
  // Phase 2 (200-450ms): dim board
  setTimeout(() => {
    const bc = document.getElementById('board-container');
    if (bc) bc.classList.add('board-won');
  }, 200);
  // Phase 4 (600ms): restore and call callback
  setTimeout(() => {
    const bc = document.getElementById('board-container');
    if (bc) bc.classList.remove('board-won');
    callback();
  }, 600);
}

// CHANGE 7: Level title interstitial
function showLevelIntro(nextIdx, callback) {
  const lvl = getActiveLevel(nextIdx);
  const kiEl = document.getElementById('li-kicker');
  const tiEl = document.getElementById('li-title');
  const doEl = document.getElementById('li-dots');
  const moEl = document.getElementById('li-mode');
  if (kiEl) kiEl.textContent = `Level ${nextIdx + 1}`;
  if (tiEl) tiEl.textContent = lvl.title || lvl.label || '';
  if (moEl) moEl.innerHTML = curMode === 'tiger'
    ? '<img src="assets/pieces/tiger-piece.png" alt="" style="width:16px;height:16px;vertical-align:middle;object-fit:contain;margin-right:4px;"> Tiger Mode'
    : '<img src="assets/pieces/goat-piece.png" alt="" style="width:16px;height:16px;vertical-align:middle;object-fit:contain;margin-right:4px;"> Goat Mode';
  if (doEl) {
    const diff = Math.min(8, Math.max(1, lvl.difficulty || 1));
    const dots = Math.round(1 + (diff - 1) * 4 / 7); // map 1-8 → 1-5
    doEl.innerHTML = Array.from({length:5},(_,i) =>
      `<div class="li-dot ${i < dots ? 'filled' : 'empty'}"></div>`).join('');
  }
  const el = document.getElementById('level-intro');
  if (!el) { callback(); return; }
  el.classList.add('li-show');
  setTimeout(() => {
    el.classList.remove('li-show');
    setTimeout(callback, 220);
  }, 700);
}

let _cb1=null,_cb2=null;

// -- RESULT CARD ------------------------------------------------
let _lastResult = null; // {mode, title, moves, moveLimit, won, run}

function drawResultCard(result) {
  const rc = document.getElementById('result-canvas');
  if (!rc) return;
  const W=520, H=280;
  rc.width=W; rc.height=H;
  const cx = rc.getContext('2d');

  // Background
  cx.fillStyle='#16100A';
  cx.fillRect(0,0,W,H);

  // Amber border glow (left strip)
  const lGrad = cx.createLinearGradient(0,0,0,H);
  lGrad.addColorStop(0,'rgba(232,135,26,0)');
  lGrad.addColorStop(0.5,'rgba(232,135,26,0.9)');
  lGrad.addColorStop(1,'rgba(232,135,26,0)');
  cx.fillStyle=lGrad; cx.fillRect(0,0,3,H);

  // Title
  cx.fillStyle='#FFD060';
  cx.font='bold 26px Georgia, serif';
  cx.letterSpacing='4px';
  cx.fillText('TIGER TRAP', 24, 46);

  // Mode pill
  cx.fillStyle = result.mode==='tiger' ? 'rgba(232,135,26,0.18)' : 'rgba(237,224,196,0.1)';
  cx.beginPath(); cx.roundRect(24, 58, 70, 18, 4); cx.fill();
  cx.fillStyle = result.mode==='tiger' ? '#E8871A' : '#9B8060';
  cx.font='10px Georgia, serif';
  cx.fillText(result.mode==='tiger' ? 'TIGER MODE' : 'GOAT MODE', 30, 72);

  // Run type badge
  if (result.run==='daily') {
    cx.fillStyle='rgba(80,150,220,0.18)';
    cx.beginPath(); cx.roundRect(100, 58, 50, 18, 4); cx.fill();
    cx.fillStyle='#60A0E0';
    cx.font='10px Georgia, serif';
    cx.fillText('DAILY', 110, 72);
  }

  // Divider
  cx.strokeStyle='rgba(60,42,22,0.8)'; cx.lineWidth=1;
  cx.beginPath(); cx.moveTo(24,88); cx.lineTo(W-24,88); cx.stroke();

  // Main result text
  cx.fillStyle = result.won ? '#EDE0C4' : '#5A3820';
  cx.font='bold 42px Georgia, serif';
  const mainText = result.won
    ? (result.mode==='goat' ? 'Trapped!' : result.title)
    : 'Not today';
  cx.fillText(mainText, 24, 138);

  // Stats
  if (result.won) {
    cx.fillStyle='#6A5030';
    cx.font='13px Georgia, serif';
    const parLine = result.moves <= Math.floor(result.moveLimit * 0.6) ? ' · Under par' : '';
    cx.fillText(`${result.moves} move${result.moves!==1?'s':''} of ${result.moveLimit}${parLine}`, 24, 164);

    // Mini board sketch (5×5 dots)
    const bx=24, by=185, bs=6, gap=12;
    for (let r=0;r<5;r++) for (let c=0;c<5;c++) {
      cx.beginPath();
      cx.arc(bx+c*gap, by+r*gap, 2, 0, Math.PI*2);
      cx.fillStyle='#3C2A16'; cx.fill();
    }
    // Tiger marker
    cx.fillStyle='#E8871A';
    const tn = S ? S.tigers[0] : 12;
    const tr2=Math.floor(tn/5), tc2=tn%5;
    cx.beginPath();
    cx.moveTo(bx+tc2*gap, by+tr2*gap-4);
    cx.lineTo(bx+tc2*gap+4, by+tr2*gap+3);
    cx.lineTo(bx+tc2*gap-4, by+tr2*gap+3);
    cx.closePath(); cx.fill();
  }

  // Perfect label
  if (result.won && result.moves === 1) {
    cx.fillStyle='rgba(80,200,80,0.15)';
    cx.beginPath(); cx.roundRect(24, 178, 58, 18, 4); cx.fill();
    cx.fillStyle='#60C060';
    cx.font='9px Georgia, serif';
    cx.fillText('PERFECT', 30, 191);
  }

  // Branding
  cx.fillStyle='rgba(60,42,22,0.7)';
  cx.font='10px Georgia, serif';
  cx.fillText('tigertrap.game', W-110, H-16);

  // Frame border
  cx.strokeStyle='rgba(60,42,22,0.6)'; cx.lineWidth=1;
  cx.strokeRect(0.5,0.5,W-1,H-1);
}

function showResultCard(result) {
  _lastResult = result;
  const rc = document.getElementById('result-canvas');
  const row = document.getElementById('result-share-row');
  const badge = document.getElementById('overlay-badge');
  if (!rc || !row) return;

  drawResultCard(result);
  rc.style.display='block';
  row.style.display='flex';

  if (badge) {
    if (result.won && result.moves === 1) {
      badge.innerHTML='<span class="perfect-badge">Perfect solve</span>';
    } else if (result.won && result.moves <= Math.floor(result.moveLimit * 0.6)) {
      badge.innerHTML='<span class="perfect-badge" style="color:#A0C050;border-color:rgba(120,180,50,.3)">Under par</span>';
    } else {
      badge.innerHTML='';
    }
  }
}

function hideResultCard() {
  const rc=document.getElementById('result-canvas');
  const row=document.getElementById('result-share-row');
  const badge=document.getElementById('overlay-badge');
  if(rc) rc.style.display='none';
  if(row) row.style.display='none';
  if(badge) badge.innerHTML='';
}

function getShareText() {
  if (!_lastResult) return 'Tiger Trap puzzle game';
  const r = _lastResult;
  const modeStr = r.mode==='tiger' ? '🐯 Tiger' : '🐐 Goat';
  const runStr  = r.run==='daily' ? ' · Daily' : r.run==='endless' ? ' · Endless' : '';
  const result  = r.won
    ? `Solved in ${r.moves} move${r.moves!==1?'s':''}!`
    : 'Did not solve.';
  return `Tiger Trap${runStr} — ${modeStr} mode\n${result}\ntigertrap.game`;
}

// Share button
document.getElementById('btn-share').addEventListener('click', async () => {
  const text = getShareText();
  const rc = document.getElementById('result-canvas');
  const copied = document.getElementById('share-copied');

  // Try native Web Share with image if supported
  if (rc && navigator.share && navigator.canShare) {
    try {
      rc.toBlob(async blob => {
        const file = new File([blob], 'tiger-trap-result.png', { type:'image/png' });
        const shareData = { text, files:[file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
        // Fall back to text-only share
        if (navigator.canShare({ text })) {
          await navigator.share({ text });
          return;
        }
        _copyText(text, copied);
      }, 'image/png');
      return;
    } catch(e) { /* fall through to clipboard */ }
  }
  _copyText(text, copied);
});

function _copyText(text, copiedEl) {
  try {
    navigator.clipboard.writeText(text).then(() => {
      if (!copiedEl) return;
      copiedEl.classList.add('show');
      setTimeout(() => copiedEl.classList.remove('show'), 2200);
    });
  } catch(e) {}
}

function showOverlay(icon,title,sub,b1,cb1,b2,cb2, resultData, direction) {
  direction = direction || 'up';
  document.getElementById('overlay-icon').innerHTML=icon;
  document.getElementById('overlay-title').textContent=title;
  document.getElementById('overlay-sub').textContent=sub;
  document.getElementById('overlay-btn').textContent=b1;
  document.getElementById('overlay-btn2').textContent=b2||'Menu';
  _cb1=cb1; _cb2=cb2||showStart;
  // Show level name if in campaign
  const nameEl = document.getElementById('overlay-level-name');
  if (nameEl) {
    const lvlName = (curRun==='campaign' && runtimeLevel?.title) ? runtimeLevel.title : '';
    nameEl.textContent = lvlName;
  }
  if (resultData) {
    showResultCard(resultData);
  } else {
    hideResultCard();
  }
  const ov = document.getElementById('overlay');
  ov.classList.remove('fail','slide-up','slide-down');
  if (direction === 'down') {
    ov.classList.add('fail','slide-down');
    // Style fail: full-width primary, small text link for btn2
    document.getElementById('overlay-btn').style.width = '100%';
    document.getElementById('overlay-btn2').style.cssText = 'background:none;border:none;color:#7A5020;font-size:11px;letter-spacing:1px;cursor:pointer;font-family:inherit;padding:6px 0;text-decoration:underline;';
    const btn3 = document.getElementById('overlay-btn3');
    if (btn3) btn3.textContent = '💡 Show hint';
  } else {
    ov.classList.add('slide-up');
    document.getElementById('overlay-btn').style.width = '';
    document.getElementById('overlay-btn2').style.cssText = '';
  }
  ov.setAttribute('role','dialog');
  ov.setAttribute('aria-modal','true');
  requestAnimationFrame(() => {
    ov.classList.add('show');
    ov.classList.remove('slide-up','slide-down');
  });
  // Auto-show share for daily wins (Change 11)
  if (curRun==='daily' && resultData?.won) {
    setTimeout(() => {
      const row = document.getElementById('result-share-row');
      if (row) row.style.display = 'flex';
    }, 800);
  }
}
function hideOverlay(){
  const ov = document.getElementById('overlay');
  ov.classList.remove('show','fail');
  const btn3 = document.getElementById('overlay-btn3');
  if (btn3) btn3.style.display = '';
  hideResultCard();
}
document.getElementById('overlay-btn').addEventListener('click',()=>{if(_cb1)_cb1();});
document.getElementById('overlay-btn2').addEventListener('click',()=>{if(_cb2)_cb2();});
document.getElementById('overlay-btn3')?.addEventListener('click', () => {
  hideOverlay();
  showHintMove();
});



function pauseGame() {
  if (!S || isPaused || document.getElementById('overlay').classList.contains('show')) return;
  isPaused = true;
  updateHUD();
  showOverlay('⏸','Paused','Take a breath.',
    'Resume', ()=>{ isPaused=false; hideOverlay(); updateHUD(); },
    'Home', ()=>{ isPaused=false; showStart(); });
}

function showHintMove() {
  if (!S || S.phase!=='player') return;
  const move = getHintMove();
  if (!move) return;
  playerHint = {from:move.from, to:move.to, end:performance.now()+2200};
  if (curRun === 'campaign') {
    progress.hintsUsedThisLevel = (progress.hintsUsedThisLevel || 0) + 1;
  }
  haptic.tap();
  updateHUD();
}


// ==============================================================
//  SWIPE HINT
// ==============================================================
function _maybeShowSwipeHint() {
  try { if (localStorage.getItem('tt_swipe_hint')) return; } catch(e) { return; }
  const el = document.getElementById('swipe-hint');
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
    try { localStorage.setItem('tt_swipe_hint','1'); } catch(e) {}
  }, 3000);
}

// ==============================================================
//  ONBOARDING
// ==============================================================
let _obStep = 0;
function _obGoTo(i) {
  document.querySelectorAll('.ob-card').forEach((c,j) => c.classList.toggle('active', j===i));
  document.querySelectorAll('.ob-dot').forEach((d,j) => d.classList.toggle('active', j===i));
  document.getElementById('ob-next').textContent = i >= 2 ? 'Play →' : 'Next →';
  _obStep = i;
}
function _obShow() {
  _obGoTo(0);
  const el = document.getElementById('onboard-overlay');
  if (!el) return;
  el.classList.remove('hidden');
  el.style.transition = 'none';
  el.style.opacity = '0';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '1';
  });
}
function _obDismiss() {
  const el = document.getElementById('onboard-overlay');
  if (el) { el.style.opacity='0'; el.style.transition='opacity .3s';
             setTimeout(()=>el.classList.add('hidden'), 300); }
}
document.getElementById('ob-next')?.addEventListener('click', () => {
  if (_obStep < 2) _obGoTo(_obStep + 1);
  else _obDismiss();
});
document.getElementById('ob-skip')?.addEventListener('click', _obDismiss);

// ==============================================================
//  VISIBILITY CHANGE (Android background pause)
// ==============================================================
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (_audioCtx && _audioCtx.state === 'running') {
      _audioCtx.suspend().catch(()=>{});
    }
  } else {
    if (_audioCtx && _audioCtx.state === 'suspended') {
      _audioCtx.resume().catch(()=>{});
    }
    requestAnimationFrame(render);
  }
});

// ==============================================================
//  SCREEN NAV
// ==============================================================

function showStart() {
  hideOverlay(); isPaused=false; playerHint=null; S=null; runtimeLevel=null; activeTutorialMode = null;
  updateHUD();
  updateStartMeta();
  renderStreak();
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('game-screen').classList.add('hidden');
}
function startDailyTigerSide() {
  hideOverlay();
  curMode = 'tiger'; isPaused = false; playerHint = null;
  requestAnimationFrame(() => {
    setupCanvas();
    loadLevel(0);
    trackEvent('daily_tiger_start', {});
  });
}

function startMode(mode, forcedIndex=null) {
  curMode=mode; isPaused=false; playerHint=null;
  if (curRun === 'campaign') {
    lvlIdx = forcedIndex!==null ? forcedIndex : getCurrentIndex(mode);
  } else {
    lvlIdx = forcedIndex!==null ? forcedIndex : 0;
  }
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  requestAnimationFrame(()=>{
    setupCanvas();
    loadLevel(lvlIdx);
    maybeShowFirstTimeTutorial(mode);
    trackEvent('mode_start', { mode:mode, run:curRun, level:lvlIdx+1 });
  });
}

document.getElementById('card-tiger').addEventListener('click',()=>startMode('tiger'));
document.getElementById('card-goat' ).addEventListener('click',()=>startMode('goat'));
document.getElementById('run-campaign').addEventListener('click',()=>setRunType('campaign'));
document.getElementById('run-daily').addEventListener('click',()=>setRunType('daily'));
document.getElementById('run-endless').addEventListener('click',()=>setRunType('endless'));
document.getElementById('btn-levels-goat').addEventListener('click',()=>openLevelSelect('goat'));
document.getElementById('btn-levels-tiger').addEventListener('click',()=>openLevelSelect('tiger'));
document.getElementById('level-select-close').addEventListener('click',closeLevelSelect);
document.getElementById('level-select').addEventListener('click',e=>{ if (e.target.id==='level-select') closeLevelSelect(); });
document.getElementById('level-grid').addEventListener('click',e=>{ const btn=e.target.closest('[data-level]'); if(!btn) return; const mode=btn.dataset.mode; const idx=Number(btn.dataset.level||0); closeLevelSelect(); startMode(mode, idx); });
document.getElementById('btn-home' ).addEventListener('click',showStart);
document.getElementById('btn-pause').addEventListener('click',pauseGame);
document.getElementById('btn-reset').addEventListener('click',()=>{ trackEvent('reset', { mode:curMode, level:lvlIdx+1, run:curRun }); loadLevel(lvlIdx); });
document.getElementById('btn-hint' ).addEventListener('click',()=>{ trackEvent('hint', { mode:curMode, level:lvlIdx+1, run:curRun }); showHintMove(); });
document.getElementById('btn-undo' ).addEventListener('click',()=>{ trackEvent('undo', { mode:curMode, level:lvlIdx+1, run:curRun }); undoMove(); });
document.getElementById('btn-sound').addEventListener('click',()=>{
  _soundEnabled = !_soundEnabled;
  const btn = document.getElementById('btn-sound');
  btn.textContent = _soundEnabled ? '🔊' : '🔇';
  btn.classList.toggle('muted', !_soundEnabled);
  if (_soundEnabled) { _getCtx(); SFX.tap(); }
});

document.getElementById('btn-howtoplay').addEventListener('click', () => {
  openTutorial(curMode, true);
});

// btn-reset-progress is in the settings sheet — handled below via sheet listener
// (the old standalone listener is kept for the in-game top-bar button if present)

// ── Settings sheet ───────────────────────────────────────────
function openSettings() {
  document.getElementById('settings-backdrop')?.classList.add('show');
  document.getElementById('settings-sheet')?.classList.add('open');
}
function closeSettings() {
  document.getElementById('settings-backdrop')?.classList.remove('show');
  document.getElementById('settings-sheet')?.classList.remove('open');
}
const _btnSettings = document.getElementById('btn-settings');
if (_btnSettings) _btnSettings.addEventListener('click', openSettings);
const _settingsBackdrop = document.getElementById('settings-backdrop');
if (_settingsBackdrop) _settingsBackdrop.addEventListener('click', closeSettings);

// Sound toggle (home icon button)
const _btnSoundHome = document.getElementById('btn-sound-home');
if (_btnSoundHome) _btnSoundHome.addEventListener('click', () => {
  _soundEnabled = !_soundEnabled;
  _btnSoundHome.textContent = _soundEnabled ? '🔊' : '🔇';
  _btnSoundHome.classList.toggle('muted', !_soundEnabled);
  // Keep in-game sound button in sync
  const gbtn = document.getElementById('btn-sound');
  if (gbtn) { gbtn.textContent = _soundEnabled ? '🔊' : '🔇'; gbtn.classList.toggle('muted', !_soundEnabled); }
  // Keep sheet sound toggle in sync
  const sst = document.getElementById('sheet-sound-toggle');
  if (sst) { sst.textContent = _soundEnabled ? 'On' : 'Off'; sst.classList.toggle('active', _soundEnabled); }
  if (_soundEnabled) { _getCtx(); SFX.tap(); }
});

// Sheet sound toggle
const _sheetSoundToggle = document.getElementById('sheet-sound-toggle');
if (_sheetSoundToggle) _sheetSoundToggle.addEventListener('click', () => {
  _soundEnabled = !_soundEnabled;
  _sheetSoundToggle.textContent = _soundEnabled ? 'On' : 'Off';
  _sheetSoundToggle.classList.toggle('active', _soundEnabled);
  const btn = document.getElementById('btn-sound');
  if (btn) { btn.textContent = _soundEnabled ? '🔊' : '🔇'; btn.classList.toggle('muted', !_soundEnabled); }
  const hbtn = document.getElementById('btn-sound-home');
  if (hbtn) { hbtn.textContent = _soundEnabled ? '🔊' : '🔇'; hbtn.classList.toggle('muted', !_soundEnabled); }
  if (_soundEnabled) { _getCtx(); SFX.tap(); }
});

// Sheet haptics toggle
const _sheetHapticsToggle = document.getElementById('sheet-haptics-toggle');
if (_sheetHapticsToggle) _sheetHapticsToggle.addEventListener('click', () => {
  _hapticsEnabled = !_hapticsEnabled;
  _sheetHapticsToggle.textContent = _hapticsEnabled ? 'On' : 'Off';
  _sheetHapticsToggle.classList.toggle('active', _hapticsEnabled);
});

// Sheet How to Play
const _sheetHowToPlay = document.getElementById('sheet-howtoplay');
if (_sheetHowToPlay) _sheetHowToPlay.addEventListener('click', () => {
  closeSettings();
  openTutorial(curMode || 'goat', false);
});

// Sheet Game Intro
const _sheetIntro = document.getElementById('sheet-intro');
if (_sheetIntro) _sheetIntro.addEventListener('click', () => {
  closeSettings();
  _obShow();
});

// Sheet Reset All
const _sheetReset = document.getElementById('btn-reset-progress');
if (_sheetReset) _sheetReset.addEventListener('click', () => {
  closeSettings();
  resetAllProgress();
});

// ── Swipe left on game-wrapper = undo ────────────────────────
let _swipeStartX = 0, _swipeStartY = 0, _swipeStartT = 0;
const _gameWrapper = document.getElementById('game-wrapper');
if (_gameWrapper) {
  _gameWrapper.addEventListener('touchstart', e => {
    const t = e.touches[0];
    _swipeStartX = t.clientX; _swipeStartY = t.clientY; _swipeStartT = Date.now();
  }, { passive: true });
  _gameWrapper.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - _swipeStartX;
    const dy = t.clientY - _swipeStartY;
    const dt = Date.now() - _swipeStartT;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (dt < 400 && absDx > 60 && absDx > absDy * 1.8 && dx < 0) {
      undoMove();
      trackEvent('swipe_undo', { mode: curMode });
    }
  }, { passive: true });
}

// ==============================================================
//  INIT
// ==============================================================

let _rt=null;
window.addEventListener('resize',()=>{clearTimeout(_rt);_rt=setTimeout(setupCanvas,80);});
window.addEventListener('load',()=>{
  // ── Preload stone-skin assets ──
  const _loadImg = (src) => { const img = new Image(); img.src = src; return img; };
  window._boardImg      = _loadImg('assets/bg/board-stone.jpg');
  window._tigerPieceImg = _loadImg('assets/pieces/tiger-piece.png');
  window._goatPieceImg  = _loadImg('assets/pieces/goat-piece.png');
  window._amberDotImg   = _loadImg('assets/pieces/amber-dot.png');

  // ── Service Worker (inline blob, no external file) ────────────
  if ('serviceWorker' in navigator) {
    const swCode = `
      const CACHE = 'tiger-trap-v1';
      self.addEventListener('install', e => {
        e.waitUntil(
          caches.open(CACHE).then(c => c.addAll([self.location.href]))
        );
        self.skipWaiting();
      });
      self.addEventListener('activate', e => {
        e.waitUntil(clients.claim());
      });
      self.addEventListener('fetch', e => {
        e.respondWith(
          caches.match(e.request).then(r => r || fetch(e.request))
        );
      });
    `;
    const blob = new Blob([swCode], { type: 'application/javascript' });
    navigator.serviceWorker.register(URL.createObjectURL(blob))
      .catch(() => {}); // silently fail if blob SW unsupported
  }

  // ── AudioContext unlock listeners (Android WebView fix) ───────
  document.addEventListener('touchstart', _unlockAudio, { passive:true, once:true });
  document.addEventListener('click',      _unlockAudio, { once:true });

  // ── Onboarding: always show on every load/refresh ─────────────
  // (Players can skip via "Skip intro" or swipe through to "Play →")

  // ── Splash screen with real preload sequence ─────────────────
  const splash = document.getElementById('splash-screen');
  const splashBar = document.getElementById('splash-bar');
  const splashLabel = document.getElementById('splash-label');
  let _splashSkipped = false;

  const setSplashProgress = (pct, label) => {
    if (splashBar) splashBar.style.width = pct + '%';
    if (splashLabel) splashLabel.textContent = label;
  };

  const minDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const hideSplash = () => {
    _splashSkipped = true;
    if (!splash || splash.classList.contains('fade-out')) return;
    splash.classList.add('fade-out');
    setTimeout(() => { if (splash) splash.style.display = 'none'; }, 580);
  };

  if (splash) {
    splash.addEventListener('click', hideSplash);

    // Real preload sequence
    const splashStart = Date.now();
    const MIN_SPLASH_MS = 1800;

    const runPreload = async () => {
      // Step 1: Load puzzles / localStorage
      setSplashProgress(0, 'Loading puzzles…');
      await minDelay(0);
      progress = loadProgress();
      setSplashProgress(25, 'Loading puzzles…');
      await minDelay(120);

      // Step 2: Validate campaign pools
      setSplashProgress(25, 'Checking boards…');
      await minDelay(0);
      validateCampaignPools();
      setSplashProgress(55, 'Checking boards…');
      await minDelay(80);

      // Step 3: Audio warmup
      setSplashProgress(55, 'Setting up audio…');
      try { _getCtx(); } catch(e) {}
      setSplashProgress(75, 'Setting up audio…');
      await minDelay(60);

      // Step 4: Canvas
      setSplashProgress(75, 'Preparing canvas…');
      setupCanvas();
      setSplashProgress(90, 'Preparing canvas…');
      await minDelay(60);

      // Step 5: Ready — pad to minimum total time
      const elapsed = Date.now() - splashStart;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed - 160);
      await minDelay(remaining);
      setSplashProgress(100, 'Ready');
      await minDelay(160);

      if (!_splashSkipped) hideSplash();
    };

    runPreload();
  }

  // -- Fix hover delay: remove preload class after first paint --
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.body.classList.remove('preload');
  }));

  requestAnimationFrame(()=>{
    try { screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait').catch(()=>{}); } catch(e){}
    setRunType(curRun); setupCanvas(); updateStartMeta(); renderStartProgress(); renderStreak();
    requestAnimationFrame(render);
  });
});

