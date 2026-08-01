# TapScape — Implementation Task Tracker

Mirrors `TapScape_Task_Breakdown.pdf`. Checked off in the same commit that implements and
verifies the task; see `git log` for exact commits.

## Milestone 1: Playable prototype (Tasks 1-13)

- [x] 1. Project bootstrap — Phaser + TS + Vite project — `71ea8b6`
- [x] 2. Core architecture — Scenes, event bus, folders — `71ea8b6`
- [x] 3. Asset pipeline — Loader & assets — `1db3791`
- [x] 4. Home screen — Phone UI — `6505d7f`
- [x] 5. Input manager — Unified input — `ee43cdb`
- [x] 6. Character controller — Run/jump/slide — `5e06089`
- [x] 7. Camera system — Follow camera
- [ ] 8. Physics — Arcade physics
- [ ] 9. Infinite ground — Scrolling floor
- [ ] 10. Chunk system — Chunk loading
- [ ] 11. Procedural generation — Valid chunk selection
- [ ] 12. Obstacle manager — Obstacle spawning
- [ ] 13. Collision manager — Death handling

## Milestone 2: Core game complete (Tasks 14-20)

- [ ] 14. Score manager — Distance scoring
- [ ] 15. Coin system — Collectibles
- [ ] 16. Results screen — End screen
- [ ] 17. Save manager — LocalStorage
- [ ] 18. Audio manager — Music & SFX
- [ ] 19. UI framework — HUD/settings
- [ ] 20. Power-up framework — Generic effects

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
