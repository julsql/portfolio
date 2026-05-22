import type { TileKind } from "../types";

export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 14;

/** Where the hero spawns. */
export const HERO_START = { x: 9, y: 9, facing: "up" as const };

// Fixed decoration so the layout is deterministic (and testable).
const LAKE = { x0: 8, y0: 6, x1: 11, y1: 8 };

const TREES: ReadonlyArray<[number, number]> = [
  [2, 4],
  [5, 4],
  [8, 4],
  [11, 4],
  [14, 4],
  [18, 4],
  [2, 7],
  [18, 7],
  [5, 8],
  [7, 8],
  [13, 8],
  [8, 10],
];

const FLOWERS: ReadonlyArray<[number, number]> = [
  [4, 6],
  [7, 5],
  [11, 9],
  [14, 6],
  [15, 9],
  [4, 9],
];

const ROCKS: ReadonlyArray<[number, number]> = [
  [12, 6],
  [3, 8],
];

const has = (list: ReadonlyArray<[number, number]>, x: number, y: number) =>
  list.some(([tx, ty]) => tx === x && ty === y);

/** Build the static tile grid. Landmarks are drawn on top (see projects.ts). */
export function buildMap(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      const border = x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1;
      const inLake = x >= LAKE.x0 && x <= LAKE.x1 && y >= LAKE.y0 && y <= LAKE.y1;
      if (border) row.push("tree");
      else if (inLake) row.push("water");
      else if (has(ROCKS, x, y)) row.push("rock");
      else if (has(TREES, x, y)) row.push("tree");
      else if (has(FLOWERS, x, y)) row.push("flower");
      else row.push(y === 9 ? "path" : "grass");
    }
    grid.push(row);
  }
  return grid;
}

/** Tiles the hero cannot walk onto. */
export const BLOCKED: ReadonlyArray<TileKind> = ["tree", "water", "rock"];
