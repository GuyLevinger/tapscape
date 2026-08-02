export const SCROLL_SPEED = 300;

// Level intro & retry flow: a run's very first attempt gets a longer obstacle-free runway
// (welcoming, teaches controls through play) while a retry after dying gets just enough room to
// react before the first obstacle, so the loop of "die, retry, go" stays fast. Both are expressed
// as world-distance (not a timer), since obstacles/chunks are positioned in world-x - dividing by
// SCROLL_SPEED gives roughly the seconds of clear road a player at the default scroll speed sees.
export const FIRST_ATTEMPT_CLEAR_DISTANCE = SCROLL_SPEED * 2.5; // ~2.5s
export const RETRY_CLEAR_DISTANCE = SCROLL_SPEED * 0.75; // ~0.75s

// Per the GDD's power-up section: pickups appear roughly every 60-90s of
// survival, with slight randomness, and the effect itself is a short timed
// window (here: temporary invincibility, the one effect the GDD's collision
// rules universally define - "protected by an active power-up").
export const POWERUP_MIN_INTERVAL_MS = 60_000;
export const POWERUP_MAX_INTERVAL_MS = 90_000;
export const POWERUP_EFFECT_DURATION_MS = 8_000;
