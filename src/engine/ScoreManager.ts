const DISTANCE_TO_SCORE_SCALE = 10;

export class ScoreManager {
  private scrollSpeed: number;
  private distance = 0;

  constructor(scrollSpeed: number) {
    this.scrollSpeed = scrollSpeed;
  }

  get score(): number {
    return Math.floor(this.distance / DISTANCE_TO_SCORE_SCALE);
  }

  get distanceTraveled(): number {
    return Math.floor(this.distance);
  }

  update(delta: number): void {
    this.distance += (this.scrollSpeed * delta) / 1000;
  }
}
