import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createExercisePdf, createSetupPdf } from "./exportPdf";
import { brickCenterBounds, defaultSetup, maximumBrickHeight, maximumBrickWidth, minimumBrickSize, randomSetup, readSetup, sceneBricks, setupUrl, type BrickParameters } from "./setup";
import { HEIGHT, WIDTH, lightPolygon } from "./geometry";
import "./light.css";

export default function LightPropagation() {
  const [initialSetup] = useState(() => readSetup(window.location.search));
  const [sourceY, setSourceY] = useState(initialSetup.sourceY);
  const [angle, setAngle] = useState(initialSetup.angle);
  const [brickParameters, setBrickParameters] = useState(initialSetup.bricks);
  const [lightOn, setLightOn] = useState(false);
  const [showRays, setShowRays] = useState(false);
  const [exerciseCount, setExerciseCount] = useState("5");
  const validExerciseCount = /^\d+$/.test(exerciseCount) && Number(exerciseCount) >= 1 && Number(exerciseCount) <= 50;
  useEffect(() => {
    window.history.replaceState(window.history.state, "", setupUrl(window.location.href, { sourceY, angle, bricks: brickParameters }));
  }, [sourceY, angle, brickParameters]);

  useEffect(() => {
    function restoreSetup() {
      const setup = readSetup(window.location.search);
      setSourceY(setup.sourceY);
      setAngle(setup.angle);
      setBrickParameters(setup.bricks);
      setLightOn(false);
    }
    window.addEventListener("popstate", restoreSetup);
    return () => window.removeEventListener("popstate", restoreSetup);
  }, []);

  const drag = useRef<{ index: number; offset: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bricks = sceneBricks({ sourceY, angle, bricks: brickParameters });
  const source = { x: 9, y: sourceY };
  const polygon = lightPolygon(source, angle, bricks);
  const points = polygon.map((point) => `${point.x},${point.y}`).join(" ");
  const screenSegments = polygon.slice(1).flatMap((point, index, boundary) => {
    const next = boundary[index + 1];
    return next && Math.abs(point.x - WIDTH) < 0.001 && Math.abs(next.x - WIDTH) < 0.001
      ? [{ from: point.y, to: next.y }] : [];
  });

  function updateBrick(index: number, changes: Partial<BrickParameters>) {
    setBrickParameters((current) => {
      const updated = current.map((brick, i) => i === index ? { ...brick, ...changes } : brick);
      const bounds = brickCenterBounds(updated, index);
      updated[index].centerY = Math.max(bounds.min, Math.min(bounds.max, updated[index].centerY));
      return updated;
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
    else updateBrick(drag.current.index, { centerY: Math.round(value * 2) / 2 });
  }

  function exportScene() {
    const setup = { sourceY, angle, bricks: brickParameters };
    const shareUrl = setupUrl(window.location.href, setup);
    createSetupPdf(setup, shareUrl).save("lichtausbreitung-versuchsaufbau.pdf");
  }

  function generateExercises() {
    const setups = Array.from({ length: Number(exerciseCount) }, () => randomSetup());
    createExercisePdf(setups, window.location.href).save("lichtausbreitung-aufgaben.pdf");
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
          {brickParameters.map((brick, index) => {
            const bounds = brickCenterBounds(brickParameters, index);
            const name = `Klotz ${String.fromCharCode(65 + index)}`;
            return <details className="control-group light-brick-controls" key={index}>
              <summary>{name}</summary>
              <label htmlFor={`brick-${index}`}>{name}, Mitte von oben <strong>{brick.centerY} mm</strong></label>
              <input id={`brick-${index}`} type="range" min={bounds.min} max={bounds.max} step="0.5" value={brick.centerY} onChange={(event) => updateBrick(index, { centerY: Number(event.target.value) })} />
              <label htmlFor={`brick-width-${index}`}>{name}, Breite <strong>{brick.width} mm</strong></label>
              <input id={`brick-width-${index}`} type="range" min={minimumBrickSize} max={maximumBrickWidth} value={brick.width} onChange={(event) => updateBrick(index, { width: Number(event.target.value) })} />
              <label htmlFor={`brick-height-${index}`}>{name}, Höhe <strong>{brick.height} mm</strong></label>
              <input id={`brick-height-${index}`} type="range" min={minimumBrickSize} max={maximumBrickHeight} value={brick.height} onChange={(event) => updateBrick(index, { height: Number(event.target.value) })} />
            </details>;
          })}
          <div className="control-group"><label><input type="checkbox" checked={showRays} onChange={(event) => setShowRays(event.target.checked)} /> Randstrahlen anzeigen</label></div>
          <div className="button-line">
            <button className="primary-button" onClick={() => setLightOn(!lightOn)}>{lightOn ? "Licht ausschalten" : "Licht einschalten"}</button>
            <button className="secondary-button" onClick={() => { const setup = randomSetup(); setSourceY(setup.sourceY); setAngle(setup.angle); setBrickParameters(setup.bricks); setLightOn(false); }}>Zufälliger Aufbau</button>
            <button className="secondary-button" onClick={exportScene}>Aufbau als PDF speichern</button>
            <button className="secondary-button" onClick={() => { setSourceY(defaultSetup.sourceY); setAngle(defaultSetup.angle); setBrickParameters(defaultSetup.bricks); setLightOn(false); setShowRays(false); }}>Zurücksetzen</button>
          </div>
          <h2>Aufgabenblätter erstellen</h2>
          <p>Erzeuge zufällige Versuchsaufbauten zum Ausdrucken und Überprüfen.</p>
          <div className="control-group">
            <label htmlFor="exercise-count">Anzahl der Blätter (1–50)</label>
            <input id="exercise-count" type="number" min="1" max="50" step="1" value={exerciseCount} onChange={(event) => setExerciseCount(event.target.value)} />
          </div>
          <button className="secondary-button" type="button" disabled={!validExerciseCount} onClick={generateExercises}>Aufgaben als PDF erzeugen</button>
        </div>
        <div className="sim-display">
          <div className="chart-card light-scene">
            <h2>Versuch auf DIN A4</h2>
            <svg ref={svgRef} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} viewBox={`-4 -4 ${WIDTH + 8} ${HEIGHT + 8}`} role="img" aria-label={`Versuchsaufbau mit Lichtquelle bei ${sourceY} Millimetern, Öffnungswinkel ${angle} Grad und vier Klötzen. Licht ${lightOn ? "eingeschaltet" : "ausgeschaltet"}.`}>
              <defs><pattern id="light-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" className="light-grid-line" /></pattern><clipPath id="light-paper-clip"><rect width={WIDTH} height={HEIGHT} /></clipPath></defs>
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} className="light-paper" />
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#light-grid)" />
              {lightOn && <polygon points={points} className="light-beam" />}
              {lightOn && showRays && polygon.slice(1).map((point, index) => <line key={index} x1={source.x} y1={source.y} x2={point.x} y2={point.y} className="light-ray" />)}
              <g clipPath="url(#light-paper-clip)">{bricks.map((brick, index) => {
                const centerX = brick.x + brick.width / 2;
                const centerY = brick.y + brick.height / 2;
                return <g key={index} onPointerDown={(event) => startDrag(event, index, centerY)} className="light-brick-group">
                  <rect {...brick} className="light-brick" />
                  <g className="light-brick-marker" aria-hidden="true">
                    <line x1={centerX - 2} y1={centerY} x2={centerX + 2} y2={centerY} />
                    <line x1={centerX} y1={centerY - 2} x2={centerX} y2={centerY + 2} />
                    <text x={centerX + 3} y={Math.max(4, Math.min(HEIGHT - 1, centerY - 3))}>{String.fromCharCode(65 + index)}</text>
                  </g>
                </g>;
              })}</g>
              <line x1={WIDTH} y1="0" x2={WIDTH} y2={HEIGHT} className="light-screen" />
              {lightOn && screenSegments.map((segment, index) => <line key={index} x1={WIDTH} y1={segment.from} x2={WIDTH} y2={segment.to} className="light-screen-result" />)}
              <rect x="0" y={sourceY - 5} width="9" height="10" className="light-source" onPointerDown={(event) => startDrag(event, -1, sourceY)} />
            </svg>
            <p className="sim-caption">Lichtquelle und Klötze ziehen oder mit den Reglern bewegen · Schirm rechts · Klotzmitten von der oberen Blattkante gemessen</p>
            <p className="sim-caption">Die PDF-Datei zeigt den Aufbau ohne Licht und ist im A4-Querformat druckfertig. QR-Code und Link öffnen denselben Aufbau mit ausgeschaltetem Licht.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
