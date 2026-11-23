import { useState } from "react";
import { BRICK_HEIGHT, BRICK_WIDTH, HEIGHT, LEVELS, WIDTH, lightPolygon } from "./geometry";
import "./light.css";

const initialPositions = [0, 115, 0, 115];

export default function LightPropagation() {
  const [sourceY, setSourceY] = useState(105);
  const [angle, setAngle] = useState(50);
  const [positions, setPositions] = useState(initialPositions);
  const [lightOn, setLightOn] = useState(false);
  const bricks = positions.map((y, index) => ({
    x: LEVELS[Math.floor(index / 2)], y, width: BRICK_WIDTH, height: BRICK_HEIGHT,
  }));
  const points = lightPolygon({ x: 0, y: sourceY }, angle, bricks)
    .map((point) => `${point.x},${point.y}`).join(" ");

  function exportScene() {
    const brickElements = bricks.map((brick) =>
      `<rect x="${brick.x}" y="${brick.y}" width="${brick.width}" height="${brick.height}" fill="#b6b6b6" stroke="#222"/>`,
    ).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 297 210"><rect x="0.5" y="0.5" width="296" height="209" fill="white" stroke="#222"/><polygon points="0,${sourceY - 5} 9,${sourceY} 0,${sourceY + 5}" fill="#222"/>${brickElements}<line x1="296" y1="0" x2="296" y2="210" stroke="#222" stroke-width="2"/><text x="12" y="203" font-family="sans-serif" font-size="4">Lichtquelle · Öffnungswinkel ${angle}° · Schirm rechts</text></svg>`;
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
          <div className="control-group"><label htmlFor="light-source">Lichtquelle von oben <strong>{sourceY} mm</strong></label><input id="light-source" type="range" min="0" max="210" value={sourceY} onChange={(event) => setSourceY(Number(event.target.value))} /></div>
          <div className="control-group"><label htmlFor="light-angle">Öffnungswinkel <strong>{angle}°</strong></label><input id="light-angle" type="range" min="10" max="100" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></div>
          {positions.map((position, index) => (
            <div className="control-group" key={index}>
              <label htmlFor={`brick-${index}`}>Stein {Math.floor(index / 2) + 1} {index % 2 === 0 ? "oben" : "unten"} <strong>{position} mm</strong></label>
              <input id={`brick-${index}`} type="range" min="0" max={HEIGHT - BRICK_HEIGHT} value={position} onChange={(event) => setPositions((current) => current.map((value, i) => i === index ? Number(event.target.value) : value))} />
            </div>
          ))}
          <div className="button-line">
            <button className="primary-button" onClick={() => setLightOn(!lightOn)}>{lightOn ? "Licht ausschalten" : "Licht einschalten"}</button>
            <button className="secondary-button" onClick={exportScene}>Aufbau als SVG speichern</button>
            <button className="secondary-button" onClick={() => { setSourceY(105); setAngle(50); setPositions(initialPositions); setLightOn(false); }}>Zurücksetzen</button>
          </div>
        </div>
        <div className="sim-display">
          <div className="chart-card light-scene">
            <h2>Versuch auf DIN A4</h2>
            <svg viewBox={`-4 -4 ${WIDTH + 8} ${HEIGHT + 8}`} role="img" aria-label={`Versuchsaufbau mit Lichtquelle bei ${sourceY} Millimetern, Öffnungswinkel ${angle} Grad und vier Steinen. Licht ${lightOn ? "eingeschaltet" : "ausgeschaltet"}.`}>
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} className="light-paper" />
              {lightOn && <polygon points={points} className="light-beam" />}
              {bricks.map((brick, index) => <rect key={index} {...brick} className="light-brick" />)}
              <line x1={WIDTH} y1="0" x2={WIDTH} y2={HEIGHT} className="light-screen" />
              <polygon points={`0,${sourceY - 5} 9,${sourceY} 0,${sourceY + 5}`} className="light-source" />
            </svg>
            <p className="sim-caption">Lichtquelle links · Schirm rechts · Steinpositionen von der oberen Blattkante gemessen</p>
            <p className="sim-caption">Die SVG-Datei zeigt immer den Aufbau ohne Licht. Zum Ausdrucken im Browser öffnen und Querformat wählen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
