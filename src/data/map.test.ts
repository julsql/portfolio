import { describe, expect, it } from "vitest";
import { buildMap, BLOCKED, HERO_START, MAP_HEIGHT, MAP_WIDTH } from "./map";
import { PROJECTS } from "./projects";
import type { TileKind } from "../types";

const grid = buildMap();
const isBlocked = (k: TileKind) => BLOCKED.includes(k);

describe("buildMap", () => {
  it("has the declared dimensions", () => {
    expect(grid).toHaveLength(MAP_HEIGHT);
    expect(grid.every((row) => row.length === MAP_WIDTH)).toBe(true);
  });

  it("surrounds the map with an impassable border", () => {
    for (let x = 0; x < MAP_WIDTH; x++) {
      expect(grid[0][x]).toBe("tree");
      expect(grid[MAP_HEIGHT - 1][x]).toBe("tree");
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      expect(grid[y][0]).toBe("tree");
      expect(grid[y][MAP_WIDTH - 1]).toBe("tree");
    }
  });

  it("spawns the hero on a walkable tile", () => {
    expect(isBlocked(grid[HERO_START.y][HERO_START.x])).toBe(false);
  });
});

describe("project landmarks", () => {
  it("are all placed inside the map bounds", () => {
    for (const p of PROJECTS) {
      expect(p.pos.x).toBeGreaterThan(0);
      expect(p.pos.y).toBeGreaterThan(0);
      expect(p.pos.x).toBeLessThan(MAP_WIDTH - 1);
      expect(p.pos.y).toBeLessThan(MAP_HEIGHT - 1);
    }
  });

  it("never overlap each other", () => {
    const seen = new Set(PROJECTS.map((p) => `${p.pos.x},${p.pos.y}`));
    expect(seen.size).toBe(PROJECTS.length);
  });

  it("are not placed on water or trees", () => {
    for (const p of PROJECTS) {
      expect(["water", "tree", "rock"]).not.toContain(grid[p.pos.y][p.pos.x]);
    }
  });

  it("is reachable from at least one walkable neighbour", () => {
    for (const p of PROJECTS) {
      const neighbours = [
        grid[p.pos.y - 1]?.[p.pos.x],
        grid[p.pos.y + 1]?.[p.pos.x],
        grid[p.pos.y]?.[p.pos.x - 1],
        grid[p.pos.y]?.[p.pos.x + 1],
      ];
      const walkable = neighbours.filter((k) => k && !isBlocked(k));
      expect(walkable.length).toBeGreaterThan(0);
    }
  });
});
