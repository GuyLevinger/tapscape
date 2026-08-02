import { Worlds } from './worlds';
import { SaveManager } from '@/save/SaveManager';

export interface AchievementReward {
  coins?: number;
  cosmeticId?: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  reward?: AchievementReward;
  isComplete: () => boolean;
}

// Per the GDD: "Around 15-20 achievements reward exploration ... Achievements unlock cosmetics."
// The 8 non-default cosmetics from Task 27 (src/data/cosmetics.ts) are each tied to one
// milestone-style achievement below, so players have a free path to every cosmetic alongside the
// coin-purchase path in CustomizeScene; the rest hand out a coin bonus instead.
export const Achievements: AchievementDef[] = [
  {
    id: 'first_run',
    name: 'First Run',
    description: 'Complete a run.',
    reward: { coins: 25 },
    isComplete: () => SaveManager.stats.totalRuns >= 1,
  },
  {
    id: 'score_5000',
    name: 'High Scorer',
    description: 'Reach a score of 5,000 in a single run.',
    reward: { cosmeticId: 'phoneSkin_crimson' },
    isComplete: () => SaveManager.stats.bestScoreOverall >= 5000,
  },
  {
    id: 'score_10000',
    name: 'Score Legend',
    description: 'Reach a score of 10,000 in a single run.',
    reward: { cosmeticId: 'phoneSkin_gold' },
    isComplete: () => SaveManager.stats.bestScoreOverall >= 10000,
  },
  {
    id: 'coins_100',
    name: 'Coin Collector',
    description: 'Collect 100 coins in total.',
    reward: { cosmeticId: 'wallpaper_sunset' },
    isComplete: () => SaveManager.stats.totalCoinsEarned >= 100,
  },
  {
    id: 'coins_500',
    name: 'Coin Hoarder',
    description: 'Collect 500 coins in total.',
    reward: { cosmeticId: 'wallpaper_ocean' },
    isComplete: () => SaveManager.stats.totalCoinsEarned >= 500,
  },
  {
    id: 'coins_1000',
    name: 'Coin Tycoon',
    description: 'Collect 1,000 coins in total.',
    reward: { cosmeticId: 'wallpaper_forest' },
    isComplete: () => SaveManager.stats.totalCoinsEarned >= 1000,
  },
  {
    id: 'survive_2_minutes',
    name: 'Marathoner',
    description: 'Survive for two minutes in a single run.',
    reward: { cosmeticId: 'phoneSkin_mint' },
    isComplete: () => SaveManager.stats.bestSurvivalMs >= 2 * 60 * 1000,
  },
  {
    id: 'survive_5_minutes',
    name: 'Iron Lungs',
    description: 'Survive for five minutes in a single run.',
    reward: { cosmeticId: 'phoneSkin_violet' },
    isComplete: () => SaveManager.stats.bestSurvivalMs >= 5 * 60 * 1000,
  },
  {
    id: 'unlock_every_world',
    name: 'App Hoarder',
    description: 'Unlock every world.',
    reward: { cosmeticId: 'wallpaper_bubblegum' },
    isComplete: () => SaveManager.worldsUnlockedIds.length >= Worlds.length,
  },
  {
    id: 'play_10_runs',
    name: 'Regular',
    description: 'Complete 10 runs.',
    reward: { coins: 100 },
    isComplete: () => SaveManager.stats.totalRuns >= 10,
  },
  {
    id: 'coins_in_one_run_50',
    name: 'Big Haul',
    description: 'Collect 50 coins in a single run.',
    reward: { coins: 50 },
    isComplete: () => SaveManager.stats.bestCoinsInRun >= 50,
  },
  {
    id: 'distance_2500',
    name: 'Long Hauler',
    description: 'Travel 2,500 distance in a single run.',
    reward: { coins: 50 },
    isComplete: () => SaveManager.stats.bestDistanceOverall >= 2500,
  },
  {
    id: 'own_3_cosmetics',
    name: 'Fashionista',
    description: 'Own 3 cosmetic items.',
    reward: { coins: 50 },
    isComplete: () => SaveManager.cosmeticsUnlockedIds.length >= 3,
  },
  ...Worlds.map((world) => ({
    id: `play_${world.key}`,
    name: `Try ${world.name}`,
    description: `Play a run in ${world.name}.`,
    reward: { coins: 25 },
    isComplete: () => SaveManager.hasPlayedWorld(world.key),
  })),
];

export function getAchievement(id: string): AchievementDef | undefined {
  return Achievements.find((achievement) => achievement.id === id);
}
