import { BRICK_HEIGHT, BRICK_WIDTH, HEIGHT, LEVELS, type Brick } from "./geometry";

export type BrickParameters = { centerY: number; width: number; height: number };
export type Setup = { sourceY: number; angle: number; bricks: BrickParameters[] };
export const minimumBrickSize = 2;
export const maximumBrickWidth = 80;
export const maximumBrickHeight = 200;
export const defaultSetup: Setup = {
  sourceY: 105, angle: 50,
  bricks: [47.5, 162.5, 47.5, 162.5].map((centerY) => ({ centerY, width: BRICK_WIDTH, height: BRICK_HEIGHT })),
};

export function sceneBricks(setup: Setup): Brick[] {
  return setup.bricks.map((brick, index) => ({
    x: LEVELS[Math.floor(index / 2)] + BRICK_WIDTH / 2 - brick.width / 2,
    y: brick.centerY - brick.height / 2,
    width: brick.width,
    height: brick.height,
  }));
}

export function brickCenterBounds(bricks: BrickParameters[], index: number, height = bricks[index].height) {
  const neighbor = bricks[index % 2 === 0 ? index + 1 : index - 1];
  return index % 2 === 0
    ? { min: 1 - height / 2, max: neighbor.centerY - (height + neighbor.height) / 2 }
    : { min: neighbor.centerY + (height + neighbor.height) / 2, max: HEIGHT - 1 + height / 2 };
}

export function readSetup(search: string): Setup {
  const encoded = new URLSearchParams(search).get("setup");
  if (!encoded || !/^-?\d+(?:\.\d+)?(,-?\d+(?:\.\d+)?)*$/.test(encoded)) return defaultSetup;
  const values = encoded.split(",").map(Number);
  const [sourceY, angle] = values;
  let bricks: BrickParameters[];
  if (values.length === 6) {
    bricks = values.slice(2).map((y) => ({ centerY: y + BRICK_HEIGHT / 2, width: BRICK_WIDTH, height: BRICK_HEIGHT }));
  } else if (values.length === 14) {
    bricks = Array.from({ length: 4 }, (_, index) => ({ centerY: values[2 + index * 3], width: values[3 + index * 3], height: values[4 + index * 3] }));
  } else return defaultSetup;
  if (!Number.isInteger(sourceY) || sourceY < 5 || sourceY > 205 || !Number.isInteger(angle) || angle < 10 || angle > 100 ||
      bricks.some((brick, index) => {
        const bounds = brickCenterBounds(bricks, index);
        return !Number.isInteger(brick.width) || !Number.isInteger(brick.height) ||
          brick.width < minimumBrickSize || brick.width > maximumBrickWidth || brick.height < minimumBrickSize || brick.height > maximumBrickHeight ||
          brick.centerY < bounds.min || brick.centerY > bounds.max;
      })) return defaultSetup;
  return { sourceY, angle, bricks };
}

export function setupUrl(href: string, setup: Setup): string {
  const url = new URL(href);
  url.searchParams.set("setup", [setup.sourceY, setup.angle, ...setup.bricks.flatMap(({ centerY, width, height }) => [centerY, width, height])].join(","));
  return url.toString();
}

// Both openings contain a shared ray, so every randomized task has a visible result.
export function randomSetup(random = Math.random): Setup {
  const integer = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
  const sourceY = integer(45, 165);
  const slope = (random() - 0.5) * 0.3;
  const bricks = LEVELS.flatMap((x) => {
    const center = Math.max(21, Math.min(HEIGHT - 21, Math.round(sourceY + (x - 9) * slope)));
    const halfGap = integer(10, 20);
    return [center - halfGap - BRICK_HEIGHT / 2, center + halfGap + BRICK_HEIGHT / 2]
      .map((centerY) => ({ centerY, width: BRICK_WIDTH, height: BRICK_HEIGHT }));
  });
  return { sourceY, angle: integer(30, 80), bricks };
}
