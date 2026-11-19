// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { parseVersions, readDeveloperMode, root, saveDeveloperMode, versionUrl } from "./versions";

describe("version navigation", () => {
  const stable = { id: "main", label: "Stable", channel: "stable" as const, basePath: root };
  const preview = { id: "pr-17", label: "PR #17", channel: "preview" as const, basePath: `${root}previews/pr-17/` };
  it("preserves routes between versions", () => {
    expect(versionUrl(preview, "#/werkzeuge/ohmsches-gesetz")).toBe(`${root}previews/pr-17/#/werkzeuge/ohmsches-gesetz`);
    expect(versionUrl(stable, "#/ueber")).toBe(`${root}#/ueber`);
    expect(versionUrl(preview, "")).toBe(`${root}previews/pr-17/#/`);
  });
  it("rejects unsafe paths, mismatched ids and duplicates", () => {
    expect(parseVersions({ versions: [stable, preview, preview, { ...preview, basePath: "//evil.example/" }, { ...stable, id: "pr-18" }] })).toEqual([stable, preview]);
  });
  it("handles malformed catalogues", () => expect(parseVersions(null)).toEqual([]));
});

describe("developer mode storage", () => {
  beforeEach(() => sessionStorage.clear());
  it("persists until disabled", () => {
    expect(readDeveloperMode()).toBe(false);
    saveDeveloperMode(true);
    expect(readDeveloperMode()).toBe(true);
    saveDeveloperMode(false);
    expect(readDeveloperMode()).toBe(false);
  });
});
