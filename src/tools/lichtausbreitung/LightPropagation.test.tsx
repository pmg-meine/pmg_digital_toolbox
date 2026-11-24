// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import LightPropagation from "./LightPropagation";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
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
