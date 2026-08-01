import Phaser from 'phaser';

export const GameEvents = {
  RUN_STARTED: 'RUN_STARTED',
  PLAYER_JUMPED: 'PLAYER_JUMPED',
  PLAYER_SLID: 'PLAYER_SLID',
  COIN_COLLECTED: 'COIN_COLLECTED',
  POWERUP_PICKED: 'POWERUP_PICKED',
  POWERUP_EXPIRED: 'POWERUP_EXPIRED',
  OBSTACLE_HIT: 'OBSTACLE_HIT',
  PLAYER_DIED: 'PLAYER_DIED',
  WORLD_UNLOCKED: 'WORLD_UNLOCKED',
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];

export const EventBus = new Phaser.Events.EventEmitter();
