export type OpeningSide = "north" | "south" | "west" | "east";
export interface Opening { side: OpeningSide; center: number }

// Two non-overlapping positions per wall provide all eight openings for an exercise.
export function generateOpenings(): Opening[] {
  const sides: OpeningSide[] = ["north", "south", "west", "east"];
  const openings = sides.flatMap((side) => [
    { side, center: Math.round((-4.6 + Math.random() * 3.45) * 1000) / 1000 },
    { side, center: Math.round((1.15 + Math.random() * 3.45) * 1000) / 1000 },
  ]);

  for (let index = openings.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [openings[index], openings[otherIndex]] = [openings[otherIndex], openings[index]];
  }
  return openings;
}
