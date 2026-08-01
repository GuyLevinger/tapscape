# TapScape

Browser-first endless runner set entirely inside a smartphone UI. Every home-screen "app" is a
parody-themed endless runner world (social media, photos, messaging, video, navigation). No
backend, no accounts — LocalStorage only.

**Read `docs/gdd-1-vision.md` through `docs/gdd-4-systems.md`, `docs/hld.md`, and
`docs/task-breakdown.md` for the full design/technical spec before making non-trivial design
decisions.** Those are transcriptions of the original PDFs the user provided, kept in the repo so any
session can read them without the PDFs being re-attached.

## Where things stand

**`TASKS.md` is the single source of truth for progress.** Read it first, every session. It mirrors
`docs/task-breakdown.md`'s 32 tasks with checkboxes, and is kept current — a task's box is checked
in the same commit that implements and verifies it. `git log` has the full "why" behind each commit
if you need more detail than the checkbox gives you.

## Workflow rules (follow these without being asked)

1. **Before starting work, read `TASKS.md`** to see what's done and what's next. Work top-to-bottom
   unless the user redirects you.
2. **For each task**: implement it, verify it actually works (see Verification below — don't just
   type-check and assume), then commit with a message explaining what changed and how it was
   verified, then push.
3. **Update `TASKS.md` in the same commit** that completes a task — check the box. Don't batch
   multiple tasks into one commit; one commit per task keeps the history reviewable.
4. **If you deviate from the design docs** (see the Phaser 4 example below), or make an
   architectural decision not covered by them, **add a note to this file and/or `TASKS.md`'s "Notes /
   deviations" section.** Future sessions should not have to rediscover a decision by reading diffs.
5. **If you can't verify something yourself and need the user to check it manually, stop and ask —
   don't move on to the next task first.** This was an explicit instruction from the user at project
   start.
6. Don't add scope beyond what a task's row in `docs/task-breakdown.md` actually asks for. Later
   tasks (e.g. real obstacle fairness rules, full settings UI, cosmetics) intentionally build on earlier
   ones incrementally — resist doing task N+1's work while implementing task N, even if it's tempting
   for polish reasons.

## Architecture

- **Stack**: Phaser **4** (not 3 — see deviation note below) + TypeScript + Vite, scaffolded via the
  official `npm create vite@latest . -- --template vanilla-ts` (never hand-roll config files vite
  already generates; add to them instead).
- **Scenes** (`src/engine/scenes/`): Boot → Home → World → Results, per the HLD's scene
  architecture. Boot loads the asset manifest with a progress bar. World is where all gameplay
  managers get wired together per run.
- **Manager-per-system pattern** (`src/engine/`): each gameplay concern is its own single-purpose
  class instantiated by `WorldScene` — `CharacterController`, `CameraController`, `InputManager`,
  `InfiniteGround`, `ChunkManager` + `ChunkSelector`, `ObstacleManager`, `CoinManager`,
  `CollisionManager`, `ScoreManager`, `AudioManager`. This matches the HLD's explicit list of
  systems and its "event-driven and single-purpose" principle. `EventBus` (`src/engine/EventBus.ts`)
  is a shared `Phaser.Events.EventEmitter` carrying the HLD's named events
  (`PLAYER_JUMPED`, `COIN_COLLECTED`, `PLAYER_DIED`, etc.) — prefer wiring new cross-system
  reactions through it (e.g. `AudioManager` plays SFX purely by listening to existing events, no
  direct calls from other managers) rather than adding direct references between managers.
- **World is stationary, content scrolls**: the player's x-position never changes. "Running" is
  simulated by scrolling the ground (`InfiniteGround`, a `TileSprite` — no seams by construction) and
  moving chunks/obstacles/coins left via their own velocity or manual offset. Keep this convention —
  don't reintroduce player horizontal movement.
- **Chunks** (`ChunkManager` + `ChunkSelector` + `src/data/chunkTypes.ts`): fixed-width segments
  recycled once off-screen. `ChunkSelector.next()` can only pick from the previous chunk type's
  `allowedNext` list, so smooth difficulty transitions are guaranteed by construction, not checked
  after the fact. `ObstacleManager` and `CoinManager` populate each chunk via a callback from
  `ChunkManager`, not by owning chunk logic themselves.
- **Data-driven worlds** (`src/data/worlds.ts`): per the HLD's "world plugin model," worlds are
  config objects (key, name, color, unlocked), not per-world code. World-specific gameplay (Tasks
  22-26) should extend this pattern rather than branching engine code per world.
- **Save** (`src/save/SaveManager.ts`): single versioned JSON blob in LocalStorage
  (`tapscape-save`), matching the HLD's save schema (best score/distance per world, total coins,
  worlds/cosmetics/achievements unlocked, settings). Falls back to in-memory defaults if
  LocalStorage is unavailable or corrupt.
- **Placeholder assets**: no art or audio was provided. Images are hand-written SVGs
  (`src/assets/`, loaded as images through the normal loader). Audio is short synthesized WAV
  tones generated once via a throwaway Node script (`src/audio/`, loaded through the same
  asset-manifest pipeline as images). Both are meant to be swapped for real assets later — the
  *pipeline* around them (Task 3, Task 18) is what matters, not the placeholder content itself.

## Known deviations from the design docs

