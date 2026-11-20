import { describe, expect, it } from "vitest";
import { generateOpenings } from "./openings";

describe("cave opening layouts", () => {
  it("provides eight positions that stay in place as the visible count changes", () => {
    const layout = generateOpenings();
    const initial = layout.slice(0, 4);
    expect(layout).toHaveLength(8);
    expect(layout.slice(0, 2)).toEqual(initial.slice(0, 2));
    expect(layout.slice(0, 6).slice(0, 4)).toEqual(initial);
    expect(layout.slice(0, 2).concat(layout.slice(2, 4))).toEqual(initial);
  });

  it("keeps openings within each wall and separated", () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const layout = generateOpenings();
      for (const side of ["north", "south", "west", "east"]) {
        const centers = layout.filter((opening) => opening.side === side).map((opening) => opening.center);
        expect(centers).toHaveLength(2);
        expect(centers.every((center) => Math.abs(center) <= 4.6)).toBe(true);
        expect(Math.abs(centers[0] - centers[1])).toBeGreaterThanOrEqual(2.3);
      }
    }
  });
});
