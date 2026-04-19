#!/usr/bin/env node
// ===========================================================================
//  Tiger Trap — Level Audit Harness
//  Standalone Node.js script. No npm dependencies. Run from project root:
//
//      node audit.mjs                 # uses ./game.js
//      node audit.mjs path/to/game.js # explicit path
//
//  Exits 0 if every check passes (warnings allowed).
//  Exits 1 if any CRITICAL issue is found (unsolvable level, broken hint,
//  duplicate position, escape goal-text mismatch, instant-lose level).
//
//  Mirrors the move primitives and solvers from game.js exactly so that
//  results match what players will experience in the live game.
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';

const ANSI = {
  reset: '\x1b[0m',
  bold:  '\x1b[1m',
  dim:   '\x1b[2m',
  red:   '\x1b[31m',
  green: '\x1b[32m',
  yellow:'\x1b[33m',
  blue:  '\x1b[34m',
  cyan:  '\x1b[36m',
};
const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const c = (color, s) => NO_COLOR ? s : `${ANSI[color]}${s}${ANSI.reset}`;

const gamePath = path.resolve(process.argv[2] || './game.js');
if (!fs.existsSync(gamePath)) {
  console.error(c('red', `\u2717 game.js not found at ${gamePath}`));
  console.error(c('dim', '  Run from project root, or pass a path: node audit.mjs path/to/game.js'));
  process.exit(2);
}

console.log(c('bold', `\n=== Tiger Trap Level Audit ===`));
console.log(c('dim', `  source: ${gamePath}\n`));

// ---------- BUILD GRAPH (mirrors game.js lines 13-32) ----------
const GRAPH = (() => {
  const adj = Array.from({ length:25 }, () => []);
  const link = (a,b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };
  for (let r=0;r<5;r++) for (let col=0;col<5;col++) {
    const n=r*5+col;
    if (col<4) link(n,n+1);
    if (r<4) link(n,n+5);
  }
  for (let r=0;r<4;r++) for (let col=0;col<4;col++) {
    if ((r+col)%2===0) {
      const tl=r*5+col, tr=r*5+col+1, bl=(r+1)*5+col, br=(r+1)*5+col+1;
      link(tl,br); link(tr,bl);
    }
  }
  return adj;
})();
const nR = n => Math.floor(n/5);
const nC = n => n%5;

// ---------- EXTRACT LEVEL ARRAYS FROM game.js ----------
const src = fs.readFileSync(gamePath, 'utf8');

function extractArray(name) {
  const startMarker = `const ${name} = [`;
  const i = src.indexOf(startMarker);
  if (i === -1) {
    console.error(c('red', `\u2717 Could not find ${name} in game.js`));
    process.exit(2);
  }
  let depth = 0, j = i + startMarker.length - 1;
  for (; j < src.length; j++) {
    const ch = src[j];
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) break; }
  }
  const block = src.slice(i, j+1);
  const code = `(${block.slice(startMarker.length - 1)})`;
  // Strip /* ... */ and // ... comments; trusted local source only.
  const cleaned = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
  return eval(cleaned);
}

let GOAT_CORE_LEVELS, TIGER_CORE_LEVELS;
try {
  GOAT_CORE_LEVELS  = extractArray('GOAT_CORE_LEVELS');
  TIGER_CORE_LEVELS = extractArray('TIGER_CORE_LEVELS');
} catch (e) {
  console.error(c('red', `\u2717 Failed to parse level arrays: ${e.message}`));
  process.exit(2);
}

// ---------- MOVE PRIMITIVES (mirrors game.js 1555-1579) ----------
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
      if (score > bestScore) { bestScore = score; best = {type:'jump', ...j}; }
    }
    move = best;
  }
  if (!move && slides.length) {
    let best = slides[0], bestConn = -1;
    const occ = new Set([tiger, ...goats]);
    for (const s of slides) {
      const conn = GRAPH[s].filter(n=>!occ.has(n)).length;
      if (conn > bestConn) { bestConn = conn; best = s; }
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
      if (score > bestScore) { bestScore = score; bestGoat = goat; bestDest = dest; }
    }
  }
  return bestGoat === -1 ? null : {from:bestGoat, to:bestDest};
}

