import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Hero as HeroType, LandmarkRef, Scene } from "../types";
import { castleById, projectById } from "../data/projects";
import { useMovement } from "../hooks/useMovement";
import Hero from "./Hero";
import TouchControls from "./TouchControls";

interface Props {
  scene: Scene;
  initialHero: HeroType;
  onInteract: (landmark: LandmarkRef) => void;
  onGameOver: () => void;
  paused: boolean;
  crowned: boolean;
}

/** Heat ticks (every BURN_MS) on a fire tile before the hero burns up. */
const BURN_LIMIT = 6;
const BURN_MS = 350;

function tileStyle(x: number, y: number) {
  return { left: `calc(${x} * var(--tile))`, top: `calc(${y} * var(--tile))` };
}

export default function SceneView({
  scene,
  initialHero,
  onInteract,
  onGameOver,
  paused,
  crowned,
}: Props) {
  const { t } = useTranslation();
  const { hero, move, setEnabled } = useMovement(scene, initialHero, onInteract);
  const [heat, setHeat] = useState(0);

  useEffect(() => setEnabled(!paused), [paused, setEnabled]);

  // Heat builds up while standing on a fire tile, and cools instantly off it.
  const onFire = scene.decor.some((d) => d.hazard && d.x === hero.x && d.y === hero.y);
  useEffect(() => {
    if (paused || !onFire) {
      setHeat(0);
      return;
    }
    const id = setInterval(() => setHeat((h) => h + 1), BURN_MS);
    return () => clearInterval(id);
  }, [onFire, paused]);

  useEffect(() => {
    if (heat >= BURN_LIMIT) onGameOver();
  }, [heat, onGameOver]);

  const heatRatio = Math.min(heat / BURN_LIMIT, 1);

  return (
    <div className="overworld">
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
          <span key={`d-${i}`} className="decor" style={tileStyle(d.x, d.y)} aria-hidden="true">
            {d.icon}
          </span>
        ))}

        {scene.landmarks.map((l) => {
          if (l.kind === "crown") {
            return (
              <button
                key={`crown-${l.x}-${l.y}`}
                className="landmark landmark-crown"
                style={tileStyle(l.x, l.y)}
                onClick={() => onInteract(l)}
                aria-label="crown"
              >
                <span className="landmark-icon">👑</span>
              </button>
            );
          }

          if (l.kind === "exit") {
            return (
              <button
                key={`exit-${l.x}-${l.y}`}
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
                key={`castle-${l.ref}`}
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
              key={`p-${l.ref}`}
              className={`landmark cat-${p.category}`}
              style={tileStyle(l.x, l.y)}
              onClick={() => onInteract(l)}
              aria-label={p.name}
            >
              <span className="landmark-icon">{p.icon}</span>
              <span className="landmark-label">{p.name}</span>
            </button>
          );
        })}

        <Hero hero={hero} crowned={crowned} burning={onFire} />
      </div>

      <TouchControls onMove={move} />
    </div>
  );
}
