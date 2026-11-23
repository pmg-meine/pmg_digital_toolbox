export const WIDTH = 297;
export const HEIGHT = 210;
export const BRICK_WIDTH = 8;
export const BRICK_HEIGHT = 95;
export const LEVELS = [99, 198];

export type Brick = { x: number; y: number; width: number; height: number };
export type Point = { x: number; y: number };

// Cast a ray against the page edge and all four sides of each opaque brick.
export function traceRay(source: Point, angle: number, bricks: Brick[]): Point {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let distance = (WIDTH - source.x) / dx;
  if (dy > 0) distance = Math.min(distance, (HEIGHT - source.y) / dy);
  if (dy < 0) distance = Math.min(distance, -source.y / dy);

  for (const brick of bricks) {
    for (const x of [brick.x, brick.x + brick.width]) {
      const t = (x - source.x) / dx;
      const y = source.y + t * dy;
      if (t >= 0 && y >= brick.y && y <= brick.y + brick.height) distance = Math.min(distance, t);
    }
    if (dy !== 0) {
      for (const y of [brick.y, brick.y + brick.height]) {
        const t = (y - source.y) / dy;
        const x = source.x + t * dx;
        if (t >= 0 && x >= brick.x && x <= brick.x + brick.width) distance = Math.min(distance, t);
      }
    }
  }
  return { x: source.x + distance * dx, y: source.y + distance * dy };
}

// Corner rays and their immediate neighbours capture every shadow boundary.
export function lightPolygon(source: Point, openingAngle: number, bricks: Brick[]): Point[] {
  const halfAngle = openingAngle * Math.PI / 360;
  const angles = [-halfAngle, halfAngle];
  for (const brick of bricks) {
    for (const x of [brick.x, brick.x + brick.width]) {
      for (const y of [brick.y, brick.y + brick.height]) {
        const angle = Math.atan2(y - source.y, x - source.x);
        for (const offset of [-0.000001, 0, 0.000001]) {
          if (angle + offset > -halfAngle && angle + offset < halfAngle) angles.push(angle + offset);
        }
      }
    }
  }
  // The page corners also change which page edge stops a ray.
  for (const y of [0, HEIGHT]) {
    const angle = Math.atan2(y - source.y, WIDTH - source.x);
    if (angle > -halfAngle && angle < halfAngle) angles.push(angle);
  }
  return [source, ...angles.sort((a, b) => a - b).map((angle) => traceRay(source, angle, bricks))];
}
