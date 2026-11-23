import { useEffect, useRef, useState, type PointerEvent } from "react";
import QRCode from "qrcode";
import { defaultSetup, maximumBrickY, minimumBrickY, randomSetup, readSetup, setupUrl } from "./setup";
import { BRICK_HEIGHT, BRICK_WIDTH, HEIGHT, LEVELS, WIDTH, lightPolygon } from "./geometry";
import "./light.css";

export default function LightPropagation() {
  const [initialSetup] = useState(() => readSetup(window.location.search));
  const [sourceY, setSourceY] = useState(initialSetup.sourceY);
  const [angle, setAngle] = useState(initialSetup.angle);
  const [positions, setPositions] = useState(initialSetup.positions);
  const [lightOn, setLightOn] = useState(false);
  const [showRays, setShowRays] = useState(false);
  useEffect(() => {
    window.history.replaceState(window.history.state, "", setupUrl(window.location.href, { sourceY, angle, positions }));
  }, [sourceY, angle, positions]);

  useEffect(() => {
    function restoreSetup() {
      const setup = readSetup(window.location.search);
      setSourceY(setup.sourceY);
      setAngle(setup.angle);
      setPositions(setup.positions);
      setLightOn(false);
    }
    window.addEventListener("popstate", restoreSetup);
    return () => window.removeEventListener("popstate", restoreSetup);
  }, []);

  const drag = useRef<{ index: number; offset: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bricks = positions.map((y, index) => ({
    x: LEVELS[Math.floor(index / 2)], y, width: BRICK_WIDTH, height: BRICK_HEIGHT,
  }));
  const source = { x: 9, y: sourceY };
  const polygon = lightPolygon(source, angle, bricks);
  const points = polygon.map((point) => `${point.x},${point.y}`).join(" ");
  const screenSegments = polygon.slice(1).flatMap((point, index, boundary) => {
    const next = boundary[index + 1];
    return next && Math.abs(point.x - WIDTH) < 0.001 && Math.abs(next.x - WIDTH) < 0.001
      ? [{ from: point.y, to: next.y }] : [];
  });

  function moveBrick(index: number, value: number) {
    setPositions((current) => {
      const minimum = index % 2 === 0 ? minimumBrickY : current[index - 1] + BRICK_HEIGHT;
      const maximum = index % 2 === 0 ? current[index + 1] - BRICK_HEIGHT : maximumBrickY;
      return current.map((position, i) => i === index ? Math.round(Math.max(minimum, Math.min(maximum, value))) : position);
    });
  }

  function pointerY(event: PointerEvent<SVGElement>) {
    const svg = svgRef.current;
    if (!svg) return 0;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()).y : 0;
  }

  function startDrag(event: PointerEvent<SVGElement>, index: number, position: number) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { index, offset: pointerY(event) - position };
  }

  function moveDrag(event: PointerEvent<SVGElement>) {
    if (!drag.current) return;
    const value = pointerY(event) - drag.current.offset;
    if (drag.current.index === -1) setSourceY(Math.round(Math.max(5, Math.min(HEIGHT - 5, value))));
    else moveBrick(drag.current.index, value);
  }

  async function exportScene() {
    const shareUrl = setupUrl(window.location.href, { sourceY, angle, positions });
    const qr = await QRCode.toString(shareUrl, { type: "svg", errorCorrectionLevel: "M", margin: 4 });
    const qrContent = qr.replace(/<svg[^>]*>/, (tag) => tag.replace("<svg ", '<svg x="270" y="211" width="24" height="24" '));
    const brickElements = bricks.map((brick) =>
      `<rect x="${brick.x}" y="${brick.y}" width="${brick.width}" height="${brick.height}" fill="#d3d3d3" stroke="#777" stroke-width="0.3"/>`,
    ).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="235mm" viewBox="0 0 297 235"><defs><pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="#d8d8d8" stroke-width="0.2"/></pattern></defs><rect width="297" height="210" fill="white"/><rect width="297" height="210" fill="url(#grid)"/><rect x="0" y="${sourceY - 5}" width="9" height="10" fill="#222"/>${brickElements}<line x1="296" y1="0" x2="296" y2="210" stroke="#222" stroke-width="2"/><text x="12" y="203" font-family="sans-serif" font-size="4">Lichtquelle · Öffnungswinkel ${angle}° · Schirm rechts</text><rect y="210" width="297" height="25" fill="white"/><text x="12" y="223" font-family="sans-serif" font-size="4">QR-Code scannen und Licht einschalten, um die Vermutung zu überprüfen.</text>${qrContent}</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "lichtausbreitung-versuchsaufbau.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="sim-content">
      <div className="sim-topline"><span className="sim-eyebrow">OPTIK</span><span className="sim-note">Vermuten, zeichnen, überprüfen</span></div>
      <p>Stelle den Versuch ein und exportiere den unbeleuchteten Aufbau. Zeichne deine Vermutung ein und schalte danach das Licht an.</p>
      <div className="sim-columns">
        <div className="sim-control-panel">
          <h2>Versuchsaufbau</h2>
          <div className="control-group"><label htmlFor="light-source">Lichtquelle von oben <strong>{sourceY} mm</strong></label><input id="light-source" type="range" min="5" max="205" value={sourceY} onChange={(event) => setSourceY(Number(event.target.value))} /></div>
          <div className="control-group"><label htmlFor="light-angle">Öffnungswinkel <strong>{angle}°</strong></label><input id="light-angle" type="range" min="10" max="100" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></div>
          {positions.map((position, index) => (
            <div className="control-group" key={index}>
              <label htmlFor={`brick-${index}`}>Stein {Math.floor(index / 2) + 1} {index % 2 === 0 ? "oben" : "unten"} <strong>{position} mm</strong></label>
              <input id={`brick-${index}`} type="range" min={index % 2 === 0 ? minimumBrickY : positions[index - 1] + BRICK_HEIGHT} max={index % 2 === 0 ? positions[index + 1] - BRICK_HEIGHT : maximumBrickY} value={position} onChange={(event) => moveBrick(index, Number(event.target.value))} />
            </div>
          ))}
          <div className="control-group"><label><input type="checkbox" checked={showRays} onChange={(event) => setShowRays(event.target.checked)} /> Randstrahlen anzeigen</label></div>
          <div className="button-line">
            <button className="primary-button" onClick={() => setLightOn(!lightOn)}>{lightOn ? "Licht ausschalten" : "Licht einschalten"}</button>
            <button className="secondary-button" onClick={() => { const setup = randomSetup(); setSourceY(setup.sourceY); setAngle(setup.angle); setPositions(setup.positions); setLightOn(false); }}>Zufälliger Aufbau</button>
            <button className="secondary-button" onClick={exportScene}>Aufbau als SVG speichern</button>
            <button className="secondary-button" onClick={() => { setSourceY(defaultSetup.sourceY); setAngle(defaultSetup.angle); setPositions(defaultSetup.positions); setLightOn(false); setShowRays(false); }}>Zurücksetzen</button>
          </div>
        </div>
        <div className="sim-display">
          <div className="chart-card light-scene">
            <h2>Versuch auf DIN A4</h2>
            <svg ref={svgRef} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} viewBox={`-4 -4 ${WIDTH + 8} ${HEIGHT + 8}`} role="img" aria-label={`Versuchsaufbau mit Lichtquelle bei ${sourceY} Millimetern, Öffnungswinkel ${angle} Grad und vier Steinen. Licht ${lightOn ? "eingeschaltet" : "ausgeschaltet"}.`}>
              <defs><pattern id="light-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" className="light-grid-line" /></pattern><clipPath id="light-paper-clip"><rect width={WIDTH} height={HEIGHT} /></clipPath></defs>
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} className="light-paper" />
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#light-grid)" />
              {lightOn && <polygon points={points} className="light-beam" />}
              {lightOn && showRays && polygon.slice(1).map((point, index) => <line key={index} x1={source.x} y1={source.y} x2={point.x} y2={point.y} className="light-ray" />)}
              <g clipPath="url(#light-paper-clip)">{bricks.map((brick, index) => <rect key={index} {...brick} className="light-brick" onPointerDown={(event) => startDrag(event, index, brick.y)} />)}</g>
              <line x1={WIDTH} y1="0" x2={WIDTH} y2={HEIGHT} className="light-screen" />
              {lightOn && screenSegments.map((segment, index) => <line key={index} x1={WIDTH} y1={segment.from} x2={WIDTH} y2={segment.to} className="light-screen-result" />)}
              <rect x="0" y={sourceY - 5} width="9" height="10" className="light-source" onPointerDown={(event) => startDrag(event, -1, sourceY)} />
            </svg>
            <p className="sim-caption">Lichtquelle und Steine ziehen oder mit den Reglern bewegen · Schirm rechts · Steinpositionen von der oberen Blattkante gemessen</p>
            <p className="sim-caption">Die SVG-Datei zeigt immer den Aufbau ohne Licht. Der QR-Code öffnet denselben Aufbau mit ausgeschaltetem Licht. Zum Ausdrucken im Browser öffnen und Querformat wählen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
