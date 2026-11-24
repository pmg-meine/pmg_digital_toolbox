import { useEffect, useRef, useState, type PointerEvent } from "react";
import { HEIGHT, WIDTH, lightPolygon, type Point } from "../lichtausbreitung/geometry";
import { beamScreenSegments } from "./geometry";
import { createShadowPdf } from "./exportPdf";
import { randomSetup, readSetup, setupUrl } from "./setup";
import "../lichtausbreitung/light.css";
import "./shadow.css";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const sourceX = 9;


export default function ShadowSimulation() {
  const [setup, setSetup] = useState(() => readSetup(window.location.search));
  const { sourceYs, angles, enabled, brick, showRays } = setup;
  const [exerciseCount, setExerciseCount] = useState("5");
  const [message, setMessage] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ target: number; offset: Point } | null>(null);
  const sources = sourceYs.map((y) => ({ x: sourceX, y }));
  const activeSources = sources.filter((_, index) => enabled[index]);
  const segments = beamScreenSegments(sources.flatMap((point, index) => enabled[index] ? [{ point, angle: angles[index] }] : []), brick);
  const screenDescription = [...segments].reverse().map((segment) => {
    const illumination = segment.illuminatedBy === 0
      ? "unbeleuchtet"
      : `von ${segment.illuminatedBy} ${segment.illuminatedBy === 1 ? "Lampe" : "Lampen"} beleuchtet`;
    const shadow = activeSources.length === 2 && segment.blockedBy
      ? (segment.illuminatedBy === 0 ? ", Kernschatten" : ", Halbschatten")
      : "";
    return `${(HEIGHT - segment.to).toFixed(1)} bis ${(HEIGHT - segment.from).toFixed(1)} Millimeter: ${illumination}${shadow}`;
  }).join("; ");
  const brickPosition = { x: brick.x, y: brick.y };
  const brickWidth = brick.width, brickHeight = brick.height;
  const setBrickPosition = (position: Point) => setSetup((current) => ({ ...current, brick: { ...current.brick, ...position } }));
  const setEnabled = (index: number, value: boolean) => setSetup((current) => ({ ...current, enabled: current.enabled.map((old, i) => i === index ? value : old) }));
  useEffect(() => {
    const timeout = window.setTimeout(() => window.history.replaceState(window.history.state, "", setupUrl(window.location.href, setup)), 500);
    return () => window.clearTimeout(timeout);
  }, [setup]);
  useEffect(() => {
    const restore = () => setSetup(readSetup(window.location.search));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  async function shareScene() {
    try { await navigator.clipboard.writeText(setupUrl(window.location.href, setup)); setMessage("Link kopiert."); }
    catch { setMessage("Link konnte nicht kopiert werden. Bitte kopiere die Adresse aus der Adressleiste."); }
  }

  function exportPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const copy = svg.cloneNode(true) as SVGSVGElement;
    const originals = [svg, ...svg.querySelectorAll("*")];
    const copies = [copy, ...copy.querySelectorAll("*")];
    originals.forEach ( (element, index) => {
      const style = getComputedStyle(element);
      for (const property of ["fill", "fill-opacity", "stroke", "stroke-width", "font-size", "font-weight"]) {
        (copies[index] as SVGElement).style.setProperty(property, style.getPropertyValue(property));
      }
    });
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas"); canvas.width = 1525; canvas.height = 1090;
      const context = canvas.getContext("2d");
      if (context) { context.drawImage(image, 0, 0, canvas.width, canvas.height); const link = document.createElement("a"); link.download = "schatten-versuchsaufbau.png"; link.href = canvas.toDataURL("image/png"); link.click(); }
      URL.revokeObjectURL(url);
    };
    image.onerror = () => { URL.revokeObjectURL(url); setMessage("PNG konnte nicht erstellt werden."); };
    image.src = url;
  }

  function setSourceY(index: number, y: number) {
    setSetup((current) => ({ ...current, sourceYs: current.sourceYs.map((value, i) => i === index ? clamp(y, 5, HEIGHT - 5) : value) }));
  }

  function pointerPosition(event: PointerEvent<SVGElement>): Point | null {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(matrix.inverse());
  }

  function startDrag(event: PointerEvent<SVGElement>, target: number, position: Point) {
    const point = pointerPosition(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { target, offset: { x: point.x - position.x, y: point.y - position.y } };
  }

  function moveDrag(event: PointerEvent<SVGElement>) {
    const point = pointerPosition(event);
    if (!point || !drag.current) return;
    const { target, offset } = drag.current;
    if (target < 2) setSourceY(target, Math.round(point.y - offset.y));
    else setBrickPosition({ x: clamp(Math.round(point.x - offset.x), 35, WIDTH - brickWidth - 10), y: clamp(Math.round(point.y - offset.y), 0, HEIGHT - brickHeight) });
  }

  return <div className="sim-content">
    <div className="sim-topline"><span className="sim-eyebrow">OPTIK</span><span className="sim-note">Vermuten, überprüfen, vergleichen</span></div>
    <div className="sim-columns">
      <div className="sim-control-panel">
        <h2>Versuchsaufbau</h2>
        <div className="light-switches">{sources.map((_, index) => <label className="light-switch" key={index}>
          <span>💡 Taschenlampe {index + 1} einschalten</span>
          <input type="checkbox" role="switch" checked={enabled[index]} onChange={(event) => setEnabled(index, event.target.checked)} />
        </label>)}<label className="light-switch"><span>☀ Randstrahlen anzeigen</span><input type="checkbox" role="switch" checked={showRays} onChange={(event) => setSetup({ ...setup, showRays: event.target.checked })} /></label></div>
        {sources.map((source, index) => <details className="control-group light-parameter-controls" key={index}>
          <summary>Taschenlampe {index + 1}</summary>
          <label htmlFor={`shadow-source-${index}`}>Position Y <strong>{HEIGHT - source.y} mm</strong></label>
          <input id={`shadow-source-${index}`} type="range" min="5" max="205" value={HEIGHT - source.y} onChange={(event) => setSourceY(index, HEIGHT - Number(event.target.value))} />
          <label htmlFor={`shadow-angle-${index}`}>Öffnungswinkel <strong>{angles[index]}°</strong></label><input id={`shadow-angle-${index}`} type="range" min="10" max="100" value={angles[index]} onChange={(event) => setSetup({ ...setup, angles: angles.map((angle, i) => i === index ? Number(event.target.value) : angle) })} /></details>)}
        <details className="control-group light-parameter-controls">
          <summary>Klotz</summary>
          <label htmlFor="shadow-brick-x">Position X <strong>{brick.x} mm</strong></label>
          <input id="shadow-brick-x" type="range" min="35" max={WIDTH - brickWidth - 10} value={brick.x} onChange={(event) => setBrickPosition({ ...brickPosition, x: Number(event.target.value) })} />
          <label htmlFor="shadow-brick-y">Position Y <strong>{HEIGHT - brick.y - brickHeight / 2} mm</strong></label>
          <input id="shadow-brick-y" type="range" min={brickHeight / 2} max={HEIGHT - brickHeight / 2} step="0.5" value={HEIGHT - brick.y - brickHeight / 2} onChange={(event) => setBrickPosition({ ...brickPosition, y: HEIGHT - brickHeight / 2 - Number(event.target.value) })} />
          {(["width", "height"] as const).map((dimension) => <div key={dimension}><label htmlFor={`shadow-${dimension}`}>{dimension === "width" ? "Breite" : "Höhe"} <strong>{brick[dimension]} mm</strong></label><input id={`shadow-${dimension}`} type="range" min="5" max={dimension === "width" ? 50 : 150} value={brick[dimension]} onChange={(event) => { const updated = { ...brick, [dimension]: Number(event.target.value) }; updated.x = Math.min(updated.x, WIDTH - updated.width - 10); updated.y = Math.min(updated.y, HEIGHT - updated.height); setSetup({ ...setup, brick: updated }); }} /></div>)}
        </details>
        <h2>Aufgabenblätter erstellen</h2><div className="control-group"><label htmlFor="shadow-count">Anzahl der Blätter (1–50)</label><div className="light-exercise-actions"><input id="shadow-count" type="number" min="1" max="50" value={exerciseCount} onChange={(event) => setExerciseCount(event.target.value)} /><button className="secondary-button" disabled={!/^\d+$/.test(exerciseCount) || Number(exerciseCount) < 1 || Number(exerciseCount) > 50} onClick={() => createShadowPdf(Array.from({ length: Number(exerciseCount) }, randomSetup), window.location.href).save("schatten-aufgaben.pdf")}>PDF erzeugen</button></div></div>
      </div>
      <div className="sim-display"><div className="chart-card light-scene">
        <h2>Versuch auf DIN A4</h2>
        <p>Vermute zuerst, wo Kernschatten und Halbschatten auf dem Schirm entstehen. Schalte dann die Taschenlampen einzeln und gemeinsam ein.</p>
        <p className="light-share-message" role="status">{message}</p>
        <div className="shadow-canvas"><div className="light-scene-actions shadow-actions">
          <button className="secondary-button light-icon-button" onClick={exportPng} aria-label="Aufbau als PNG speichern" title="Aufbau als PNG speichern"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" /></svg></button>
          <button className="secondary-button light-icon-button" onClick={() => createShadowPdf([setup], window.location.href).save("schatten-versuchsaufbau.pdf")} aria-label="Aufbau als PDF speichern" title="Aufbau als PDF speichern"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" /></svg></button>
          <button className="secondary-button light-icon-button" onClick={shareScene} aria-label="Link kopieren" title="Link kopieren"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.6 1.6M14 11a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.6-1.6" /></svg></button>
        </div><svg ref={svgRef} viewBox={`-4 -4 ${WIDTH + 8} ${HEIGHT + 8}`} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} role="img" aria-label={`Versuchsaufbau mit zwei Taschenlampen und einem Klotz. ${activeSources.length} von 2 Taschenlampen eingeschaltet. ${activeSources.length > 0 ? `Schirm von unten nach oben: ${screenDescription}.` : ""}}`}>
          <defs><pattern id="shadow-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" className="light-grid-line" /></pattern></defs>
          <rect width={WIDTH} height={HEIGHT} className="light-paper" /><rect width={WIDTH} height={HEIGHT} fill="url(#shadow-grid)" />
          {sources.map((source, index) => enabled[index] && <polygon key={index} points={lightPolygon(source, angles[index], [brick]).map((point) => `${point.x},${point.y}`).join(" ")} className="shadow-beam" />)}
          {showRays && sources.map((source, index) => enabled[index] && lightPolygon(source, angles[index], [brick]).slice(1).map((point, ray) => <line key={`${index}-${ray}`} x1={source.x} y1={source.y} x2={point.x} y2={point.y} className="light-ray" />))}
          <rect {...brick} className="light-brick" onPointerDown={(event) => startDrag(event, 2, brickPosition)} />
          <line x1={WIDTH} y1="0" x2={WIDTH} y2={HEIGHT} className="light-screen" />
          {activeSources.length > 0 && segments.map((segment, index) => <line key={index} x1={WIDTH} y1={segment.from} x2={WIDTH} y2={segment.to} className={`shadow-screen-${segment.illuminatedBy}`} />)}
          {activeSources.length === 2 && segments.map((segment, index) => segment.blockedBy && segment.to - segment.from > 3 ? <text key={index} x={WIDTH - 3} y={(segment.from + segment.to) / 2} textAnchor="end" className="shadow-region-label">{segment.illuminatedBy === 0 ? "Kernschatten" : "Halbschatten"}</text> : null)}
          <g className="light-axes" aria-hidden="true">
            <path d="M 9 200 H 21 M 18 197 L 21 200 L 18 203 M 9 200 V 188 M 6 191 L 9 188 L 12 191" />
            <text x="23" y="201">x</text><text x="8" y="186">y</text>
          </g>
          {sources.map((source, index) => <g key={index}><rect x="0" y={source.y - 5} width="9" height="10" className="light-source" onPointerDown={(event) => startDrag(event, index, source)} /><text x="4.5" y={source.y + 1.5} textAnchor="middle" className="shadow-source-label" pointerEvents="none">{index + 1}</text></g>)}
        </svg></div>
      </div></div>
    </div>
  </div>;
}
