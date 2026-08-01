# TapScape — Game Design Document
## Chapter 1: Vision & Core Product Definition

> Transcribed from `TapScape_GDD_Chapter_1_Full.pdf` for repo searchability. Source PDFs are the
> canonical originals if any discrepancy arises.

### 1. Executive Summary

TapScape is a browser-first endless runner that takes place entirely inside a smartphone.

Instead of presenting players with menus, buttons and game modes, the game itself is a
smartphone. Every application on the home screen represents a different parody-themed endless
runner world inspired by familiar mobile apps.

Players immediately understand the concept because they already understand smartphones.

Open an app. Start running. Have fun.

No tutorial. No story exposition. No complex controls.

The objective is to build an endlessly replayable game that can be enjoyed in sessions ranging from
thirty seconds to thirty minutes.

Although every world shares the same movement mechanics, each introduces its own gameplay
twist through unique obstacles, collectibles, visuals, music and signature mechanics.

TapScape is designed for browser play using Phaser.js, allowing instant access without downloads
or installation.

### 2. Vision Statement

Turn the smartphone everyone already knows into the most fun endless playground they've ever
played.

The player should smile before their first run even begins.

Recognition is part of the gameplay. The home screen feels intuitive because players already
understand smartphones.

### 3. Product Goals

**Primary Goals**
- Create a game anyone can begin playing within five seconds.
- Deliver highly polished endless runner mechanics.
- Encourage "one more run" behavior.
- Reward mastery rather than grinding.
- Create memorable parody worlds.
- Establish TapScape as an expandable franchise.

**Secondary Goals**
- Short play sessions.
- Browser-first.
- Accessible to children and adults.
- Expandable through new apps and worlds.

**Non Goals**
- Multiplayer
- Online accounts
- Cloud saves
- Story campaign
- Crafting
- Skill trees
- Backend services

### 4. Product Philosophy

Every design decision should support:
- Immediate Accessibility
- Familiarity Through Parody
- Mechanical Simplicity
- Replayability
- Short Sessions

### 5. Target Audience

Primary: Ages 10-35, casual gamers, students, office workers, parents.

Secondary: Children, streamers, speedrunners and achievement hunters.

### 6. Player Personas

- **Emma (14)**: Plays during school breaks and wants cosmetics and high scores.
- **Daniel (27)**: Plays between meetings and prefers quick sessions.
- **Sarah (34)**: Plays with her children and values simplicity.

### 7. Design Pillars

1. **Instant Fun**: No tutorials or waiting.
2. **Recognizable Humor**: Exaggerated digital experiences.
3. **Mastery**: Simple controls with a high skill ceiling.
4. **Personality**: The phone expresses emotion through animation.
5. **Consistency**: Same controls across every world.

### 8. Core Gameplay Loop

Launch Game → Phone Home Screen → Choose App → Run → Jump & Slide → Avoid Obstacles
→ Collect Rewards → Die → Results → Coins & XP → Unlock Progress → Return Home → Repeat.

### 9. Success Criteria

Players should understand the game within five seconds, complete several runs during their first
session, unlock rewards quickly and be motivated to try additional worlds.

### 10. Technical Vision

- Platform: HTML5
- Engine: Phaser.js 3
- Backend: None (MVP)
- Persistence: Browser LocalStorage
- Target: 60 FPS
- Supported Devices: Desktop, Mobile and Tablets.

> **Implementation note (see root `CLAUDE.md`):** the project actually uses **Phaser 4** — the
> latest version at implementation time, released after this doc was written. No Phaser-3-specific
> API is relied upon.

### 11. Why Phaser.js

Phaser provides excellent HTML5 performance, rapid iteration, lightweight deployment, strong
browser compatibility and no dependency on app stores.

### 12. Guiding Principle

Whenever a design decision is uncertain, prefer the option that makes the game faster to
understand, more fun in the first minute, easier to replay, simpler to control and richer in personality.
