import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EnemySpec, Hero as HeroType, LandmarkRef, Pot, Scene, TileKind } from "../types";
import type { Sfx } from "../audio/sound";
import { castleById, projectById } from "../data/projects";
import { BLOCKED } from "../data/map";
import { CAVE_ID, OVERWORLD_ID } from "../data/scenes";
import { SPRITES, type RupeeColor } from "../data/sprites";
import { sound } from "../audio/sound";
import { useMovement } from "../hooks/useMovement";
import Hero from "./Hero";
import TouchControls from "./TouchControls";

interface Props {
  scene: Scene;
  initialHero: HeroType;
  onInteract: (l: LandmarkRef) => void;
  onPickup: (l: LandmarkRef) => void;
  onHit: () => void;
  onBossDefeated: () => void;
  onMonsterDefeated: () => void;
  onRupee: (color: RupeeColor) => void;
  /** Heal Link by a number of half-heart units (pot drops at low HP). */
  onHeal: (units: number) => void;
  useBottle: (slot: number) => void;
  paused: boolean;
  hasSword: boolean;
  hasBow: boolean;
  arrows: number;
  bombs: number;
  smallKeys: number;
  hasBossKey: boolean;
  hasTriforce: boolean;
  bottles: ("empty" | "potion" | "fairy")[];
  opened: Set<string>;
  unlockedDoors: Set<string>;
  consumeArrow: () => void;
  consumeBomb: () => void;
  health: number;
  maxHearts: number;
  rupees: number;
  invulnerable: boolean;
}

type Enemy = EnemySpec & { dir: number; frame: number; maxHp: number };
type Dir = HeroType["facing"];
type Arrow = { id: number; x: number; y: number; dir: Dir };
type Bomb = { id: number; x: number; y: number; exploding: boolean };
type Drop = { id: number; x: number; y: number; color: RupeeColor };
type HeartDrop = { id: number; x: number; y: number };
type Fireball = { id: number; x: number; y: number; dir: Dir };

const RUPEE_COLORS: RupeeColor[] = ["green", "green", "green", "blue", "blue", "red"];
const randomRupee = (): RupeeColor => RUPEE_COLORS[Math.floor(Math.random() * RUPEE_COLORS.length)];

/** Each tile kind picks its own OOT footstep bank (so Link sounds different
 *  on grass than on sand or wood). Falls back to `stepDirt` for everything
 *  else (any other walkable tile). */
const STEP_SFX: Partial<Record<TileKind, Sfx>> = {
  grass: "stepGrass",
  path: "stepDirt",
  sand: "stepSand",
  dock: "stepWood",
  floor: "stepStone",
  carpet: "stepCarpet",
};

const BURN_MS = 300;
const ENEMY_MS = 600;
const ATTACK_MS = 260;
const ARROW_MS = 80;
const BOMB_FUSE_MS = 1500;
const BOMB_FLASH_MS = 380;
const FIREBALL_MS = 160;
const FIREBALL_SPAWN_MS = 1800;
/** Chance that a pot smashed at low HP drops a heart instead of a rupee. */
const LOW_HEALTH_HEART_CHANCE = 0.5;
const DELTA: Record<Dir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

function tileStyle(x: number, y: number) {
  return { left: `calc(${x} * var(--tile))`, top: `calc(${y} * var(--tile))` };
}

const heartSrc = (health: number, i: number) => {
  const units = Math.max(Math.min(health - i * 2, 2), 0);
  return units >= 2 ? SPRITES.heart.full : units === 1 ? SPRITES.heart.half : SPRITES.heart.empty;
};

const bottleSrc = (b: "empty" | "potion" | "fairy") =>
  b === "fairy" ? SPRITES.bottleFairy : b === "potion" ? SPRITES.potion : SPRITES.bottleEmpty;

