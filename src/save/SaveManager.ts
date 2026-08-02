export interface WorldSaveData {
  highScore: number;
  bestDistance: number;
}

export interface SaveData {
  version: 1;
  totalCoins: number;
  worlds: Record<string, WorldSaveData>;
  worldsUnlocked: string[];
  cosmeticsUnlocked: string[];
  cosmeticsEquipped: Record<string, string>;
  achievementsUnlocked: string[];
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

  get totalCoins(): number {
    return this.data.totalCoins;
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
  ): { highScore: number; isNewHighScore: boolean } {
    const current = this.getWorldStats(worldKey);
    const isNewHighScore = score > current.highScore;

    this.data.worlds[worldKey] = {
      highScore: Math.max(current.highScore, score),
      bestDistance: Math.max(current.bestDistance, distance),
    };
    this.data.totalCoins += coinsEarned;
    this.persist();

    return { highScore: this.data.worlds[worldKey].highScore, isNewHighScore };
  }

  reset(): void {
    this.data = defaultSaveData();
    this.persist();
  }
}

export const SaveManager = new SaveManagerImpl();
