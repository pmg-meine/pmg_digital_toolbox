import { describe, expect, it } from "vitest";
import { encode, flip, syndrome } from "./hamming";

describe("Hamming code (7,4)", () => {
  it("encodes all data words with even parity and locates every single-bit error", () => {
    for (let value = 0; value < 16; value++) {
      const data = [3, 2, 1, 0].map((shift) => (value >> shift) & 1);
      const word = encode(data);
      expect([word[2], word[4], word[5], word[6]]).toEqual(data);
      expect(syndrome(word)).toEqual([0, 0, 0]);
      for (let index = 0; index < 7; index++) {
        const received = flip(word, index);
        const position = syndrome(received).reduce((sum, bit, group) => sum + bit * 2 ** group, 0);
        expect(position).toBe(index + 1);
        expect(flip(received, position - 1)).toEqual(word);
      }
    }
  });
});
