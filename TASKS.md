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

- [x] 30. Performance pass — Optimization
- [x] 31. Polish — FX & animations
- [ ] 32. Release — Production build

## Milestone 5: Pre-release enhancements (user-requested, not in `docs/task-breakdown.md`)

Requested 2026-08-02, before Task 32 (Release). Two independent tracks, obstacle variety first per
user direction. Two scope questions were resolved with the user up front, before any of these
tasks started, to avoid an architecture change partway through:

- **"Safe slot" multi-lane patterns → approximated with jump/slide timing, not a real lane system.**
  The character has no persistent lane position today (grounded / jump-arc / slide, all one lane) -
  building real top/mid/ground lanes would be a movement-model change, not obstacle content. Combo
  patterns instead stack hazards so the existing jump-arc and slide window create the "right moment
  to pass" puzzle the diagram was going for.
- **Track gaps → simulated with a wide ground-level obstacle, not real gaps in `InfiniteGround`.**
  Real gaps would mean breaking `InfiniteGround`'s single seamless scrolling `TileSprite` (a
  deliberate no-seams-by-construction design) into omittable segments - out of proportion to what a
  "fall through if you don't jump" hazard actually needs. A wide obstacle gives the same
  jump-early-or-die pressure without touching the ground system.

### Obstacle variety

- [x] 33. Spatial obstacle variants — low ground hurdle (jump required) vs. high suspended banner
      (jumping into it is the wrong move - just stay grounded/keep running, or delay a jump you'd
      otherwise take nearby)
- [x] 34. "Tall barrier" (well-timed jump) + wide multi-obstacle block (jump early to clear the
      whole span) - both built as multi-obstacle placement formations, not literally taller
      obstacles (see Notes)
- [x] 35. Slalom combo pattern — ground obstacle (jump required) immediately followed by an
      overhead one (jump punished), or vice versa, forcing a jump-then-don't-jump decision rather
      than jump-then-slide (see Notes)
- [x] 36. Wide ground-level "gap" hazard — approximates a track gap (see above) as an obstacle
      rather than a real hole in `InfiniteGround`
- [x] 37. Pulsing laser/firewall gate — on/off timing cycle with a warning indicator before it
      activates
- [x] 38. Chasing hazard — a trailing obstacle that closes in from behind on a timer (see Notes for
      why "punishes lingering" doesn't map onto this game)
- [x] 39. Themed hazard re-skins + effects — Notification pop-up (solid barrier), Glitch Zone
      (temporary control invert), Low Battery Zone (temporary slow), WiFi Dead Zone (temporarily
      disables power-ups)
- [x] 40. Wire hazard variety into per-difficulty chunk definitions — easy/medium/hard pattern
      progression and combo formations (approximated safe-slot layouts per above)

### Phone-style chrome for menus/HUD

- [x] 41. In-run HUD redesigned as a phone status bar (time/battery/signal styling, score & coins
      integrated into that bar rather than separate boxes)
- [ ] 42. Mute button redesigned as a speaker icon (with a muted/slashed state)
- [ ] 43. Back/Home button redesigned as a phone nav-bar back icon
- [ ] 44. Customize entry point redesigned as a settings-gear icon

- **Task 41 replaced `UIManager`'s separately-boxed Score/Coins/World-name readouts with a single
  full-width phone status bar** at the top of the in-run HUD, matching the smartphone-UI framing
  the rest of the game already commits to (Home's placeholder "9:41" clock joke, phone-case bezel,
  etc.). The bar is one dark translucent strip (0-40px) with, left to right: a static "9:41" clock
  (decorative, same joke as Home - a real status bar's chrome doesn't change during play either);
  score (a small white diamond marker + number) and coins (a small yellow circle + number), each
  drawn with a fixed-width number slot so growing digit counts extend leftward without ever
  touching a neighboring element (verified up to 5/3-digit values); and decorative signal-bar/
  wifi/battery icons on the right edge, hand-drawn with Phaser `Graphics` primitives (`fillRect`,
  `strokeRoundedRect`, `arc`) rather than new art, always showing "full" exactly like a real phone
  screenshot always does regardless of anything - there's no in-game stat that maps onto them, so
  they're chrome only, the same spirit as the always-9:41 clock. Back/Mute buttons (Tasks 42-43's
  job to actually redesign) were only repositioned below the new bar so they don't overlap it -
  their own appearance is untouched, since re-skinning them now would be doing later tasks' scope
  early. Verified live via `window.__game`'s dev-only exposure (the same technique used for Task
  40's deterministic checks) driving a real, paused `WorldScene` instance directly: the bar's
  default 0/0 state screenshotted cleanly with every element in its intended position, and forcing
  `UIManager.setScore(12345)`/`setCoins(789)`/`setPowerup(9)` confirmed the fixed-slot layout holds
  with multi-digit values - no overlap with the icon cluster or into neighboring elements.

