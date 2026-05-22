import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EnemySpec, Hero as HeroType, LandmarkRef, Scene, TileKind } from "../types";
import { castleById, projectById } from "../data/projects";
import { BLOCKED } from "../data/map";
import { SPRITES } from "../data/sprites";
import { useMovement } from "../hooks/useMovement";
import Hero from "./Hero";
import TouchControls from "./TouchControls";

interface Props {
  scene: Scene;
  initialHero: HeroType;
  onInteract: (l: LandmarkRef) => void;
  onPickup: (l: LandmarkRef) => void;
  onHit: () => void;
  paused: boolean;
  hasSword: boolean;
  health: number;
  maxHearts: number;
  rupees: number;
  invulnerable: boolean;
}

type Enemy = EnemySpec & { dir: number; frame: number };
type Dir = HeroType["facing"];

const BURN_MS = 300;
const ENEMY_MS = 600;
const ATTACK_MS = 260;
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

export default function SceneView(props: Props) {
  const { scene, initialHero, onInteract, onPickup, onHit } = props;
  const { paused, hasSword, health, maxHearts, rupees, invulnerable } = props;
  const { t } = useTranslation();

  const [rocks, setRocks] = useState(scene.rocks ?? []);
  const [enemies, setEnemies] = useState<Enemy[]>(
    (scene.enemies ?? []).map((e) => ({ ...e, dir: 1, frame: 0 })),
  );
  const [attacking, setAttacking] = useState(false);

  const pushRock = useCallback(
    (id: string, x: number, y: number) =>
      setRocks((rs) => rs.map((r) => (r.id === id ? { ...r, x, y } : r))),
    [],
  );
  const removeRock = useCallback(
    (id: string) => setRocks((rs) => rs.filter((r) => r.id !== id)),
    [],
  );
  const onDrown = useCallback(() => onHit(), [onHit]);

  const { hero, move, setEnabled } = useMovement(scene, initialHero, {
    onInteract,
    onPickup,
    onDrown,
    rocks,
    enemies,
    pushRock,
    removeRock,
  });
  useEffect(() => setEnabled(!paused), [paused, setEnabled]);

  // Idle "breathing": continuously alternate the walk frames so Link feels alive.
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

  // ── Enemies: patrol or random walk, blocked by rocks / walls / landmarks ──
  const canEnter = useCallback(
    (x: number, y: number, tiles: TileKind[][]) => {
      if (x < 0 || y < 0 || x >= scene.width || y >= scene.height) return false;
      if (tiles[y][x] === "water" || BLOCKED.includes(tiles[y][x])) return false;
      if (rocks.some((r) => r.x === x && r.y === y)) return false;
      if (scene.landmarks.some((l) => l.x === x && l.y === y)) return false;
      return true;
    },
    [scene, rocks],
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
          // Patrol along its axis, bouncing at bounds or obstacles.
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

  // Contact with an enemy hurts.
  useEffect(() => {
    if (paused) return;
    if (enemies.some((e) => e.x === hero.x && e.y === hero.y)) onHit();
  }, [enemies, hero, paused, onHit]);

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
    setAttacking(true);
    setTimeout(() => setAttacking(false), ATTACK_MS);
    const [dx, dy] = DELTA[hero.facing];
    const fx = hero.x + dx;
    const fy = hero.y + dy;
    setEnemies((prev) =>
      prev.flatMap((e) => {
        if (e.x !== fx || e.y !== fy) return [e];
        const hp = (e.hp ?? 1) - 1;
        return hp > 0 ? [{ ...e, hp }] : [];
      }),
    );
  }, [attacking, hero]);

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
      </div>

      <p className={`explore-hint${onFire ? " danger" : ""}`}>
        {onFire ? (
          t("world.hot")
        ) : (
          <>
            <span className="hint-desktop">{hasSword ? t("hud.hint_sword") : t("hud.hint")}</span>
            <span className="hint-touch">{t("hud.hint_touch")}</span>
          </>
        )}
      </p>

      <div
        className={`field scene-${scene.id}`}
        style={{ ["--cols" as string]: scene.width, ["--rows" as string]: scene.height }}
      >
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

        {scene.landmarks.map((l) => renderLandmark(l))}

        {enemies.map((e) =>
          e.sprites ? (
            <img
              key={e.id}
              className={`enemy ${e.random ? "enemy-boss" : "enemy-sprite"}`}
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

      <TouchControls onMove={move} onAttack={hasSword ? strike : undefined} />
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
          onClick={() => onInteract(l)}
          aria-label={t("item.heart")}
        >
          <img className="item-sprite" src={SPRITES.heart.full} alt="" />
        </button>
      );
    }
    if (l.kind === "sword") {
      return (
        <button
          key={key}
          className="landmark landmark-item"
          style={tileStyle(l.x, l.y)}
          onClick={() => onInteract(l)}
          aria-label={t("item.sword")}
        >
          <img className="item-sprite pedestal" src={SPRITES.swordPedestal} alt="" />
        </button>
      );
    }
    if (l.kind === "npc") {
      return (
        <button
          key={key}
          className="landmark landmark-npc"
          style={tileStyle(l.x, l.y)}
          onClick={() => onInteract(l)}
          aria-label={t("npc.name")}
        >
          <span className="landmark-icon">🧙</span>
          <span className="landmark-label">{t("npc.name")}</span>
        </button>
      );
    }
    if (l.kind === "door") {
      return (
        <button
          key={key}
          className="landmark landmark-door"
          style={tileStyle(l.x, l.y)}
          onClick={() => onInteract(l)}
          aria-label={t("world.ganon_door")}
        >
          <img className="landmark-icon door-icon" src={SPRITES.door} alt="" />
          <span className="landmark-label">{t("world.ganon_door")}</span>
        </button>
      );
    }
    if (l.kind === "exit") {
      return (
        <button
          key={key}
          className="landmark landmark-exit"
          style={tileStyle(l.x, l.y)}
          onClick={() => onInteract(l)}
          aria-label={t("world.exit")}
        >
          <img className="landmark-icon door-icon" src={SPRITES.door} alt="" />
          <span className="landmark-label">{t("world.exit")}</span>
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
          onClick={() => onInteract(l)}
          aria-label={castle.name}
        >
          <span className="landmark-icon">{castle.icon}</span>
          <span className="landmark-label">
            {castle.name} <span className="enter-tag">⤵ {t("world.enter")}</span>
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
        onClick={() => onInteract(l)}
        aria-label={p.name}
      >
        <span className="landmark-icon">{p.icon}</span>
        <span className="landmark-label">{p.name}</span>
      </button>
    );
  }
}
