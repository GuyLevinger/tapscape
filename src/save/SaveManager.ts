export interface WorldSaveData {
  highScore: number;
  bestDistance: number;
}

// Lifetime stats, distinct from per-world bests and the spendable totalCoins balance (which goes
// down when cosmetics/worlds are purchased) - achievements need numbers that only ever go up.
export interface LifetimeStats {
  totalRuns: number;
  totalCoinsEarned: number;
  bestScoreOverall: number;
  bestDistanceOverall: number;
  bestCoinsInRun: number;
  bestSurvivalMs: number;
}

export interface SaveData {
  version: 1;
  totalCoins: number;
  worlds: Record<string, WorldSaveData>;
  worldsUnlocked: string[];
  cosmeticsUnlocked: string[];
  cosmeticsEquipped: Record<string, string>;
  achievementsUnlocked: string[];
  stats: LifetimeStats;
  settings: { musicVolume: number; sfxVolume: number; muted: boolean };
}

const STORAGE_KEY = 'tapscape-save';

function defaultSaveData(): SaveData {
  return {
    version: 1,
    totalCoins: 0,
    worlds: {},
    worldsUnlocked: ['legbook'],
    cosmeticsUnlocked: [],
    cosmeticsEquipped: {},
    achievementsUnlocked: [],
    stats: {
      totalRuns: 0,
      totalCoinsEarned: 0,
      bestScoreOverall: 0,
      bestDistanceOverall: 0,
      bestCoinsInRun: 0,
      bestSurvivalMs: 0,
    },
    settings: { musicVolume: 1, sfxVolume: 1, muted: false },
  };
}

class SaveManagerImpl {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaultSaveData();
      }
      return { ...defaultSaveData(), ...(JSON.parse(raw) as Partial<SaveData>) };
    } catch {
      return defaultSaveData();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // LocalStorage unavailable (private browsing, quota exceeded) - progress
      // still works for the current session, it just won't survive a reload.
    }
  }

  getWorldStats(worldKey: string): WorldSaveData {
    return this.data.worlds[worldKey] ?? { highScore: 0, bestDistance: 0 };
  }

  hasPlayedWorld(worldKey: string): boolean {
    return worldKey in this.data.worlds;
  }

  get worldsUnlockedIds(): string[] {
    return [...this.data.worldsUnlocked];
  }

  get totalCoins(): number {
    return this.data.totalCoins;
  }

  get stats(): LifetimeStats {
    return { ...this.data.stats };
  }

  addCoins(amount: number): void {
    if (amount <= 0) {
      return;
    }
    this.data.totalCoins += amount;
    this.persist();
  }

  get settings(): SaveData['settings'] {
    return { ...this.data.settings };
  }

  setMuted(muted: boolean): void {
    this.data.settings.muted = muted;
    this.persist();
  }

  setMusicVolume(volume: number): void {
    this.data.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.persist();
  }

  setSfxVolume(volume: number): void {
    this.data.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.persist();
  }

  isCosmeticUnlocked(id: string): boolean {
    return this.data.cosmeticsUnlocked.includes(id);
  }

  unlockCosmetic(id: string): void {
    if (!this.data.cosmeticsUnlocked.includes(id)) {
      this.data.cosmeticsUnlocked.push(id);
      this.persist();
    }
  }

  getEquippedCosmetic(category: string): string | undefined {
    return this.data.cosmeticsEquipped[category];
  }

  equipCosmetic(category: string, id: string): void {
    this.data.cosmeticsEquipped[category] = id;
    this.persist();
  }

  get cosmeticsUnlockedIds(): string[] {
    return [...this.data.cosmeticsUnlocked];
  }

  isAchievementUnlocked(id: string): boolean {
    return this.data.achievementsUnlocked.includes(id);
  }

  unlockAchievement(id: string): void {
    if (!this.data.achievementsUnlocked.includes(id)) {
      this.data.achievementsUnlocked.push(id);
      this.persist();
    }
  }

  spendCoins(amount: number): boolean {
    if (amount <= 0 || this.data.totalCoins < amount) {
      return false;
    }
    this.data.totalCoins -= amount;
    this.persist();
    return true;
  }

  recordRun(
    worldKey: string,
    score: number,
    distance: number,
    coinsEarned: number,
    survivalMs: number,
  ): { highScore: number; isNewHighScore: boolean } {
    const current = this.getWorldStats(worldKey);
    const isNewHighScore = score > current.highScore;

    this.data.worlds[worldKey] = {
      highScore: Math.max(current.highScore, score),
      bestDistance: Math.max(current.bestDistance, distance),
    };
    this.data.totalCoins += coinsEarned;

    const stats = this.data.stats;
    stats.totalRuns += 1;
    stats.totalCoinsEarned += coinsEarned;
    stats.bestScoreOverall = Math.max(stats.bestScoreOverall, score);
    stats.bestDistanceOverall = Math.max(stats.bestDistanceOverall, distance);
    stats.bestCoinsInRun = Math.max(stats.bestCoinsInRun, coinsEarned);
    stats.bestSurvivalMs = Math.max(stats.bestSurvivalMs, survivalMs);

    this.persist();

    return { highScore: this.data.worlds[worldKey].highScore, isNewHighScore };
  }

  reset(): void {
    this.data = defaultSaveData();
    this.persist();
  }
}

export const SaveManager = new SaveManagerImpl();
