import Phaser from 'phaser';
import { SaveManager } from '@/save/SaveManager';
import { checkForNewAchievements } from '@/engine/AchievementManager';
import { PhoneFrame } from '@/engine/PhoneFrame';

export interface ResultsData {
  worldKey: string;
  worldName: string;
  score: number;
  distance: number;
  coins: number;
  survivalMs: number;
}

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('Results');
  }

  create(data: ResultsData): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#111318');
    new PhoneFrame(this);

    const { highScore, isNewHighScore } = SaveManager.recordRun(
      data.worldKey,
      data.score,
      data.distance,
      data.coins,
      data.survivalMs,
    );
    const newAchievements = checkForNewAchievements();

    this.add
      .text(width / 2, 100, 'Run Over', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 150, data.worldName, {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    const lines = [
      `Score: ${data.score}`,
      `Best: ${highScore}${isNewHighScore ? '  (New Best!)' : ''}`,
      `Distance: ${data.distance}`,
      `Coins: ${data.coins}`,
    ];
    this.add
      .text(width / 2, height / 2 - 40, lines.join('\n'), {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5);

    let buttonY = height / 2 + 140;
    if (newAchievements.length > 0) {
      const achievementLines = [
        'Achievement Unlocked!',
        ...newAchievements.map((achievement) => achievement.name),
      ];
      this.add
        .text(width / 2, height / 2 + 90, achievementLines.join('\n'), {
          fontFamily: 'sans-serif',
          fontSize: '16px',
          color: '#facc15',
          align: 'center',
          lineSpacing: 6,
        })
        .setOrigin(0.5);
      buttonY += 20 + achievementLines.length * 20;
    }

    const retryButton = this.add
      .text(width / 2, buttonY, 'Retry', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#2dd4bf',
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    retryButton.on('pointerdown', () => {
      this.scene.start('World', { worldKey: data.worldKey, isRetry: true });
    });

    const homeButton = this.add
      .text(width / 2, buttonY + 60, 'Home', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#374151',
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    homeButton.on('pointerdown', () => {
      this.scene.start('Home');
    });
  }
}
