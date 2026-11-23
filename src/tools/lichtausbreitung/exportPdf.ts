import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { BRICK_HEIGHT, BRICK_WIDTH, HEIGHT, LEVELS, WIDTH } from "./geometry";
import { setupUrl, type Setup } from "./setup";

// Vector graphics keep the grid and QR code sharp when printed.
export function createSetupPdf(setup: Setup, shareUrl: string): jsPDF {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  drawSetupPage(pdf, setup, shareUrl);
  return pdf;
}

export function createExercisePdf(setups: Setup[], baseUrl: string): jsPDF {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  setups.forEach((setup, index) => {
    if (index > 0) pdf.addPage();
    drawSetupPage(pdf, setup, setupUrl(baseUrl, setup));
  });
  return pdf;
}

function drawSetupPage(pdf: jsPDF, setup: Setup, shareUrl: string) {
  const left = 27;
  const top = 7;
  const scale = 0.82;
  const x = (value: number) => left + value * scale;
  const y = (value: number) => top + value * scale;

  pdf.setDrawColor(216, 216, 216);
  pdf.setLineWidth(0.12);
  for (let gridX = 0; gridX <= WIDTH; gridX += 5) pdf.line(x(gridX), y(0), x(gridX), y(HEIGHT));
  for (let gridY = 0; gridY <= HEIGHT; gridY += 5) pdf.line(x(0), y(gridY), x(WIDTH), y(gridY));

  pdf.setFillColor(211, 211, 211);
  pdf.setDrawColor(119, 119, 119);
  pdf.setLineWidth(0.2);
  setup.positions.forEach((position, index) => {
    const visibleTop = Math.max(0, position);
    const visibleBottom = Math.min(HEIGHT, position + BRICK_HEIGHT);
    pdf.rect(x(LEVELS[Math.floor(index / 2)]), y(visibleTop), BRICK_WIDTH * scale, (visibleBottom - visibleTop) * scale, "F");
    // Only draw actual brick edges, not artificial edges at the paper boundary.
    const brickLeft = x(LEVELS[Math.floor(index / 2)]);
    const brickRight = brickLeft + BRICK_WIDTH * scale;
    pdf.line(brickLeft, y(visibleTop), brickLeft, y(visibleBottom));
    pdf.line(brickRight, y(visibleTop), brickRight, y(visibleBottom));
    if (position >= 0) pdf.line(brickLeft, y(position), brickRight, y(position));
    if (position + BRICK_HEIGHT <= HEIGHT) pdf.line(brickLeft, y(position + BRICK_HEIGHT), brickRight, y(position + BRICK_HEIGHT));
  });
  pdf.setFillColor(34, 34, 34);
  pdf.rect(x(0), y(setup.sourceY - 5), 9 * scale, 10 * scale, "F");
  pdf.setDrawColor(34, 34, 34);
  pdf.setLineWidth(1.6);
  pdf.line(x(WIDTH), y(0), x(WIDTH), y(HEIGHT));

  const qr = QRCode.create(shareUrl, { errorCorrectionLevel: "M" });
  const qrSize = 23;
  const moduleSize = qrSize / (qr.modules.size + 8);
  const qrX = 264;
  const qrY = 181;
  pdf.setFillColor(0, 0, 0);
  for (let row = 0; row < qr.modules.size; row++) {
    for (let column = 0; column < qr.modules.size; column++) {
      if (qr.modules.get(row, column)) {
        pdf.rect(qrX + (column + 4) * moduleSize, qrY + (row + 4) * moduleSize, moduleSize, moduleSize, "F");
      }
    }
  }

  pdf.setTextColor(34, 34, 34);
  pdf.setFontSize(9);
  pdf.text(`Lichtquelle · Öffnungswinkel ${setup.angle}° · Schirm rechts`, 10, 185);
  pdf.text("QR-Code scannen oder Link öffnen und Licht einschalten:", 10, 190);
  pdf.setFontSize(7);
  const lines: string[] = pdf.splitTextToSize(shareUrl, 250);
  lines.forEach((line, index) => {
    const lineY = 194 + index * 3;
    pdf.text(line, 10, lineY);
    pdf.link(10, lineY - 2.5, pdf.getTextWidth(line), 3, { url: shareUrl });
  });
}