- **Immediate user follow-up to Task 41: the phone framing extends to every scene, not just
  in-run.** The user explicitly asked for the whole app - Boot, Home, World, Results, Customize -
  to read as a phone, including hardware details (speaker, camera) beyond just the status bar.
  Task 41's bar-building code (bezel border, time, decorative signal/wifi/battery) was extracted
  from `UIManager` into a new shared `PhoneFrame` class (`src/engine/PhoneFrame.ts`) that every
  scene now instantiates once; `UIManager` keeps only the score/coin readouts, anchored off
  `PhoneFrame.statusBarContentRightX` instead of re-deriving the same cursor math. Per the user's
  clarification, the speaker+camera cluster is drawn on the **left edge**, not top-center -
  described as "the phone rotated 90 degrees," i.e. the hardware that's normally centered on a
  portrait phone's top bezel now sits along the left edge instead, while the status bar itself
  stays unrotated at the top. It's a dark rounded-rect "cutout" panel near the top-left corner
  containing a vertical pill (the speaker grille) above a small ringed circle (the camera lens),
  all hand-drawn with `Graphics` primitives, no new art. Every scene's previously flush-left
  content (back buttons, Home's coin balance, Customize's back button) shifted right by
  `PhoneFrame.notchRightX + 16` to clear it, and title-row content that sat right under the old
  ad hoc bezel/clock (Customize's title and cosmetic rows) shifted down by the same amount the
  header row itself moved. Verified live via `window.__game` screenshots of all four scenes
  (Home, a paused World run, a directly-launched Results, and Customize): the bezel, status bar,
  and left-edge notch render identically on each with no element overlapping the notch or the
  bar, and equipping the paid "Crimson" phone skin via Customize's own swatch-click flow correctly
  recolored the bezel on the very next scene launch - confirming `PhoneFrame`'s
  `getEquippedColor('phoneSkin')` call (identical to the pre-refactor code, just relocated) still
  threads cosmetics through correctly.

- **Second round of user refinements to the phone frame, all in `PhoneFrame.ts`.** (1) The clock
  is now real local time (`Date.toLocaleTimeString` formatted without seconds, refreshed every 10s
  via a scene timer cleaned up on `SHUTDOWN`) instead of the static "9:41" placeholder joke - the
  user wanted an actually-live clock, not the Apple-keynote-screenshot gag. (2) The status bar is
  now inset fully inside the bezel's inner edge (`x` from `BEZEL_THICKNESS` to
  `width - BEZEL_THICKNESS`, `y` starting at `BEZEL_THICKNESS`) instead of spanning the full canvas
  from `(0,0)` - previously it partially painted over/under the border stroke; every scene's "next
  row" now anchors off a new `statusBarBottomY` property instead of `statusBarHeight + 8`, which
  didn't account for the bezel offset. (3) The speaker pill is now dramatically taller (30px to
  140px - "much longer" per the user) and, along with the camera dot beneath it, is centered on the
  screen's full vertical middle rather than tucked near the top - both moved from a `notchY` fixed
  near the status bar to `height / 2 - NOTCH_HEIGHT / 2`, and nudged an extra `NOTCH_LEFT_MARGIN`
  (8px) clear of the bezel's inner edge ("slightly to the right" per the user, not flush against
  the border). Moving the notch to mid-screen freed World/Home/Results' top-of-screen content from
  needing to dodge it (their back/coin buttons reverted to simple `contentLeftX` padding), but
  newly put it in the path of Customize's swatch grid, which - unlike World's transient scrolling
  pickups - is static, left-anchored content that would otherwise permanently sit half-hidden
  behind the notch; `PhoneFrame` kept a `notchRightX` property specifically for that case, and
  `CustomizeScene`'s category labels and swatch rows now start there instead of `contentLeftX`.
  Verified live: screenshots of Home/World/Customize all show the bar fully clear of the border,
  the pill+dot centered vertically with no border overlap, and Customize's swatches no longer
  obscured; two screenshots taken a minute apart during verification showed the clock advancing
  ("9:16 PM" to "9:17 PM"), confirming it reads real time rather than a static string.

