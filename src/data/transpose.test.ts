import { describe, expect, it } from "vitest";
import { transposeHero, transposeScene } from "./transpose";
import type { Hero, Scene } from "../types";

const baseScene: Scene = {
  id: "test",
  width: 4,
  height: 3,
  tiles: [
    ["grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass"],
  ],
  heroStart: { x: 1, y: 2, facing: "up" },
  landmarks: [
    {
      x: 3,
      y: 0,
      kind: "cave",
      ref: "lair",
      spawn: { x: 5, y: 7, facing: "down" },
    },
  ],
  decor: [],
  breakables: [
    {
      id: "b1",
      x: 2,
      y: 1,
      reveals: "secret",
      spawn: { x: 9, y: 4, facing: "left" },
    },
  ],
};

describe("transposeHero", () => {
  it("swaps x and y and rotates the facing 90°", () => {
    const h: Hero = { x: 2, y: 5, facing: "up" };
    expect(transposeHero(h)).toEqual({ x: 5, y: 2, facing: "left" });
  });
});

describe("transposeScene", () => {
  it("swaps the scene dimensions", () => {
    const t = transposeScene(baseScene);
    expect(t.width).toBe(baseScene.height);
    expect(t.height).toBe(baseScene.width);
  });

  it("transposes landmark positions but keeps their `spawn` in landscape coords", () => {
    const t = transposeScene(baseScene);
    const l = t.landmarks[0];
    expect(l.x).toBe(0);
    expect(l.y).toBe(3);
    expect(l.spawn).toEqual({ x: 5, y: 7, facing: "down" });
  });

  it("transposes breakable positions but keeps their `spawn` in landscape coords", () => {
    const t = transposeScene(baseScene);
    const b = t.breakables![0];
    expect(b.x).toBe(1);
    expect(b.y).toBe(2);
    expect(b.spawn).toEqual({ x: 9, y: 4, facing: "left" });
  });
});