export default function SceneView(props: Props) {
  const { scene, initialHero, onInteract, onPickup, onHit } = props;
  const { onBossDefeated, onMonsterDefeated, onRupee, onHeal } = props;
  const { paused, hasSword, hasBow, arrows, bombs, bottles, opened, unlockedDoors } = props;
  const { health, maxHearts, rupees, invulnerable } = props;
  const { hasBossKey, hasTriforce, smallKeys, consumeArrow, consumeBomb, useBottle } = props;
  const { t } = useTranslation();

  const [rocks, setRocks] = useState(scene.rocks ?? []);
  const [pots, setPots] = useState<Pot[]>(scene.pots ?? []);
  const [enemies, setEnemies] = useState<Enemy[]>(
    (scene.enemies ?? []).map((e) => ({ ...e, dir: 1, frame: 0, maxHp: e.hp ?? 1 })),
  );
  const [attacking, setAttacking] = useState(false);
  const [bossHurt, setBossHurt] = useState(false);
  const [arrowsInFlight, setArrowsInFlight] = useState<Arrow[]>([]);
  const [placedBombs, setPlacedBombs] = useState<Bomb[]>([]);
  /** Rupees dropped by broken pots, waiting for the hero to walk over them. */
  const [drops, setDrops] = useState<Drop[]>([]);
  /** Recovery hearts dropped by pots smashed while Link is on his last heart. */
  const [heartDrops, setHeartDrops] = useState<HeartDrop[]>([]);
  /** Fireballs Ganondorf throws at Link inside his lair. */
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const nextId = useRef(0);

  const pushRock = useCallback(
    (id: string, x: number, y: number) =>
      setRocks((rs) => rs.map((r) => (r.id === id ? { ...r, x, y } : r))),
    [],
  );
  const removeRock = useCallback((id: string) => {
    // The only path that drops a rock is heaving it into water — splash!
    sound.sfx("splash");
    setRocks((rs) => rs.filter((r) => r.id !== id));
  }, []);
  const drown = useCallback(() => {
    // Splash + a hurt cry on top — Link doesn't go under in silence.
    sound.sfx("drown");
    sound.sfx("hurt");
    onHit();
  }, [onHit]);

  const interact = useCallback(
    (l: LandmarkRef) => {
      // Boss / mini-boss rooms lock the exit while the boss is still alive.
      if (l.kind === "exit" && enemies.some((e) => e.random)) {
        sound.sfx("lockedNo");
        return;
      }
      if (l.kind === "heart") sound.sfx("heart");
      else if (l.kind === "sword") sound.sfx("item");
      else if (l.kind === "door") sound.sfx("enterLair");
      // Caves are holes in the ground — Link cries as he drops in.
      else if (l.kind === "cave") sound.sfx("fall");
      else if (l.kind === "exit") sound.sfx("door");
      else if (l.kind === "project" || l.kind === "castle" || l.kind === "npc") sound.sfx("select");
      onInteract(l);
    },
    [onInteract, enemies],
  );

  const pickup = useCallback(
    (l: LandmarkRef) => {
      if (l.kind === "rupee") sound.sfx("pickup");
      else if (l.kind === "recoveryHeart") sound.sfx("heartRefill");
      onPickup(l);
    },
    [onPickup],
  );

  const { hero, move, setEnabled } = useMovement(scene, initialHero, {
    onInteract: interact,
    onPickup: pickup,
    onDrown: drown,
    rocks,
    pots,
    enemies,
    pushRock,
    removeRock,
    onStep: (tile) => sound.sfx(STEP_SFX[tile] ?? "stepDirt"),
  });
  useEffect(() => setEnabled(!paused), [paused, setEnabled]);

  // The bomb fuse fires from a setTimeout closure → it must read the hero
  // position at the moment of the explosion, not at placement, otherwise the
  // hero is "always" within range of his own bomb. Mirror the live hero into
  // a ref so the fuse callback can sample the up-to-date position.
  const heroRef = useRef(hero);
  useEffect(() => {
    heroRef.current = hero;
  }, [hero]);

  const [frame, setFrame] = useState<1 | 2>(1);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setFrame((f) => (f === 1 ? 2 : 1)), 380);
    return () => clearInterval(id);
  }, [paused]);

  // ── Fire hazard: progressive damage while standing on a fire tile ─────────
  const onFire = scene.decor.some((d) => d.hazard && d.x === hero.x && d.y === hero.y);
  useEffect(() => {
    if (paused || !onFire) return;
    const id = setInterval(() => onHit(), BURN_MS);
    return () => clearInterval(id);
  }, [onFire, paused, onHit]);
  // Re-play the "burn" cry every time Link actually loses a heart while on
  // fire (i.e. when his `health` prop drops). Using a health-watcher instead
  // of firing the SFX from the interval avoids spamming the cry during the
  // invulnerability window between successful hits.
  const lastHealthRef = useRef(health);
  useEffect(() => {
    if (health < lastHealthRef.current && onFire) sound.sfx("burn");
    lastHealthRef.current = health;
  }, [health, onFire]);

  // ── Enemies: patrol or random walk, blocked by rocks / pots / walls ──────
  const canEnter = useCallback(
    (x: number, y: number, tiles: TileKind[][]) => {
      if (x < 0 || y < 0 || x >= scene.width || y >= scene.height) return false;
      if (tiles[y][x] === "water" || BLOCKED.includes(tiles[y][x])) return false;
      if (rocks.some((r) => r.x === x && r.y === y)) return false;
      if (pots.some((p) => p.x === x && p.y === y)) return false;
      if (scene.landmarks.some((l) => l.x === x && l.y === y)) return false;
      return true;
    },
    [scene, rocks, pots],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setEnemies((prev) =>
        prev.map((e) => {
          if (e.random) {
            const dirs = (Object.keys(DELTA) as Dir[])
              .map((d) => DELTA[d])
              .filter(([dx, dy]) => canEnter(e.x + dx, e.y + dy, scene.tiles));
            if (!dirs.length) return e;
            const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
            const len = e.sprites?.length ?? 1;
            return { ...e, x: e.x + dx, y: e.y + dy, frame: (e.frame + 1) % len };
          }
          let dir = e.dir;
          const tryStep = (d: number) => {
            const x = e.axis === "h" ? e.x + d : e.x;
            const y = e.axis === "h" ? e.y : e.y + d;
            const pos = e.axis === "h" ? x : y;
            return pos >= (e.min ?? 0) && pos <= (e.max ?? 0) && canEnter(x, y, scene.tiles)
              ? { x, y }
              : null;
          };
          let next = tryStep(dir);
          if (!next) {
            dir = -dir;
            next = tryStep(dir);
          }
          return next ? { ...e, ...next, dir } : { ...e, dir };
        }),
      );
    }, ENEMY_MS);
    return () => clearInterval(id);
  }, [paused, canEnter, scene]);

  useEffect(() => {
    if (paused) return;
    const touching = enemies.find((e) => e.x === hero.x && e.y === hero.y);
    if (touching) {
      sound.sfx(touching.random ? "hurtBoss" : "hurt");
      onHit();
    }
  }, [enemies, hero, paused, onHit]);

  // Pick up any rupee dropped on the tile the hero just walked onto.
  useEffect(() => {
    if (paused) return;
    const drop = drops.find((d) => d.x === hero.x && d.y === hero.y);
    if (!drop) return;
    sound.sfx("pickup");
    setDrops((ds) => ds.filter((d) => d.id !== drop.id));
    onRupee(drop.color);
  }, [hero, drops, paused, onRupee]);

  // ── Damage resolution shared by sword / arrows / bombs ───────────────────
  const damageAt = useCallback(
    (fx: number, fy: number, _source: "sword" | "arrow" | "bomb") => {
      const target = enemies.find((e) => e.x === fx && e.y === fy);
      if (target) {
        const willDie = (target.hp ?? 1) <= 1;
        if (target.random) {
          if (willDie && target.id === "ganondorf") onBossDefeated();
          else if (willDie && target.id === "monster") onMonsterDefeated();
          else {
            sound.sfx("bossHit");
            setBossHurt(true);
            setTimeout(() => setBossHurt(false), 320);
          }
        } else {
          // Regular foe: roar on hit, NES-style death squawk on kill.
          sound.sfx(willDie ? "enemyDie" : "enemyHit");
        }
      }
      setEnemies((prev) =>
        prev.flatMap((e) => {
          if (e.x !== fx || e.y !== fy) return [e];
          const hp = (e.hp ?? 1) - 1;
          return hp > 0 ? [{ ...e, hp }] : [];
        }),
      );
      const pot = pots.find((p) => p.x === fx && p.y === fy);
      if (pot) {
        sound.sfx("potBreak");
        setPots((ps) => ps.filter((p) => p.id !== pot.id));
        // At low health (one heart or less), pots have a chance to drop a
        // recovery heart instead of the usual random rupee — gives the hero
        // a fighting chance to bottle a comeback.
        const lowHealth = health <= 2;
        if (lowHealth && Math.random() < LOW_HEALTH_HEART_CHANCE) {
          setHeartDrops((ds) => [...ds, { id: nextId.current++, x: pot.x, y: pot.y }]);
        } else {
          setDrops((ds) => [
            ...ds,
            { id: nextId.current++, x: pot.x, y: pot.y, color: randomRupee() },
          ]);
        }
      }
    },
    [enemies, pots, health, onBossDefeated, onMonsterDefeated],
  );

  // Pick up any heart dropped on the tile the hero just walked onto.
  useEffect(() => {
    if (paused) return;
    const drop = heartDrops.find((d) => d.x === hero.x && d.y === hero.y);
    if (!drop) return;
    sound.sfx("heartRefill");
    setHeartDrops((ds) => ds.filter((d) => d.id !== drop.id));
    onHeal(2);
  }, [hero, heartDrops, paused, onHeal]);

  // ── Sword: Space strikes the tile in front; kills enemies / wounds boss ──
  useEffect(() => {
    if (!hasSword || paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      strike();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const strike = useCallback(() => {
    if (attacking) return;
    // Sword swoosh + a random Young-Link "Haa!" shout, played together.
    sound.sfx("attack");
    sound.sfx("attackShout");
    setAttacking(true);
    setTimeout(() => setAttacking(false), ATTACK_MS);
    const [dx, dy] = DELTA[hero.facing];
    damageAt(hero.x + dx, hero.y + dy, "sword");
  }, [attacking, hero, damageAt]);

  // ── Bow: X fires an arrow in the direction the hero is currently facing ──
  const shoot = useCallback(() => {
    if (!hasBow || arrows <= 0 || paused) return;
    sound.sfx("bowShoot");
    consumeArrow();
    const dir = hero.facing;
    const [dx, dy] = DELTA[dir];
    const id = nextId.current++;
    setArrowsInFlight((as) => [...as, { id, x: hero.x + dx, y: hero.y + dy, dir }]);
  }, [hasBow, arrows, paused, hero, consumeArrow]);

  // Step arrows along their direction; despawn on walls / out of bounds.
  useEffect(() => {
    if (paused || arrowsInFlight.length === 0) return;
    const id = setInterval(() => {
      setArrowsInFlight((prev) =>
        prev.flatMap((a) => {
          // Resolve impact on the current tile before advancing.
          const enemyHere = enemies.some((e) => e.x === a.x && e.y === a.y);
          const potHere = pots.some((p) => p.x === a.x && p.y === a.y);
          if (enemyHere || potHere) {
            damageAt(a.x, a.y, "arrow");
            return [];
          }
          const [dx, dy] = DELTA[a.dir];
          const nx = a.x + dx;
          const ny = a.y + dy;
          if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) return [];
          if (BLOCKED.includes(scene.tiles[ny][nx])) {
            // Arrow snaps off a wall — tiny "tink".
            sound.sfx("arrowHit");
            return [];
          }
          return [{ ...a, x: nx, y: ny }];
        }),
      );
    }, ARROW_MS);
    return () => clearInterval(id);
  }, [paused, arrowsInFlight.length, enemies, pots, scene, damageAt]);

  // ── Bombs: B drops a bomb that ticks down then explodes ──────────────────
  const dropBomb = useCallback(() => {
    if (bombs <= 0 || paused) return;
    sound.sfx("bombDrop");
    consumeBomb();
    const id = nextId.current++;
    const bx = hero.x;
    const by = hero.y;
    setPlacedBombs((bs) => [...bs, { id, x: bx, y: by, exploding: false }]);
    setTimeout(() => {
      sound.sfx("explosion");
      setPlacedBombs((bs) => bs.map((b) => (b.id === id ? { ...b, exploding: true } : b)));
      // Damage at the bomb tile and the four cardinal neighbours.
      damageAt(bx, by, "bomb");
      damageAt(bx + 1, by, "bomb");
      damageAt(bx - 1, by, "bomb");
      damageAt(bx, by + 1, "bomb");
      damageAt(bx, by - 1, "bomb");
      // Hurts the hero only if he hasn't walked off the explosion in time —
      // enemy-style contact: he must be on a blast tile when it goes off.
      // Sample the live position from a ref (the closure captured at
      // placement still sees the hero on the bomb tile).
      const h = heroRef.current;
      if (Math.abs(h.x - bx) + Math.abs(h.y - by) <= 1) onHit();
      setTimeout(() => setPlacedBombs((bs) => bs.filter((b) => b.id !== id)), BOMB_FLASH_MS);
    }, BOMB_FUSE_MS);
  }, [bombs, paused, hero, consumeBomb, damageAt, onHit]);

  // Combat / inventory keys: X shoots, B drops a bomb.
  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        shoot();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        dropBomb();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, shoot, dropBomb]);

  // ── Ganondorf throws fireballs at Link ───────────────────────────────────
  // Periodic spawn from Ganon's current tile toward Link's dominant axis.
  // We read live positions through refs so the interval can run cheaply.
  const enemiesRef = useRef(enemies);
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  const ganonAlive = enemies.some((e) => e.id === "ganondorf");
  useEffect(() => {
    if (paused || !ganonAlive) return;
    const id = setInterval(() => {
      const g = enemiesRef.current.find((e) => e.id === "ganondorf");
      if (!g) return;
      const h = heroRef.current;
      const dxRaw = h.x - g.x;
      const dyRaw = h.y - g.y;
      const dir: Dir =
        Math.abs(dxRaw) >= Math.abs(dyRaw)
          ? dxRaw >= 0
            ? "right"
            : "left"
          : dyRaw >= 0
            ? "down"
            : "up";
      const [dx, dy] = DELTA[dir];
      sound.sfx("fireballShoot");
      setFireballs((fs) => [
        ...fs,
        { id: nextId.current++, x: g.x + dx, y: g.y + dy, dir },
      ]);
    }, FIREBALL_SPAWN_MS);
    return () => clearInterval(id);
  }, [paused, ganonAlive]);

  // Step fireballs along their direction; despawn on walls / out of bounds /
  // when they hit Link.
  useEffect(() => {
    if (paused || fireballs.length === 0) return;
    const id = setInterval(() => {
      setFireballs((prev) =>
        prev.flatMap((f) => {
          const h = heroRef.current;
          if (f.x === h.x && f.y === h.y) {
            sound.sfx("fireballBurn");
            onHit();
            return [];
          }
          const [dx, dy] = DELTA[f.dir];
          const nx = f.x + dx;
          const ny = f.y + dy;
          if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) return [];
          if (BLOCKED.includes(scene.tiles[ny][nx])) {
            sound.sfx("fireballBurn");
            return [];
          }
          return [{ ...f, x: nx, y: ny }];
        }),
      );
    }, FIREBALL_MS);
    return () => clearInterval(id);
  }, [paused, fireballs.length, scene, onHit]);

  const boss = enemies.find((e) => e.random);

  return (
    <div className="overworld">
      <div className="status">
        <span className="hearts">
          {Array.from({ length: maxHearts }, (_, i) => (
            <img key={i} className="heart-img" src={heartSrc(health, i)} alt="" />
          ))}
        </span>
        <span className="rupees">
          <img className="rupee-icon" src={SPRITES.rupee.green} alt="" /> {rupees}
        </span>
        <span className="inventory" aria-label={t("hud.inventory")}>
          {hasBow && (
            <span className="inv-slot" title={t("item.bow")}>
              <img src={SPRITES.bowIcon} alt="" /> {arrows}
            </span>
          )}
          {bombs > 0 && (
            <span className="inv-slot" title={t("item.bomb")}>
              <img src={SPRITES.bomb} alt="" /> {bombs}
            </span>
          )}
          {smallKeys > 0 && (
            <span className="inv-slot" title={t("item.smallKey")}>
              <img src={SPRITES.keySmall} alt="" /> {smallKeys}
            </span>
          )}
          {hasBossKey && (
            <span className="inv-slot" title={t("item.bossKey")}>
              <img src={SPRITES.keyBoss} alt="" />
            </span>
          )}
          {hasTriforce && (
            <span className="inv-slot" title={t("item.triforce")}>
              <img src={SPRITES.triforcePiece} alt="" />
            </span>
          )}
          {bottles.map((b, i) => (
            <button
              key={i}
              className="inv-slot inv-bottle"
              onClick={() => useBottle(i)}
              title={t(`bottle.${b}`)}
              aria-label={t(`bottle.${b}`)}
            >
              <img src={bottleSrc(b)} alt="" />
            </button>
          ))}
        </span>
      </div>

      <p className={`explore-hint${onFire ? " danger" : ""}`}>
        {onFire ? (
          t("world.hot")
        ) : (
          <>
            <span className="hint-desktop">
              {hasBow ? t("hud.hint_bow") : hasSword ? t("hud.hint_sword") : t("hud.hint")}
            </span>
            <span className="hint-touch">{t("hud.hint_touch")}</span>
          </>
        )}
      </p>

      <div
        className={`field scene-${scene.id}`}
        style={{ ["--cols" as string]: scene.width, ["--rows" as string]: scene.height }}
      >
        {boss && (
          <div className={`boss-bar${bossHurt ? " hurt" : ""}`}>
            <span className="boss-name">{t(`boss.${boss.id}`, { defaultValue: boss.id })}</span>
            <span className="boss-pips">
              {Array.from({ length: boss.maxHp }, (_, i) => (
                <span key={i} className={`boss-pip${i < (boss.hp ?? 0) ? " full" : ""}`} />
              ))}
            </span>
          </div>
        )}
        <div className="tilemap">
          {scene.tiles.flatMap((row, y) =>
            row.map((kind, x) => <div key={`${x}-${y}`} className={`tile tile-${kind}`} />),
          )}
        </div>

        {scene.decor.map((d, i) =>
          d.icon.startsWith("/") ? (
            <img
              key={`d-${i}`}
              className={`decor${d.hazard ? " hazard" : ""}`}
              style={tileStyle(d.x, d.y)}
              src={d.icon}
              alt=""
            />
          ) : (
            <span
              key={`d-${i}`}
              className={`decor${d.hazard ? " hazard" : ""}`}
              style={tileStyle(d.x, d.y)}
              aria-hidden="true"
            >
              {d.icon}
            </span>
          ),
        )}

        {rocks.map((r) => (
          <img
            key={r.id}
            className="rock-obj"
            style={tileStyle(r.x, r.y)}
            src={SPRITES.rock}
            alt=""
          />
        ))}

        {pots.map((p) => (
          <img
            key={p.id}
            className="pot-obj"
            style={tileStyle(p.x, p.y)}
            src={SPRITES.pot}
            alt=""
          />
        ))}

        {scene.landmarks.map((l) => renderLandmark(l))}

        {arrowsInFlight.map((a) => (
          <img
            key={`arr-${a.id}`}
            className={`arrow-fx arrow-${a.dir}`}
            style={tileStyle(a.x, a.y)}
            src={SPRITES.arrow}
            alt=""
          />
        ))}

        {drops.map((d) => (
          <img
            key={`drop-${d.id}`}
            className="drop-rupee"
            style={tileStyle(d.x, d.y)}
            src={SPRITES.rupee[d.color]}
            alt=""
          />
        ))}

        {heartDrops.map((d) => (
          <img
            key={`hd-${d.id}`}
            className="drop-rupee drop-heart"
            style={tileStyle(d.x, d.y)}
            src={SPRITES.heart.full}
            alt=""
          />
        ))}

        {fireballs.map((f) => (
          <img
            key={`fb-${f.id}`}
            className="fireball-fx"
            style={tileStyle(f.x, f.y)}
            src={SPRITES.fire}
            alt=""
          />
        ))}

        {placedBombs.map((b) => (
          <img
            key={`bomb-${b.id}`}
            className={`bomb-fx${b.exploding ? " exploding" : ""}`}
            style={tileStyle(b.x, b.y)}
            src={b.exploding ? SPRITES.explosion : SPRITES.bomb}
            alt=""
          />
        ))}

        {enemies.map((e) =>
          e.sprites ? (
            <img
              key={e.id}
              className={`enemy ${e.random ? "enemy-boss" : "enemy-sprite"}${
                e.random && bossHurt ? " hurt" : ""
              }`}
              style={tileStyle(e.x, e.y)}
              src={e.sprites[e.frame % e.sprites.length]}
              alt=""
            />
          ) : (
            <span key={e.id} className="enemy" style={tileStyle(e.x, e.y)} aria-hidden="true">
              {e.icon}
            </span>
          ),
        )}

        <Hero
          hero={hero}
          frame={frame}
          hasSword={hasSword}
          attacking={attacking}
          burning={onFire}
          invulnerable={invulnerable}
        />
      </div>

      <TouchControls
        onMove={move}
        onAttack={hasSword ? strike : undefined}
        onShoot={hasBow && arrows > 0 ? shoot : undefined}
        onBomb={bombs > 0 ? dropBomb : undefined}
      />
    </div>
  );

  function renderLandmark(l: LandmarkRef) {
    const key = `${l.kind}-${l.ref}`;

    if (l.kind === "rupee") {
      return (
        <img
          key={key}
          className="rupee"
          style={tileStyle(l.x, l.y)}
          src={SPRITES.rupee[l.rupee ?? "green"]}
          alt=""
        />
      );
    }
    if (l.kind === "heart") {
      return (
        <button
          key={key}
          className="landmark landmark-item"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("item.heart")}
        >
          <img className="item-sprite" src={SPRITES.heart.full} alt="" />
        </button>
      );
    }
    if (l.kind === "recoveryHeart") {
      return (
        <img
          key={key}
          className="rupee recovery-heart"
          style={tileStyle(l.x, l.y)}
          src={SPRITES.heart.full}
          alt=""
        />
      );
    }
    if (l.kind === "sword") {
      return (
        <button
          key={key}
          className="landmark landmark-item"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("item.sword")}
        >
          <img className="item-sprite pedestal" src={SPRITES.swordPedestal} alt="" />
        </button>
      );
    }
    if (l.kind === "chest") {
      const isOpen = opened.has(l.ref);
      return (
        <button
          key={key}
          className="landmark landmark-chest"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t(isOpen ? "item.chestOpen" : "item.chest")}
        >
          <img className="item-sprite" src={isOpen ? SPRITES.chestOpen : SPRITES.chest} alt="" />
        </button>
      );
    }
    if (l.kind === "lockedChest") {
      const isOpen = opened.has(l.ref);
      return (
        <button
          key={key}
          className="landmark landmark-chest"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t(isOpen ? "item.chestOpen" : "item.chestLocked")}
        >
          <img
            className="item-sprite"
            src={isOpen ? SPRITES.chestOpen : SPRITES.chestLocked}
            alt=""
          />
        </button>
      );
    }
    if (l.kind === "bossDoor") {
      const ganon = l.ref.startsWith("ganon");
      const opened = unlockedDoors.has(l.ref);
      const sprite = ganon
        ? opened
          ? SPRITES.doorOpen
          : SPRITES.doorBossLocked
        : opened
          ? SPRITES.doorDungeonOpen
          : SPRITES.doorDungeon;
      const cls = `landmark landmark-boss-door${opened ? " unlocked" : ""}${
        ganon ? " for-ganon" : ""
      }`;
      return (
        <button
          key={key}
          className={cls}
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("world.bossDoor")}
        >
          <img className="landmark-icon door-icon" src={sprite} alt="" />
        </button>
      );
    }
    if (l.kind === "cave") {
      return (
        <button
          key={key}
          className="landmark landmark-cave"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("world.cave")}
        >
          <img className="cave-mouth" src={SPRITES.hole} alt="" />
        </button>
      );
    }
    if (l.kind === "fountain") {
      return (
        <button
          key={key}
          className="landmark landmark-fountain"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("world.fountain")}
        >
          <img className="fountain-icon" src={SPRITES.fountain} alt="" />
        </button>
      );
    }
    if (l.kind === "fairy") {
      return (
        <button
          key={key}
          className="landmark landmark-fairy"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("item.fairy")}
        >
          <img className="item-sprite fairy-sprite" src={SPRITES.fairy} alt="" />
        </button>
      );
    }
    if (l.kind === "triforce") {
      return (
        <button
          key={key}
          className="landmark landmark-triforce"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("item.triforce")}
        >
          <img className="item-sprite" src={SPRITES.triforcePiece} alt="" />
        </button>
      );
    }
    if (l.kind === "shopItem") {
      const sold = opened.has(l.ref);
      const drop = l.drop;
      const icon = !drop
        ? SPRITES.rupee.green
        : drop.kind === "bombs"
          ? SPRITES.bomb
          : drop.kind === "arrows"
            ? SPRITES.arrow
            : drop.kind === "potion"
              ? SPRITES.potion
              : drop.kind === "bottle"
                ? SPRITES.bottleEmpty
                : drop.kind === "bossKey"
                  ? SPRITES.keyBoss
                  : SPRITES.keySmall;
      return (
        <button
          key={key}
          className={`landmark landmark-shop${sold ? " sold" : ""}`}
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t(`shop.${drop?.kind ?? "item"}`)}
        >
          {!sold && <img className="item-sprite shop-icon" src={icon} alt="" />}
          {!sold && (
            <span className="landmark-label shop-price">
              {l.price ?? 0}
              <img className="shop-price-rupee" src={SPRITES.rupee.green} alt="" />
            </span>
          )}
        </button>
      );
    }
    if (l.kind === "npc") {
      const merchant = l.ref === "merchant";
      return (
        <button
          key={key}
          className={`landmark landmark-npc${merchant ? " landmark-merchant" : ""}`}
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t(merchant ? "dialog.merchant.name" : "npc.name")}
        >
          <img
            className="landmark-icon npc-icon"
            src={merchant ? SPRITES.merchant : SPRITES.npc}
            alt=""
          />
        </button>
      );
    }
    if (l.kind === "door") {
      return (
        <button
          key={key}
          className="landmark landmark-door"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t("world.ganon_door")}
        >
          <img className="landmark-icon door-icon" src={SPRITES.doorOpen} alt="" />
        </button>
      );
    }
    if (l.kind === "exit") {
      // Only flag the doorway as "Sortie" when it leaves to the open world;
      // internal doors (cave ↔ shop / fountain / back-rooms) are just doors.
      const labelled = l.ref === OVERWORLD_ID;
      // The cave is a hole in the mountain — climb out via a ladder, not a
      // door. Inner sub-rooms (shop / fountain / boss room) keep doors.
      const isCaveLadder = labelled && scene.id === CAVE_ID;
      const sprite = isCaveLadder ? SPRITES.ladder : SPRITES.doorOpen;
      const iconClass = isCaveLadder ? "ladder-icon" : "door-icon";
      return (
        <button
          key={key}
          className={`landmark landmark-exit${labelled ? "" : " landmark-door-silent"}`}
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={t(isCaveLadder ? "world.ladder" : "world.exit")}
        >
          <img className={`landmark-icon ${iconClass}`} src={sprite} alt="" />
          {labelled && <span className="landmark-label">{t("world.exit")}</span>}
        </button>
      );
    }
    if (l.kind === "castle") {
      const castle = castleById(l.ref);
      if (!castle) return null;
      return (
        <button
          key={key}
          className="landmark landmark-castle"
          style={tileStyle(l.x, l.y)}
          onClick={() => interact(l)}
          aria-label={castle.name}
        >
          <img className="landmark-icon castle-icon" src={SPRITES.castle} alt="" />
          <span className="landmark-label">
            <span>{castle.name}</span> <span className="enter-tag">⤵ {t("world.enter")}</span>
          </span>
        </button>
      );
    }

    const p = projectById(l.ref);
    if (!p) return null;
    return (
      <button
        key={key}
        className={`landmark cat-${p.category}`}
        style={tileStyle(l.x, l.y)}
        onClick={() => interact(l)}
        aria-label={p.name}
      >
        <span className="landmark-icon">{p.icon}</span>
        <span className="landmark-label">{p.name}</span>
      </button>
    );
  }
}
