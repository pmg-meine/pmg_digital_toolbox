// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AbstractDatatypeVisualizer from "./AbstractDatatypeVisualizer";

afterEach(cleanup);

it("expands and restores the same IDE without reloading it", () => {
  render(<AbstractDatatypeVisualizer />);
  const ide = screen.getByTitle("Visualisierung abstrakter Datentypen mit Java-IDE");
  const workspace = ide.parentElement;

  fireEvent.click(screen.getByRole("button", { name: "Vollbild" }));
  expect(workspace?.classList.contains("datatype-workspace-expanded")).toBe(true);
  expect(screen.getByTitle("Visualisierung abstrakter Datentypen mit Java-IDE")).toBe(ide);
  expect(document.body.style.overflow).toBe("hidden");

  fireEvent.click(screen.getByRole("button", { name: "Vollbild verlassen" }));
  expect(workspace?.classList.contains("datatype-workspace-expanded")).toBe(false);
  expect(screen.getByTitle("Visualisierung abstrakter Datentypen mit Java-IDE")).toBe(ide);
  expect(document.body.style.overflow).toBe("");
});