// ---------- SOLVERS (mirrors game.js 1634-1739) ----------
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
        memo.set(key, res); return res;
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
        memo.set(key, res); return res;
      }
    }
  }
  const fail = {ok:false}; memo.set(key, fail); return fail;
}

function solveTigerState(tiger, goats, movesLeft, objective, targetRemaining, escapeNodes, memo = new Map()) {
  const esc = [...escapeNodes].sort((a,b)=>a-b);
  const key = `${tiger}|${goats.slice().sort((a,b)=>a-b).join(',')}|${movesLeft}|${objective}|${targetRemaining}|${esc.join(',')}`;
  if (memo.has(key)) return memo.get(key);
  const {slides, jumps} = tigerMovesFrom(tiger, goats);
  if (!slides.length && !jumps.length) { const f = {ok:false}; memo.set(key,f); return f; }
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
        if (nextTarget <= 0) { const r = {ok:true}; memo.set(key,r); return r; }
      }
    }
    if (objective === 'escape' && escapeNodes.includes(move.to)) {
      const r = {ok:true}; memo.set(key,r); return r;
    }
    if (movesLeft <= 1) continue;
    const goatAI = goatAIMoveFrom(tigerNext, goatsAfter);
    if (goatAI) goatsAfter[goatsAfter.indexOf(goatAI.from)] = goatAI.to;
    const future = tigerMovesFrom(tigerNext, goatsAfter);
    if (!future.slides.length && !future.jumps.length) continue;
    const next = solveTigerState(tigerNext, goatsAfter, movesLeft-1, objective, nextTarget, escapeNodes, memo);
    if (next.ok) { const r = {ok:true}; memo.set(key,r); return r; }
  }
  const fail = {ok:false}; memo.set(key, fail); return fail;
}

// ---------- VARIANT TRANSFORM (mirrors game.js 715-726) ----------
function transformNode(n, variant) {
  const r = Math.floor(n/5), col = n%5;
  let nr=r, nc=col;
  if (variant === 2) { nr=4-r; nc=4-col; }
  return nr*5+nc;
}

// ===========================================================================
//  AUDIT CHECKS
// ===========================================================================

const issues = { critical: [], warning: [] };
const critical = (section, msg) => issues.critical.push({section, msg});
const warning  = (section, msg) => issues.warning.push({section, msg});

// ---------- CHECK 1: duplicate positions ----------
function fingerprint(lvl) {
  const t = lvl.tigers.slice().sort((a,b)=>a-b).join(',');
  const g = lvl.goats.slice().sort((a,b)=>a-b).join(',');
  return `T[${t}]|G[${g}]`;
}

function checkDuplicates(arr, label) {
  console.log(c('cyan', `-- DUPLICATE POSITIONS: ${label} --`));
  const map = new Map();
  arr.forEach((lvl, i) => {
    const fp = fingerprint(lvl);
    if (!map.has(fp)) map.set(fp, []);
    map.get(fp).push({ idx: i, title: lvl.title, goal: lvl.goal, moveLimit: lvl.moveLimit });
  });
  let dupCount = 0;
  for (const [fp, list] of map) {
    if (list.length > 1) {
      dupCount++;
      console.log(`  ${c('yellow','!')} ${fp}`);
      for (const e of list) console.log(`     [${e.idx}] ${e.title} -- goal:${e.goal} moveLimit:${e.moveLimit}`);
      warning('duplicate', `${label}: ${list.length} levels share ${fp}`);
    }
  }
  if (dupCount === 0) console.log(c('green', '  OK -- no duplicate positions'));
}

checkDuplicates(GOAT_CORE_LEVELS,  'GOAT_CORE_LEVELS');
checkDuplicates(TIGER_CORE_LEVELS, 'TIGER_CORE_LEVELS');

