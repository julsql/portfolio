import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Project, TileKind } from "../types";
import { MAP_HEIGHT, MAP_WIDTH } from "../data/map";
import { PROJECTS } from "../data/projects";
import { useMovement } from "../hooks/useMovement";
import Hero from "./Hero";
import TouchControls from "./TouchControls";
import Legend from "./Legend";

interface Props {
  grid: TileKind[][];
  onOpen: (p: Project) => void;
  paused: boolean;
}

export default function Overworld({ grid, onOpen, paused }: Props) {
  const { t } = useTranslation();
  const { hero, move, setEnabled } = useMovement(grid, onOpen);

  // Freeze movement while a modal is open.
  useEffect(() => setEnabled(!paused), [paused, setEnabled]);

  return (
    <div className="overworld">
      <p className="explore-hint">
        <span className="hint-desktop">{t("hud.hint")}</span>
        <span className="hint-touch">{t("hud.hint_touch")}</span>
      </p>

      <div
        className="field"
        style={{ ["--cols" as string]: MAP_WIDTH, ["--rows" as string]: MAP_HEIGHT }}
      >
        <div className="tilemap">
          {grid.flatMap((row, y) =>
            row.map((kind, x) => <div key={`${x}-${y}`} className={`tile tile-${kind}`} />),
          )}
        </div>

        {PROJECTS.map((p) => (
          <button
            key={p.id}
            className={`landmark cat-${p.category}`}
            style={{ left: `calc(${p.pos.x} * var(--tile))`, top: `calc(${p.pos.y} * var(--tile))` }}
            onClick={() => onOpen(p)}
            aria-label={p.name}
          >
            <span className="landmark-icon">{p.icon}</span>
            <span className="landmark-label">{p.name}</span>
          </button>
        ))}

        <Hero hero={hero} />
      </div>

      <Legend />
      <TouchControls onMove={move} />
    </div>
  );
}
