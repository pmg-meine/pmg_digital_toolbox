import { useEffect, useRef, useState } from "react";
import { createCaveScene } from "./caveScene";
import "./cave.css";

type Scene = ReturnType<typeof createCaveScene>;
type Point = { x: number; y: number };

export default function CaveLight() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const [source, setSource] = useState<Point>({ x: 0, y: 0 });
  const [height, setHeight] = useState(1.4);
  const [count, setCount] = useState(4);
  const [hidden, setHidden] = useState(false);
  const [showRays, setShowRays] = useState(true);
  const [view, setView] = useState<"orthographic" | "perspective">("orthographic");
  const [sceneError, setSceneError] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    try {
      const instance = createCaveScene(canvas.current, (x, y) => setSource({ x, y }));
      scene.current = instance;
      return () => { instance.dispose(); scene.current = null; };
    } catch {
      setSceneError(true);
    }
  }, []);
  useEffect(() => { scene.current?.setSource(source.x, source.y, height); }, [source, height]);
  useEffect(() => { scene.current?.setCount(count); }, [count]);
  useEffect(() => { scene.current?.setVisibility(hidden, showRays); }, [hidden, showRays]);
  useEffect(() => { scene.current?.setView(view); }, [view]);

  function randomize() {
    const randomPosition = () => Math.round((Math.random() * 7.6 - 3.8) * 10) / 10;
    setSource({ x: randomPosition(), y: randomPosition() });
    setHeight(Math.round((0.9 + Math.random() * 1.4) * 10) / 10);
    scene.current?.randomizeOpenings();
  }

  return <div className="sim-content">
    <div className="sim-topline"><span className="sim-eyebrow">OPTIK</span><span className="sim-note">Lichtstrahlen zurückverfolgen</span></div>
    <div className="sim-columns">
      <div className="sim-control-panel">
        <h2>Versuchsaufbau</h2>
        <div className="control-group"><label htmlFor="cave-count">Öffnungen <strong>{count}</strong></label><input id="cave-count" type="range" min="1" max="8" value={count} onChange={(event) => setCount(Number(event.target.value))} /></div>
        <div className="control-group"><label htmlFor="cave-view">Ansicht</label><select id="cave-view" value={view} onChange={(event) => setView(event.target.value as typeof view)}><option value="orthographic">2D – Draufsicht</option><option value="perspective">3D – Perspektive</option></select></div>
        <div className="control-group"><label><input type="checkbox" checked={showRays} onChange={(event) => setShowRays(event.target.checked)} /> Lichtstrahlen in der Höhle anzeigen</label></div>
        <div className="control-group"><label><input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} /> Lichtquelle und Licht in der Höhle ausblenden</label></div>
        {!hidden && <><p>Verschiebe die Lichtquelle in der Ansicht oder mit den Reglern.</p>{(["x", "y"] as const).map((axis) => <div className="control-group" key={axis}><label htmlFor={`cave-${axis}`}>Position {axis.toUpperCase()} <strong>{source[axis].toFixed(1)}</strong></label><input id={`cave-${axis}`} type="range" min="-4.2" max="4.2" step="0.1" value={source[axis]} onChange={(event) => setSource({ ...source, [axis]: Number(event.target.value) })} /></div>)}
        <div className="control-group"><label htmlFor="cave-height">Höhe der Lichtquelle <strong>{height.toFixed(1)}</strong></label><input id="cave-height" type="range" min="0.6" max="2.5" step="0.1" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></div></>}
        <p>In der 3D-Ansicht kannst du die Höhle mit Ziehen drehen und mit dem Mausrad oder zwei Fingern zoomen.</p>
        {view === "perspective" && <div className="cave-camera-controls" role="group" aria-label="Kamera drehen">
          <button type="button" onClick={() => scene.current?.rotateCamera(-0.2, 0)}>Links drehen</button>
          <button type="button" onClick={() => scene.current?.rotateCamera(0.2, 0)}>Rechts drehen</button>
          <button type="button" onClick={() => scene.current?.rotateCamera(0, -0.2)}>Von oben</button>
          <button type="button" onClick={() => scene.current?.rotateCamera(0, 0.2)}>Seitlicher</button>
        </div>}
        <div className="cave-camera-controls" role="group" aria-label="Kamera zoomen">
          <button type="button" onClick={() => scene.current?.zoomCamera(1.2)}>Vergrößern</button>
          <button type="button" onClick={() => scene.current?.zoomCamera(1 / 1.2)}>Verkleinern</button>
        </div>
        <button className="secondary-button" type="button" onClick={() => scene.current?.resetCamera()}>Kamera zurücksetzen</button>
        <button className="secondary-button" type="button" onClick={randomize}>Neue Aufgabe ↻</button>
        <button className="secondary-button" type="button" onClick={() => scene.current?.download()}>Bild herunterladen</button>
        <p>Verlängere die äußeren Lichtbündel gedanklich in die Höhle. Wo treffen sie sich? Blende die Lichtquelle zur Kontrolle ein.</p>
      </div>
      <div className="sim-display cave-display">
        <div className="cave-viewport"><canvas ref={canvas} role="img" aria-label={`${view === "orthographic" ? "Draufsicht" : "3D-Ansicht"} der Höhle mit ${count} Öffnungen${hidden ? "; Lichtquelle verborgen" : `; Lichtquelle bei X ${source.x.toFixed(1)}, Y ${source.y.toFixed(1)}`}`} /></div>
        {sceneError && <p role="alert">Die 3D-Darstellung konnte nicht geladen werden. Bitte aktiviere WebGL in deinem Browser.</p>}
        <p>Die farbigen Flächen zeigen die Lichtbündel am Boden. Die Darstellung vereinfacht die Lichtquelle zu einem Punkt.</p>
      </div>
    </div>
  </div>;
}
