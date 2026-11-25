import { HEIGHT, WIDTH, type Brick, type Point } from "../lichtausbreitung/geometry";

export type ScreenSegment = { from: number; to: number; illuminatedBy: number; blockedBy?: number };

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

// Count light only inside each lamp's cone, and distinguish obstacles from darkness outside it.
export function beamScreenSegments(sources: { point: Point; angle: number }[], brick: Brick): ScreenSegment[] {
  const beams = sources.map(({ point, angle }) => {
    const radius = (WIDTH - point.x) * Math.tan(angle * Math.PI / 360);
    return { from: Math.max(0, point.y - radius), to: Math.min(HEIGHT, point.y + radius), shadow: shadowOnScreen(point, brick) };
  });
  const boundaries = [...new Set([0, HEIGHT, ...beams.flatMap((beam) => [beam.from, beam.to, ...beam.shadow])])].sort((a, b) => a - b);
  return boundaries.slice(0, -1).map((from, index) => {
    const to = boundaries[index + 1];
    const middle = (from + to) / 2;
    const inBeam = beams.filter((beam) => middle >= beam.from && middle <= beam.to);
    const blockedBy = inBeam.filter((beam) => middle >= beam.shadow[0] && middle <= beam.shadow[1]).length;
    return { from, to, illuminatedBy: inBeam.length - blockedBy, blockedBy };
  });
}
