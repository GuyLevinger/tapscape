# TapScape — Implementation Task Breakdown

> Transcribed from `TapScape_Task_Breakdown.pdf` for repo searchability. Source PDF is the
> canonical original if any discrepancy arises. **Live progress tracking lives in `TASKS.md` at the
> repo root, not here** — this file is the frozen original spec.

| # | Task | Deliverable | Test |
|---|------|-------------|------|
| 1 | Project bootstrap | Phaser + TS + Vite project | Blank screen loads |
| 2 | Core architecture | Scenes, event bus, folders | Boot→Home works |
| 3 | Asset pipeline | Loader & assets | Assets load |
| 4 | Home screen | Phone UI | App opens world |
| 5 | Input manager | Unified input | Jump/Slide events |
| 6 | Character controller | Run/jump/slide | Responsive movement |
| 7 | Camera system | Follow camera | Tracks player |
| 8 | Physics | Arcade physics | Collisions work |
| 9 | Infinite ground | Scrolling floor | No gaps |
| 10 | Chunk system | Chunk loading | Chunks recycle |
| 11 | Procedural generation | Valid chunk selection | No impossible layouts |
| 12 | Obstacle manager | Obstacle spawning | Continuous obstacles |
| 13 | Collision manager | Death handling | Collision ends run |
| 14 | Score manager | Distance scoring | Score increases |
| 15 | Coin system | Collectibles | Coins collected |
| 16 | Results screen | End screen | Retry works |
| 17 | Save manager | LocalStorage | High score persists |
| 18 | Audio manager | Music & SFX | Audio plays |
| 19 | UI framework | HUD/settings | HUD updates |
| 20 | Power-up framework | Generic effects | Effects expire |
| 21 | Difficulty scaling | Progression | Difficulty ramps |
| 22 | Legbook world | Playable world | End-to-end play |
| 23 | Slowgram world | World | Playable |
| 24 | ChatZap world | World | Playable |
| 25 | MeTube world | World | Playable |
| 26 | WrongTurn world | World | Playable |
| 27 | Cosmetics | Customization | Changes persist |
| 28 | Achievements | Achievement system | Unlocks trigger |
| 29 | World unlocks | Progression | Unlock worlds |
| 30 | Performance pass | Optimization | 60 FPS |
| 31 | Polish | FX & animations | Production quality |
| 32 | Release | Production build | Public deployment |

**Milestone 1:** Tasks 1-13 (playable prototype)
**Milestone 2:** Tasks 14-20 (core game complete)
**Milestone 3:** Tasks 21-29 (MVP complete)
**Milestone 4:** Tasks 30-32 (release)
