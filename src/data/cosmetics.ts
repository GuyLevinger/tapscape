import { SaveManager } from '@/save/SaveManager';

export type CosmeticCategory = 'phoneSkin' | 'wallpaper';

export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  name: string;
  color: number;
  price: number;
}

export const CosmeticCategories: { key: CosmeticCategory; label: string }[] = [
  { key: 'phoneSkin', label: 'Phone Skin' },
  { key: 'wallpaper', label: 'Wallpaper' },
];

// Per the GDD: "five phone skins, five wallpapers, three running animations and three victory
// animations." The engine has no sprite-frame animation system (CharacterController only ever
// shows one texture, tinted per state - see TASKS.md's Task 20 note for the same situation with
// power-ups), so running/victory "animations" have no real surface to attach cosmetic content to
// and are dropped rather than faked as more tint swaps. Phone skin and wallpaper map cleanly onto
// existing render surfaces (the Home screen's bezel color and background color), so those two
// categories are implemented as specified. The first item in each category is the free starting
// default; the rest are purchased with coins.
export const Cosmetics: CosmeticItem[] = [
  { id: 'phoneSkin_slate', category: 'phoneSkin', name: 'Slate', color: 0x2a2d34, price: 0 },
  { id: 'phoneSkin_crimson', category: 'phoneSkin', name: 'Crimson', color: 0xb91c1c, price: 150 },
  { id: 'phoneSkin_gold', category: 'phoneSkin', name: 'Gold', color: 0xd4af37, price: 150 },
  { id: 'phoneSkin_mint', category: 'phoneSkin', name: 'Mint', color: 0x34d399, price: 150 },
  { id: 'phoneSkin_violet', category: 'phoneSkin', name: 'Violet', color: 0x8b5cf6, price: 150 },

  { id: 'wallpaper_midnight', category: 'wallpaper', name: 'Midnight', color: 0x111318, price: 0 },
  { id: 'wallpaper_sunset', category: 'wallpaper', name: 'Sunset', color: 0x7c2d12, price: 150 },
  { id: 'wallpaper_ocean', category: 'wallpaper', name: 'Ocean', color: 0x0c4a6e, price: 150 },
  { id: 'wallpaper_forest', category: 'wallpaper', name: 'Forest', color: 0x14532d, price: 150 },
  { id: 'wallpaper_bubblegum', category: 'wallpaper', name: 'Bubblegum', color: 0x9d174d, price: 150 },
];

export function getCosmetic(id: string): CosmeticItem | undefined {
  return Cosmetics.find((item) => item.id === id);
}

export function getCosmeticsByCategory(category: CosmeticCategory): CosmeticItem[] {
  return Cosmetics.filter((item) => item.category === category);
}

export function defaultCosmeticId(category: CosmeticCategory): string {
  return getCosmeticsByCategory(category).find((item) => item.price === 0)?.id ?? '';
}

export function isCosmeticAvailable(item: CosmeticItem): boolean {
  return item.price === 0 || SaveManager.isCosmeticUnlocked(item.id);
}

/** Resolves the color of whatever is currently equipped in a category, falling back to the free default. */
export function getEquippedColor(category: CosmeticCategory): number {
  const equippedId = SaveManager.getEquippedCosmetic(category) ?? defaultCosmeticId(category);
  return getCosmetic(equippedId)?.color ?? getCosmetic(defaultCosmeticId(category))?.color ?? 0xffffff;
}
