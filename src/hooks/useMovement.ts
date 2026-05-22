import { useCallback, useEffect, useState } from "react";
import type { Hero, Project } from "../types";
import { BLOCKED, HERO_START, MAP_HEIGHT, MAP_WIDTH } from "../data/map";
import { PROJECTS } from "../data/projects";

type Dir = "up" | "down" | "left" | "right";

const DELTAS: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  z: "up", // AZERTY
  q: "left", // AZERTY
};

function projectAt(x: number, y: number): Project | undefined {
  return PROJECTS.find((p) => p.pos.x === x && p.pos.y === y);
}

interface UseMovement {
  hero: Hero;
  /** Try to move the hero one tile; opens a project if a landmark is bumped. */
  move: (dir: Dir) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

/**
 * Owns the hero position. Walking into a project landmark does not move the
 * hero — it calls `onOpen` instead (Zelda-style "bump to interact").
 */
export function useMovement(grid: string[][], onOpen: (p: Project) => void): UseMovement {
  const [hero, setHero] = useState<Hero>({ ...HERO_START });
  const [enabled, setEnabled] = useState(true);

  const move = useCallback(
    (dir: Dir) => {
      if (!enabled) return;
      setHero((prev) => {
        const { dx, dy } = DELTAS[dir];
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        const facing = dir;
        if (nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT) {
          return { ...prev, facing };
        }
        const target = projectAt(nx, ny);
        if (target) {
          onOpen(target);
          return { ...prev, facing };
        }
        if (BLOCKED.includes(grid[ny][nx] as never)) {
          return { ...prev, facing };
        }
        return { x: nx, y: ny, facing };
      });
    },
    [enabled, grid, onOpen],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  return { hero, move, enabled, setEnabled };
}
