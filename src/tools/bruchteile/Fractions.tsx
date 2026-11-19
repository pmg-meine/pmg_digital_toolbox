import { useState } from "react";
export default function Fractions() {
  const [denominator, setDenominator] = useState(4);
  const [numerator, setNumerator] = useState(2);
  const fraction = numerator / denominator;
  return (
    <div className="sim-content">
      <div className="sim-topline">
        <span className="sim-eyebrow">BRUCHRECHNUNG</span>
        <span className="sim-note">Vom Anteil zur Zahl</span>
      </div>
      <div className="sim-columns">
        <div className="sim-control-panel">
          <h2>Bruch einstellen</h2>
          <div className="control-group">
            <label htmlFor="numerator">
              Zähler <strong>{numerator}</strong>
            </label>
            <input
              type="range"
              id="numerator"
              min="0"
              max={denominator}
              step="1"
              value={numerator}
              onChange={(e) => setNumerator(Number(e.target.value))}
            />
            <div className="range-limits">
              <span>0</span>
              <span>{denominator}</span>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="denominator">
              Nenner <strong>{denominator}</strong>
            </label>
            <input
              type="range"
              id="denominator"
              min="1"
              max="12"
              step="1"
              value={denominator}
              onChange={(e) => {
                const n = Number(e.target.value);
                setDenominator(n);
                setNumerator((value) => Math.min(value, n));
              }}
            />
            <div className="range-limits">
              <span>1</span>
              <span>12</span>
            </div>
          </div>
          <button
            className="secondary-button"
            onClick={() => {
              setDenominator(4);
              setNumerator(2);
            }}
          >
            Zurücksetzen ↺
          </button>
        </div>
        <div className="sim-display fraction-display">
          <div className="fraction-number">
            <span>{numerator}</span>
            <span>{denominator}</span>
          </div>
          <div
            className="fraction-bar"
            role="img"
            aria-label={`${numerator} von ${denominator} Teilen sind eingefärbt`}
          >
            {Array.from({ length: denominator }, (_, i) => (
              <div
                key={i}
                className={
                  i < numerator ? "fraction-part active" : "fraction-part"
                }
              />
            ))}
          </div>
          <div className="fraction-values">
            <span>
              {(fraction * 100).toLocaleString("de-DE", {
                maximumFractionDigits: 1,
              })}
              %
            </span>
            <span>
              {fraction.toLocaleString("de-DE", { maximumFractionDigits: 3 })}
            </span>
          </div>
          <p className="sim-caption">
            {numerator} von {denominator} gleich großen Teilen sind markiert.
          </p>
        </div>
      </div>
    </div>
  );
}
