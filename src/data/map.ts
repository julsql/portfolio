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
export function buildOverworld(): TileKind[][] {
  const W = OVERWORLD_W;
  const H = OVERWORLD_H;
  const cx = 10;
  const cy = 7;
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
    // Frame: mountains north, sea south, forest east/west.
    if (y === 0 || (x === 0 && y < 7)) return "mountain";
    if (y === H - 1) return "water";
    if ((x === 0 && y > 6) || (x === W - 1 && y > 3 && y < 9)) return "tree";

    // Central plaza around the castle.
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    if (dx <= 2 && dy <= 2) return dx + dy === 0 ? "path" : "grass";

    const left = x < cx;
    const top = y < cy;
    if (top && left) return "sand"; // desert
    if (top && !left) return x >= 15 && y <= 3 ? "mountain" : "grass"; // mountains
    if (!top && left) return x >= 2 && x <= 5 && y >= 9 && y <= 11 ? "water" : "grass"; // lake
    return x >= 14 && y >= 9 ? "water" : "grass"; // sea
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
