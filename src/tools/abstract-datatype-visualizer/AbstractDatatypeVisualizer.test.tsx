// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";

afterEach(cleanup);

it("expands and restores the same IDE without reloading it", async () => {
  render(<MemoryRouter initialEntries={["/werkzeuge/abstract-datatype-visualizer"]}><App /></MemoryRouter>);
  const ide = await screen.findByTitle("Visualisierung abstrakter Datentypen mit Java-IDE");
  const workspace = ide.closest(".simulation-container");

  fireEvent.click(screen.getByRole("button", { name: "Vollbild" }));
  expect(workspace?.classList.contains("simulation-container-expanded")).toBe(true);
  expect(screen.getByTitle("Visualisierung abstrakter Datentypen mit Java-IDE")).toBe(ide);
  expect(document.body.style.overflow).toBe("hidden");

  fireEvent.click(screen.getByRole("button", { name: "Vollbild verlassen" }));
  expect(workspace?.classList.contains("simulation-container-expanded")).toBe(false);
  expect(screen.getByTitle("Visualisierung abstrakter Datentypen mit Java-IDE")).toBe(ide);
  expect(document.body.style.overflow).toBe("");
});
