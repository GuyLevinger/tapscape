import Phaser from 'phaser';
import type { CharacterController } from '@/engine/CharacterController';
import { LegbookMechanic } from '@/engine/signatureMechanics/LegbookMechanic';
import { SlowgramMechanic } from '@/engine/signatureMechanics/SlowgramMechanic';
import { ChatZapMechanic } from '@/engine/signatureMechanics/ChatZapMechanic';

export interface SignatureMechanicContext {
  character: CharacterController;
  groundY: number;
  // Live reference to the active obstacle bodies (e.g. for a mechanic like
  // ChatZap's "incoming messages push nearby obstacles"). The array
  // instance itself doesn't change, only its contents each frame - it's the
  // same array ObstacleManager.group returns.
  getObstacles: () => Phaser.Physics.Arcade.Image[];
}

// A world's signature mechanic (Legbook's obscuring reactions, Slowgram's
// camera flashes, etc.) is structurally different per world - some are
// visual overlays, some push obstacles, some alter input. Rather than model
// all of them, the engine just gives each world a per-frame update hook;
// the mechanic's actual behavior is entirely world-owned code.
export interface SignatureMechanic {
  update(delta: number): void;
  destroy?(): void;
}

// Per the HLD's "world plugin model": each world is a config package for
// obstacles/collectibles/power-ups/signature mechanic, and the engine
// contains no world-specific logic. Unset fields fall back to the shared
// placeholder assets, so a world with no entry here (or a partial one)
// plays identically to the generic engine content.
export interface WorldContentDef {
  obstacleTextureKey: string;
  coinTextureKey: string;
  powerupTextureKey: string;
  powerupName: string;
  createSignatureMechanic?: (scene: Phaser.Scene, ctx: SignatureMechanicContext) => SignatureMechanic;
}

export const DefaultWorldContent: WorldContentDef = {
  obstacleTextureKey: 'obstacle',
  coinTextureKey: 'coin',
  powerupTextureKey: 'powerup',
  powerupName: 'Shield',
};

// Per-world overrides, merged over DefaultWorldContent by getWorldContent().
// Worlds fill these in (textures, power-up name, signature mechanic) as
// part of their own task (22-26) rather than here.
export const WorldContent: Record<string, Partial<WorldContentDef>> = {};

WorldContent.legbook = {
  obstacleTextureKey: 'legbook_obstacle',
  coinTextureKey: 'legbook_coin',
  powerupTextureKey: 'legbook_powerup',
  powerupName: 'Verified Badge',
  createSignatureMechanic: (scene, ctx) => new LegbookMechanic(scene, ctx),
};

WorldContent.slowgram = {
  obstacleTextureKey: 'slowgram_obstacle',
  coinTextureKey: 'slowgram_coin',
  powerupTextureKey: 'slowgram_powerup',
  powerupName: 'Perfect Filter',
  createSignatureMechanic: (scene, ctx) => new SlowgramMechanic(scene, ctx),
};

WorldContent.chatzap = {
  obstacleTextureKey: 'chatzap_obstacle',
  coinTextureKey: 'chatzap_coin',
  powerupTextureKey: 'chatzap_powerup',
  powerupName: 'Mute Chat',
  createSignatureMechanic: (scene, ctx) => new ChatZapMechanic(scene, ctx),
};

export function getWorldContent(worldKey: string): WorldContentDef {
  return { ...DefaultWorldContent, ...WorldContent[worldKey] };
}
