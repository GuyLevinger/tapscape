const DISTANCE_TO_SCORE_SCALE = 10;

export class ScoreManager {
  private scrollSpeed: number;
  private distance = 0;
  private bonus = 0;

  constructor(scrollSpeed: number) {
    this.scrollSpeed = scrollSpeed;
  }

  get score(): number {
    return Math.floor(this.distance / DISTANCE_TO_SCORE_SCALE) + this.bonus;
  }

  get distanceTraveled(): number {
    return Math.floor(this.distance);
  }

  addBonus(points: number): void {
    this.bonus += points;
  }

  update(delta: number): void {
    this.distance += (this.scrollSpeed * delta) / 1000;
  }
}
