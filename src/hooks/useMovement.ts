import { useCallback, useEffect, useRef, useState } from "react";
import type { Hero, LandmarkRef, Pot, Rock, Scene, TileKind } from "../types";
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
  pots?: Pot[];
  enemies: { x: number; y: number }[];
  pushRock: (id: string, x: number, y: number) => void;
  removeRock: (id: string) => void;
  /** Fires on every successful step with the tile Link just walked onto. */
  onStep?: (tile: TileKind) => void;
}

interface UseMovement {
  hero: Hero;
  /** Increments on every successful step. */
  steps: number;
  move: (dir: Dir) => void;
  /** Turn the hero without stepping (e.g. to face right before shooting). */
  face: (dir: Dir) => void;
  setEnabled: (v: boolean) => void;
}

/**
 * Owns the hero position within a scene. Handles bump-to-interact landmarks,
 * walk-over pickups (rupees), pushable rocks (which sink in water) and drowning.
 *
 * Side effects (pickups, damage, rock moves) run directly in `move` — never
 * inside a setState updater — so React 18 StrictMode's double-invoked updaters
 * can't fire them twice (which doubled rupee counts).
 */
export function useMovement(scene: Scene, initial: Hero, h: MoveHandlers): UseMovement {
  const [hero, setHero] = useState<Hero>(initial);
  const heroRef = useRef<Hero>(initial);
  const [steps, setSteps] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const { onInteract, onPickup, onDrown, rocks, pots, enemies, pushRock, removeRock, onStep } = h;
  const potsList = pots ?? [];

  const move = useCallback(
    (dir: Dir) => {
      if (!enabled) return;
      const prev = heroRef.current;
      const { dx, dy } = DELTAS[dir];
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      const facing = dir;

      const face = () => {
        const next = { ...prev, facing };
        heroRef.current = next;
        setHero(next);
      };
      const stepTo = (x: number, y: number) => {
        const next = { x, y, facing };
        heroRef.current = next;
        setHero(next);
        setSteps((s) => s + 1);
        onStep?.(scene.tiles[y][x]);
      };

      if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) return face();

      const landmark = scene.landmarks.find((l) => l.x === nx && l.y === ny);
      if (landmark) {
        if (landmark.pickup) {
          onPickup(landmark);
          return stepTo(nx, ny);
        }
        onInteract(landmark);
        return face();
      }

      // Clay pots block movement until smashed (sword / arrow / bomb).
      if (potsList.some((p) => p.x === nx && p.y === ny)) return face();

      const rock = rocks.find((r) => r.x === nx && r.y === ny);
      if (rock) {
        const bx = nx + dx;
        const by = ny + dy;
        const inBounds = bx >= 0 && by >= 0 && bx < scene.width && by < scene.height;
        if (!inBounds) return face();
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
        if (obstructed) return face();
        pushRock(rock.id, bx, by);
        return stepTo(nx, ny);
      }

      const tile = scene.tiles[ny][nx];
      if (tile === "water") {
        onDrown();
        return face();
      }
      if (BLOCKED.includes(tile)) return face();
      return stepTo(nx, ny);
    },
    [
      enabled,
      scene,
      rocks,
      potsList,
      enemies,
      onInteract,
      onPickup,
      onDrown,
      pushRock,
      removeRock,
      onStep,
    ],
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

  const face = useCallback((dir: Dir) => {
    const prev = heroRef.current;
    if (prev.facing === dir) return;
    const next = { ...prev, facing: dir };
    heroRef.current = next;
    setHero(next);
  }, []);

  return { hero, steps, move, face, setEnabled };
}
