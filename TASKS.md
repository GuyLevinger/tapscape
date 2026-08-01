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

- [ ] 21. Difficulty scaling — Progression
- [ ] 22. Legbook world — Playable world
- [ ] 23. Slowgram world — World
- [ ] 24. ChatZap world — World
- [ ] 25. MeTube world — World
- [ ] 26. WrongTurn world — World
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

## Known limitations to revisit during hardening (Task 30)

- An extreme frame-time gap (multi-second stall — observed via a dev-tool viewport resize,
  potentially also tab backgrounding/device lock on real devices) can still push the player
  partway through the ground before the per-step `deltaMax` clamp (added in Task 9) fully
  catches it. Normal gameplay, including ordinary window resizes, is unaffected. Revisit with a
  proper "pause physics while hidden" (`visibilitychange`) handler during the performance pass.
