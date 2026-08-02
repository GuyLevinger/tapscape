import Phaser from 'phaser';
import type { ChunkDifficulty, ChunkTypeDef } from '@/data/chunkTypes';

// Keeps obstacles off chunk edges (so they don't spawn flush against a
// neighboring chunk's obstacle) and far enough apart to always be avoidable
// by a jump or slide - a lightweight stand-in for full fairness validation,
// which Task 13's collision consequences and later polish will build on.
const EDGE_MARGIN = 100;
const DESPAWN_MARGIN = 400;

// Minimum time a player must have to react to one obstacle before the next one arrives, so two
// obstacles can never end up too close to jump/slide through in sequence. Derived from
// CharacterController's jump arc (JUMP_VELOCITY -600 / gravity 1200 => 0.5s up + 0.5s down = 1.0s
// airtime before the player can jump again), plus a small safety margin. This is expressed as
// TIME rather than a fixed world-distance because DifficultyManager ramps scrollSpeed up over a
// run - a fixed-distance gap (the old approach) shrinks in real reaction time as speed increases,
// which is what let two obstacles end up unfairly close together later in a run.
const MIN_REACTION_TIME_S = 1.1;

// Same reasoning as CharacterController's hitbox shrink: a hit box matching the full obstacle
// texture registers a collision before the sprites visually touch. Trimmed off the top (obstacles
// sit on the ground, origin (0.5, 1)) so the box stays grounded but is meaningfully shorter than
// the sprite - directly what a player needs to actually clear it with a jump that looked clean.
const HITBOX_WIDTH_RATIO = 0.65;
const HITBOX_HEIGHT_RATIO = 0.75;

// Suspended obstacles float this far above the ground (bottom edge to ground), so a standing/
// running player's hitbox (~102px tall, see CharacterController's HITBOX_HEIGHT_RATIO) never
// reaches them - only a jump's arc does. Comfortably above 102px so normal running never grazes
// one; a jump's ~150px apex (JUMP_VELOCITY/gravity) still carries the player's hitbox into it.
const OVERHEAD_CLEARANCE = 130;
// Fraction of obstacles spawned as "overhead" (jump-punishing) rather than "ground" (jump-required)
// variants. A basic 50/50-ish mix for Task 33 - real per-difficulty tuning is Task 40's job.
const OVERHEAD_VARIANT_CHANCE = 0.35;

// Task 39's purely-cosmetic "Notification Pop-Up" re-skin for plain single obstacles - same
// texture dimensions (48x64) as the generic obstacle art, so it drops into the existing
// placement/hitbox code with no other changes.
const NOTIFICATION_SKIN_CHANCE = 0.2;

// "Tall barrier" and "wide block" (Task 34) can't be built by literally scaling an obstacle taller
// - Arcade Bodies don't reliably track a scaled GameObject's size once setSize() has been called
// manually (confirmed empirically: the resulting hitbox landed partly below the ground line,
// disconnected from the taller visual). Both are built instead from placement: two/three of the
// exact same, already-correct single obstacles spaced closer than a normal reaction gap allows, so
// clearing the *group* takes one well-timed, early jump rather than reacting to each individually.
//
// A single jump only clears ground obstacles for the portion of its arc where the player's feet are
// above the obstacle's 48px hitbox - solving JUMP_VELOCITY*t - 0.5*GRAVITY*t^2 >= 48 gives a ~0.82s
// window, not the full ~1.0s airtime. At base scroll speed (300) that's a ~247-unit hard ceiling on
// how wide a "clear it all with one jump" formation can ever be - WIDE_BLOCK_SPACING=90 (a 211-unit
// span) was verified (numerically, off the same physics) to have ZERO valid jump timing at all, and
// GAP_SPACING=55 with 6 obstacles (306 units) exceeded the ceiling outright - both were reported
// as "impossible" in real play and confirmed as a genuine bug, not a difficulty complaint. Re-tuned
// to keep a real timing window (not just barely non-negative): 121-unit/230ms for WIDE_BLOCK,
// 136-unit/180ms for GAP (still the wider of the two, per its "widest, most committing" intent).
const TIGHT_PAIR_GAP = 70;
const WIDE_BLOCK_COUNT = 3;
const WIDE_BLOCK_SPACING = 45;

// A ground obstacle (jump required) and an overhead one (jump punished) close enough together
// that the jump needed to clear the first is still airborne when the second arrives - clearing
// both takes a deliberately early jump on the first so the player is already descending (or
// landed) by the time the second passes, rather than two independent reactions. ~0.53s apart at
// base scroll speed, comfortably inside a ~1.0s jump's airtime. Order (ground-then-overhead vs.
// overhead-then-ground) is randomized per spawn for variety.
const SLALOM_GAP = 160;

