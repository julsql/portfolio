import { useCallback, useEffect, useState } from "react";
import type { Hero, LandmarkRef, Scene } from "../types";
import { BLOCKED } from "../data/map";

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

interface UseMovement {
  hero: Hero;
  /** Try to move the hero one tile; interacts with a landmark if bumped. */
  move: (dir: Dir) => void;
  setEnabled: (v: boolean) => void;
}

/**
 * Owns the hero position within a scene. Walking into a landmark does not move
 * the hero — it calls `onInteract` instead (Zelda-style "bump to interact").
 */
export function useMovement(
  scene: Scene,
  initial: Hero,
  onInteract: (landmark: LandmarkRef) => void,
): UseMovement {
  const [hero, setHero] = useState<Hero>(initial);
  const [enabled, setEnabled] = useState(true);

  const move = useCallback(
    (dir: Dir) => {
      if (!enabled) return;
      setHero((prev) => {
        const { dx, dy } = DELTAS[dir];
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        const facing = dir;
        if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) {
          return { ...prev, facing };
        }
        const landmark = scene.landmarks.find((l) => l.x === nx && l.y === ny);
        if (landmark) {
          onInteract(landmark);
          return { ...prev, facing };
        }
        if (BLOCKED.includes(scene.tiles[ny][nx])) {
          return { ...prev, facing };
        }
        return { x: nx, y: ny, facing };
      });
    },
    [enabled, scene, onInteract],
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

  return { hero, move, setEnabled };
}