// ---------- CHECK 2: solvability + par sanity ----------
function auditSolvability(arr, label, solver) {
  console.log(c('cyan', `\n-- SOLVABILITY: ${label} --`));
  arr.forEach((lvl, i) => {
    let minSolvable = null;
    for (let m = 1; m <= lvl.moveLimit; m++) {
      const result = solver(lvl, m);
      if (result.ok) { minSolvable = m; break; }
    }
    if (minSolvable === null) {
      console.log(`  ${c('red','X')} [${i}] "${lvl.title}" UNSOLVABLE within moveLimit=${lvl.moveLimit}`);
      critical('unsolvable', `${label}[${i}] "${lvl.title}" unsolvable`);
    } else if (lvl.exactMoves && minSolvable < lvl.moveLimit) {
      console.log(`  ${c('red','X')} [${i}] "${lvl.title}" exactMoves:true but par=${minSolvable} (moveLimit=${lvl.moveLimit})`);
      critical('par-mismatch', `${label}[${i}] "${lvl.title}" exactMoves lies: par ${minSolvable}, claims ${lvl.moveLimit}`);
    } else if (!lvl.exactMoves && minSolvable < lvl.moveLimit) {
      const gap = lvl.moveLimit - minSolvable;
      const slackThreshold = label.startsWith('TIGER') ? 3 : 2;
      if (gap >= slackThreshold) {
        console.log(`  ${c('yellow','!')} [${i}] "${lvl.title}" par=${minSolvable}/${lvl.moveLimit} (slack)`);
        warning('par-slack', `${label}[${i}] "${lvl.title}" par ${minSolvable}, moveLimit ${lvl.moveLimit}`);
      } else {
        console.log(`  ${c('green','OK')} [${i}] "${lvl.title}" par=${minSolvable}/${lvl.moveLimit}`);
      }
    } else {
      console.log(`  ${c('green','OK')} [${i}] "${lvl.title}" par=${minSolvable}`);
    }
  });
}

auditSolvability(GOAT_CORE_LEVELS, 'GOAT_CORE_LEVELS',
  (lvl, m) => solveGoatState(lvl.tigers[0], lvl.goats.slice(), m, 0, lvl.maxCaptures || 99));
auditSolvability(TIGER_CORE_LEVELS, 'TIGER_CORE_LEVELS',
  (lvl, m) => solveTigerState(lvl.tigers[0], lvl.goats.slice(), m, lvl.objective, lvl.target || 0, (lvl.escapeNodes||[]).slice()));

// ---------- CHECK 3: first-turn playability ----------
console.log(c('cyan', '\n-- FIRST-TURN PLAYABILITY --'));
let firstTurnIssues = 0;
GOAT_CORE_LEVELS.forEach((lvl, i) => {
  const movable = lvl.goats.filter(g => goatMovesFrom(lvl.tigers[0], lvl.goats, g).length > 0);
  if (!movable.length) {
    console.log(`  ${c('red','X')} GOAT[${i}] "${lvl.title}" -- ZERO movable goats on turn 1`);
    critical('frozen', `GOAT[${i}] "${lvl.title}" has no movable goats`);
    firstTurnIssues++;
  }
});
TIGER_CORE_LEVELS.forEach((lvl, i) => {
  const {slides, jumps} = tigerMovesFrom(lvl.tigers[0], lvl.goats);
  if (!slides.length && !jumps.length) {
    console.log(`  ${c('red','X')} TIGER[${i}] "${lvl.title}" -- tiger has NO moves on turn 1 (instant lose)`);
    critical('instant-lose', `TIGER[${i}] "${lvl.title}" instant-lose, no legal first move`);
    firstTurnIssues++;
  }
});
if (firstTurnIssues === 0) console.log(c('green', '  OK -- all levels playable on turn 1'));

// ---------- CHECK 4: hint sanity ----------
console.log(c('cyan', '\n-- HINT SANITY --'));
let hintIssues = 0;
GOAT_CORE_LEVELS.forEach((lvl, i) => {
  if (!lvl.hint) return;
  const {from, to} = lvl.hint;
  if (!lvl.goats.includes(from)) {
    console.log(`  ${c('red','X')} GOAT[${i}] "${lvl.title}" hint.from=${from} is not a goat`);
    critical('bad-hint', `GOAT[${i}] hint.from is not a goat`);
    hintIssues++; return;
  }
  const legal = goatMovesFrom(lvl.tigers[0], lvl.goats, from);
  if (!legal.includes(to)) {
    console.log(`  ${c('red','X')} GOAT[${i}] "${lvl.title}" hint ${from}->${to} not legal (legal: ${legal.join(',')||'none'})`);
    critical('bad-hint', `GOAT[${i}] hint move not legal`);
    hintIssues++;
  }
});
TIGER_CORE_LEVELS.forEach((lvl, i) => {
  if (!lvl.hint) return;
  const {from, to} = lvl.hint;
  if (!lvl.tigers.includes(from)) {
    console.log(`  ${c('red','X')} TIGER[${i}] "${lvl.title}" hint.from=${from} is not the tiger`);
    critical('bad-hint', `TIGER[${i}] hint.from is not the tiger`);
    hintIssues++; return;
  }
  const {slides, jumps} = tigerMovesFrom(lvl.tigers[0], lvl.goats);
  const legalDests = [...slides, ...jumps.map(j=>j.to)];
  if (!legalDests.includes(to)) {
    console.log(`  ${c('red','X')} TIGER[${i}] "${lvl.title}" hint ${from}->${to} not legal (slides:[${slides.join(',')}] jumps:[${jumps.map(j=>j.to).join(',')}])`);
    critical('bad-hint', `TIGER[${i}] hint move not legal`);
    hintIssues++;
  }
});
if (hintIssues === 0) console.log(c('green', '  OK -- all hints are legal moves'));

