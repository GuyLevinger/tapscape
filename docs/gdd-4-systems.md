# TapScape — Game Design Document
## Chapter 4: Core Gameplay Systems

> Transcribed from `TapScape_GDD_Chapter_4.pdf` for repo searchability. Source PDFs are the
> canonical originals if any discrepancy arises.

### 1. Chapter Overview

This chapter defines the gameplay systems that power every run. It specifies the run lifecycle,
movement, controls, physics, procedural generation, scoring, difficulty scaling, collisions and
power-up behavior. These systems are shared by every world.

### 2. Gameplay Philosophy

Gameplay should always feel immediate, responsive, fair, fast and skill-based. Whenever a player
loses, they should immediately understand why. Difficulty comes from mastery rather than
randomness.

### 3. Run Lifecycle

Tap an app → Zoom into the world → Brief ready animation → Automatic running begins →
Difficulty increases continuously → Collision ends the run → Results screen → Return to the home
screen.

### 4. Controls

**Desktop:**
- Space = Jump
- Down Arrow = Slide
- Mouse = UI interaction

**Mobile:**
- Tap = Jump
- Swipe Down = Slide

There are no virtual joysticks, attack buttons or camera controls.

### 5. Movement

The character runs automatically. Players cannot stop, move backwards or control speed. Player
input is limited to jumping and sliding.

### 6. Jump & Slide

Jump must feel immediate and consistent. Slide lowers the collision box for approximately 0.7
seconds and cannot be cancelled. Future versions may introduce a double jump.

### 7. Collision Rules

Colliding with hazards immediately ends the run unless protected by an active power-up. Every
obstacle must always be avoidable.

### 8. Procedural Generation

Levels are assembled from reusable gameplay chunks. Each chunk defines its length, difficulty,
entry and exit conditions, and compatible neighboring chunks. Impossible layouts must never be
generated.

### 9. Difficulty Scaling

Difficulty increases gradually through player speed, obstacle density, branching paths and the
frequency of each world's signature mechanic. The transition should always feel smooth.

### 10. Scoring

Score is primarily based on survival distance with bonus points from coins, obstacle streaks and
power-ups. Players should always understand why their score increased.

### 11. Coins & Collectibles

Coins appear in recognizable formations such as lines, arcs, staircases and risk/reward paths.
Their placement should naturally teach movement and reward skilled play.

### 12. Obstacles

Obstacle placement follows strict fairness rules. Impossible jumps, hidden hazards, blind collisions
and conflicting mechanics are never allowed.

### 13. Power-ups

Only one power-up may be active at a time.

Universal power-ups:
- Fast Charger
- RAM Boost
- Airplane Mode
- Do Not Disturb
- Premium

Power-ups should appear approximately every 60 to 90 seconds with slight randomness.

### 14. Signature Mechanics

- Legbook: Floating reactions obscure visibility.
- Slowgram: Camera flashes.
- ChatZap: Messages push obstacles.
- MeTube: Unskippable advertisements interrupt gameplay.
- WrongTurn: Roads split into multiple lanes.

### 15. Death & Results

Deaths should feel humorous rather than frustrating, using expressive animations. The results
screen displays score, best score, distance, coins earned and any newly unlocked cosmetics, with
Retry and Home buttons.

### 16. Performance Targets

Target 60 FPS, input latency below 50 ms, world loading under one second and stable memory
usage throughout long play sessions.

### 17. Phaser Architecture

Gameplay is organized into reusable systems:
- Input Manager
- Character Controller
- World Manager
- Chunk Generator
- Obstacle Manager
- Collectible Manager
- Power-up Manager
- Collision Manager
- Score Manager
- Save Manager
- Audio Manager

Each system has a single responsibility and is designed for easy expansion.

### 18. Chapter Summary

This chapter defines the mechanical foundation of TapScape. These systems provide a consistent
gameplay framework that every current and future world will build upon.
