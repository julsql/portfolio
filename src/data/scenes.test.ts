import { describe, expect, it } from "vitest";
import { CASTLE_ID, OVERWORLD_ID, SCENES } from "./scenes";
import { castleById, projectById, PROJECTS } from "./projects";
import { BLOCKED } from "./map";
import type { Scene, TileKind } from "../types";

const isBlocked = (k: TileKind) => BLOCKED.includes(k);
const scenes = Object.values(SCENES);

const walkableNeighbour = (scene: Scene, x: number, y: number) =>
  [
    scene.tiles[y - 1]?.[x],
    scene.tiles[y + 1]?.[x],
    scene.tiles[y]?.[x - 1],
    scene.tiles[y]?.[x + 1],
  ].some((k) => k && !isBlocked(k));

describe.each(scenes)("scene $id", (scene) => {
  it("has tiles matching its declared dimensions", () => {
    expect(scene.tiles).toHaveLength(scene.height);
    expect(scene.tiles.every((row) => row.length === scene.width)).toBe(true);
  });

  it("spawns the hero on a walkable tile inside bounds", () => {
    const { x, y } = scene.heroStart;
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect(isBlocked(scene.tiles[y][x])).toBe(false);
  });

  it("places every landmark inside bounds, without overlaps", () => {
    const seen = new Set<string>();
    for (const l of scene.landmarks) {
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.y).toBeGreaterThanOrEqual(0);
      expect(l.x).toBeLessThan(scene.width);
      expect(l.y).toBeLessThan(scene.height);
      seen.add(`${l.x},${l.y}`);
    }
    expect(seen.size).toBe(scene.landmarks.length);
  });

  it("keeps every landmark reachable from a walkable neighbour", () => {
    for (const l of scene.landmarks) {
      expect(walkableNeighbour(scene, l.x, l.y)).toBe(true);
    }
  });

  it("references valid projects, castles and target scenes", () => {
    for (const l of scene.landmarks) {
      if (l.kind === "project") expect(projectById(l.ref)).toBeDefined();
      if (l.kind === "castle") expect(castleById(l.ref)).toBeDefined();
      if (l.kind === "exit" || l.kind === "cave" || l.kind === "bossDoor")
        expect(SCENES[l.ref]).toBeDefined();
    }
  });

  it("never reuses an id between two pots, breakables or rocks", () => {
    const seen = new Set<string>();
    for (const r of scene.rocks ?? []) {
      expect(seen.has(r.id)).toBe(false);
      seen.add(r.id);
    }
    for (const p of scene.pots ?? []) {
      expect(seen.has(p.id)).toBe(false);
      seen.add(p.id);
    }
  });
});

describe("castle wiring", () => {
  it("shows exactly the grouped projects inside the castle", () => {
    const castle = castleById("thecode")!;
    const inside = SCENES[CASTLE_ID].landmarks
      .filter((l) => l.kind === "project")
      .map((l) => l.ref)
      .sort();
    expect(inside).toEqual([...castle.memberIds].sort());
  });

  it("hides grouped projects from the overworld", () => {
    const overworldRefs = SCENES[OVERWORLD_ID].landmarks.map((l) => l.ref);
    for (const p of PROJECTS.filter((p) => p.group)) {
      expect(overworldRefs).not.toContain(p.id);
    }
  });

  it("lets the castle exit lead back to the overworld with a spawn", () => {
    const exit = SCENES[CASTLE_ID].landmarks.find((l) => l.kind === "exit")!;
    expect(exit.ref).toBe(OVERWORLD_ID);
    expect(exit.spawn).toBeDefined();
  });

  it("places fire hazards on tiles the hero can actually stand on", () => {
    const scene = SCENES[CASTLE_ID];
    const hazards = scene.decor.filter((d) => d.hazard);
    expect(hazards.length).toBeGreaterThan(0);
    for (const h of hazards) {
      // Walkable tile (so you can step into it) and not a landmark.
      expect(isBlocked(scene.tiles[h.y][h.x])).toBe(false);
      expect(scene.landmarks.some((l) => l.x === h.x && l.y === h.y)).toBe(false);
    }
  });
});

const walkable = (scene: Scene, x: number, y: number) =>
  !isBlocked(scene.tiles[y][x]) && scene.tiles[y][x] !== "water";

describe("game objects", () => {
  it.each(scenes)("$id: standable landmarks sit on walkable tiles", (scene) => {
    // Walk-onto landmarks: rupees, fairies (pickup with bottle), the triforce
    // piece. NPCs / hearts / swords are bump-only but still need to sit on
    // walkable tiles (the hero must be able to be on top to bump from any side).
    const standable = ["project", "castle", "rupee", "npc", "heart", "sword", "fairy", "triforce"];
    for (const l of scene.landmarks) {
      if (standable.includes(l.kind)) {
        expect(walkable(scene, l.x, l.y), `${l.kind} ${l.ref}`).toBe(true);
      }
    }
  });

  it.each(scenes)("$id: pots block movement and sit on walkable tiles", (scene) => {
    const ids = new Set<string>();
    for (const p of scene.pots ?? []) {
      expect(walkable(scene, p.x, p.y), `pot ${p.id}`).toBe(true);
      expect(scene.landmarks.some((l) => l.x === p.x && l.y === p.y)).toBe(false);
      expect(ids.has(p.id), `duplicate pot id ${p.id}`).toBe(false);
      ids.add(p.id);
    }
  });

  it.each(scenes)("$id: rocks rest on walkable, non-overlapping tiles", (scene) => {
    for (const r of scene.rocks ?? []) {
      expect(walkable(scene, r.x, r.y)).toBe(true);
      expect(scene.landmarks.some((l) => l.x === r.x && l.y === r.y)).toBe(false);
    }
  });

  it.each(scenes)("$id: enemies start on walkable tiles, clear of landmarks", (scene) => {
    for (const e of scene.enemies ?? []) {
      expect(walkable(scene, e.x, e.y), `${e.id} start`).toBe(true);
      expect(scene.landmarks.some((l) => l.x === e.x && l.y === e.y)).toBe(false);
      // Patrol enemies must keep their whole range walkable and landmark-free.
      if (e.axis && e.min !== undefined && e.max !== undefined) {
        const pos = e.axis === "h" ? e.x : e.y;
        expect(pos).toBeGreaterThanOrEqual(e.min);
        expect(pos).toBeLessThanOrEqual(e.max);
        for (let p = e.min; p <= e.max; p++) {
          const x = e.axis === "h" ? p : e.x;
          const y = e.axis === "h" ? e.y : p;
          expect(walkable(scene, x, y), `patrol ${e.id} @ ${x},${y}`).toBe(true);
          expect(scene.landmarks.some((l) => l.x === x && l.y === y)).toBe(false);
        }
      }
    }
  });
});
