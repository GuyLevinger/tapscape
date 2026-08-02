# TapScape — Implementation Task Tracker

Mirrors `docs/task-breakdown.md` (a transcription of the original `TapScape_Task_Breakdown.pdf`).
Checked off in the same commit that implements and verifies the task; see `git log` for exact
commits. **See root `CLAUDE.md` for the workflow this file is part of.**

## Milestone 1: Playable prototype (Tasks 1-13)

- [x] 1. Project bootstrap — Phaser + TS + Vite project — `71ea8b6`
- [x] 2. Core architecture — Scenes, event bus, folders — `71ea8b6`
- [x] 3. Asset pipeline — Loader & assets — `1db3791`
- [x] 4. Home screen — Phone UI — `6505d7f`
- [x] 5. Input manager — Unified input — `ee43cdb`
- [x] 6. Character controller — Run/jump/slide — `5e06089`
- [x] 7. Camera system — Follow camera
- [x] 8. Physics — Arcade physics
- [x] 9. Infinite ground — Scrolling floor
- [x] 10. Chunk system — Chunk loading
- [x] 11. Procedural generation — Valid chunk selection
- [x] 12. Obstacle manager — Obstacle spawning
- [x] 13. Collision manager — Death handling

## Milestone 2: Core game complete (Tasks 14-20)

- [x] 14. Score manager — Distance scoring
- [x] 15. Coin system — Collectibles
- [x] 16. Results screen — End screen
- [x] 17. Save manager — LocalStorage
- [x] 18. Audio manager — Music & SFX
- [x] 19. UI framework — HUD/settings
- [x] 20. Power-up framework — Generic effects

## Milestone 3: MVP complete (Tasks 21-29)

- [x] 21. Difficulty scaling — Progression
- [x] 22. Legbook world — Playable world
- [x] 23. Slowgram world — World
- [x] 24. ChatZap world — World
- [x] 25. MeTube world — World
- [x] 26. WrongTurn world — World
- [x] 27. Cosmetics — Customization
- [x] 28. Achievements — Achievement system
- [x] 29. World unlocks — Progression

## Milestone 4: Release (Tasks 30-32)

- [ ] 30. Performance pass — Optimization
- [ ] 31. Polish — FX & animations
- [ ] 32. Release — Production build

## Notes / deviations from the original docs

- **Added a "Level Intro & Retry Flow" feature (post-MVP user request, not one of the 32 tasks or
  in any GDD chapter).** A run's first attempt at a world now gets an obstacle-free runway of
  ~2.5s (`FIRST_ATTEMPT_CLEAR_DISTANCE` in `src/config/gameplayConfig.ts`) so new players can feel
  out jump/slide before facing anything; retrying after death (the Results screen's Retry button,
  which now passes `isRetry: true` through to `WorldScene`) only gets ~0.75s
  (`RETRY_CLEAR_DISTANCE`) so the retry loop stays fast, rather than replaying the same long empty
  stretch every time. Both are expressed as world-distance, not a timer, since `ObstacleManager`
  (now constructed with an `obstacleFreeUntilX` world-x boundary) filters individual obstacle
  spawns below that x rather than skipping whole chunks - this keeps chunk/coin/power-up placement
  completely untouched and generalizes to every world for free, since none of the 5 worlds' content
  files needed to change. Verified live: a first attempt in Legbook survived ~2.8s before the first
  obstacle (matching the "approximately 2-3 seconds" target) and a subsequent Retry from the same
  Results screen died after a ~244-distance run (~0.8s, matching "approximately 0.5-1 second").
  Re-entering a world from Home (rather than via Retry) always gets the long first-attempt runway
  again - there's no persistent "have I seen this world's intro before" flag, since the request
  frames "first attempt" per play session rather than per lifetime.
- Using **Phaser 4** (latest, actively maintained) instead of the Phaser 3 named in the HLD —
  no v3-specific API is relied upon, and the docs simply predate v4's release.
- **Task 20's power-up framework implements one generic effect (temporary invincibility)**, not
  the 5 named universal power-ups (Fast Charger, RAM Boost, Airplane Mode, Do Not Disturb,
  Premium) or the 4 world-specific ones — the GDD names them but never specifies what any of
  them mechanically *do*, and invincibility is the only effect the GDD's collision rules actually
  define ("protected by an active power-up"). `PowerupManager` is written so a specific named
  effect is just a different pickup texture + a different `WorldScene` reaction to
  `GameEvents.POWERUP_PICKED`/`POWERUP_EXPIRED` — the spawn timer, pickup lifecycle, and
  "only one active at a time" duration tracking are already generic. Naming/skinning individual
  power-ups per-world belongs in Tasks 22-26 (the world plugin model).
- **Added a world-plugin extension point ahead of Tasks 22-26** (`src/data/worldContent.ts`), not
  itself one of the 32 numbered tasks. Before Task 21, `WorldDef` had no hooks for per-world
  obstacles/collectibles/power-ups/signature mechanics — `ObstacleManager`/`CoinManager`/
  `PowerupManager` all hardcoded the generic texture keys. `getWorldContent(worldKey)` now
  returns per-world texture keys, a power-up display name, and an optional
  `createSignatureMechanic(scene, ctx) => { update(delta), destroy?() }` factory, all merged over
  shared defaults so an unset/partial entry plays identically to the generic engine content
  (verified: Legbook is unchanged). The signature mechanic is intentionally just a per-frame
  update hook rather than a richer shared abstraction — Legbook's visibility-obscuring reactions,
  Slowgram's camera flash, ChatZap's obstacle-push, MeTube's ad-interrupt and WrongTurn's
  lane-branching are structurally too different to generalize further, and the HLD's world plugin
  model says the engine should contain no world-specific logic anyway. Tasks 22-26 fill in
  `WorldContent[key]` (plus their own texture assets) rather than touching engine code.
