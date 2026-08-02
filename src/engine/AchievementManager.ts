import { Achievements, type AchievementDef } from '@/data/achievements';
import { SaveManager } from '@/save/SaveManager';

/** Scans all achievement definitions against current save stats, unlocking and applying the
 * reward for any that just became complete. Safe to call repeatedly (e.g. after every run, or
 * after a world/cosmetic purchase) - already-unlocked achievements are skipped. */
export function checkForNewAchievements(): AchievementDef[] {
  const newlyUnlocked: AchievementDef[] = [];

  for (const achievement of Achievements) {
    if (SaveManager.isAchievementUnlocked(achievement.id)) {
      continue;
    }
    if (!achievement.isComplete()) {
      continue;
    }

    SaveManager.unlockAchievement(achievement.id);
    if (achievement.reward?.coins) {
      SaveManager.addCoins(achievement.reward.coins);
    }
    if (achievement.reward?.cosmeticId) {
      SaveManager.unlockCosmetic(achievement.reward.cosmeticId);
    }
    newlyUnlocked.push(achievement);
  }

  return newlyUnlocked;
}
