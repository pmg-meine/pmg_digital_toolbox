import { useState, type PointerEvent } from "react";
import "./cave.css";

type Point = { x: number; y: number };
type Opening = { side: number; center: number };
const initialOpenings: Opening[] = [
  { side: 0, center: -2 }, { side: 1, center: 1 },
  { side: 2, center: 2 }, { side: 3, center: -1 },
  { side: 0, center: 2 }, { side: 2, center: -2 },
  { side: 1, center: -3 }, { side: 3, center: 3 },
];
const clamp = (value: number) => Math.max(-4.2, Math.min(4.2, value));
function edgePoint(opening: Opening, offset: number): Point {
  const position = opening.center + offset;
  switch (opening.side) {
    case 0: return { x: position, y: -6 };
    case 1: return { x: 6, y: position };
    case 2: return { x: position, y: 6 };
    default: return { x: -6, y: position };
  }
}
function extend(source: Point, edge: Point): Point {
  const dx = edge.x - source.x;
  const dy = edge.y - source.y;
  const length = Math.hypot(dx, dy);
  return { x: edge.x + dx / length * 8.5, y: edge.y + dy / length * 8.5 };
}
export default function CaveLight() {
  const [source, setSource] = useState<Point>({ x: 0, y: 0 });
  const [count, setCount] = useState(4);
  const [openings, setOpenings] = useState(initialOpenings);
  const [hidden, setHidden] = useState(false);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const project = (point: Point, height = 0): Point => view === "2d"
    ? { x: 200 + point.x * 13, y: 200 + point.y * 13 }
    : { x: 200 + (point.x - point.y) * 9, y: 180 + (point.x + point.y) * 4.5 - height * 13 };
  const coordinates = (points: Point[]) => points.map((point) => {
    const projected = project(point);
    return `${projected.x},${projected.y}`;
  }).join(" ");
  const moveSource = (event: PointerEvent<SVGSVGElement>) => {
    if (hidden || view !== "2d") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = Math.min(bounds.width, bounds.height) / 400;
    setSource({ x: clamp((event.clientX - bounds.left - bounds.width / 2) / scale / 13), y: clamp((event.clientY - bounds.top - bounds.height / 2) / scale / 13) });
  };
  const randomize = () => {
    setSource({ x: Math.round((Math.random() * 7.6 - 3.8) * 10) / 10, y: Math.round((Math.random() * 7.6 - 3.8) * 10) / 10 });
    setOpenings([...initialOpenings].sort(() => Math.random() - 0.5));
  };
  const visibleOpenings = openings.slice(0, count);
  const corners = [{ x: -6, y: -6 }, { x: 6, y: -6 }, { x: 6, y: 6 }, { x: -6, y: 6 }];
  return <div className="sim-content">
    <div className="sim-topline"><span className="sim-eyebrow">OPTIK</span><span className="sim-note">Lichtstrahlen zurückverfolgen</span></div>
    <div className="sim-columns">
      <div className="sim-control-panel">
        <h2>Versuchsaufbau</h2>
        <div className="control-group"><label htmlFor="cave-count">Öffnungen <strong>{count}</strong></label><input id="cave-count" type="range" min="1" max="8" value={count} onChange={(event) => setCount(Number(event.target.value))} /></div>
        <div className="control-group"><label htmlFor="cave-view">Ansicht</label><select id="cave-view" value={view} onChange={(event) => setView(event.target.value as "2d" | "3d")}><option value="2d">2D – Draufsicht</option><option value="3d">3D – Perspektive</option></select></div>
        <div className="control-group"><label><input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} /> Lichtquelle und Licht in der Höhle ausblenden</label></div>
        {!hidden && <><p>Verschiebe die Lichtquelle in der Draufsicht oder mit den Reglern.</p>{(["x", "y"] as const).map((axis) => <div className="control-group" key={axis}><label htmlFor={`cave-${axis}`}>Position {axis.toUpperCase()} <strong>{source[axis].toFixed(1)}</strong></label><input id={`cave-${axis}`} type="range" min="-4.2" max="4.2" step="0.1" value={source[axis]} onChange={(event) => setSource({ ...source, [axis]: Number(event.target.value) })} /></div>)}</>}
        <button className="secondary-button" type="button" onClick={randomize}>Neue Aufgabe ↻</button>
        <p>Verlängere die äußeren Lichtbündel gedanklich in die Höhle. Wo treffen sie sich? Blende die Lichtquelle zur Kontrolle ein.</p>
      </div>
      <div className="sim-display cave-display">
        <svg viewBox="0 0 400 400" role="img" aria-label={`${view === "2d" ? "Draufsicht" : "Perspektivische Ansicht"} der Höhle mit ${count} Öffnungen und Lichtbündeln${hidden ? "; Lichtquelle verborgen" : `; Lichtquelle bei X ${source.x.toFixed(1)}, Y ${source.y.toFixed(1)}`}`} onPointerDown={(event) => { if (view === "2d" && !hidden) { event.currentTarget.setPointerCapture(event.pointerId); moveSource(event); } }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveSource(event); }}>
          <rect width="400" height="400" fill="#12232e" />
          <polygon points={coordinates(corners)} fill="#263e48" />
          {visibleOpenings.map((opening, index) => {
            const a = edgePoint(opening, -0.75); const b = edgePoint(opening, 0.75);
            return <g key={index}><polygon points={coordinates([a, b, extend(source, b), extend(source, a)])} fill="#95e3ff" opacity="0.72" />{!hidden && <polygon points={coordinates([source, a, b])} fill="#ffd36a" opacity="0.35" />}</g>;
          })}
          {corners.map((_, side) => {
            const sideOpenings = visibleOpenings.filter((opening) => opening.side === side).sort((a, b) => a.center - b.center);
            const segments = [edgePoint({ side, center: -6 }, 0), ...sideOpenings.flatMap((opening) => [edgePoint(opening, -0.75), edgePoint(opening, 0.75)]), edgePoint({ side, center: 6 }, 0)];
            return <g key={side}>{Array.from({ length: segments.length / 2 }, (_, index) => {
              const a = segments[index * 2]; const b = segments[index * 2 + 1];
              const pa = project(a); const pb = project(b); const ta = project(a, 2.8); const tb = project(b, 2.8);
              return view === "3d" ? <polygon key={index} points={`${pa.x},${pa.y} ${pb.x},${pb.y} ${tb.x},${tb.y} ${ta.x},${ta.y}`} fill="#71838a" stroke="#b4c4c9" strokeWidth="1" /> : <line key={index} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#b4c4c9" strokeWidth="4" />;
            })}</g>;
          })}
          {!hidden && <circle cx={project(source).x} cy={project(source).y} r="7" fill="#ffd36a" stroke="#fff" strokeWidth="2" />}
        </svg>
        <p>Die farbigen Flächen zeigen die Lichtbündel am Boden. Die Darstellung vereinfacht die Lichtquelle zu einem Punkt.</p>
      </div>
    </div>
  </div>;
}
