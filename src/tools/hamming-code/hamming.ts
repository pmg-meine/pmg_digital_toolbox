export const bitNames = ["p0", "p1", "d0", "p2", "d1", "d2", "d3"];
export const parityPositions = [0, 1, 3];
export const groups = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]];

export function encode(data: number[]): number[] {
  const [d0, d1, d2, d3] = data;
  return [d0 ^ d1 ^ d3, d0 ^ d2 ^ d3, d0, d1 ^ d2 ^ d3, d1, d2, d3];
}

export function syndrome(word: number[]): number[] {
  return groups.map((group) => group.reduce((sum, index) => sum ^ word[index], 0));
}

export function randomWord(): number[] {
  return encode(Array.from({ length: 4 }, () => Math.floor(Math.random() * 2)));
}

export function flip(word: number[], index: number): number[] {
  return word.map((bit, position) => position === index ? bit ^ 1 : bit);
}
