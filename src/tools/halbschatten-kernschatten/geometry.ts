import { HEIGHT, WIDTH, type Brick, type Point } from "../lichtausbreitung/geometry";

export type ScreenSegment = { from: number; to: number; illuminatedBy: number };

// Project the two silhouette edges of the brick onto the screen.
export function shadowOnScreen(source: Point, brick: Brick): [number, number] {
  const projectedCorners = [brick.x, brick.x + brick.width].flatMap((x) =>
    [brick.y, brick.y + brick.height].map((y) =>
      source.y + (y - source.y) * (WIDTH - source.x) / (x - source.x),
    ),
  );
  const clamp = (y: number) => Math.max(0, Math.min(HEIGHT, y));
  return [clamp(Math.min(...projectedCorners)), clamp(Math.max(...projectedCorners))];
}

export function screenSegments(sources: Point[], brick: Brick): ScreenSegment[] {
  const shadows = sources.map((source) => shadowOnScreen(source, brick));
  const boundaries = [...new Set([0, HEIGHT, ...shadows.flat()])].sort((a, b) => a - b);
  return boundaries.slice(0, -1).map((from, index) => {
    const to = boundaries[index + 1];
    const middle = (from + to) / 2;
    const illuminatedBy = shadows.filter(([start, end]) => middle < start || middle > end).length;
    return { from, to, illuminatedBy };
  });
}
