import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import GameOver, { GAMEOVER_LOCKOUT_MS } from "./GameOver";
import "../i18n";

vi.mock("../audio/sound", () => ({ sound: { sfx: vi.fn() } }));

describe("GameOver lockout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("locks the retry button until the lockout elapses", () => {
    render(<GameOver onRetry={() => {}} />);
    const btn = screen.getByRole("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    act(() => vi.advanceTimersByTime(GAMEOVER_LOCKOUT_MS));
    expect(btn.disabled).toBe(false);
  });

  it("ignores a fast key-mash, then accepts Enter once unlocked", () => {
    const onRetry = vi.fn();
    render(<GameOver onRetry={onRetry} />);

    // Mashing Enter right after death must not skip the screen.
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onRetry).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(GAMEOVER_LOCKOUT_MS));
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not fire retry when the button is clicked while locked", () => {
    const onRetry = vi.fn();
    render(<GameOver onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onRetry).not.toHaveBeenCalled();
  });
});
