import { HEIGHT, WIDTH, type Brick } from "../lichtausbreitung/geometry";

export type ShadowSetup = { sourceYs: number[]; angles: number[]; brick: Brick; enabled: boolean[]; showRays: boolean };
export const defaultSetup: ShadowSetup = { sourceYs: [65, 145], angles: [60, 60], brick: { x: 136, y: 92.5, width: 25, height: 25 }, enabled: [false, false], showRays: false };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function readSetup(search: string): ShadowSetup {
  const params = new URLSearchParams(search);
  const number = (key: string, fallback: number, min: number, max: number) => {
    const raw = params.get(key);
    const value = raw === null || raw.trim() === "" ? NaN : Number(raw);
    return clamp(Number.isFinite(value) ? value : fallback, min, max);
  };
  const width = number("width", defaultSetup.brick.width, 5, 50);
  const height = number("height", defaultSetup.brick.height, 5, 150);
  return {
    sourceYs: [number("y1", 65, 5, 205), number("y2", 145, 5, 205)],
    angles: [number("angle1", 60, 10, 100), number("angle2", 60, 10, 100)],
    brick: { x: number("x", defaultSetup.brick.x, 35, WIDTH - width - 10), y: number("y", defaultSetup.brick.y, 0, HEIGHT - height), width, height },
    enabled: [params.get("light1") === "1", params.get("light2") === "1"],
    showRays: params.get("rays") === "1",
  };
}

export function setupUrl(url: string, setup: ShadowSetup): string {
  const result = new URL(url);
  const values: Record<string, string | number> = { y1: setup.sourceYs[0], y2: setup.sourceYs[1], angle1: setup.angles[0], angle2: setup.angles[1], x: setup.brick.x, y: setup.brick.y, width: setup.brick.width, height: setup.brick.height, light1: Number(setup.enabled[0]), light2: Number(setup.enabled[1]), rays: Number(setup.showRays) };
  Object.entries(values).forEach(([key, value]) => result.searchParams.set(key, String(value)));
  return result.toString();
}

export function randomSetup(): ShadowSetup {
  const random = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  return { sourceYs: [random(30, 90), random(120, 180)], angles: [random(40, 90), random(40, 90)], brick: { x: random(90, 190), y: random(45, 120), width: 25, height: 25 }, enabled: [false, false], showRays: false };
}
