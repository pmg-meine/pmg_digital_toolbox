import { describe, expect, it } from "vitest";
import { createSetupPdf } from "./exportPdf";
import { defaultSetup, setupUrl } from "./setup";

describe("printable light setup", () => {
  it("creates a landscape A4 PDF with a link to the shared setup", () => {
    const url = setupUrl("https://example.org/tools/lichtausbreitung", defaultSetup);
    const pdf = createSetupPdf(defaultSetup, url);
    const output = pdf.output();

    expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(297);
    expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(210);
    expect(pdf.getNumberOfPages()).toBe(1);
    expect(output).toContain("/Subtype /Link");
    expect(output).toContain(url);
  });
});
