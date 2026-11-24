import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { HEIGHT, WIDTH } from "./geometry";
import { sceneBricks, setupUrl, type Setup } from "./setup";

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
  sceneBricks(setup).forEach((brick) => {
    const visibleTop = Math.max(0, brick.y);
    const visibleBottom = Math.min(HEIGHT, brick.y + brick.height);
    const brickLeft = x(brick.x);
    const brickRight = x(brick.x + brick.width);
    pdf.rect(brickLeft, y(visibleTop), brick.width * scale, (visibleBottom - visibleTop) * scale, "F");
    pdf.line(brickLeft, y(visibleTop), brickLeft, y(visibleBottom));
    pdf.line(brickRight, y(visibleTop), brickRight, y(visibleBottom));
    if (brick.y >= 0) pdf.line(brickLeft, y(brick.y), brickRight, y(brick.y));
    if (brick.y + brick.height <= HEIGHT) pdf.line(brickLeft, y(brick.y + brick.height), brickRight, y(brick.y + brick.height));
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

  pdf.setTextColor(0, 0, 200);
  pdf.setFontSize(9);
  const linkWidth = pdf.textWithLink("Lösung: Klicke hier oder scanne den QR-Code und schalte das Licht ein.", 10, 185, { url: shareUrl });
  pdf.setDrawColor(0, 0, 200);
  pdf.setLineWidth(0.15);
  pdf.line(10, 185.7, 10 + linkWidth, 185.7);
  pdf.setTextColor(34, 34, 34);
  pdf.setFontSize(7);
  pdf.text(`Parameter: Lichtquelle y=${setup.sourceY}, Öffnungswinkel=${setup.angle}°`, 10, 191);
  setup.bricks.forEach((brick, index) => {
    pdf.text(`Stein ${index + 1}: Mitte y=${brick.centerY}, Breite=${brick.width}, Höhe=${brick.height} mm`, 10 + (index % 2) * 110, 195 + Math.floor(index / 2) * 4);
  });
}