// ---------- CHECK 5: Dusk variant escape goal-text mismatch ----------
console.log(c('cyan', '\n-- DUSK VARIANT ESCAPE GOAL-TEXT --'));
let mismatchIssues = 0;
const dirOf = (nodes) => {
  const rows = nodes.map(nR), cols = nodes.map(nC);
  if (rows.every(r=>r===0)) return 'north';
  if (rows.every(r=>r===4)) return 'south';
  if (cols.every(col=>col===0)) return 'west';
  if (cols.every(col=>col===4)) return 'east';
  return 'mixed';
};
const goalDir = (goalText) => {
  const t = goalText.toLowerCase();
  if (t.includes('north')) return 'north';
  if (t.includes('south')) return 'south';
  if (t.includes('east'))  return 'east';
  if (t.includes('west'))  return 'west';
  return null;
};
const oppDir = { north:'south', south:'north', east:'west', west:'east' };
const rotateGoalText = (goal) => goal.replace(/\b(north|south|east|west)\b/gi, (m) => {
  const opp = oppDir[m.toLowerCase()];
  return m[0] === m[0].toUpperCase() ? opp[0].toUpperCase() + opp.slice(1) : opp;
});
TIGER_CORE_LEVELS.forEach((lvl, i) => {
  if (lvl.objective !== 'escape') return;
  const original  = lvl.escapeNodes;
  const rotated   = original.map(n => transformNode(n, 2));
  const duskDir   = dirOf(rotated);
  const duskGoal  = rotateGoalText(lvl.goal);
  const claimDir  = goalDir(duskGoal);
  if (claimDir && duskDir !== 'mixed' && claimDir !== duskDir) {
    console.log(`  ${c('red','X')} TIGER[${i}] "${lvl.title}" Dusk escape is ${duskDir} but goal text says "${claimDir}"`);
    critical('dusk-mismatch', `TIGER[${i}] Dusk variant goal text mismatch`);
    mismatchIssues++;
  }
});
if (mismatchIssues === 0) console.log(c('green', '  OK -- all Dusk escape variants have matching goal text'));

// ===========================================================================
//  SUMMARY
// ===========================================================================
console.log(c('bold', '\n=== SUMMARY ==='));
const goatCount  = GOAT_CORE_LEVELS.length;
const tigerCount = TIGER_CORE_LEVELS.length;
console.log(`  Goat cores:  ${goatCount}   (campaign expands to ${goatCount*2} via Dawn/Dusk)`);
console.log(`  Tiger cores: ${tigerCount}   (campaign expands to ${tigerCount*2} via Dawn/Dusk)`);

if (issues.critical.length === 0 && issues.warning.length === 0) {
  console.log(c('green', `\n  CLEAN -- no critical issues, no warnings.\n`));
  process.exit(0);
}

if (issues.critical.length > 0) {
  console.log(c('red', `\n  ${issues.critical.length} critical issue${issues.critical.length===1?'':'s'}:`));
  for (const it of issues.critical) console.log(`    - ${c('dim', `[${it.section}]`)} ${it.msg}`);
}
if (issues.warning.length > 0) {
  console.log(c('yellow', `\n  ${issues.warning.length} warning${issues.warning.length===1?'':'s'}:`));
  for (const it of issues.warning) console.log(`    - ${c('dim', `[${it.section}]`)} ${it.msg}`);
}
console.log('');
process.exit(issues.critical.length > 0 ? 1 : 0);
