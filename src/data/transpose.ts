import type { Hero, Scene } from "../types";

const FACING: Record<Hero["facing"], Hero["facing"]> = {
  up: "left",
  down: "right",
  left: "up",
  right: "down",
};

/** Mirror a point/hero across the main diagonal (swap x/y). */
export function transposeHero(h: Hero): Hero {
  return { x: h.y, y: h.x, facing: FACING[h.facing] };
}

/**
 * Transpose a whole scene (swap its axes) so a landscape 20x14 map becomes a
 * portrait 14x20 one — used when the window is in portrait orientation. The
 * world is just diagonally mirrored; movement stays intuitive (up is up).
 */
export function transposeScene(scene: Scene): Scene {
  const width = scene.height;
  const height = scene.width;
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => scene.tiles[x][y]),
  );

  return {
    ...scene,
    width,
    height,
    tiles,
    heroStart: transposeHero(scene.heroStart),
    landmarks: scene.landmarks.map((l) => ({
      ...l,
      x: l.y,
      y: l.x,
      spawn: l.spawn ? transposeHero(l.spawn) : undefined,
    })),
    decor: scene.decor.map((d) => ({ ...d, x: d.y, y: d.x })),
    rocks: scene.rocks?.map((r) => ({ ...r, x: r.y, y: r.x })),
    pots: scene.pots?.map((p) => ({ ...p, x: p.y, y: p.x })),
    breakables: scene.breakables?.map((b) => ({
      ...b,
      x: b.y,
      y: b.x,
      spawn: b.spawn ? transposeHero(b.spawn) : undefined,
    })),
    enemies: scene.enemies?.map((e) => ({
      ...e,
      x: e.y,
      y: e.x,
      axis: e.axis === "h" ? "v" : e.axis === "v" ? "h" : e.axis,
    })),
  };
}
