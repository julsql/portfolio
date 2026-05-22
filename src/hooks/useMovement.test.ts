import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMovement } from "./useMovement";
import { OVERWORLD_ID, SCENES } from "../data/scenes";

const overworld = SCENES[OVERWORLD_ID];

describe("useMovement", () => {
  it("moves the hero onto a walkable tile and updates facing", () => {
    const { result } = renderHook(() => useMovement(overworld, overworld.heroStart, () => {}));
    // Hero starts at (9,9); moving left should land on (8,9).
    act(() => result.current.move("left"));
    expect(result.current.hero).toMatchObject({ x: 8, y: 9, facing: "left" });
  });

  it("does not leave the map but still turns to face a blocked direction", () => {
    const { result } = renderHook(() => useMovement(overworld, overworld.heroStart, () => {}));
    act(() => {
      for (let i = 0; i < 30; i++) result.current.move("left");
    });
    expect(result.current.hero.x).toBeGreaterThanOrEqual(1);
    expect(result.current.hero.facing).toBe("left");
    expect(result.current.hero.y).toBe(overworld.heroStart.y);
  });

  it("interacts with a landmark instead of moving when bumping it", () => {
    const onInteract = vi.fn();
    const { result } = renderHook(() => useMovement(overworld, overworld.heroStart, onInteract));
    // From (9,9): step left to (6,9), then up toward the castle at (9,2)?
    // exif-tools sits at (6,11). Walk left to x=6 then down onto it.
    act(() => {
      result.current.move("left"); // 8,9
      result.current.move("left"); // 7,9
      result.current.move("left"); // 6,9
      result.current.move("down"); // 6,10
    });
    expect(result.current.hero).toMatchObject({ x: 6, y: 10 });
    act(() => result.current.move("down")); // bumps exif-tools at (6,11)
    expect(onInteract).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "project", ref: "exif-tools" }),
    );
    expect(result.current.hero).toMatchObject({ x: 6, y: 10 });
  });

  it("triggers a castle landmark when bumped", () => {
    const onInteract = vi.fn();
    const { result } = renderHook(() =>
      useMovement(overworld, { x: 9, y: 3, facing: "up" }, onInteract),
    );
    act(() => result.current.move("up")); // castle sits at (9,2)
    expect(onInteract).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "castle", ref: "thecode" }),
    );
  });
});
