import { describe, expect, it } from "vitest";
import { BRICK_HEIGHT, BRICK_WIDTH, LEVELS, traceRay } from "./geometry";
import { defaultSetup, randomSetup, readSetup, setupUrl } from "./setup";

describe("shareable light setup", () => {
  it("round trips positions and angle while preserving the deployment path and other parameters", () => {
    const setup = { sourceY: 45, angle: 80, positions: [-50, 80, 10, 150] };
    const url = new URL(setupUrl("https://example.org/preview/werkzeuge/lichtausbreitung?other=1", setup));
    expect(url.pathname).toBe("/preview/werkzeuge/lichtausbreitung");
    expect(url.searchParams.get("other")).toBe("1");
    expect(readSetup(url.search)).toEqual(setup);
  });

  it("uses defaults for malformed or overlapping setups", () => {
    expect(readSetup("?setup=1,2,3")).toEqual(defaultSetup);
    expect(readSetup("?setup=105,50,0,20,0,115")).toEqual(defaultSetup);
    expect(readSetup("?setup=105,50,,115,0,115")).toEqual(defaultSetup);
  });

  it("generates valid setups with a ray reaching the screen", () => {
    for (let i = 0; i < 1000; i++) {
      const setup = randomSetup();
      expect(readSetup(new URL(setupUrl("https://example.org/", setup)).search)).toEqual(setup);
      const bricks = setup.positions.map((y, index) => ({ x: LEVELS[Math.floor(index / 2)], y, width: BRICK_WIDTH, height: BRICK_HEIGHT }));
      const firstGap = (setup.positions[0] + BRICK_HEIGHT + setup.positions[1]) / 2;
      const angle = Math.atan2(firstGap - setup.sourceY, LEVELS[0] - 9);
      expect(traceRay({ x: 9, y: setup.sourceY }, angle, bricks).x).toBeCloseTo(297);
    }
  });
});
