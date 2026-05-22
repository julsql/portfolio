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
      if (l.kind === "exit") expect(SCENES[l.ref]).toBeDefined();
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
});
