# TapScape — High-Level Technical Design (HLD)

> Transcribed from `TapScape_High_Level_Technical_Design_HLD.pdf` for repo searchability. Source
> PDF is the canonical original if any discrepancy arises.

### 1. Objectives

Run entirely in the browser; zero backend; maintain 60 FPS; support desktop and mobile; allow
new worlds with minimal code; separate engine from content; use LocalStorage for persistence.

### 2. Technology Stack

- Engine: Phaser.js 3
- Language: TypeScript
- Build: Vite
- Rendering: WebGL (Canvas fallback)
- Storage: Browser LocalStorage
- Deployment: Static hosting

> **Implementation note (see root `CLAUDE.md`):** the project uses **Phaser 4** instead of 3 (see
> `docs/gdd-1-vision.md` note). Everything else in this stack matches as specified.

### 3. High-Level Architecture

Browser → Phaser Game → Boot/Loader + Save Manager → Home Scene → World Scene
containing Input, Character, World, Chunk, Obstacle, Collectible, Power-up, Collision, Score, Audio
and UI managers.

### 4. Scene Architecture

- **Boot**: initialization and asset loading.
- **Home**: phone UI and world selection.
- **World**: gameplay.
- **Results**: score, distance, coins, unlocks, retry and home.

### 5. Gameplay Systems

InputManager, CharacterController, CameraController, ChunkGenerator, WorldManager,
ObstacleManager, CollectibleManager, PowerupManager, CollisionManager, ScoreManager,
AudioManager, SaveManager and UIManager. Each has a single responsibility and communicates
through events.

### 6. Event Bus

`RUN_STARTED`, `PLAYER_JUMPED`, `PLAYER_SLID`, `COIN_COLLECTED`, `POWERUP_PICKED`,
`OBSTACLE_HIT`, `PLAYER_DIED`, `WORLD_UNLOCKED`.

### 7. Folder Structure

`src/engine`, `worlds`, `assets`, `audio`, `ui`, `config`, `save`, `data`.

### 8. World Plugin Model

Each world is a configuration package containing theme, music, obstacles, collectibles, signature
mechanic, power-ups and chunk definitions. The engine contains no world-specific logic.

### 9. Procedural Generation

Chunks define length, difficulty, entry/exit conditions and allowed successors. Generator selects
valid chunks, validates layouts and prevents impossible sequences.

### 10. Save System

LocalStorage JSON storing settings, coins, unlocked worlds, best scores, best distance,
achievements and cosmetics.

### 11. Performance

60 FPS target, under 50 ms input latency, under 1 second world loading. Uses object pooling,
chunk recycling, sprite atlases and lazy loading.

### 12. Physics

Phaser Arcade Physics with simple player collision, static obstacles and overlap collectibles.

### 13. Audio

Music, sound effects, volume, mute and persistence.

### 14. Input

Desktop: Space and Down Arrow. Mobile: Tap and Swipe Down. Inputs normalize to Jump and
Slide actions.

### 15. Configuration

Gameplay tuning lives in configuration files: speed, gravity, jump force, slide duration, coin values,
power-up durations, difficulty curve and chunk weights.

### 16. Future Extensions

Cloud saves, leaderboards, daily challenges, more worlds, ghost runs, analytics, ads, in-app
purchases and seasonal events.

### 17. Architecture Principles

Engine and content are separated. Systems are event-driven and single-purpose. Worlds are
data-driven. No backend is required for the MVP.