- **Phaser 4, not Phaser 3.** The GDD/HLD both specify Phaser 3, but that was simply the latest
  version when those docs were written. Phaser 4 is newer and actively maintained; nothing in the
  implementation relies on a Phaser-3-specific API (Arcade Physics, Scenes, the event emitter all
  carry over). Confirmed with the user this is fine — don't "fix" this by downgrading.
- Per-task deviations and known limitations are logged in `TASKS.md`'s "Notes / deviations" section
  (e.g. a large frame-time-gap edge case around physics tunneling, flagged for the Task 30
  hardening pass rather than fixed immediately, since it doesn't affect normal gameplay).

## Verification workflow

- **Type-checking is not verification.** `npx tsc --noEmit` (node path on this machine:
  `"C:\Program Files\nodejs\node.exe" node_modules/typescript/bin/tsc --noEmit`) catches type
  errors, not behavior. Every task in `TASKS.md` was verified live in the browser via the preview
  tool before being checked off — do the same for new work.
- **Preview server**: `.claude/launch.json` points it at `node.exe` running Vite's bin directly
  (`node_modules/vite/bin/vite.js`), not `npm run dev` — a plain `npm`/`npx` invocation failed in
  this environment because the spawned process didn't inherit a PATH containing Node itself. If the
  preview server won't start, check `.claude/launch.json` still points there before debugging further.
- **Running two sessions' dev servers at once**: if another session already has port 5173 bound,
  the preview tool refuses to reuse it and asks you to enable `autoPort`. `autoPort: true` alone
  isn't enough — Vite doesn't read the tool's assigned port automatically, so it falls back to its
  own "try 5173, then increment" logic and the two disagree on which port is actually listening
  (connection-refused on the port the tool thinks it started). Fixed by reading `process.env.PORT`
  in `vite.config.ts`'s `server.port` (falls back to 5173 when unset, so a plain `vite` invocation
  is unaffected). Both `.claude/launch.json` (`autoPort: true`) and `vite.config.ts` need this for
  parallel sessions to each get a working preview.
- **The `Claude_Preview` MCP tool's browser tab/registry is shared across parallel worktree
  agents**, even though each agent calls `preview_start` from its own worktree directory. Multiple
  agents in the Tasks 22-26 fan-out independently hit the same symptom: `preview_start` reporting
  success but the served content (or `cwd`) belonging to the main checkout or a *different* agent's
  worktree, and the shared browser tab getting silently navigated out from under them mid-session.
  There is no per-agent isolation to request — the fix every agent converged on independently: run
  `vite` directly (`node.exe node_modules/vite/bin/vite.js`, own port) rooted in your own worktree
  instead of going through `preview_start`, confirm it's actually serving your files (e.g. `curl` an
  edited file), then either drive a `claude-in-chrome` tab against that URL, or repeatedly assert
  `window.location.href` matches your port at the top of every `preview_eval` before trusting the
  result (the shared tab may have been redirected elsewhere between calls). Don't spend time
  fighting `preview_start` itself in a multi-worktree-agent context — it's a known limitation, not a
  misconfiguration. (The orchestrating/parent session doesn't have this problem — it's specific to
  multiple agents running concurrently.)
- **Clicking in Phaser via `preview_eval`**: Phaser's `MouseManager` listens for native
  `mousedown`/`mouseup`/`mouseup` DOM events on the canvas, **not** `pointerdown`/`pointerup`. A
  synthetic `PointerEvent` will silently do nothing. Dispatch `MouseEvent('mousedown', {clientX,
  clientY, button: 0, buttons: 1})` / `mouseup` on `document.querySelector('canvas')` instead.
  Compute `clientX/clientY` from a live query of the target object's `x`/`y` in the scene (e.g.
  `scene.children.list.find(...)`) plus `canvas.getBoundingClientRect()` — don't eyeball coordinates
  from a screenshot, since the screenshot's pixel dimensions don't necessarily match the canvas's
  actual CSS size (seen drifting between e.g. 730×730 actual vs ~800×800 screenshot).
  Keyboard events for `scene.input.keyboard` go to `window`, not the canvas — regular
  `KeyboardEvent`s dispatched on `window` work, and Phaser's key-name binding (`keydown-SPACE`,
  `keydown-DOWN`) reads `event.keyCode`, so pass an explicit `keyCode`/`which` since some
  synthetic-event paths don't populate the legacy field.
- **Separate `preview_eval` calls appear to throttle/reset background state.** A value read, then
  read again in a *separate* tool call moments later, sometimes comes back unchanged even though
  real time passed — this is background-tab throttling in the preview environment, not a game bug.
  Long single-call polling loops can also hit the tool's ~30s timeout, which appears to trigger some
  kind of recovery that resets state. The reliable pattern: do a **single eval call with an internal
  `setTimeout` poll loop** (checking a condition every 20-50ms, bounded to a few hundred ticks) and
  resolve a Promise with the result — this reliably observes real state changes (chunk
  recycling, score climbing, death happening, etc.) within one round trip. Don't conclude something
  is broken from two separate short reads showing no change; re-verify with a single continuous
  poll before treating it as a bug.
- **Git identity** is set locally in this repo (not global) — `GuyLevinger` /
  `12374182+GuyLevinger@users.noreply.github.com` (GitHub noreply address, chosen to avoid
  leaking a real email). `gh` is authenticated as the same GitHub account. Both were set up
  interactively with the user; a fresh session shouldn't need to redo this unless the environment
  changed.