## Notes / deviations from the original docs

- **Shrunk the player's and every obstacle's collision box below their sprite size** (user report:
  "if i jump too close to obstacle, even not touching it - i fail. same goes for landing"). Both
  `CharacterController` and `ObstacleManager` previously left the Arcade physics body at its
  default size - the *full* texture frame (96x128 for the player, 48x64 for every obstacle
  variant) - so a collision registered whenever those full rectangles overlapped, well before the
  visibly-drawn shapes (which have their own transparent padding on top of that) actually touched.
  Both now shrink their body to 60%/80% (player) or 65%/75% (obstacle) of width/height, centered
  horizontally and anchored to the ground (trimmed only off the top, via `body.setOffset`) so
  grounded collision with `InfiniteGround` is unaffected. Verified live via Phaser's own
  `physics.overlap()` swept across a range of relative positions: the horizontal danger zone
  shrank from 144 to 88.8 world-units (~38% less), and the minimum jump height needed to clear an
  obstacle dropped from 64px to 50px (~22% less) - both are real, quantified forgiveness gains, not
  just a "feel" change - while a normal run still ends in death on an actual hit as before.
- **Fixed a fairness bug where two obstacles could spawn too close together to pass** (user
  report: "sometimes there are 2 obstacles too close to one another, which makes it impossible to
  pass"). Root causes, both in `ObstacleManager`: (1) the old `MIN_GAP` was a fixed 220 world-units
  enforced only *within* a chunk's own obstacle placement - it said nothing about the gap between
  the last obstacle of one chunk and the first of the next, which worked out to a fixed 200 units
  (below even the old minimum) whenever a chunk ended with an obstacle at its far edge; (2) `MIN_GAP`
  never accounted for `DifficultyManager` ramping scroll speed up to 1.5x over a run - a fixed
  world-distance gap translates to steadily less *reaction time* as speed increases, so gaps that
  were fine early in a run became too tight later on. Replaced the whole per-chunk gap formula with
  a single check at the point every obstacle actually spawns: `MIN_REACTION_TIME_S` (1.1s, just
  above the ~1.0s a full jump arc takes given `CharacterController`'s jump velocity/gravity) is
  multiplied by the *current* scroll speed to get the live minimum world-gap, and any candidate
  obstacle closer than that to `lastObstacleX` (tracked globally across chunk boundaries, not
  per-chunk) is skipped rather than placed. This fixes both root causes with one mechanism and
  applies to all 5 worlds automatically (`ObstacleManager` is shared engine code). Verified live: a
  fresh run's pre-seeded obstacles all had gaps (400-600 units) safely above the live minimum
  (~335 at base speed); a forced high-difficulty chunk spawned at a simulated ramped-up speed
  (450) correctly thinned 3 candidate slots down to 1, keeping every surviving gap above the
  correspondingly larger required minimum (495).
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

- **Task 30 targets the HLD's "object pooling" technique specifically, not sprite atlases or
  lazy-loading** (the other two techniques the HLD's Performance section names alongside chunk
  recycling, which Task 10 already covers). `ObstacleManager`, `CoinManager`, and `PowerupManager`
  previously called `scene.physics.add.image(...)` on every spawn and `.destroy()` on every
  despawn - real allocation/GC churn every time a chunk recycles (~every 1-2s during a run), which
  is exactly what the HLD calls out object pooling to avoid. All three now keep a `pool` array of
  inactive Images and reuse them (`setActive`/`setVisible`/`body.enable` toggled instead of
  create/destroy) rather than being pushed through Phaser's Group class, since the existing
  `.group` getter (a plain array) is already what `CollisionManager` and `WorldScene`'s
  `physics.add.overlap` calls are wired against - reusing that contract kept the change scoped to
  the three managers instead of also touching collision wiring. Atlases and lazy-loading were
  judged out of scope: the full asset set is 20 small hand-drawn SVGs + 4 short synthesized tones,
  and a production build (`vite build`) completes in well under half a second at ~372 kB gzipped -
  there's no load-time problem those techniques would be fixing. Verified live: after warming a
  run's pool via chunk recycling, `totalSpawned` on all three managers stayed flat while
  `totalRecycled` climbed, confirming spawns are being satisfied from the pool rather than
  allocating new GameObjects; collision-into-Results and coin-collection-into-pool (body disabled,
  hidden, texture/hitbox correctly re-derived from the reused Image's frame size rather than its
  already-shrunk body) both still behaved identically to before the change.
- **Also stripped `ChunkManager`'s per-chunk debug rectangle+text label from production builds**,
  discovered while investigating Task 30's per-recycle costs - it's a Task 10/11-era dev aid
  (visually confirming chunk-type sequencing) that was never gated and so was rendering on top of
  live gameplay unconditionally, and a `Text` object's canvas-texture generation is a real cost to
  pay on every chunk recycle for something the GDD never calls for. Now gated behind
  `import.meta.env.DEV`, kept (not deleted) since it's still a useful dev tool for verifying
  `ChunkSelector` sequencing. Verified the label/marker code is fully dead-code-eliminated from the
  production bundle (grepped the built JS for the marker's distinguishing style - absent - vs. the
  dev server, where it's present and still updates correctly).

- **Fixed the frame-time-gap ground-tunneling bug flagged above, right after writing that note.**
  Root cause: `CharacterController`'s `body.deltaMax.y` (added in Task 9 to cap per-step
  displacement during a frame-time spike) was set to the player's own hitbox height (~102px) - but
  the ground slab (`GROUND_HEIGHT`) is only 80px thick, so a single clamped step could still be
  larger than the ground itself and skip past it with zero overlap at either the step's start or
  end position (Arcade physics only resolves collisions reactively from overlap, not via
  continuous/swept detection). The two values were never coupled, so nothing tied the clamp to what
  it actually needed to guarantee. Fixed by deriving `deltaMax.y` from `groundHeight` (now passed
  into `CharacterController`'s constructor) instead of the player's hitbox: any value strictly less
  than `groundHeight` guarantees a body resting on the ground's top edge can't clear its far edge in
  one step regardless of body height, so `groundHeight / 2` (40px) was chosen for comfortable
  margin - still ~2.5x the deltaMax needed and vastly larger than any normal per-frame fall
  displacement at 60 FPS, so jump/slide/landing feel is unchanged. Verified live: injecting a
  simulated 5-second delta directly into `physics.world.update()` while the player was resting on
  the ground left `body.blocked.down`/`touching.down` both `true` and the body's bottom edge
  exactly at the ground's top edge (no penetration), where before the fix the same injection was
  the reported repro for tunneling through.

- **Task 31's "FX & animations" is implemented entirely as procedural tweens/particles on the
  existing placeholder textures, not new sprite-sheet animations.** The engine still has no
  sprite-frame animation system (the same gap noted in Task 27, where "3 running animations, 3
  victory animations" was cut rather than faked via tint recolors) - the GDD's "phone expresses
  emotion through animation" and "deaths should feel humorous" goals are met instead with
  transform-only juice: `CharacterController` now does a takeoff stretch on jump (scaleY 1.2),
  a squash-and-recover on landing (scaleY 0.75 -> 1 via `Back.easeOut`, triggered off the
  airborne-to-grounded transition rather than a fixed timer), and a toppling "flop" (angle to 80°,
  pivoting from the sprite's ground-anchored origin) on death, timed to finish within the existing
  500ms death->Results delay. None of this touches hitboxes (Task 30's shrink work) or the
  `deltaMax` fix above - only `sprite.scale`/`sprite.angle`. A new `FxManager` mirrors
  `AudioManager`'s pattern (reacts to existing `EventBus` events rather than being called directly)
  to add camera shake + a full-screen red flash on `PLAYER_DIED`, and a particle burst (reusing the
  `coin`/`powerup` textures as particle sprites, tinted per context - no new art) plus a floating
  "+5" on `COIN_COLLECTED`/`POWERUP_PICKED`. `CoinManager`/`PowerupManager`'s collect() now emit
  their event with `{x, y}` so `FxManager` knows where to place the burst. `UIManager` separately
  listens for the same two pickup events to punch-scale whichever HUD counter just changed, rather
  than diffing values inside `setScore`/`setCoins` (which run every frame regardless of change).
  Verified live via Phaser's tween/camera APIs directly (not screenshots, which the project's own
  verification notes already flag as unreliable for exact timing): jump/landing/death scale and
  angle values sampled at precise tick offsets matched their tween targets and durations; shake,
  flash, particle emitters and floating text all appeared immediately and fully cleaned themselves
  up (destroyed/reset) within their configured lifetimes with no leftover objects.

- **Task 33's "overhead" obstacle variant punishes jumping rather than requiring a duck.** The
  original request framed it as "stay low or delay your jump," which maps naturally onto a hazard
  positioned above standing height but within jump range - no slide/duck interaction needed at all,
  matching the "approximate with jump/slide timing" decision made with the user before this track
  started. `ObstacleManager.spawnObstacle` now randomly (35% chance, a placeholder mix - Task 40
  will drive this from actual difficulty) picks `'ground'` (unchanged - anchored at `groundY`,
  requires a jump) or `'overhead'` (anchored at `groundY - OVERHEAD_CLEARANCE`, 130px - comfortably
  above the player's ~102px standing hitbox but within the ~150px a jump's apex reaches). Both
  variants reuse the same per-world obstacle texture (no new art - that's Task 39's job) and the
  same hitbox-shrink forgiveness technique from the earlier hitbox note, but trim from opposite
  edges: ground obstacles trim off the top (what a clearing jump grazes), overhead ones trim off the
  bottom (what a jumping player's head grazes from below) - whichever edge is actually approached
  matters, the other edge has no gameplay reason to be forgiving. Verified live with real Arcade
  physics bodies (not just the math): a standing/running player's body does not overlap an overhead
  obstacle, the same body moved up by a jump's apex offset (150px) does overlap it, and a standing
  player still overlaps a ground obstacle exactly as before (no regression).

- **Task 34's "tall barrier" is not a literally taller obstacle - scaling one turned out to be
  unsafe.** Tried scaling an obstacle's sprite taller (`setScale(1, 1.6)`) and recomputing its
  hitbox from the scaled dimensions; tested three different ways to pass the scaled numbers into
  `body.setSize`/`setOffset`, and all three produced a hitbox disconnected from the visual - in one
  case the body ended up straddling the ground line, 16-45px below the sprite's own visual bottom
  edge. Root cause: Arcade Bodies don't proportionally resize once `setSize()` has been called
  manually (confirmed empirically - `body.width`/`height` stayed at the unscaled texture size after
  `setScale`), so every manual attempt to compensate produced a different kind of wrong answer.
  Given this project already shipped two rounds of "the hitbox doesn't match what I see" bug
  reports, shipping a third, subtler version of the same class of bug wasn't worth it for one
  hazard type. Both "tall barrier" and "wide block" are built instead from **placement** of the
  exact same, already-correct single ground obstacle: `spawnTightPair` places two 70 world-units
  apart (close enough that a jump timed for just the first one still lands on the second - the
  "requires a well-timed jump" outcome, achieved without any new hitbox math), and `spawnWideBlock`
  places three spaced 90 apart (a ~250-unit total span, wide enough to require an early, sustained
  jump rather than a single-obstacle reaction). `ObstacleManager` gained a shared `placeObstacle(x,
  variant)` used by the plain single-obstacle path and both new formations, and `canPlaceAt(x)`
  which the formations check once against their *leading* obstacle only - the point of a formation
  is that its internal spacing is intentionally tighter than the normal fairness gap, so only the
  gap *before* and *after* the whole formation needs to respect `MIN_REACTION_TIME_S`. Verified
  live: a forced pair landed at exactly 70 units apart and a forced block at exactly 90-unit
  intervals, `lastObstacleX` correctly advanced to the formation's trailing edge (not its center or
  first member), and a sampled obstacle from within a formation had the identical hitbox
  top/bottom/width already verified for Task 33's plain ground obstacle - no distortion from being
  part of a formation.

- **Task 35's "Slalom" is a ground+overhead pair, not a jump+slide combo.** The request's own
  wording was internally inconsistent ("a high hazard... jump *over* the first" - but Section 1 of
  the same request defines "high" hazards as the ones you must *not* jump over) - there's no
  self-consistent literal reading. Given `ground` (jump required) and `overhead` (jump punished)
  were already built and verified in Task 33, the natural, consistent version of "jump over one,
  then immediately get the opposite hazard" is chaining those two: `spawnSlalom` places a `ground`
  obstacle and an `overhead` one 160 world-units apart (~0.53s at base scroll speed - well inside a
  jump's ~1.0s airtime, so the jump taken for whichever comes first is still resolving when the
  second arrives), with the order (ground-then-overhead or overhead-then-ground) randomized per
  spawn. Ground-then-overhead is the harder direction - it demands jumping deliberately early on
  the first obstacle so the player is already past the overhead one's danger window by the time it
  arrives, rather than two independent, comfortably-spaced reactions. Verified live: forcing each
  order produced obstacles at exactly the expected x-positions and variants in both sequences.

- **Task 36's "gap" reuses the same formation pattern as Tasks 34-35** (`spawnGap`, alongside
  `spawnTightPair`/`spawnWideBlock`/`spawnSlalom`) - six ground obstacles 55 units apart, a ~275-unit
  span placing it right at the edge of a jump's ~1.0s airtime at base scroll speed, the widest/most
  committing of the ground formations (see the milestone-intro note for why this is a wide obstacle
  rather than a literal hole in `InfiniteGround`). Verified live: forced spawn produced exactly 6
  ground-variant obstacles at the expected 55-unit spacing, `lastObstacleX` advanced to the trailing
  edge.

- **Task 37's laser gate is a ground+overhead pair sharing one timer, not new geometry.** The two
  pieces (positioned exactly as Tasks 33-34's already-verified `ground`/`overhead` variants) together
  cover the player's *entire* reachable vertical range with no safe gap: standing/sliding hitbox
  reaches up to ~102px, a jump's apex reaches ~150px, and the two pieces' hitboxes span 0-48px and
  146-194px above ground - the unguarded band between them (48-146px, 98px tall) is narrower than
  the ~102px standing/jumping hitbox, so no player position exists where the hitbox avoids both
  pieces at once. That makes waiting for the "off" phase the *only* way through, not one jump/slide
  option among several. Cycles off (1.5s, gray tint) -> warning (0.5s, yellow) -> on (1.5s, red,
  lethal) -> back to off, reusing the same texture with only a tint change (no new art).
  `CollisionManager`'s overlap callback now reads the obstacle argument it previously ignored,
  skipping death when `variant === 'laser'` and `laserPhase !== 'on'` - overlapping a gate while it's
  off/warning is the intended safe passage, not a near-miss. A pooled obstacle now has `clearTint()`
  called on every reuse so a laser gate's tint can't leak onto a later plain obstacle drawn from the
  same pool. Verified live: a real-time poll hit this environment's documented timer-throttling
  quirk (`setInterval` ticks arriving far apart from their nominal spacing) and gave misleading
  numbers, so verification instead forced `phaseEndTime` to already-expired and called
  `updateLaserGates()` directly once per transition (the same deterministic approach used to verify
  the ground-tunneling fix) - confirmed the exact off -> warning -> on -> off cycle, the exact tint
  per phase, and that the `variant`/`laserPhase` combination read by `CollisionManager` only evaluates
  to lethal during the "on" phase.

- **Task 38's "chasing hazard" cannot literally punish lingering, because the player has no
  lingering to punish.** The request's own framing - "keeps pressure on the player so they don't
  linger in one spot" - assumes some player-controlled pacing (common in platformers where you can
  stop or move slower). This game has none: the player's x never changes, forward progress is
  automatic, and every hazard already scrolls toward the player at the same `scrollSpeed` -
  there's no such thing as falling behind. What's actually buildable, and still delivers the
  requested *feeling* (a visible, looming threat that keeps pressure on), is a hazard that spawns
  off-screen behind the player (`playerX - 600`) on an independent ~20-30s timer and closes the gap
  by moving *rightward* (`velocityX = +250`, toward the player) over a few seconds, then behaves
  exactly like a normal ground obstacle once it arrives - same jump-required hitbox, same lethality.
  Needed two small carve-outs from the shared machinery built for every other hazard: `setScrollSpeed`
  now skips any obstacle tagged `variant === 'chaser'` (the shared `-scrollSpeed` assignment would
  otherwise stomp its rightward velocity every frame), and it isn't subject to `canPlaceAt`/
  `lastObstacleX` at all, since those govern spacing between hazards placed ahead from chunk content
  - irrelevant to a hazard spawned behind the player on its own clock. Once it passes the player
  (`x >= playerX + 100`) it's recycled immediately via a new shared `recycleObstacle` helper (factored
  out of the despawn sweep, which only ever looks *behind* the camera and would never catch something
  still drifting rightward). Verified live: forced spawn landed at exactly `playerX - 600` with
  `velocityX = 250`; deterministic pass-margin checks confirmed it stays tracked mid-range and gets
  recycled (removed from both the chaser list and the collidable `obstacles` array) once past; and a
  real, unforced playthrough (no invincibility) showed the chaser closing from spawn to a genuine
  collision death in ~2.2s, matching the ~2.4s estimate (600 units / 250 units-per-second).

- **Task 39 added 4 new hand-drawn SVG textures** (`notification.svg`, `glitch.svg`, `battery.svg`,
  `wifi_off.svg`, same 48x64 dimensions and flat-shape style as the existing obstacle art) since
  this task - unlike Tasks 33-38, which all explicitly deferred re-skinning - is specifically about
  themed visuals. "Notification Pop-Up" is purely cosmetic: `spawnObstacle` now has a 20% chance to
  pass a `notification` texture override into `placeObstacle` for a plain single obstacle, no other
  change. Glitch/Battery/WiFi are non-lethal pickups, structurally modeled on `PowerupManager`
  (spawn timer hooked into `ChunkManager`'s callback, collect-on-touch, timed effect) rather than on
  `ObstacleManager`, since "touch it and something happens for a while" is a power-up shape, not an
  obstacle shape - a new `DebuffZoneManager` handles all three. Each effect required a small,
  different integration point: Glitch (control inversion) lives entirely inside `InputManager`
  (`GLITCH_STARTED`/`ENDED` flips a flag that swaps which event `emitJump`/`emitSlide` fire - a pure
  input remap, `CharacterController` never knows), Battery (world slowdown) added a `setSlowed`
  boolean to `DifficultyManager` that halves its `scrollSpeed` getter, and WiFi (disables
  power-ups) added a `setDisabled` flag to `PowerupManager` that also force-cancels any
  *currently active* effect, not just future pickups. `WorldScene` mediates the latter two (it
  already holds references to both managers) by listening for `BATTERY_LOW_STARTED/ENDED` and
  `WIFI_DEAD_STARTED/ENDED` and calling straight into the relevant setter, with cleanup on its
  existing `SHUTDOWN` hook. "Disables special abilities" was kept scoped to power-ups only - "score
  multipliers" doesn't exist as a mechanic anywhere in the codebase, and inventing one solely to have
  something for WiFi Dead to disable would be scope creep in the wrong direction. Verified live:
  forced battery/wifi collection showed `scrollSpeed` drop from 300 to exactly 150 and
  `PowerupManager`'s `disabled` flag flip to `true` respectively (the latter also *cancelled* a
  manually-forced active invincibility, confirming the force-cancel path); the debuff spawn timer
  and the notification re-skin were both confirmed through the same `ChunkManager`-callback and
  `spawnObstacle` paths already proven for every other hazard. Glitch's control-inversion couldn't
  be exercised through simulated keyboard events in this environment (a synthetic `KeyboardEvent`
  dispatch didn't register even for an unrelated, un-glitched baseline jump, confirming it's a
  pre-existing environment quirk, not a Task 39 regression) - verified by code inspection instead,
  since it's the identical `EventBus.on(event, handler, this)` /
  `EventBus.off(event, handler, this)` pattern already proven correct for every other listener in
  this codebase (`CharacterController`'s `PLAYER_JUMPED`/`PLAYER_SLID` handlers, `AudioManager`,
  `FxManager`, `UIManager`), applied to a two-line boolean flip.

- **Task 40 turned the flat, chunk-difficulty-blind formation chances from Tasks 34-37 into a
  per-difficulty table.** Before this task, `ChunkTypeDef.difficulty` (easy/medium/hard, from
  `chunkTypes.ts`) only controlled how many obstacle *slots* a chunk got (`count = difficulty`) -
  every slot then rolled the exact same flat chance of becoming a tight-pair/wide-block/slalom/gap/
  laser-gate formation regardless of tier, so a "hard" chunk was only busier, never more
  complex, than an "easy" one. `FORMATION_CHANCES` (`ObstacleManager.ts`) now maps each
  `ChunkDifficulty` to its own formation weights: easy is plain ground/overhead obstacles only (no
  formations at all), medium introduces the two simplest combos (tight pair, slalom), and hard
  keeps the exact flat values every formation used before this task (tight pair, wide block,
  slalom, gap, laser) - so hard chunks are unchanged and easy/medium are strict subsets of that
  mix, not new tuning of the formations themselves. `spawnForChunk` looks up the table by
  `chunkType.difficulty` instead of using the old always-on constants. Verified live (deterministic,
  same approach as Task 37's timer verification - `window.__game`'s dev-only exposure gives direct
  access to `WorldScene`'s real `ObstacleManager` instance, so this drove the actual spawn code
  rather than a re-implementation): 300 simulated easy chunks produced zero formations (only plain
  obstacles, ~34% overhead ratio matching the unrelated Task 33 base rate); 300 medium chunks
  produced formations in ~49% of chunk-calls with zero laser gates (matching the expected ~47% from
  a 0.27 per-slot chance across medium's 2 slots/chunk, tight-pair+slalom only); 300 hard chunks
  produced formations in ~93% of chunk-calls including laser gates (matching the expected ~93% from
  the full 0.59 per-slot chance across hard's 3 slots/chunk) - confirming the three tiers are now
  actually distinct, not just different obstacle counts of the same mix.

- **Fixed `WIDE_BLOCK` and `GAP` (Tasks 34/36) being mathematically impossible to clear** (user
  report, live playtesting: "too many straight obstacles makes it impossible to pass, it looks like
  the max possible is straight 2"). Root cause: their spacing was chosen assuming a single jump's
  full ~1.0s airtime translates directly to clearable world-distance (airtime x scrollSpeed). It
  doesn't - a jump only clears a ground obstacle's 48px hitbox for the portion of its arc where
  `JUMP_VELOCITY*t - 0.5*GRAVITY*t^2 >= 48`, which solves to a ~0.82s window, not the full ~1.0s
  (the first/last ~0.09s of a jump, right after takeoff and right before landing, are still too low
  to clear a ground obstacle). At base scroll speed that's a hard ~247-unit ceiling on how wide a
  "clear it all with one jump" formation can ever be. `WIDE_BLOCK`'s old spacing (90, three
  obstacles, 211-unit span) and `GAP`'s (55, six obstacles, 306-unit span) were verified - via a
  standalone Node numerical simulation using the game's real physics constants (gravity 1200,
  obstacle hitbox 48, confirmed by reading a live obstacle's body), not just re-derived math - to
  have **zero valid jump-timing solutions at all** for `WIDE_BLOCK` and to exceed the ceiling
  outright for `GAP`: genuinely impossible, not merely hard. Re-tuned with real margin rather than
  scraping the ceiling: `WIDE_BLOCK_SPACING` 90 -> 45 (121-unit span, ~230ms of valid jump-timing
  window) and `GAP_COUNT`/`GAP_SPACING` 6/55 -> 4/35 (136-unit span, ~180ms window) - both re-checked
  with the same simulation before touching code, then cross-validated live against the real Arcade
  physics bodies (not the analytical model) by scanning for a collision-free jump-timing offset
  using each formation's actual spawned hitbox width/height/spacing: both formations found one
  (`WIDE_BLOCK` at offset 115, `GAP` at offset 123), confirming the fix works against the real
  engine, not just the standalone model. `SLALOM_GAP` (160, a ground+overhead pair rather than a
  same-height multi-obstacle run, so a different constraint applies) was checked with an analogous
  simulation and already had a genuine solution in both orderings - left unchanged.
