import { describe, expect, it } from "vitest";
import { defaultSetup, readSetup, setupUrl } from "./setup";

describe("shadow setup links", () => {
  it("round trips all controls and keeps unrelated parameters", () => {
    const setup = { ...defaultSetup, angles: [30, 90], enabled: [true, false], showRays: true, brick: { x: 100, y: 20, width: 30, height: 80 } };
    const url = new URL(setupUrl("https://example.com/tool?other=1", setup));
    expect(url.searchParams.get("other")).toBe("1");
    expect(readSetup(url.search)).toEqual(setup);
  });

  it("clamps malformed and out-of-range dimensions and positions", () => {
    const setup = readSetup("?width=999&height=999&x=999&y=999&angle1=oops");
    expect(setup.brick).toEqual({ x: 237, y: 60, width: 50, height: 150 });
    expect(setup.angles[0]).toBe(60);
  });
});
