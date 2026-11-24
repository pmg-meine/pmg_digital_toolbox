import { describe, expect, it } from "vitest";
import { screenSegments, shadowOnScreen } from "./geometry";

const brick = { x: 100, y: 80, width: 10, height: 40 };

describe("shadow projection", () => {
  it("uses the outer corners when the source is above the brick", () => {
    const [top, bottom] = shadowOnScreen({ x: 0, y: 50 }, brick);
    expect(top).toBeCloseTo(131);
    expect(bottom).toBe(210);
  });

  it("distinguishes umbra, penumbra and fully illuminated regions", () => {
    const segments = screenSegments([{ x: 0, y: 80 }, { x: 0, y: 120 }], brick);
    expect(segments.map((segment) => segment.illuminatedBy)).toEqual([2, 1, 0, 1, 2]);
    expect(segments[0].from).toBe(0);
    expect(segments.at(-1)?.to).toBe(210);
  });

  it("handles coincident sources and shadows outside the screen", () => {
    expect(screenSegments([{ x: 0, y: 100 }, { x: 0, y: 100 }], brick).map((segment) => segment.illuminatedBy)).toEqual([2, 0, 2]);
    expect(shadowOnScreen({ x: 0, y: 205 }, { ...brick, y: 0 })).toEqual([0, 0]);
  });
});
