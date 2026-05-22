import type { TileKind } from "../types";

// ── Overworld dimensions ───────────────────────────────────────────────────
export const OVERWORLD_W = 20;
export const OVERWORLD_H = 14;

// ── Castle interior dimensions ─────────────────────────────────────────────
export const CASTLE_W = 13;
export const CASTLE_H = 10;

/** Tiles the hero cannot walk onto. */
export const BLOCKED: ReadonlyArray<TileKind> = ["tree", "water", "rock", "wall"];

const OVERWORLD_LAKE = { x0: 8, y0: 6, x1: 11, y1: 8 };

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

/** Static terrain for the open-air overworld. */
export function buildOverworld(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let y = 0; y < OVERWORLD_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < OVERWORLD_W; x++) {
      const border = x === 0 || y === 0 || x === OVERWORLD_W - 1 || y === OVERWORLD_H - 1;
      const inLake =
        x >= OVERWORLD_LAKE.x0 &&
        x <= OVERWORLD_LAKE.x1 &&
        y >= OVERWORLD_LAKE.y0 &&
        y <= OVERWORLD_LAKE.y1;
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

/** Stone room behind the TheCode castle gate, with a carpet up the middle. */
export function buildCastle(): TileKind[][] {
  const grid: TileKind[][] = [];
  const mid = Math.floor(CASTLE_W / 2);
  for (let y = 0; y < CASTLE_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < CASTLE_W; x++) {
      const border = x === 0 || y === 0 || x === CASTLE_W - 1 || y === CASTLE_H - 1;
      if (border) row.push("wall");
      else if (x === mid) row.push("carpet");
      else row.push("floor");
    }
    grid.push(row);
  }
  return grid;
}