// A wide, near-continuous run of ground obstacles standing in for a "gap in the track" - the user
// agreed this shouldn't be a literal hole in InfiniteGround's seamless scrolling texture (a much
// bigger, riskier change than one hazard type warrants). Reuses the same ground obstacle, just more
// of them, closer together - the widest, most committing of the ground formations, but see the
// WIDE_BLOCK comment above for why "widest" has a hard physical ceiling (~247 units at base speed)
// well below the original 6-obstacle/55-spacing version (306 units - confirmed mathematically
// unclearable by any jump timing, not just difficult).
const GAP_COUNT = 4;
const GAP_SPACING = 35;

// A pulsing gate: a ground-anchored piece and an overhead-anchored piece at the same x, sharing one
// timer, together spanning the player's entire reachable vertical range (standing/sliding hitbox up
// to ~102px, jump apex up to ~150px, leaving only a 98px unguarded band - too narrow for the ~102px
// standing/jumping hitbox to ever fit inside). That makes the *only* way through timing, not a
// jump/slide maneuver: wait for the "off" phase. Cycles off (safe) -> warning (yellow, still safe,
// a heads-up) -> on (red, lethal) -> back to off. Reuses the plain ground/overhead placement/hitbox
// code from Tasks 33-34 and only re-tags `variant` to `'laser'` afterward, so positioning stays
// identical to the already-verified variants - tint is the only new visual, no new art.
const LASER_OFF_MS = 1500;
const LASER_WARNING_MS = 500;
const LASER_ON_MS = 1500;
const LASER_OFF_TINT = 0x64748b;
const LASER_WARNING_TINT = 0xfacc15;
const LASER_ON_TINT = 0xff4444;

// Task 40: the formations above (Tasks 34-37) were previously offered at the same flat chance
// regardless of chunk difficulty - a "hard" chunk only spawned more obstacles (see `count` in
// spawnForChunk below), not meaningfully harder ones, since ChunkSelector's easy/medium/hard
// adjacency rules (chunkTypes.ts) had nothing to say about *which* hazard shapes each tier could
// produce. This table is what actually gives the three tiers a distinct feel: easy chunks are
// plain single obstacles only (no formations at all, matching "easy" meaning something), medium
// introduces the two simplest combos (a well-timed jump, and a jump-then-don't-jump decision),
// and hard unlocks the full set including the two formations with a hard physical ceiling on how
// wide they can be (WIDE_BLOCK, GAP - see their constant comments) plus the wait-for-it laser
// gate. Hard's weights are the exact flat values every formation used before this task, so hard
// chunks are unchanged; easy/medium are strict subsets of that mix, not new tuning.
interface FormationChances {
  tightPair: number;
  wideBlock: number;
  slalom: number;
  gap: number;
  laser: number;
}

const FORMATION_CHANCES: Record<ChunkDifficulty, FormationChances> = {
  1: { tightPair: 0, wideBlock: 0, slalom: 0, gap: 0, laser: 0 },
  2: { tightPair: 0.15, wideBlock: 0, slalom: 0.12, gap: 0, laser: 0 },
  3: { tightPair: 0.15, wideBlock: 0.12, slalom: 0.12, gap: 0.1, laser: 0.1 },
};

type LaserPhase = 'off' | 'warning' | 'on';

interface LaserGate {
  ground: Phaser.Physics.Arcade.Image;
  overhead: Phaser.Physics.Arcade.Image;
  phase: LaserPhase;
  phaseEndTime: number;
}

// A hazard that approaches from *behind* the player rather than ahead. The literal request
// ("punishes lingering/slow play") doesn't map onto this game - the player never controls their
// own forward speed, everything moves at the same scrollSpeed, so there's no such thing as
// "lingering" to punish. What's buildable and still delivers the intended feeling (a visible,
// looming threat that keeps pressure on) is a hazard that spawns off-screen behind the player and
// closes the gap over a few seconds, then requires the same jump/duck response as any other
// obstacle once it arrives. It moves rightward (toward the player) while closing in, which is why
// it needs its own velocity handling instead of the shared -scrollSpeed every other obstacle gets.
const CHASE_MIN_INTERVAL_MS = 20_000;
const CHASE_MAX_INTERVAL_MS = 30_000;
const CHASE_START_DISTANCE = 600;
const CHASE_APPROACH_SPEED = 250;
const CHASE_PASS_MARGIN = 100;

