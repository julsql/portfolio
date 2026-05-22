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
  pushRock: (id: string, x: number, y: number) => void;
}

interface UseMovement {
  hero: Hero;
  move: (dir: Dir) => void;
  setEnabled: (v: boolean) => void;
}

/**
 * Owns the hero position within a scene. Handles bump-to-interact landmarks,
 * walk-over pickups (coins), pushable rocks and drowning in water.
 */
export function useMovement(scene: Scene, initial: Hero, h: MoveHandlers): UseMovement {
  const [hero, setHero] = useState<Hero>(initial);
  const [enabled, setEnabled] = useState(true);
  const { onInteract, onPickup, onDrown, rocks, pushRock } = h;

  const move = useCallback(
    (dir: Dir) => {
      if (!enabled) return;
      setHero((prev) => {
        const { dx, dy } = DELTAS[dir];
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        const facing = dir;
        const stay = { ...prev, facing };
        const step = { x: nx, y: ny, facing };

        if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) return stay;

        const landmark = scene.landmarks.find((l) => l.x === nx && l.y === ny);
        if (landmark) {
          if (landmark.pickup) {
            onPickup(landmark);
            return step;
          }
          onInteract(landmark);
          return stay;
        }

        const rock = rocks.find((r) => r.x === nx && r.y === ny);
        if (rock) {
          const bx = nx + dx;
          const by = ny + dy;
          const inBounds = bx >= 0 && by >= 0 && bx < scene.width && by < scene.height;
          const beyond = inBounds ? scene.tiles[by][bx] : null;
          const blocked =
            !inBounds ||
            beyond === "water" ||
            BLOCKED.includes(beyond as never) ||
            rocks.some((r) => r.x === bx && r.y === by) ||
            scene.landmarks.some((l) => l.x === bx && l.y === by);
          if (blocked) return stay;
          pushRock(rock.id, bx, by);
          return step;
        }

        const tile = scene.tiles[ny][nx];
        if (tile === "water") {
          onDrown();
          return stay;
        }
        if (BLOCKED.includes(tile)) return stay;
        return step;
      });
    },
    [enabled, scene, rocks, onInteract, onPickup, onDrown, pushRock],
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
