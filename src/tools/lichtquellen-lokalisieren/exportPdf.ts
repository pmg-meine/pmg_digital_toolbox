import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { setupUrl, type Setup } from "./setup";

export function createSetupPdf(setup: Setup, baseUrl: string): jsPDF {
  return createExercisePdf([setup], baseUrl);
}

export function createExercisePdf(setups: Setup[], baseUrl: string): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  setups.forEach((setup, index) => {
    if (index) pdf.addPage();
    const url = setupUrl(baseUrl, setup);
    pdf.setFontSize(16);
    pdf.text(`Lichtquelle lokalisieren – Aufgabe ${index + 1}`, 15, 18);
    pdf.setFontSize(10);
    pdf.text("Verlängere die Lichtbündel in die Höhle und finde die Lichtquelle.", 15, 26);
    const center = 105;
    const top = 43;
    const scale = 6;
    const point = (x: number, y: number) => [center + x * scale, top + (y + 12) * scale] as const;
    const source = [setup.x, setup.y];
    setup.openings.slice(0, setup.count).forEach((opening) => {
      const horizontal = opening.side === "north" || opening.side === "south";
      const fixed = opening.side === "north" || opening.side === "west" ? -6 : 6;
      const endpoints = [-0.75, 0.75].map((offset) => horizontal
        ? [opening.center + offset, fixed] : [fixed, opening.center + offset]);
      pdf.setDrawColor(100);
      endpoints.forEach(([x, y]) => {
        const length = Math.hypot(x - source[0], y - source[1]);
        const [startX, startY] = point(x, y);
        const [endX, endY] = point(x + 8.5 * (x - source[0]) / length, y + 8.5 * (y - source[1]) / length);
        pdf.line(startX, startY, endX, endY);
      });
    });
    // Draw each wall in segments, leaving the selected openings clear.
    (["north", "south", "west", "east"] as const).forEach((side) => {
      const horizontal = side === "north" || side === "south";
      const fixed = side === "north" || side === "west" ? -6 : 6;
      const openings = setup.openings.slice(0, setup.count).filter((opening) => opening.side === side).sort((a, b) => a.center - b.center);
      let start = -6;
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.6);
      for (const opening of openings) {
        const a = horizontal ? point(start, fixed) : point(fixed, start);
        const b = horizontal ? point(opening.center - 0.75, fixed) : point(fixed, opening.center - 0.75);
        pdf.line(...a, ...b);
        start = opening.center + 0.75;
      }
      const a = horizontal ? point(start, fixed) : point(fixed, start);
      const b = horizontal ? point(6, fixed) : point(fixed, 6);
      pdf.line(...a, ...b);
    });
    pdf.setLineWidth(0.2);
    pdf.setFontSize(8);
    pdf.text(`Parameter: Quelle x=${setup.x.toFixed(1)}, y=${setup.y.toFixed(1)}, Höhe=${setup.height.toFixed(1)}; Öffnungen=${setup.count}`, 15, 216);
    pdf.text(`Ansicht=${setup.view}, Quelle verborgen=${setup.hidden ? "ja" : "nein"}, Strahlen=${setup.showRays ? "ja" : "nein"}`, 15, 221);
    const openingText = setup.openings.map((opening) => `${opening.side}: ${opening.center.toFixed(3)}`).join("; ");
    pdf.text(pdf.splitTextToSize(`Öffnungen (Reihenfolge): ${openingText}`, 150), 15, 226);
    pdf.setTextColor(0, 0, 200);
    const linkWidth = pdf.textWithLink("Lösung: Klicke hier oder scanne den QR-Code und schalte das Licht ein.", 15, 245, { url });
    pdf.setDrawColor(0, 0, 200);
    pdf.setLineWidth(0.15);
    pdf.line(15, 245.7, 15 + linkWidth, 245.7);
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
    const moduleSize = 35 / (qr.modules.size + 8);
    pdf.setFillColor(0, 0, 0);
    for (let row = 0; row < qr.modules.size; row++) {
      for (let column = 0; column < qr.modules.size; column++) {
        if (qr.modules.get(row, column)) pdf.rect(160 + (column + 4) * moduleSize, 240 + (row + 4) * moduleSize, moduleSize, moduleSize, "F");
      }
    }
    pdf.setTextColor(0);
  });
  return pdf;
}
