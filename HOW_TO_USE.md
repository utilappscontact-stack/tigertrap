# How to use CLAUDE_PHASE2.md with Claude Code

A short operator's manual. Three sections: file layout, prompt patterns, and how to stop the permission prompts.

---

## 1. File layout in your project

Put these three files in the **root of the tigertrap project** (same folder as `game.js`):

```
tigertrap/
├── CLAUDE_PHASE2.md            <- the instruction file
├── audit.mjs                   <- the level validator
├── .claude/
│   └── settings.local.json     <- your permission allow list (gitignored)
├── game.js
├── index.html
├── style.css
└── assets/
```

**Why root, not a subfolder:** Claude Code automatically reads files in the project root and treats them as context for every session. You won't need to re-attach the .md file.

**`.claude/` directory:** Create it if it doesn't exist. The `.local.json` suffix is important — Claude Code adds that file to `.gitignore` automatically so your personal permission rules don't get committed.

---

## 2. The right way to ask Claude Code to run a task

**Don't say:** "do task 1" or "do task A"

**Why:** There is no Task 1. The blocks are named `A1`, `A2`, `B1`, ..., `E4`. Saying "task 1" forces Claude Code to guess which one you mean. Saying "task A" is ambiguous because A is a whole section with five tasks.

### Single-task prompts (preferred — one task per session)

```
Read CLAUDE_PHASE2.md. Execute Task B1 only.
Follow its acceptance checklist. Stop at the stop condition.
Run audit.mjs before you start and after you finish.
Show me the diff before committing.
```

```
Open CLAUDE_PHASE2.md. Execute Task A1.
Do not proceed to A2. Do not modify the .md file.
```

```
Execute Task C1 from CLAUDE_PHASE2.md.
Confirm the v1->v2 migration logic with me before writing it.
```

### What makes these prompts good

- **Names the task by ID.** No ambiguity.
- **Forbids scope creep.** "Do not proceed to A2" stops Claude Code from chaining.
- **Names the verification step.** Telling Claude Code to run `audit.mjs` before/after a B-section task means you get evidence each time.
- **Asks for review before commit.** "Show me the diff" gives you one final checkpoint.

### Prompts to avoid

- ❌ "Do all of section B" — you'll get a half-correct mega-commit you can't review or revert cleanly.
- ❌ "Continue with the next task" — Claude Code may or may not pick the right next one given the dependency graph.
- ❌ "Fix the East Corridor bug" — vague; the .md has a precise spec for B1, use it.

### Workflow loop

1. Open Claude Code in the tigertrap directory.
2. Pick the next task from the **Run Order Guidance** section of the .md.
3. Prompt Claude Code with a single-task instruction (template above).
4. Watch the diff. Reject anything outside the task's stated scope.
5. If it's a B-section task: confirm `audit.mjs` exit code is 0 (or that the only remaining issues are ones you intentionally deferred).
6. Commit. Move to next task.
7. End the session (`/clear` or new chat). Fresh context for the next task is cleaner.

### How long should one task take?

If a task's session goes past **30 minutes of back-and-forth**, stop. Either the task is bigger than the .md anticipated, or Claude Code is going in circles. Cancel, revert, and either break the task into smaller pieces or ask me (regular Claude) to refine the .md spec for that task.

---

## 3. Stopping the permission prompts

You're hitting "Allow / Deny" on every command. There are three levels of fix, increasing in convenience and risk.

### Level 1 — Project allow list (recommended)

Drop the `settings.local.json` file (provided alongside this guide) into `.claude/settings.local.json` in your project. It pre-approves every command Claude Code will need for Phase 2 work: `node`, `npm`, `git status/diff/add/commit`, `grep`, `sed`, `cat`, `ls`, etc. Risky operations (`git push`, `rm`, `git reset`) still prompt. Truly dangerous ones (`sudo`, `rm -rf /`) are denied outright.

The file also sets `"defaultMode": "acceptEdits"` which auto-approves file edits without prompting. Bash commands still get checked against the rules. This is the right balance for most sessions.

