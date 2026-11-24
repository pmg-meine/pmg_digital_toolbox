import { generateOpenings, type Opening } from "./openings";

export type Setup = {
  x: number; y: number; height: number; count: number;
  hidden: boolean; showRays: boolean; view: "orthographic" | "perspective";
  openings: Opening[];
};

export function randomSetup(): Setup {
  const position = () => Math.round((Math.random() * 7.6 - 3.8) * 10) / 10;
  return { x: position(), y: position(), height: Math.round((0.9 + Math.random() * 1.4) * 10) / 10,
    count: 4, hidden: true, showRays: true, view: "orthographic", openings: generateOpenings() };
}

export function readSetup(search: string): Setup | null {
  try {
    const value = new URLSearchParams(search).get("setup");
    if (!value) return null;
    const values = value.split(",");
    if (values.length !== 23) return null;
    const sides = ["north", "south", "west", "east"] as const;
    const setup: Setup = {
      x: Number(values[0]), y: Number(values[1]), height: Number(values[2]), count: Number(values[3]),
      hidden: values[4] === "1", showRays: values[5] === "1",
      view: values[6] === "1" ? "perspective" : "orthographic",
      openings: Array.from({ length: 8 }, (_, index) => ({ side: sides[Number(values[7 + index * 2])], center: Number(values[8 + index * 2]) })),
    };
    if (![values[4], values[5], values[6]].every((flag) => flag === "0" || flag === "1") || values.some((part) => part === "")) return null;
    if (![setup.x, setup.y, setup.height, setup.count].every(Number.isFinite) ||
      Math.abs(setup.x) > 4.2 || Math.abs(setup.y) > 4.2 || setup.height < 0.6 || setup.height > 2.5 ||
      !Number.isInteger(setup.count) || setup.count < 1 || setup.count > 8 ||
      typeof setup.hidden !== "boolean" || typeof setup.showRays !== "boolean" ||
      !["orthographic", "perspective"].includes(setup.view) || !Array.isArray(setup.openings) || setup.openings.length !== 8 ||
      setup.openings.some((opening) => !opening || !["north", "south", "east", "west"].includes(opening.side) ||
        !Number.isFinite(opening.center) || Math.abs(opening.center) < 1.15 || Math.abs(opening.center) > 4.6) ||
      new Set(setup.openings.map((opening) => `${opening.side}:${Math.sign(opening.center)}`)).size !== 8) return null;
    return setup;
  } catch {
    return null;
  }
}

export function setupUrl(href: string, setup: Setup): string {
  const url = new URL(href);
  const sides = ["north", "south", "west", "east"];
  const values = [setup.x, setup.y, setup.height, setup.count, Number(setup.hidden), Number(setup.showRays), Number(setup.view === "perspective"),
    ...setup.openings.flatMap((opening) => [sides.indexOf(opening.side), opening.center])];
  url.searchParams.set("setup", values.join(","));
  return url.toString();
}
