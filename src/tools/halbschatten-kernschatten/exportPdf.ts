import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { HEIGHT, WIDTH } from "../lichtausbreitung/geometry";
import { setupUrl, type ShadowSetup } from "./setup";

export function createShadowPdf(setups: ShadowSetup[], baseUrl: string): jsPDF {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  setups.forEach((setup, index) => {
    if (index) pdf.addPage();
    const scale = 0.78, left = 15, top = 5;
    const x = (value: number) => left + value * scale;
    const y = (value: number) => top + value * scale;
    pdf.setDrawColor(216, 216, 216); pdf.setLineWidth(0.1);
    for (let n = 0; n <= WIDTH; n += 5) pdf.line(x(n), y(0), x(n), y(HEIGHT));
    for (let n = 0; n <= HEIGHT; n += 5) pdf.line(x(0), y(n), x(WIDTH), y(n));
    pdf.setFillColor(211, 211, 211); pdf.setDrawColor(119, 119, 119);
    pdf.rect(x(setup.brick.x), y(setup.brick.y), setup.brick.width * scale, setup.brick.height * scale, "FD");
    setup.sourceYs.forEach((sourceY, i) => {
      pdf.setFillColor(40, 32, 47); pdf.rect(x(0), y(sourceY - 5), 9 * scale, 10 * scale, "F");
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(8); pdf.text(String(i + 1), x(4.5), y(sourceY + 1.5), { align: "center" });
    });
    pdf.setDrawColor(40, 32, 47); pdf.setLineWidth(1); pdf.line(x(WIDTH), y(0), x(WIDTH), y(HEIGHT));
    const url = setupUrl(baseUrl, { ...setup, enabled: [false, false], showRays: false });
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
    const moduleSize = 22 / (qr.modules.size + 8);
    pdf.setFillColor(0, 0, 0);
    for (let row = 0; row < qr.modules.size; row++) for (let col = 0; col < qr.modules.size; col++) {
      if (qr.modules.get(row, col)) pdf.rect(263 + (col + 4) * moduleSize, 175 + (row + 4) * moduleSize, moduleSize, moduleSize, "F");
    }
    pdf.setTextColor(0, 0, 180); pdf.setFontSize(10);
    pdf.textWithLink("Aufbau öffnen und Licht einschalten", 15, 180, { url });
    pdf.setTextColor(40, 32, 47); pdf.setFontSize(9);
    pdf.text(`Öffnungswinkel: Lampe 1: ${setup.angles[0]}°, Lampe 2: ${setup.angles[1]}°`, 15, 187);
    pdf.text("Zeichne deine Vermutung für Kern- und Halbschatten ein.", 15, 194);
  });
  return pdf;
}
