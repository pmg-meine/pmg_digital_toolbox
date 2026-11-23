import { BRICK_HEIGHT, HEIGHT } from "./geometry";

export type Setup = { sourceY: number; angle: number; positions: number[] };
export const defaultSetup: Setup = { sourceY: 105, angle: 50, positions: [0, 115, 0, 115] };
export const minimumBrickY = 1 - BRICK_HEIGHT;
export const maximumBrickY = HEIGHT - 1;

export function readSetup(search: string): Setup {
  const params = new URLSearchParams(search);
  const encoded = params.get("setup");
  if (!encoded || !/^-?\d+(,-?\d+){5}$/.test(encoded)) return defaultSetup;
  const values = encoded.split(",").map(Number);
  if (!values || values.length !== 6 || values.some((value) => !Number.isInteger(value))) return defaultSetup;
  const [sourceY, angle, ...positions] = values;
  if (sourceY < 5 || sourceY > 205 || angle < 10 || angle > 100 ||
      positions.some((value) => value < minimumBrickY || value > maximumBrickY) ||
      positions[0] + BRICK_HEIGHT > positions[1] || positions[2] + BRICK_HEIGHT > positions[3]) return defaultSetup;
  return { sourceY, angle, positions };
}

export function setupUrl(href: string, setup: Setup): string {
  const url = new URL(href);
  url.searchParams.set("setup", [setup.sourceY, setup.angle, ...setup.positions].join(","));
  return url.toString();
}

// Both openings contain a shared ray, so every randomized task has a visible result.
export function randomSetup(random = Math.random): Setup {
  const integer = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
  const sourceY = integer(45, 165);
  const slope = (random() - 0.5) * 0.3;
  const positions = [99, 198].flatMap((x) => {
    const center = Math.max(21, Math.min(HEIGHT - 21, Math.round(sourceY + (x - 9) * slope)));
    const halfGap = integer(10, 20);
    return [center - halfGap - BRICK_HEIGHT, center + halfGap];
  });
  return { sourceY, angle: integer(30, 80), positions };
}
