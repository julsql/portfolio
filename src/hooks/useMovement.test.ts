import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMovement } from "./useMovement";
import { buildMap, HERO_START } from "../data/map";
import { PROJECTS } from "../data/projects";

const grid = buildMap();

describe("useMovement", () => {
  it("moves the hero onto a walkable tile and updates facing", () => {
    const { result } = renderHook(() => useMovement(grid, () => {}));
    // Hero starts at (9,9); moving left should land on (8,9).
    act(() => result.current.move("left"));
    expect(result.current.hero).toMatchObject({ x: 8, y: 9, facing: "left" });
  });

  it("does not move into a blocked tile but still turns to face it", () => {
    const { result } = renderHook(() => useMovement(grid, () => {}));
    const start = { ...HERO_START };
    // Walk far left until blocked by the border, then assert we never left bounds.
    act(() => {
      for (let i = 0; i < 30; i++) result.current.move("left");
    });
    expect(result.current.hero.x).toBeGreaterThanOrEqual(1);
    expect(result.current.hero.facing).toBe("left");
    expect(result.current.hero.y).toBe(start.y);
  });

  it("opens a project instead of moving when bumping a landmark", () => {
    const onOpen = vi.fn();
    // exif-tools sits at (6,11); place a hook and walk a hero next to it.
    const target = PROJECTS.find((p) => p.id === "exif-tools")!;
    const { result } = renderHook(() => useMovement(grid, onOpen));
    // Drive the hero to (6,10) then step down onto the landmark.
    act(() => {
      // from (9,9) -> left to x=6
      result.current.move("left");
      result.current.move("left");
      result.current.move("left");
      // now (6,9) -> down to (6,10)
      result.current.move("down");
    });
    expect(result.current.hero).toMatchObject({ x: 6, y: 10 });
    act(() => result.current.move("down"));
    expect(onOpen).toHaveBeenCalledWith(target);
    // Hero should NOT have moved onto the landmark.
    expect(result.current.hero).toMatchObject({ x: 6, y: 10 });
  });
});
