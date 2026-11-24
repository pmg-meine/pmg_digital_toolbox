import { describe, expect, it } from "vitest";
import { createExercisePdf, createSetupPdf } from "./exportPdf";
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
    expect(output).toContain("Klicke hier oder scanne den QR-Code");
    expect(output).toContain("Lichtquelle y=105.0");
    expect(output).toContain("Klotz A: Mitte y=162.5, Breite=8.0, Höhe=95.0 mm");
    expect(output).not.toContain(`(${url}) Tj`);
  });

  it("creates one page and a matching link for each exercise", () => {
    const baseUrl = "https://example.org/tools/lichtausbreitung";
    const setups = [defaultSetup, { ...defaultSetup, sourceY: 80, angle: 40 }];
    const pdf = createExercisePdf(setups, baseUrl);
    const output = pdf.output();

    expect(pdf.getNumberOfPages()).toBe(2);
    for (const setup of setups) {
      expect(output).toContain(setupUrl(baseUrl, setup));
    }
    expect(output).toContain("Lichtquelle y=130.0");
    expect(output.match(/\/Subtype \/Link/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
