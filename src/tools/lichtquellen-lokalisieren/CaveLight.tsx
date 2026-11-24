import { useEffect, useRef, useState } from "react";
import { createExercisePdf } from "./exportPdf";
import { generateOpenings } from "./openings";
import { randomSetup, readSetup, setupUrl, type Setup } from "./setup";
import { createCaveScene } from "./caveScene";
import "./cave.css";

type Scene = ReturnType<typeof createCaveScene>;
type Point = { x: number; y: number };

export default function CaveLight() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const [initial] = useState(() => readSetup(window.location.search));
  const [source, setSource] = useState<Point>({ x: initial?.x ?? 0, y: initial?.y ?? 0 });
  const [height, setHeight] = useState(initial?.height ?? 1.4);
  const [count, setCount] = useState(initial?.count ?? 4);
  const [hidden, setHidden] = useState(initial?.hidden ?? false);
  const [showRays, setShowRays] = useState(initial?.showRays ?? true);
  const [view, setView] = useState<"orthographic" | "perspective">(initial?.view ?? "orthographic");
  const [openings, setOpenings] = useState(() => initial?.openings ?? generateOpenings());
  const [exerciseCount, setExerciseCount] = useState("5");
  const [shareMessage, setShareMessage] = useState("");
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
  useEffect(() => { scene.current?.setOpenings(openings); }, [openings]);
  useEffect(() => { scene.current?.setCount(count); }, [count]);
  useEffect(() => { scene.current?.setVisibility(hidden, showRays); }, [hidden, showRays]);
  useEffect(() => { scene.current?.setView(view); }, [view]);

  const setup: Setup = { x: source.x, y: source.y, height, count, hidden, showRays, view, openings };
  useEffect(() => {
    const timeout = window.setTimeout(() => window.history.replaceState(window.history.state, "", setupUrl(window.location.href, setup)), 500);
    return () => window.clearTimeout(timeout);
  }, [source, height, count, hidden, showRays, view, openings]);

  useEffect(() => {
    function restore() {
      const restored = readSetup(window.location.search);
      if (!restored) return;
      setSource({ x: restored.x, y: restored.y }); setHeight(restored.height); setCount(restored.count);
      setHidden(restored.hidden); setShowRays(restored.showRays); setView(restored.view); setOpenings(restored.openings);
    }
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  async function share() {
    try {
      await navigator.clipboard.writeText(setupUrl(window.location.href, setup));
      setShareMessage("Link kopiert.");
    } catch {
      setShareMessage("Link konnte nicht kopiert werden. Bitte kopiere die Adresse aus der Adressleiste.");
    }
  }

  function randomize() {
    const randomPosition = () => Math.round((Math.random() * 7.6 - 3.8) * 10) / 10;
    setSource({ x: randomPosition(), y: randomPosition() });
    setHeight(Math.round((0.9 + Math.random() * 1.4) * 10) / 10);
    setOpenings(generateOpenings());
  }

  return <div className="sim-content">
    <div className="sim-topline"><span className="sim-eyebrow">OPTIK</span><span className="sim-note">Lichtstrahlen zurückverfolgen</span></div>
    <div className="sim-columns">
      <div className="sim-control-panel">
        <h2>Versuchsaufbau</h2>
        <div className="control-group"><label htmlFor="cave-count">Öffnungen <strong>{count}</strong></label><input id="cave-count" type="range" min="1" max="8" value={count} onChange={(event) => setCount(Number(event.target.value))} /></div>
        <fieldset className="control-group cave-view-toggle">
          <legend>Ansicht</legend>
          <div>
            <label><input type="radio" name="cave-view" value="orthographic" checked={view === "orthographic"} onChange={() => setView("orthographic")} /><span>2D</span></label>
            <label><input type="radio" name="cave-view" value="perspective" checked={view === "perspective"} onChange={() => setView("perspective")} /><span>3D</span></label>
          </div>
        </fieldset>
        <div className="control-group cave-checkbox"><label><input type="checkbox" checked={showRays} onChange={(event) => setShowRays(event.target.checked)} /> Lichtstrahlen in der Höhle anzeigen</label></div>
        <div className="control-group cave-checkbox"><label><input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} /> Lichtquelle und Licht in der Höhle ausblenden</label></div>
        {!hidden && <><p>Verschiebe die Lichtquelle in der Ansicht oder mit den Reglern.</p>{(["x", "y"] as const).map((axis) => <div className="control-group" key={axis}><label htmlFor={`cave-${axis}`}>Position {axis.toUpperCase()} <strong>{source[axis].toFixed(1)}</strong></label><input id={`cave-${axis}`} type="range" min="-4.2" max="4.2" step="0.1" value={source[axis]} onChange={(event) => setSource({ ...source, [axis]: Number(event.target.value) })} /></div>)}
        <div className="control-group"><label htmlFor="cave-height">Höhe der Lichtquelle <strong>{height.toFixed(1)}</strong></label><input id="cave-height" type="range" min="0.6" max="2.5" step="0.1" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></div></>}
        <div className="cave-camera-controls" role="group" aria-label="Kamera steuern">
          <button className="secondary-button" type="button" aria-label="Kamera zurücksetzen" title="Kamera zurücksetzen" onClick={() => scene.current?.resetCamera()}>↺</button>
          {view === "perspective" && <>
            <button className="secondary-button" type="button" aria-label="Links drehen" title="Links drehen" onClick={() => scene.current?.rotateCamera(-0.2, 0)}>←</button>
            <button className="secondary-button" type="button" aria-label="Rechts drehen" title="Rechts drehen" onClick={() => scene.current?.rotateCamera(0.2, 0)}>→</button>
            <button className="secondary-button" type="button" aria-label="Von oben" title="Von oben" onClick={() => scene.current?.rotateCamera(0, -0.2)}>↑</button>
            <button className="secondary-button" type="button" aria-label="Seitlicher" title="Seitlicher" onClick={() => scene.current?.rotateCamera(0, 0.2)}>↓</button>
          </>}
          <button className="secondary-button" type="button" aria-label="Vergrößern" title="Vergrößern" onClick={() => scene.current?.zoomCamera(1.2)}>＋</button>
          <button className="secondary-button" type="button" aria-label="Verkleinern" title="Verkleinern" onClick={() => scene.current?.zoomCamera(1 / 1.2)}>−</button>
        </div>
        <div className="cave-actions">
          <button className="secondary-button" type="button" onClick={randomize}>Neue Aufgabe</button>

        </div>
        <h2>Aufgabenblätter erstellen</h2>
        <div className="control-group"><label htmlFor="cave-exercise-count">Anzahl der Blätter (1–50)</label>
          <input id="cave-exercise-count" type="number" min="1" max="50" step="1" value={exerciseCount} onChange={(event) => setExerciseCount(event.target.value)} />
          <button className="secondary-button" type="button" disabled={!/^\d+$/.test(exerciseCount) || Number(exerciseCount) < 1 || Number(exerciseCount) > 50} onClick={() => createExercisePdf(Array.from({ length: Number(exerciseCount) }, () => ({ ...randomSetup(), count })), window.location.href).save("lichtquellen-aufgaben.pdf")}>PDF erzeugen</button>
        </div>
      </div>
      <div className="sim-display cave-display">
        <div className="cave-viewport"><div className="cave-scene-actions">
          <button className="secondary-button cave-icon-button" type="button" onClick={() => scene.current?.download()} aria-label="Bild herunterladen" title="Bild herunterladen">↓</button>
          <button className="secondary-button cave-icon-button" type="button" onClick={share} aria-label="Link kopieren" title="Link kopieren">↗</button>
        </div><canvas ref={canvas} role="img" aria-label={`${view === "orthographic" ? "Draufsicht" : "3D-Ansicht"} der Höhle mit ${count} Öffnungen${hidden ? "; Lichtquelle verborgen" : `; Lichtquelle bei X ${source.x.toFixed(1)}, Y ${source.y.toFixed(1)}`}`} /></div>
        <p role="status">{shareMessage}</p>
        {view === "perspective" && <p>In der 3D-Ansicht kannst du die Höhle mit Ziehen drehen und mit dem Mausrad oder zwei Fingern zoomen.</p>}
        {sceneError && <p role="alert">Die 3D-Darstellung konnte nicht geladen werden. Bitte aktiviere WebGL in deinem Browser.</p>}
        <p>Die farbigen Flächen zeigen die Lichtbündel am Boden. Die Darstellung vereinfacht die Lichtquelle zu einem Punkt.</p>
      </div>
    </div>
  </div>;
}
