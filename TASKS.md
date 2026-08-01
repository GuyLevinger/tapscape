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
- [ ] 27. Cosmetics — Customization
- [ ] 28. Achievements — Achievement system
- [ ] 29. World unlocks — Progression

## Milestone 4: Release (Tasks 30-32)

- [ ] 30. Performance pass — Optimization
- [ ] 31. Polish — FX & animations
- [ ] 32. Release — Production build

## Notes / deviations from the original docs

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

## Known limitations to revisit during hardening (Task 30)

- An extreme frame-time gap (multi-second stall — observed via a dev-tool viewport resize,
  potentially also tab backgrounding/device lock on real devices) can still push the player
  partway through the ground before the per-step `deltaMax` clamp (added in Task 9) fully
  catches it. Normal gameplay, including ordinary window resizes, is unaffected. Revisit with a
  proper "pause physics while hidden" (`visibilitychange`) handler during the performance pass.
