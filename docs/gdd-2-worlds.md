# TapScape — Game Design Document
## Chapter 2: World Design & Gameplay Content

> Transcribed from `TapScape_GDD_Chapter_2.pdf` for repo searchability. Source PDFs are the
> canonical originals if any discrepancy arises.

### 1. Chapter Overview

This chapter defines the gameplay content that players interact with during every run.

It specifies the playable character, world structure, individual worlds, obstacles, collectibles,
power-ups, gameplay variation and difficulty progression. These systems form the heart of
TapScape.

### 2. The Main Character

The player controls a living smartphone that serves as the mascot of the TapScape universe. The
character never speaks and communicates entirely through expressive animation.

- **Personality**: Curious, energetic, slightly clumsy, optimistic, playful and expressive.
- **Physical design**: Smartphone body, flexible arms and legs, expressive eyes, eyebrows and a
  small mouth, with the screen acting as the face.
- **Animation states**: Idle, Running, Jump, Slide, Hit and Victory.

### 3. World Philosophy

Every world represents an application installed on the phone. All worlds share controls, physics,
camera, speed progression, scoring and character, while changing theme, colors, music, obstacles,
background, collectibles and a signature mechanic.

### 4. World Structure

- Phase 1: Easy introduction.
- Phase 2: Normal gameplay.
- Phase 3: Advanced gameplay.
- Phase 4: Endless mode with continuously increasing difficulty.

### 5. World 1 — Legbook

- Theme: Social media parody.
- Environment: Posts, reactions, profile cards, feeds and notifications.
- Signature mechanic: Floating reaction bubbles partially obscure visibility.
- Obstacles: Ads, comment storms, notification banners, spam, fake news and livestream popups.
- Collectibles: Likes, hearts, followers and coins.
- Power-up: Verified Badge.
- Background events: Friend requests, birthdays and trending topics.
- Easter eggs: Fake posts and meme references.

### 6. World 2 — Slowgram

- Theme: Photography and influencers.
- Environment: Cameras, frames, hashtags and selfie rings.
- Signature mechanic: Camera flashes briefly blind the player.
- Obstacles: Selfie sticks, filters, ring lights, stories and sponsored posts.
- Collectibles: Followers, stars, hearts and coins.
- Power-up: Perfect Filter.

### 7. World 3 — ChatZap

- Theme: Messaging.
- Environment: Speech bubbles, typing indicators and emoji explosions.
- Signature mechanic: Incoming messages push nearby obstacles.
- Obstacles: Voice notes, spam, typing indicators, group notifications and emoji floods.
- Collectibles: Messages, stickers, emojis and coins.
- Power-up: Mute Chat.

### 8. World 4 — MeTube

- Theme: Video streaming.
- Environment: Thumbnails, subscribe buttons and recommendations.
- Signature mechanic: Unskippable ads briefly interrupt gameplay.
- Obstacles: Ads, buffering wheels, copyright flags, loading bars and dislike storms.
- Collectibles: Subscribers, views, coins and play buttons.
- Power-up: Premium.

### 9. World 5 — WrongTurn

- Theme: Navigation.
- Environment: Roads, signs, traffic lights and construction.
- Signature mechanic: Roads split into multiple lanes requiring quick choices.
- Obstacles: Traffic, detours, roadblocks, speed bumps and barriers.
- Collectibles: Map pins, fuel, stars and coins.
- Power-up: AutoPilot.

### 10. Universal Obstacles

Low battery warnings, broken chargers, cracked screens, pop-up ads, notification floods, loading
bars, viruses, captchas, lag spikes and error dialogs.

### 11. Collectible System

Coins are the primary currency. XP levels the player. Battery grants temporary bonuses. Wi-Fi
increases score multipliers. Memory Chips are rare crafting currency. Secret App Icons unlock
future content.

### 12. Power-up System

Universal power-ups: Fast Charger, RAM Boost, Airplane Mode, Do Not Disturb and Premium.
World-specific power-ups: Verified Badge, Perfect Filter, Mute Chat and AutoPilot. Only one
power-up may be active at a time.

### 13. Difficulty Philosophy

Difficulty increases through speed, obstacle combinations, signature mechanic frequency, reduced
reaction time and branching decisions. Procedural validation prevents impossible layouts.

### 14. Content Expansion Strategy

Future worlds may include Shoply, Beatify, WorkFlow, SnapZap, MailBoxx, CloudBox, FoodDash,
WeatherWise, FitTrack and GameHub. Every new world should have a recognizable parody, one
signature mechanic, unique obstacles and collectibles while preserving identical controls.

### End of Chapter 2

This chapter defines the gameplay content that gives TapScape its identity. Future chapters will
build on these systems with progression, economy, procedural generation and technical
implementation.
