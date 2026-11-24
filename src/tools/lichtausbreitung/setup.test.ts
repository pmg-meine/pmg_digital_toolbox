import { describe, expect, it } from "vitest";
import { LEVELS, traceRay } from "./geometry";
import { defaultSetup, randomSetup, readSetup, sceneBricks, setupUrl } from "./setup";

describe("shareable light setup", () => {
  it("round trips positions and angle while preserving the deployment path and other parameters", () => {
    const setup = { sourceY: 45, angle: 80, bricks: [
      { centerY: -2.5, width: 20, height: 95 }, { centerY: 127.5, width: 8, height: 95 },
      { centerY: 57.5, width: 15, height: 95 }, { centerY: 197.5, width: 8, height: 95 },
    ] };
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

  it("accepts legacy links and preserves their geometry", () => {
    expect(readSetup("?setup=105,50,0,115,0,115")).toEqual(defaultSetup);
    expect(sceneBricks(readSetup("?setup=105,50,-50,115,0,115"))[0].y).toBe(-50);
  });

  it("generates valid setups with a ray reaching the screen", () => {
    for (let i = 0; i < 1000; i++) {
      const setup = randomSetup();
      expect(readSetup(new URL(setupUrl("https://example.org/", setup)).search)).toEqual(setup);
      const bricks = sceneBricks(setup);
      const firstGap = (bricks[0].y + bricks[0].height + bricks[1].y) / 2;
      const angle = Math.atan2(firstGap - setup.sourceY, LEVELS[0] - 9);
      expect(traceRay({ x: 9, y: setup.sourceY }, angle, bricks).x).toBeCloseTo(297);
    }
  });
});
