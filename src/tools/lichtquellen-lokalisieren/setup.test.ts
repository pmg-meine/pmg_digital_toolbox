import { describe, expect, it } from "vitest";
import { createExercisePdf, createSetupPdf } from "./exportPdf";
import { randomSetup, readSetup, setupUrl } from "./setup";

describe("cave setup links and exercises", () => {
  it("round trips every parameter and preserves the deployment path and other query parameters", () => {
    const setup = randomSetup();
    const url = new URL(setupUrl("https://example.org/preview/tool?other=1", setup));
    expect(url.pathname).toBe("/preview/tool");
    expect(url.searchParams.get("other")).toBe("1");
    expect(readSetup(url.search)).toEqual(setup);
  });

  it("rejects malformed and out-of-range setups", () => {
    expect(readSetup("?setup=broken")).toBeNull();
    const setup = { ...randomSetup(), count: 99 };
    expect(readSetup(new URL(setupUrl("https://example.org/", setup)).search)).toBeNull();
  });

  it("exports the current configuration with its shareable link", () => {
    const setup = { ...randomSetup(), hidden: false };
    const baseUrl = "https://example.org/tool";
    const pdf = createSetupPdf(setup, baseUrl);
    const content = pdf.output();
    expect(pdf.getNumberOfPages()).toBe(1);
    expect(content).toContain(setupUrl(baseUrl, setup));
    expect(content).toContain("schalte das Licht ein.");
  });

  it("creates one printable page and configuration link per exercise", () => {
    const pdf = createExercisePdf([randomSetup(), randomSetup()], "https://example.org/tool");
    expect(pdf.getNumberOfPages()).toBe(2);
    const content = pdf.output();
    expect(content.match(/\/Subtype \/Link/g)).toHaveLength(2);
    expect(content).toContain("?setup=");
  });
});
