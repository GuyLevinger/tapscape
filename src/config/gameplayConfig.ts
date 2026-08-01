export const SCROLL_SPEED = 300;

// Per the GDD's power-up section: pickups appear roughly every 60-90s of
// survival, with slight randomness, and the effect itself is a short timed
// window (here: temporary invincibility, the one effect the GDD's collision
// rules universally define - "protected by an active power-up").
export const POWERUP_MIN_INTERVAL_MS = 60_000;
export const POWERUP_MAX_INTERVAL_MS = 90_000;
export const POWERUP_EFFECT_DURATION_MS = 8_000;