After dropping the file, restart Claude Code. Run `/permissions` inside Claude Code to verify the rules loaded.

### Level 2 — `/permissions` command for one-off additions

While in a Claude Code session, type `/permissions`. You get an interactive list. Add new rules without restarting. Useful when you discover Claude Code wants a command you didn't pre-approve — instead of clicking "Always allow" on the prompt (which only saves at session level on some platforms), use `/permissions` to write it to settings.

### Level 3 — `--dangerously-skip-permissions` (use with care)

Launch Claude Code with the flag:

```
claude --dangerously-skip-permissions
```

Or alias it in your shell:

```
alias clauded="claude --dangerously-skip-permissions"
```

This bypasses **every** prompt. Claude Code can run anything. Real risks: it could `rm` files, `git reset --hard` your work, or push to wrong remotes — without asking.

**Only use when:**
- You're working in a clean git working tree (so you can `git reset --hard HEAD` if it goes wrong).
- The task is well-scoped and from the .md (not exploratory).
- You're not about to step away from the keyboard.

For Tiger Trap Phase 2 specifically: I'd use Level 1 for B-section tasks (logic edits, you want to review every change) and Level 3 only for E-section tasks (PWA setup, repetitive file generation, low risk per command).

### Common gotchas

- **Settings file edits don't take effect mid-session.** If you change `settings.local.json` while Claude Code is running, restart it. Some versions have a known bug where the in-memory permissions desync after Claude Code itself edits the file (issue #41259). Restart fixes it.
- **`Bash(ls:*)` vs `Bash(ls *)`.** Both syntaxes appear in the docs. The colon form (`ls:*`) is the current canonical syntax. If you see prompts despite a rule, check the syntax.
- **The desktop app sometimes ignores settings.json.** Known issue (#29026, macOS). Workaround: use the CLI version of Claude Code, not the desktop app, for sessions where you want auto-approve to actually work.

---

## 4. A first-session example

Putting it all together. Your first Claude Code session for Phase 2 might look like:

**Setup (do once):**
```
cd ~/path/to/tigertrap
mkdir -p .claude
cp ~/Downloads/settings.local.json .claude/settings.local.json
cp ~/Downloads/CLAUDE_PHASE2.md .
cp ~/Downloads/audit.mjs .
git add CLAUDE_PHASE2.md audit.mjs
git commit -m "Add Phase 2 instruction file and audit harness"
node audit.mjs    # baseline: should show the 17 critical issues
```

**Open Claude Code:**
```
claude
```
Read Fixes_c6.md. Execute Task Task C6.1 only.


**First prompt (low-risk warmup task):**
```
Read CLAUDE_PHASE2.md. Execute Task B7 only — add stalemate
detection in runGoatAI. Do not modify the .md file. After your
edit, run `node audit.mjs` and show me the output. Do not commit.
```

**Review the diff Claude Code shows you. If clean, prompt:**
```
Looks good. Commit with a one-line message and stop.
```

**End session, start fresh for the next task:**
```
/clear
```

```
Read CLAUDE_PHASE2.md. Execute Task B4 — fix Dusk variant goal-text
rotation. Run audit.mjs after the change. The "DUSK VARIANT ESCAPE
GOAL-TEXT" section should drop from 8 critical issues to 0. Show me
the diff before committing.
```

That's the rhythm for the next 13–19 weekends of work.

---

## 5. When to escalate back to me (regular Claude)

Claude Code is fast at execution but it doesn't have the strategic context I do. Come back to me when:

- A task spec in the .md is ambiguous or a check fails in a way the .md didn't anticipate.
- You want to revise a task block (e.g. Task C2 turns out to need different storage schema).
- Audit shows new categories of issues that weren't in Part 1.
- You're considering a strategic pivot mid-phase (e.g. skip B5 culling and just patch broken levels in place).
- Phase 2 is done and you want Phase 3 spec'd.

Bring the audit output and any commits/diffs you want me to look at. I can refine .md task blocks, debug audit logic, or generate replacement level data verified by the solver.
