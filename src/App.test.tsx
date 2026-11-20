// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { tools } from "./data/tools";

afterEach(cleanup);
function open(path: string, base = "/pmg_digital_toolbox/") {
  history.replaceState(null, "", `${base}#${path}`);
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
}

describe("toolbox routes", () => {
  it("registers all tools with unique slugs and components", () => {
    expect(tools.map((tool) => tool.slug)).toEqual([
      "ohmsches-gesetz",
      "stack-container",
      "abstract-datatype-visualizer",
      "bruchteile",
    ]);
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(tools.length);
    expect(tools.every((tool) => tool.component)).toBe(true);
  });
  it("shows the catalogue and filters it", () => {
    open("/");
    expect(
      screen.getByRole("heading", { name: /Alle Werkzeuge/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Physik" }));
    expect(
      screen.getByRole("heading", { name: "Ohmsches Gesetz" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Stack visualisieren" }),
    ).toBeNull();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "unbekannt" },
    });
    expect(
      screen.getByText("Keine passenden Werkzeuge gefunden."),
    ).toBeTruthy();
  });
  it("opens the information page", () => {
    open("/ueber");
    expect(
      screen.getByRole("heading", {
        name: "Ein Werkzeugkasten für alle Fächer.",
      }),
    ).toBeTruthy();
  });
  it.each(tools)("opens $slug directly under a nested base", async (tool) => {
    open(`/werkzeuge/${tool.slug}`, "/pmg_digital_toolbox/previews/pr-17/");
    expect(screen.getByRole("heading", { name: tool.title })).toBeTruthy();
    expect(
      await screen.findByLabelText(`${tool.title} – Interaktive Anwendung`),
    ).toBeTruthy();
    await screen.findByText(tool.learningGoal);
  });
  it.each(["/werkzeuge/unbekannt", "/unbekannt"])(
    "handles unknown route %s",
    (path) => {
      open(path);
      expect(
        screen.getByRole("heading", {
          name: "Diese Seite gibt es leider nicht.",
        }),
      ).toBeTruthy();
      expect(
        screen
          .getByRole("link", { name: /Zurück zur Toolbox/ })
          .getAttribute("href"),
      ).toBe("#/");
    },
  );
  it("keeps the route intact when using the skip link", () => {
    open("/ueber");
    fireEvent.click(screen.getByText("Zum Inhalt springen"));
    expect(location.hash).toBe("#/ueber");
    expect(document.activeElement?.id).toBe("content");
  });
});

describe("developer mode", () => {
  it("requires five taps within three seconds and can be hidden", () => {
    sessionStorage.clear();
    open("/");
    const trigger = screen.getByRole("button", { name: "PMG Digital Toolbox" });
    expect(screen.queryByLabelText("Version")).toBeNull();
    for (let i = 0; i < 4; i++) fireEvent.click(trigger);
    expect(screen.queryByLabelText("Version")).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByLabelText("Version")).toBeTruthy();
    expect(screen.getByLabelText("Version").closest("footer")).toBeTruthy();
    expect(sessionStorage.getItem("pmg-digital-toolbox:developer-mode")).toBe("enabled");
    fireEvent.click(screen.getByRole("button", { name: "Ausblenden" }));
    expect(screen.queryByLabelText("Version")).toBeNull();
    sessionStorage.clear();
  });
});

it("resets an incomplete activation sequence after three seconds", () => {
  sessionStorage.clear();
  let now = 1000;
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    open("/");
    const trigger = screen.getByRole("button", { name: "PMG Digital Toolbox" });
    for (let i = 0; i < 4; i++) fireEvent.click(trigger);
    now += 3000;
    fireEvent.click(trigger);
    expect(screen.queryByLabelText("Version")).toBeNull();
  } finally {
    Date.now = originalNow;
    sessionStorage.clear();
  }
});
