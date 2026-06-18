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

// ── Secret cave + side rooms ───────────────────────────────────────────────
export const CAVE_W = 13;
export const CAVE_H = 10;
export const FOUNTAIN_W = 11;
export const FOUNTAIN_H = 9;
export const BOSS_W = 11;
export const BOSS_H = 8;
export const SHOP_W = 11;
export const SHOP_H = 8;

/** Tiles the hero cannot walk onto. Water is walkable but drowns (see useMovement). */
export const BLOCKED: ReadonlyArray<TileKind> = [
  "tree",
  "rock",
  "wall",
  "mountain",
  "mountainCave",
];

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
    // The secret-cave mouth is carved straight into the mountain range (its
    // landmark sits on this same tile in scenes.ts — keep them in sync).
    if (x === 17 && y === 3) return "mountainCave";
    // Frame: mountains north, sea south, forest east/west.
    if (y === 0 || (x === 0 && y < 7)) return "mountain";
    if (y === H - 1) return "water";
    if ((x === 0 && y > 6) || (x === W - 1 && y > 3 && y < 9)) return "tree";

    // A wooden pier reaching from the shore out into the sea (walkable).
    if (x >= 14 && x <= 17 && y === 11) return "dock";

    // Central plaza around the castle — all grass, so the path tile that used
    // to peek out from behind the castle sprite blends back into the field.
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    if (dx <= 2 && dy <= 2) return "grass";

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

/** The hidden cave reached from a mountain opening on the overworld. */
export function buildSecretCave(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let y = 0; y < CAVE_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < CAVE_W; x++) {
      const border = x === 0 || y === 0 || x === CAVE_W - 1 || y === CAVE_H - 1;
      row.push(border ? "wall" : "floor");
    }
    grid.push(row);
  }
  return grid;
}

/** The boss room hidden behind a bombable wall. */
export function buildBossRoom(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let y = 0; y < BOSS_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < BOSS_W; x++) {
      const border = x === 0 || y === 0 || x === BOSS_W - 1 || y === BOSS_H - 1;
      row.push(border ? "wall" : "floor");
    }
    grid.push(row);
  }
  return grid;
}

/** The shop reached through a side door of the secret cave. */
export function buildShop(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let y = 0; y < SHOP_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < SHOP_W; x++) {
      const border = x === 0 || y === 0 || x === SHOP_W - 1 || y === SHOP_H - 1;
      row.push(border ? "wall" : "floor");
    }
    grid.push(row);
  }
  return grid;
}

/**
 * The fairy fountain: a small grotto with a pool of water and stone shores.
 * The hero spawns at the bottom and walks up to the basin to find fairies.
 */
export function buildFountain(): TileKind[][] {
  const grid: TileKind[][] = [];
  const cx = Math.floor(FOUNTAIN_W / 2);
  const cy = Math.floor(FOUNTAIN_H / 2) - 1;
  for (let y = 0; y < FOUNTAIN_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < FOUNTAIN_W; x++) {
      const border = x === 0 || y === 0 || x === FOUNTAIN_W - 1 || y === FOUNTAIN_H - 1;
      if (border) row.push("wall");
      else {
        const dx = x - cx;
        const dy = y - cy;
        // A square pool around the central altar (the altar itself is a path tile).
        if (dx === 0 && dy === 0) row.push("path");
        else if (Math.abs(dx) <= 2 && Math.abs(dy) <= 1) row.push("water");
        else row.push("floor");
      }
    }
    grid.push(row);
  }
  return grid;
}
