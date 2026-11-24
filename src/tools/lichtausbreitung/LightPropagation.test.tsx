// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LightPropagation from "./LightPropagation";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

it("coalesces rapid position changes into one URL update with the final setup", () => {
  vi.useFakeTimers();
  const replaceState = vi.spyOn(window.history, "replaceState");
  const { container } = render(<LightPropagation />);
  const slider = container.querySelector<HTMLInputElement>("#brick-0")!;

  for (let value = 100; value < 150; value++) {
    fireEvent.change(slider, { target: { value: String(value) } });
    act(() => vi.advanceTimersByTime(10));
  }

  expect(replaceState).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(500));
  expect(replaceState).toHaveBeenCalledTimes(1);
  const sharedUrl = new URL(window.location.href);
  expect(sharedUrl.search).not.toBe("");
  const { container: restored } = render(<LightPropagation />);
  expect(restored.querySelector<HTMLInputElement>("#brick-0")!.value).toBe(slider.value);
});

describe("brick position controls", () => {
  it.each([[0, 1], [1, 0], [2, 3], [3, 2]])(
    "keeps brick %i's neighbor unchanged and prevents overlap",
    (movingIndex, neighborIndex) => {
      const { container } = render(<LightPropagation />);
      const moving = container.querySelector<HTMLInputElement>(`#brick-${movingIndex}`)!;
      const neighbor = container.querySelector<HTMLInputElement>(`#brick-${neighborIndex}`)!;
      const originalNeighbor = { value: neighbor.value, min: neighbor.min, max: neighbor.max };

      // Move toward the neighboring brick, beyond the permitted position.
      fireEvent.change(moving, { target: { value: movingIndex % 2 === 0 ? moving.min : moving.max } });

      expect({ value: neighbor.value, min: neighbor.min, max: neighbor.max }).toEqual(originalNeighbor);
      expect(Math.abs(Number(moving.value) - Number(neighbor.value))).toBe(95);
    },
  );
});
