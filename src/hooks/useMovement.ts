import { useCallback, useEffect, useState } from "react";
import type { Hero, LandmarkRef, Rock, Scene } from "../types";
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

export interface MoveHandlers {
  onInteract: (l: LandmarkRef) => void;
  onPickup: (l: LandmarkRef) => void;
  onDrown: () => void;
  rocks: Rock[];
  enemies: { x: number; y: number }[];
  pushRock: (id: string, x: number, y: number) => void;
  removeRock: (id: string) => void;
}

interface UseMovement {
  hero: Hero;
  /** Increments on every successful step — drives the walk-frame animation. */
  steps: number;
  move: (dir: Dir) => void;
  setEnabled: (v: boolean) => void;
}

/**
 * Owns the hero position within a scene. Handles bump-to-interact landmarks,
 * walk-over pickups (rupees), pushable rocks (which sink in water) and drowning.
 */
export function useMovement(scene: Scene, initial: Hero, h: MoveHandlers): UseMovement {
  const [hero, setHero] = useState<Hero>(initial);
  const [steps, setSteps] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const { onInteract, onPickup, onDrown, rocks, enemies, pushRock, removeRock } = h;

  const move = useCallback(
    (dir: Dir) => {
      if (!enabled) return;
      setHero((prev) => {
        const { dx, dy } = DELTAS[dir];
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        const facing = dir;
        const stay = { ...prev, facing };
        const stepTo = (x: number, y: number) => {
          setSteps((s) => s + 1);
          return { x, y, facing };
        };

        if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) return stay;

        const landmark = scene.landmarks.find((l) => l.x === nx && l.y === ny);
        if (landmark) {
          if (landmark.pickup) {
            onPickup(landmark);
            return stepTo(nx, ny);
          }
          onInteract(landmark);
          return stay;
        }

        const rock = rocks.find((r) => r.x === nx && r.y === ny);
        if (rock) {
          const bx = nx + dx;
          const by = ny + dy;
          const inBounds = bx >= 0 && by >= 0 && bx < scene.width && by < scene.height;
          if (!inBounds) return stay;
          const beyond = scene.tiles[by][bx];
          if (beyond === "water") {
            // Heave the boulder into the water — it sinks and vanishes.
            removeRock(rock.id);
            return stepTo(nx, ny);
          }
          const obstructed =
            BLOCKED.includes(beyond) ||
            rocks.some((r) => r.x === bx && r.y === by) ||
            scene.landmarks.some((l) => l.x === bx && l.y === by) ||
            enemies.some((e) => e.x === bx && e.y === by);
          if (obstructed) return stay;
          pushRock(rock.id, bx, by);
          return stepTo(nx, ny);
        }

        const tile = scene.tiles[ny][nx];
        if (tile === "water") {
          onDrown();
          return stay;
        }
        if (BLOCKED.includes(tile)) return stay;
        return stepTo(nx, ny);
      });
    },
    [enabled, scene, rocks, enemies, onInteract, onPickup, onDrown, pushRock, removeRock],
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

  return { hero, steps, move, setEnabled };
}