export type ObstacleVariant = 'ground' | 'overhead';

export class ObstacleManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private textureKey: string;
  private obstacleFreeUntilX: number;
  private lastObstacleX = -Infinity;
  private obstacles: Phaser.Physics.Arcade.Image[] = [];
  // Inactive Images kept around instead of destroyed, so a later spawn can reuse the GameObject +
  // Arcade Body instead of paying allocation/GC cost every ~1-2s a chunk recycles.
  private pool: Phaser.Physics.Arcade.Image[] = [];
  private laserGates: LaserGate[] = [];
  private chasers: Phaser.Physics.Arcade.Image[] = [];
  private msUntilNextChase: number;
  private playerX: number;
  private totalSpawned = 0;
  private totalRecycled = 0;

  constructor(
    scene: Phaser.Scene,
    groundY: number,
    scrollSpeed: number,
    textureKey = 'obstacle',
    obstacleFreeUntilX = 0,
    playerX = 0,
  ) {
    this.scene = scene;
    this.groundY = groundY;
    this.scrollSpeed = scrollSpeed;
    this.textureKey = textureKey;
    this.obstacleFreeUntilX = obstacleFreeUntilX;
    this.playerX = playerX;
    this.msUntilNextChase = this.randomChaseInterval();
  }

  private randomChaseInterval(): number {
    return CHASE_MIN_INTERVAL_MS + Math.random() * (CHASE_MAX_INTERVAL_MS - CHASE_MIN_INTERVAL_MS);
  }

  get stats(): { active: number; totalSpawned: number; totalRecycled: number } {
    return { active: this.obstacles.length, totalSpawned: this.totalSpawned, totalRecycled: this.totalRecycled };
  }

  get group(): Phaser.Physics.Arcade.Image[] {
    return this.obstacles;
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
    for (const obstacle of this.obstacles) {
      // Chasers manage their own (rightward, closing-in) velocity in updateChasers - the shared
      // leftward scrollSpeed would immediately overwrite it every frame otherwise.
      if (obstacle.getData('variant') === 'chaser') {
        continue;
      }
      obstacle.setVelocityX(-speed);
    }
  }

  spawnForChunk(chunkX: number, chunkWidth: number, chunkType: ChunkTypeDef): void {
    const usableWidth = chunkWidth - EDGE_MARGIN * 2;
    if (usableWidth < 0) {
      return;
    }

    // Candidate slots come straight from chunk difficulty - spawnObstacle/spawnTightPair/
    // spawnWideBlock are what actually enforce the minimum gap (against the last obstacle spawned,
    // whether it came from this chunk or the previous one), so crowded candidates are thinned out
    // rather than placed. Which formations are even eligible is also gated by difficulty (Task 40)
    // - see the FORMATION_CHANCES comment above for why.
    const count = chunkType.difficulty;
    const chances = FORMATION_CHANCES[chunkType.difficulty];
    for (let i = 0; i < count; i++) {
      const slot = count === 1 ? 0.5 : i / (count - 1);
      const x = chunkX + EDGE_MARGIN + slot * usableWidth;
      const roll = Math.random();
      if (roll < chances.wideBlock) {
        this.spawnWideBlock(x);
      } else if (roll < chances.wideBlock + chances.tightPair) {
        this.spawnTightPair(x);
      } else if (roll < chances.wideBlock + chances.tightPair + chances.slalom) {
        this.spawnSlalom(x);
      } else if (roll < chances.wideBlock + chances.tightPair + chances.slalom + chances.gap) {
        this.spawnGap(x);
      } else if (roll < chances.wideBlock + chances.tightPair + chances.slalom + chances.gap + chances.laser) {
        this.spawnLaserGate(x);
      } else {
        this.spawnObstacle(x);
      }
    }
  }

  private spawnObstacle(x: number): void {
    if (!this.canPlaceAt(x)) {
      return;
    }
    const variant: ObstacleVariant = Math.random() < OVERHEAD_VARIANT_CHANCE ? 'overhead' : 'ground';
    // Task 39's "Notification Pop-Up" re-skin - purely cosmetic (a generic texture swap), same
    // ground/overhead placement and hitbox as any other single obstacle. Only applied to plain
    // single spawns, not the formations above - re-skinning a whole tight-pair/block/gap run would
    // read as a different, more confusing hazard than intended.
    const texture = Math.random() < NOTIFICATION_SKIN_CHANCE ? 'notification' : undefined;
    this.placeObstacle(x, variant, texture);
    this.lastObstacleX = x;
  }

  // Two ground obstacles close enough together that reacting to only the first one still lands
  // the player on top of the second - clearing the pair takes one deliberately early jump, i.e.
  // the "requires a well-timed jump" tall-barrier-style hazard (see the constant comment above for
  // why this isn't a literal taller obstacle).
  private spawnTightPair(centerX: number): void {
    const startX = centerX - TIGHT_PAIR_GAP / 2;
    if (!this.canPlaceAt(startX)) {
      return;
    }
    this.placeObstacle(startX, 'ground');
    this.placeObstacle(startX + TIGHT_PAIR_GAP, 'ground');
    this.lastObstacleX = startX + TIGHT_PAIR_GAP;
  }

  // Three ground obstacles spread wide enough that clearing the whole span takes an early jump
  // sustained across all of them, rather than a jump timed for any single one - the "group 3-4
  // obstacles side-by-side, jump early to clear the whole distance" hazard.
  private spawnWideBlock(centerX: number): void {
    const startX = centerX - ((WIDE_BLOCK_COUNT - 1) * WIDE_BLOCK_SPACING) / 2;
    if (!this.canPlaceAt(startX)) {
      return;
    }
    for (let i = 0; i < WIDE_BLOCK_COUNT; i++) {
      this.placeObstacle(startX + i * WIDE_BLOCK_SPACING, 'ground');
    }
    this.lastObstacleX = startX + (WIDE_BLOCK_COUNT - 1) * WIDE_BLOCK_SPACING;
  }

  // A ground+overhead pair back to back - see the constant comment above for the timing intent.
  private spawnSlalom(centerX: number): void {
    const startX = centerX - SLALOM_GAP / 2;
    if (!this.canPlaceAt(startX)) {
      return;
    }
    const groundFirst = Math.random() < 0.5;
    this.placeObstacle(startX, groundFirst ? 'ground' : 'overhead');
    this.placeObstacle(startX + SLALOM_GAP, groundFirst ? 'overhead' : 'ground');
    this.lastObstacleX = startX + SLALOM_GAP;
  }

  // Stands in for a "gap in the track" - see the constant comment above.
  private spawnGap(centerX: number): void {
    const startX = centerX - ((GAP_COUNT - 1) * GAP_SPACING) / 2;
    if (!this.canPlaceAt(startX)) {
      return;
    }
    for (let i = 0; i < GAP_COUNT; i++) {
      this.placeObstacle(startX + i * GAP_SPACING, 'ground');
    }
    this.lastObstacleX = startX + (GAP_COUNT - 1) * GAP_SPACING;
  }

  // A pulsing gate - see the constant comment above for why waiting is the only way through.
  private spawnLaserGate(centerX: number): void {
    if (!this.canPlaceAt(centerX)) {
      return;
    }
    const ground = this.placeObstacle(centerX, 'ground');
    const overhead = this.placeObstacle(centerX, 'overhead');
    ground.setData('variant', 'laser');
    overhead.setData('variant', 'laser');
    const gate: LaserGate = { ground, overhead, phase: 'off', phaseEndTime: this.scene.time.now + LASER_OFF_MS };
    this.applyLaserPhase(gate);
    this.laserGates.push(gate);
    this.lastObstacleX = centerX;
  }

  private applyLaserPhase(gate: LaserGate): void {
    const tint =
      gate.phase === 'off' ? LASER_OFF_TINT : gate.phase === 'warning' ? LASER_WARNING_TINT : LASER_ON_TINT;
    gate.ground.setTint(tint);
    gate.overhead.setTint(tint);
    gate.ground.setData('laserPhase', gate.phase);
    gate.overhead.setData('laserPhase', gate.phase);
  }

  private updateLaserGates(): void {
    const now = this.scene.time.now;
    for (let i = this.laserGates.length - 1; i >= 0; i--) {
      const gate = this.laserGates[i];
      if (!gate.ground.active) {
        // Recycled by the normal despawn pass below - stop ticking a timer nobody can see.
        this.laserGates.splice(i, 1);
        continue;
      }
      if (now < gate.phaseEndTime) {
        continue;
      }
      if (gate.phase === 'off') {
        gate.phase = 'warning';
        gate.phaseEndTime = now + LASER_WARNING_MS;
      } else if (gate.phase === 'warning') {
        gate.phase = 'on';
        gate.phaseEndTime = now + LASER_ON_MS;
      } else {
        gate.phase = 'off';
        gate.phaseEndTime = now + LASER_OFF_MS;
      }
      this.applyLaserPhase(gate);
    }
  }

  // Spawns off-screen behind the player on an independent timer - see the constant comment above.
  // Not subject to canPlaceAt/lastObstacleX at all: those govern spacing between hazards placed
  // ahead of the player from chunk content, which has nothing to do with this hazard's approach
  // from behind on its own schedule.
  private spawnChaser(): void {
    const chaser = this.placeObstacle(this.playerX - CHASE_START_DISTANCE, 'ground');
    chaser.setData('variant', 'chaser');
    chaser.setVelocityX(CHASE_APPROACH_SPEED);
    this.chasers.push(chaser);
  }

  private updateChasers(delta: number): void {
    this.msUntilNextChase -= delta;
    if (this.msUntilNextChase <= 0) {
      this.spawnChaser();
      this.msUntilNextChase = this.randomChaseInterval();
    }

    for (let i = this.chasers.length - 1; i >= 0; i--) {
      const chaser = this.chasers[i];
      if (!chaser.active || chaser.x < this.playerX + CHASE_PASS_MARGIN) {
        continue;
      }
      // Caught up to (and passed) the player - its one moment of danger has already been resolved
      // by the normal overlap check, so recycle it now rather than letting it drift rightward
      // forever (the despawn sweep below only ever looks to the left).
      this.chasers.splice(i, 1);
      const index = this.obstacles.indexOf(chaser);
      if (index !== -1) {
        this.obstacles.splice(index, 1);
      }
      this.recycleObstacle(chaser);
      this.totalRecycled += 1;
    }
  }

  private recycleObstacle(obstacle: Phaser.Physics.Arcade.Image): void {
    obstacle.setActive(false);
    obstacle.setVisible(false);
    obstacle.setVelocity(0, 0);
    (obstacle.body as Phaser.Physics.Arcade.Body).enable = false;
    this.pool.push(obstacle);
  }

  private canPlaceAt(leadingX: number): boolean {
    if (leadingX < this.obstacleFreeUntilX) {
      return false;
    }
    const minGap = this.scrollSpeed * MIN_REACTION_TIME_S;
    return leadingX - this.lastObstacleX >= minGap;
  }

  private placeObstacle(x: number, variant: ObstacleVariant, textureOverride?: string): Phaser.Physics.Arcade.Image {
    const y = variant === 'overhead' ? this.groundY - OVERHEAD_CLEARANCE : this.groundY;

    const obstacle = this.pool.pop() ?? this.scene.physics.add.image(x, y, this.textureKey);
    obstacle.setPosition(x, y);
    obstacle.setTexture(textureOverride ?? this.textureKey);
    obstacle.setOrigin(0.5, 1);
    obstacle.setActive(true);
    obstacle.setVisible(true);
    obstacle.clearTint(); // a pooled Image may carry a laser gate's tint from its previous spawn
    obstacle.setData('variant', variant);
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);

    // Use the display frame's size, not the body's - a reused pooled Image's body may already be
    // shrunk from its previous spawn, and re-deriving the hitbox from that would shrink it again.
    const fullWidth = obstacle.width;
    const fullHeight = obstacle.height;
    const hitboxWidth = fullWidth * HITBOX_WIDTH_RATIO;
    const hitboxHeight = fullHeight * HITBOX_HEIGHT_RATIO;
    // Ground obstacles trim forgiveness off the top (what a clearing jump grazes); overhead ones
    // trim off the bottom instead (what a jump grazes from below) - the graze edge is whichever
    // side a jump actually approaches from for that variant.
    const offsetY = variant === 'overhead' ? 0 : fullHeight - hitboxHeight;
    body.setSize(hitboxWidth, hitboxHeight);
    body.setOffset((fullWidth - hitboxWidth) / 2, offsetY);

    obstacle.setVelocityX(-this.scrollSpeed);

    this.obstacles.push(obstacle);
    this.totalSpawned += 1;
    return obstacle;
  }

  update(delta: number): void {
    this.updateLaserGates();
    this.updateChasers(delta);

    const despawnX = this.scene.cameras.main.scrollX - DESPAWN_MARGIN;
    while (this.obstacles.length && this.obstacles[0].x < despawnX) {
      const obstacle = this.obstacles.shift();
      if (obstacle) {
        this.recycleObstacle(obstacle);
      }
      this.totalRecycled += 1;
    }
  }

  freeze(): void {
    for (const obstacle of this.obstacles) {
      obstacle.setVelocityX(0);
    }
  }
}
