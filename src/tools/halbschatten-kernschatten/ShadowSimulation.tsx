import { useRef, useState, type PointerEvent } from "react";
import { HEIGHT, WIDTH, lightPolygon, type Point } from "../lichtausbreitung/geometry";
import { screenSegments } from "./geometry";
import "../lichtausbreitung/light.css";
import "./shadow.css";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const sourceX = 9;
const brickWidth = 8;
const brickHeight = 45;

export default function ShadowSimulation() {
  const [sourceYs, setSourceYs] = useState([65, 145]);
  const [enabled, setEnabled] = useState([false, false]);
  const [brickPosition, setBrickPosition] = useState({ x: 145, y: 82.5 });
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ target: number; offset: Point } | null>(null);
  const sources = sourceYs.map((y) => ({ x: sourceX, y }));
  const brick = { ...brickPosition, width: brickWidth, height: brickHeight };
  const activeSources = sources.filter((_, index) => enabled[index]);
  const segments = screenSegments(activeSources, brick);

  function setSourceY(index: number, y: number) {
    setSourceYs((current) => current.map((value, i) => i === index ? clamp(y, 5, HEIGHT - 5) : value));
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
          <input type="checkbox" role="switch" checked={enabled[index]} onChange={(event) => setEnabled((current) => current.map((value, i) => i === index ? event.target.checked : value))} />
        </label>)}</div>
        {sources.map((source, index) => <div className="control-group" key={index}>
          <label htmlFor={`shadow-source-${index}`}>Taschenlampe {index + 1}: Position Y <strong>{HEIGHT - source.y} mm</strong></label>
          <input id={`shadow-source-${index}`} type="range" min="5" max="205" value={HEIGHT - source.y} onChange={(event) => setSourceY(index, HEIGHT - Number(event.target.value))} />
        </div>)}
        <div className="control-group">
          <label htmlFor="shadow-brick-x">Klotz: Position X <strong>{brick.x} mm</strong></label>
          <input id="shadow-brick-x" type="range" min="35" max={WIDTH - brickWidth - 10} value={brick.x} onChange={(event) => setBrickPosition({ ...brickPosition, x: Number(event.target.value) })} />
          <label htmlFor="shadow-brick-y">Klotz: Position Y <strong>{HEIGHT - brick.y - brickHeight / 2} mm</strong></label>
          <input id="shadow-brick-y" type="range" min={brickHeight / 2} max={HEIGHT - brickHeight / 2} step="0.5" value={HEIGHT - brick.y - brickHeight / 2} onChange={(event) => setBrickPosition({ ...brickPosition, y: HEIGHT - brickHeight / 2 - Number(event.target.value) })} />
        </div>
      </div>
      <div className="sim-display"><div className="chart-card light-scene">
        <h2>Versuch auf DIN A4</h2>
        <p>Vermute zuerst, wo Kernschatten und Halbschatten auf dem Schirm entstehen. Schalte dann die Taschenlampen einzeln und gemeinsam ein.</p>
        <svg ref={svgRef} viewBox={`-4 -4 ${WIDTH + 8} ${HEIGHT + 8}`} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} role="img" aria-label={`Versuchsaufbau mit zwei Taschenlampen und einem Klotz. ${activeSources.length} von 2 Taschenlampen eingeschaltet. Die Bereiche auf dem Schirm sind unter der Abbildung beschrieben.`}>
          <defs><pattern id="shadow-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" className="light-grid-line" /></pattern></defs>
          <rect width={WIDTH} height={HEIGHT} className="light-paper" /><rect width={WIDTH} height={HEIGHT} fill="url(#shadow-grid)" />
          {sources.map((source, index) => enabled[index] && <polygon key={index} points={lightPolygon(source, 160, [brick]).map((point) => `${point.x},${point.y}`).join(" ")} className="shadow-beam" />)}
          <rect {...brick} className="light-brick" onPointerDown={(event) => startDrag(event, 2, brickPosition)} />
          <line x1={WIDTH} y1="0" x2={WIDTH} y2={HEIGHT} className="light-screen" />
          {activeSources.length > 0 && segments.map((segment, index) => <line key={index} x1={WIDTH} y1={segment.from} x2={WIDTH} y2={segment.to} className={`shadow-screen-${segment.illuminatedBy}`} />)}
          {sources.map((source, index) => <g key={index}><rect x="0" y={source.y - 5} width="9" height="10" className="light-source" onPointerDown={(event) => startDrag(event, index, source)} /><text x="4.5" y={source.y + 1.5} textAnchor="middle" className="shadow-source-label" pointerEvents="none">{index + 1}</text></g>)}
        </svg>
        <p className="sim-caption">Taschenlampen und Klotz ziehen oder mit den Reglern bewegen · Schirm rechts · Y-Positionen von unten gemessen</p>
        {activeSources.length === 0 ? <p>Schalte eine Taschenlampe ein, um die Projektion zu sehen.</p> : <div aria-live="polite"><p>Schirm von unten nach oben (Position in mm):</p><ul>{[...segments].reverse().map((segment, index) => <li key={index}>{(HEIGHT - segment.to).toFixed(1)}–{(HEIGHT - segment.from).toFixed(1)}: {segment.illuminatedBy === 0 ? "unbeleuchtet" : `von ${segment.illuminatedBy} ${segment.illuminatedBy === 1 ? "Lampe" : "Lampen"} beleuchtet`}{activeSources.length === 2 && (segment.illuminatedBy === 0 ? " (Kernschatten)" : segment.illuminatedBy === 1 ? " (Halbschatten)" : "")}</li>)}</ul></div>}
        <p className="sim-caption">Kernschatten: Keine der beiden Lampen erreicht den Schirm. Halbschatten: Nur eine Lampe erreicht ihn.</p>
      </div></div>
    </div>
  </div>;
}
