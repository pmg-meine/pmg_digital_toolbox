import { describe, expect, it } from "vitest";
import { lightPolygon, traceRay, type Brick } from "./geometry";

const source = { x: 0, y: 105 };
const bricks: Brick[] = [
  { x: 99, y: 0, width: 8, height: 95 },
  { x: 99, y: 115, width: 8, height: 95 },
  { x: 198, y: 0, width: 8, height: 95 },
  { x: 198, y: 115, width: 8, height: 95 },
];

describe("light propagation", () => {
  it("reaches the screen through aligned gaps", () => {
    expect(traceRay(source, 0, bricks)).toEqual({ x: 297, y: 105 });
  });

  it("stops at the first brick in its path", () => {
    const hit = traceRay(source, -0.2, bricks);
    expect(hit.x).toBeCloseTo(99);
    expect(hit.y).toBeLessThan(95);
  });

  it("stops at the second level when its gap is blocked", () => {
    const blocked = [...bricks.slice(0, 2), { x: 198, y: 30, width: 8, height: 95 }];
    expect(traceRay(source, 0, blocked)).toEqual({ x: 198, y: 105 });
  });

  it("includes the source and rays at the opening angle", () => {
    const polygon = lightPolygon(source, 50, []);
    expect(polygon[0]).toEqual(source);
    expect(polygon).toHaveLength(5);
  });
});
