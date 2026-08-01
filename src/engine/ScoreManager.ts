const DISTANCE_TO_SCORE_SCALE = 10;

export class ScoreManager {
  private distance = 0;
  private bonus = 0;

  get score(): number {
    return Math.floor(this.distance / DISTANCE_TO_SCORE_SCALE) + this.bonus;
  }

  get distanceTraveled(): number {
    return Math.floor(this.distance);
  }

  addBonus(points: number): void {
    this.bonus += points;
  }

  update(delta: number, scrollSpeed: number): void {
    this.distance += (scrollSpeed * delta) / 1000;
  }
}
