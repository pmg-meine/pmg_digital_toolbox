// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";

afterEach(cleanup);

it("opens the locally hosted memory visualizer from its tool route", async () => {
  render(<MemoryRouter initialEntries={["/werkzeuge/virtual-memory-visualizer"]}><App /></MemoryRouter>);

  const visualizer = await screen.findByTitle("Virtuellen Java-Speicher visualisieren");
  expect(visualizer.getAttribute("src")).toBe(`${import.meta.env.BASE_URL}virtual-memory-visualizer/`);
  expect(screen.getByRole("link", { name: /Visualizer in einem neuen Fenster öffnen/ }).getAttribute("href"))
    .toBe(visualizer.getAttribute("src"));
});
