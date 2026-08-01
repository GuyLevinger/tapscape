import Phaser from 'phaser';
import { GameConfig } from './engine/GameConfig';

const game = new Phaser.Game(GameConfig);
if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
