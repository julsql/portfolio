import type { TileKind } from "../types";

// ── Overworld dimensions ───────────────────────────────────────────────────
export const OVERWORLD_W = 20;
export const OVERWORLD_H = 14;

// ── Castle interior dimensions ─────────────────────────────────────────────
export const CASTLE_W = 13;
export const CASTLE_H = 10;

// ── Ganon's lair dimensions ────────────────────────────────────────────────
export const GANON_W = 11;
export const GANON_H = 8;

/** Tiles the hero cannot walk onto. Water is walkable but drowns (see useMovement). */
export const BLOCKED: ReadonlyArray<TileKind> = ["tree", "rock", "wall", "mountain"];

/**
 * Themed overworld: a desert (NW), mountains (NE), a lake (SW) and the sea (SE),
 * with TheCode castle on a grassy plaza in the centre.
 */
// Single trees scattered across empty land — never a wall or a frame.
const OVERWORLD_TREES = new Set([
  "17,2",
  "18,4",
  "2,9",
  "2,11",
  "5,9",
  "9,11",
  "13,9",
  "13,12",
  "18,8",
]);

export function buildOverworld(): TileKind[][] {
  const W = OVERWORLD_W;
  const H = OVERWORLD_H;
  const grid: TileKind[][] = [];

  for (let y = 0; y < H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < W; x++) {
      row.push(tile(x, y));
    }
    grid.push(row);
  }
  return grid;

  function tile(x: number, y: number): TileKind {
    // Desert: NW corner, reaching the top & left edges so it feels endless.
    if (x <= 6 && y <= 5) return "sand";

    // Mountains border the desert on its inner (south & east) edges, with one
    // sandy pass into it — they don't run across the whole top of the map.
    const pass = x === 7 && (y === 2 || y === 3);
    if (pass) return "sand";
    if ((x === 7 && y <= 6) || (y === 6 && x <= 7)) return "mountain";

    // Sea: SE corner, reaching the edges.
    if (x >= 14 && y >= 9) return "water";

    // Castle plaza at the centre.
    if (Math.abs(x - 10) <= 2 && Math.abs(y - 7) <= 2) {
      return x === 10 && y === 7 ? "path" : "grass";
    }

    if (OVERWORLD_TREES.has(`${x},${y}`)) return "tree";
    return "grass";
  }
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

/** A small dark chamber for the final boss. */
export function buildGanonRoom(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let y = 0; y < GANON_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < GANON_W; x++) {
      const border = x === 0 || y === 0 || x === GANON_W - 1 || y === GANON_H - 1;
      row.push(border ? "wall" : "floor");
    }
    grid.push(row);
  }
  return grid;
}
