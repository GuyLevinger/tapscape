# TapScape — Game Design Document
## Chapter 3: MVP Progression & Economy

> Transcribed from `TapScape_GDD_Chapter_3_MVP.pdf` for repo searchability. Source PDFs are the
> canonical originals if any discrepancy arises.

### 1. Chapter Overview

The MVP progression system is intentionally lightweight. Every feature reinforces the core endless
runner experience while keeping the game fully offline.

All progress is stored locally using the browser's LocalStorage. There are no user accounts, cloud
saves or backend services.

### 2. Design Philosophy

Progression exists to reward play, not to create grind.

If a feature does not improve the first 30 minutes of gameplay, it does not belong in the MVP.

### 3. Local Progress

The game stores:
- Highest score per world
- Longest distance per world
- Total coins
- Worlds unlocked
- Cosmetics unlocked
- Game settings

### 4. Coins

Coins are the only currency.

Earned by collecting them during runs, reaching distance milestones, finding secrets and
completing simple achievements.

Spent on unlocking worlds and cosmetics.

### 5. World Unlocks

Players begin with one world. Additional worlds are purchased with coins. Locked apps appear as
'Not Installed' until unlocked.

### 6. Cosmetics

Initial MVP content includes five phone skins, five wallpapers, three running animations and three
victory animations. Cosmetics never affect gameplay.

### 7. Achievements

Around 15-20 achievements reward exploration, such as First Run, Reach 5,000 points, Collect 100
coins, Unlock every world and Survive for two minutes. Achievements unlock cosmetics.

### 8. Not Included

No accounts, profiles, XP, levels, daily rewards, weekly missions, login streaks, cloud saves,
leaderboards, premium currency or seasonal events.

### 9. Future Expansion

Future versions may add accounts, cloud saves, leaderboards, daily challenges, friends, seasons,
live events and cross-device sync.

### 10. Summary

The MVP progression system is intentionally minimal, focusing development on polished gameplay
while still providing meaningful goals through worlds, cosmetics and achievements.
