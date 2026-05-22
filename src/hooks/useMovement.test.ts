import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMovement, type MoveHandlers } from "./useMovement";
import { GANON_ID, OVERWORLD_ID, SCENES } from "../data/scenes";

const overworld = SCENES[OVERWORLD_ID];
const ganon = SCENES[GANON_ID];

function handlers(over: Partial<MoveHandlers> = {}): MoveHandlers {
  return {
    onInteract: vi.fn(),
    onPickup: vi.fn(),
    onDrown: vi.fn(),
    rocks: [],
    enemies: [],
    pushRock: vi.fn(),
    removeRock: vi.fn(),
    ...over,
  };
}

describe("useMovement", () => {
  it("moves the hero onto a walkable tile and updates facing", () => {
    const { result } = renderHook(() => useMovement(overworld, overworld.heroStart, handlers()));
    // Hero starts at (10,9); moving left should land on (9,9).
    act(() => result.current.move("left"));
    expect(result.current.hero).toMatchObject({ x: 9, y: 9, facing: "left" });
  });

  it("drowns instead of entering water and does not move", () => {
    const onDrown = vi.fn();
    // Spawn next to the sea (water at x>=14 && y>=9). (13,10) is grass; east is water.
    const { result } = renderHook(() =>
      useMovement(overworld, { x: 13, y: 10, facing: "right" }, handlers({ onDrown })),
    );
    act(() => result.current.move("right"));
    expect(onDrown).toHaveBeenCalledTimes(1);
    expect(result.current.hero).toMatchObject({ x: 13, y: 10 });
  });

  it("pushes a rock onto the free tile beyond it", () => {
    const pushRock = vi.fn();
    const rocks = [{ id: "r", x: 9, y: 9 }];
    // Hero at (10,9) facing left; rock at (9,9); beyond (8,9) is grass → push.
    const { result } = renderHook(() =>
      useMovement(overworld, { x: 10, y: 9, facing: "left" }, handlers({ rocks, pushRock })),
    );
    act(() => result.current.move("left"));
    expect(pushRock).toHaveBeenCalledWith("r", 8, 9);
    expect(result.current.hero).toMatchObject({ x: 9, y: 9 });
  });

  it("collects a rupee by walking over it", () => {
    const onPickup = vi.fn();
    // Ganon's lair always holds rupees (the overworld ones are optional).
    const rupee = ganon.landmarks.find((l) => l.kind === "rupee")!; // (1,6)
    const { result } = renderHook(() =>
      useMovement(ganon, { x: rupee.x + 1, y: rupee.y, facing: "left" }, handlers({ onPickup })),
    );
    act(() => result.current.move("left"));
    expect(onPickup).toHaveBeenCalledWith(rupee);
    expect(result.current.hero).toMatchObject({ x: rupee.x, y: rupee.y });
  });

  it("throws a rock into water, removing it", () => {
    const removeRock = vi.fn();
    const rocks = [{ id: "r", x: 13, y: 12 }];
    // Hero at (13,11); rock at (13,12); beyond (13,13) is the water frame row.
    const { result } = renderHook(() =>
      useMovement(overworld, { x: 13, y: 11, facing: "down" }, handlers({ rocks, removeRock })),
    );
    act(() => result.current.move("down"));
    expect(removeRock).toHaveBeenCalledWith("r");
    expect(result.current.hero).toMatchObject({ x: 13, y: 12 });
  });

  it("cannot push a rock directly onto an enemy", () => {
    const pushRock = vi.fn();
    const rocks = [{ id: "r", x: 9, y: 9 }];
    const enemies = [{ x: 8, y: 9 }];
    const { result } = renderHook(() =>
      useMovement(
        overworld,
        { x: 10, y: 9, facing: "left" },
        handlers({ rocks, enemies, pushRock }),
      ),
    );
    act(() => result.current.move("left"));
    expect(pushRock).not.toHaveBeenCalled();
    expect(result.current.hero).toMatchObject({ x: 10, y: 9 });
  });

  it("interacts with a bump landmark instead of moving", () => {
    const onInteract = vi.fn();
    // Castle sits at (10,7); approach from below at (10,8) going up.
    const { result } = renderHook(() =>
      useMovement(overworld, { x: 10, y: 8, facing: "up" }, handlers({ onInteract })),
    );
    act(() => result.current.move("up"));
    expect(onInteract).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "castle", ref: "thecode" }),
    );
    expect(result.current.hero).toMatchObject({ x: 10, y: 8 });
  });
});
