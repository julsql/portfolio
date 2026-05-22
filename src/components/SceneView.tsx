import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EnemySpec, Hero as HeroType, LandmarkRef, Scene } from "../types";
import { castleById, projectById } from "../data/projects";
import { useMovement } from "../hooks/useMovement";
import Hero from "./Hero";
import TouchControls from "./TouchControls";

interface Props {
  scene: Scene;
  initialHero: HeroType;
  onInteract: (l: LandmarkRef) => void;
  onPickup: (l: LandmarkRef) => void;
  onHit: (fatal: boolean) => void;
  paused: boolean;
  crowned: boolean;
  hearts: number;
  coins: number;
}

type Enemy = EnemySpec & { dir: number };

const MAX_HEARTS = 3;
const BURN_LIMIT = 6;
const BURN_MS = 350;
const ENEMY_MS = 600;

function tileStyle(x: number, y: number) {
  return { left: `calc(${x} * var(--tile))`, top: `calc(${y} * var(--tile))` };
}

export default function SceneView(props: Props) {
  const { scene, initialHero, onInteract, onPickup, onHit, paused, crowned, hearts, coins } = props;
  const { t } = useTranslation();

  const [rocks, setRocks] = useState(scene.rocks ?? []);
  const [enemies, setEnemies] = useState<Enemy[]>(
    (scene.enemies ?? []).map((e) => ({ ...e, dir: 1 })),
  );

  const pushRock = useCallback(
    (id: string, x: number, y: number) =>
      setRocks((rs) => rs.map((r) => (r.id === id ? { ...r, x, y } : r))),
    [],
  );
  const onDrown = useCallback(() => onHit(false), [onHit]);

  const { hero, move, setEnabled } = useMovement(scene, initialHero, {
    onInteract,
    onPickup,
    onDrown,
    rocks,
    pushRock,
  });

  useEffect(() => setEnabled(!paused), [paused, setEnabled]);

  // ── Fire hazard: heat builds on a fire tile, costs a heart when it maxes ──
  const [heat, setHeat] = useState(0);
  const onFire = scene.decor.some((d) => d.hazard && d.x === hero.x && d.y === hero.y);
  useEffect(() => {
    if (paused || !onFire) {
      setHeat(0);
      return;
    }
    const id = setInterval(() => setHeat((s) => s + 1), BURN_MS);
    return () => clearInterval(id);
  }, [onFire, paused]);
  useEffect(() => {
    if (heat >= BURN_LIMIT) onHit(false);
  }, [heat, onHit]);

  // ── Enemies patrol back and forth ────────────────────────────────────────
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setEnemies((prev) =>
        prev.map((e) => {
          let dir = e.dir;
          const pos = (e.axis === "h" ? e.x : e.y) + dir;
          if (pos > e.max || pos < e.min) dir = -dir;
          const next = (e.axis === "h" ? e.x : e.y) + dir;
          return e.axis === "h" ? { ...e, x: next, dir } : { ...e, y: next, dir };
        }),
      );
    }, ENEMY_MS);
    return () => clearInterval(id);
  }, [paused]);

  // Touching an enemy costs a heart.
  useEffect(() => {
    if (paused) return;
    if (enemies.some((e) => e.x === hero.x && e.y === hero.y)) onHit(false);
  }, [enemies, hero, paused, onHit]);

  const heatRatio = Math.min(heat / BURN_LIMIT, 1);

  return (
    <div className="overworld">
      <div className="status">
        <span className="hearts">
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <span key={i}>{i < hearts ? "❤️" : "🖤"}</span>
          ))}
        </span>
        <span className="coins">🪙 {coins}</span>
      </div>

      <p className={`explore-hint${onFire ? " danger" : ""}`}>
        {onFire ? (
          t("world.hot")
        ) : (
          <>
            <span className="hint-desktop">{t("hud.hint")}</span>
            <span className="hint-touch">{t("hud.hint_touch")}</span>
          </>
        )}
      </p>

      <div
        className={`field scene-${scene.id}`}
        style={{ ["--cols" as string]: scene.width, ["--rows" as string]: scene.height }}
      >
        {heat > 0 && (
          <div className="heat-overlay" style={{ opacity: heatRatio }} aria-hidden="true" />
        )}

        <div className="tilemap">
          {scene.tiles.flatMap((row, y) =>
            row.map((kind, x) => <div key={`${x}-${y}`} className={`tile tile-${kind}`} />),
          )}
        </div>

        {scene.decor.map((d, i) => (
          <span
            key={`d-${i}`}
            className={`decor${d.hazard ? " hazard" : ""}`}
            style={tileStyle(d.x, d.y)}
            aria-hidden="true"
          >
            {d.icon}
          </span>
        ))}

        {rocks.map((r) => (
          <span key={r.id} className="rock-obj" style={tileStyle(r.x, r.y)} aria-hidden="true">
            🪨
          </span>
        ))}

        {scene.landmarks.map((l) => renderLandmark(l))}

        {enemies.map((e) => (
          <span key={e.id} className="enemy" style={tileStyle(e.x, e.y)} aria-hidden="true">
            {e.icon}
          </span>
        ))}

        <Hero hero={hero} crowned={crowned} burning={onFire} />
      </div>

      <TouchControls onMove={move} />
    </div>
  );

  function renderLandmark(l: LandmarkRef) {
    const key = `${l.kind}-${l.ref}-${l.x}-${l.y}`;

    if (l.kind === "coin") {
      return (
        <span key={key} className="coin" style={tileStyle(l.x, l.y)} aria-hidden="true">
          🪙
        </span>
      );
    }
    if (l.kind === "crown") {
      return (
        <button
          key={key}
          className="landmark landmark-crown"
          style={tileStyle(l.x, l.y)}
          onClick={() => onInteract(l)}
          aria-label="crown"
        >
          <span className="landmark-icon">👑</span>
        </button>
      );
    }
    if (l.kind === "ganon") {
      return (
        <button
          key={key}
          className="landmark landmark-ganon"
          style={tileStyle(l.x, l.y)}
          onClick={() => onInteract(l)}
          aria-label="Ganon"
        >
          <span className="landmark-icon">👹</span>
          <span className="landmark-label">Ganon</span>
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
          <span className="landmark-icon">🚪</span>
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
          <span className="landmark-icon">🚪</span>
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
