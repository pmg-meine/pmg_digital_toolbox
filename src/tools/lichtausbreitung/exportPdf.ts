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
  sceneBricks(setup).forEach((brick, index) => {
    const visibleTop = Math.max(0, brick.y);
    const visibleBottom = Math.min(HEIGHT, brick.y + brick.height);
    const brickLeft = x(brick.x);
    const brickRight = x(brick.x + brick.width);
    pdf.rect(brickLeft, y(visibleTop), brick.width * scale, (visibleBottom - visibleTop) * scale, "F");
    pdf.line(brickLeft, y(visibleTop), brickLeft, y(visibleBottom));
    pdf.line(brickRight, y(visibleTop), brickRight, y(visibleBottom));
    if (brick.y >= 0) pdf.line(brickLeft, y(brick.y), brickRight, y(brick.y));
    if (brick.y + brick.height <= HEIGHT) pdf.line(brickLeft, y(brick.y + brick.height), brickRight, y(brick.y + brick.height));
    const centerX = brick.x + brick.width / 2;
    const centerY = brick.y + brick.height / 2;
    if (centerY >= 0 && centerY <= HEIGHT) {
      pdf.setDrawColor(41, 35, 44);
      pdf.line(x(centerX - 2), y(centerY), x(centerX + 2), y(centerY));
      pdf.line(x(centerX), y(Math.max(0, centerY - 2)), x(centerX), y(Math.min(HEIGHT, centerY + 2)));
      pdf.setDrawColor(119, 119, 119);
    }
    pdf.setTextColor(41, 35, 44);
    pdf.setFontSize(9);
    pdf.text(String.fromCharCode(65 + index), x(centerX), y(Math.max(4, Math.min(HEIGHT - 1, centerY - 3))), { align: "center" });
  });
  pdf.setFillColor(34, 34, 34);
  pdf.rect(x(0), y(setup.sourceY - 5), 9 * scale, 10 * scale, "F");
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.4);
  pdf.line(x(2.5), y(setup.sourceY), x(6.5), y(setup.sourceY));
  pdf.line(x(4.5), y(setup.sourceY - 2), x(4.5), y(setup.sourceY + 2));
  pdf.setDrawColor(81, 72, 90);
  pdf.setLineWidth(0.4);
  pdf.line(x(9), y(200), x(21), y(200));
  pdf.line(x(18), y(197), x(21), y(200));
  pdf.line(x(21), y(200), x(18), y(203));
  pdf.line(x(9), y(200), x(9), y(188));
  pdf.line(x(6), y(191), x(9), y(188));
  pdf.line(x(9), y(188), x(12), y(191));
  pdf.setTextColor(81, 72, 90);
  pdf.setFontSize(9);
  pdf.text("x", x(23), y(201));
  pdf.text("y", x(8), y(186));
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
  pdf.text(`Parameter: Lichtquelle y=${(HEIGHT - setup.sourceY).toFixed(1)}, Öffnungswinkel=${setup.angle.toFixed(1)}°`, 10, 191);
  setup.bricks.forEach((brick, index) => {
    pdf.text(`Klotz ${String.fromCharCode(65 + index)}: Mitte y=${(HEIGHT - brick.centerY).toFixed(1)}, Breite=${brick.width.toFixed(1)}, Höhe=${brick.height.toFixed(1)} mm`, 10 + (index % 2) * 110, 195 + Math.floor(index / 2) * 4);
  });
}