- **WrongTurn's signature mechanic is a visual "fork ahead" road-sign cue, not real lane-switching.**
  The GDD's stated mechanic — "roads split into multiple lanes requiring quick choices" — needs
  lateral player movement, lane-aware obstacle placement and new collision logic, none of which
  exist today (the player's x position is fixed; only jump/slide exist as input). Building that is a
  much bigger feature than any other world's mechanic in this pass, so `WrongTurnMechanic`
  instead periodically slides in a road-sign image and fades it out — decorative only, same scope
  level as the other 4 worlds' mechanics. Real lane-switching is future work.

- **Task 27's cosmetics catalog covers phone skins and wallpapers only, not "running/victory
  animations."** The GDD calls for "five phone skins, five wallpapers, three running animations
  and three victory animations," but the engine has no sprite-frame animation system at all —
  `CharacterController` only ever displays one texture, tinted per state (the same situation as
  Task 20's power-ups). An initial pass implemented running/victory "animations" as tint recolors
  (character sprite tint + Results-screen accent color) to at least give those two categories a
  render target, but the user redirected mid-task: faking animation content as tint swaps wasn't
  worth it, so those two categories were cut entirely rather than shipped as reskinned tints.
  Phone skin and wallpaper survive because they map onto real, already-rendered surfaces (the Home
  screen's case-border rectangle and its background color). `src/data/cosmetics.ts` holds the
  10-item catalog (5 phone skins + 5 wallpapers, one free default each, the rest priced in coins);
  `CustomizeScene` (reachable from a Home-screen button) is the purchase/equip UI; `SaveManager`
  gained generic `spendCoins`/`unlockCosmetic`/`equipCosmetic`/`getEquippedCosmetic` primitives with
  no knowledge of the catalog itself, matching the existing separation where `worlds.ts`/
  `worldContent.ts` don't know about `SaveManager` either. Verified live: purchase deducts coins
  and unlocks+equips the item, insufficient-coin clicks show a toast without spending, and the
  equipped phone skin/wallpaper persist across a reload and render immediately on Home.

- **Task 28's 18 achievements are evaluated statelessly against lifetime save stats, not against
  run-completion events.** `SaveManager` gained a `stats` block (`totalRuns`, `totalCoinsEarned`,
  `bestScoreOverall`, `bestDistanceOverall`, `bestCoinsInRun`, `bestSurvivalMs`) that only ever goes
  up, updated by `recordRun` (now also takes a `survivalMs` arg tracked per-run in `WorldScene`).
  `AchievementManager.checkForNewAchievements()` rescans every `AchievementDef` in
  `src/data/achievements.ts` each time it's called (currently only after `ResultsScene` records a
  run) and unlocks+rewards whichever are newly complete; this makes it trivially safe to call again
  later from anywhere state changes (e.g. Task 29's world-purchase flow) without double-unlocking
  or needing per-achievement event wiring. 8 of the 18 achievements each reward one of Task 27's 8
  non-default cosmetics (a free path to every cosmetic, parallel to the coin-purchase path), the
  rest reward coins. Verified live: completing a first run unlocks "First Run" + "Try Legbook" and
  both display on the Results screen with their coin rewards added to the balance; a second run
  shows no repeat popups; forcing lifetime stats to their thresholds and completing another run
  unlocks three more achievements plus a cascaded "Fashionista" (own 3 cosmetics) in the same pass,
  all correctly persisted across a reload.

- **Task 29 gave each world a placeholder unlock price** (200/300/400/500 coins for
  Slowgram/ChatZap/MeTube/WrongTurn; Legbook stays free/starting) since the GDD says "additional
  worlds are purchased with coins" but names no actual amounts, mirroring Task 27's placeholder
  cosmetic prices. `WorldDef.unlocked` (a static bool) was replaced with `WorldDef.price` plus
  `SaveManager.isWorldUnlocked`/`unlockWorld`, so unlock state now lives in the save like every
  other piece of progression rather than being hardcoded per world. HomeScene shows a coin balance
  and an "Unlock: Nc" label on locked apps; tapping one spends coins and unlocks+opens on success,
  or shows an insufficient-funds toast (reusing the same pattern as Task 27's `CustomizeScene`)
  without spending anything on failure. Purchases also fire `WORLD_UNLOCKED` on `EventBus` (an
  event the HLD already listed but nothing previously emitted) and re-run
  `AchievementManager.checkForNewAchievements()`, so "Unlock every world" can trigger immediately.
  Verified live: an insufficient-funds click leaves the balance untouched, a successful purchase
  deducts coins and immediately makes the world playable end-to-end (through Results, with the
  matching "Try &lt;World&gt;" achievement firing), and the unlock persists across a reload.

## Known limitations to revisit during hardening (Task 30)

- An extreme frame-time gap (multi-second stall — observed via a dev-tool viewport resize,
  potentially also tab backgrounding/device lock on real devices) can still push the player
  partway through the ground before the per-step `deltaMax` clamp (added in Task 9) fully
  catches it. Normal gameplay, including ordinary window resizes, is unaffected. Revisit with a
  proper "pause physics while hidden" (`visibilitychange`) handler during the performance pass.
