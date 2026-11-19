import { useState } from "react";

export default function OhmsLaw() {
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(20);
  const current = voltage / resistance;
  // Fixed axis limits keep comparisons meaningful during the experiment.
  const chartWidth = 480;
  const chartHeight = 240;
  const left = 54;
  const right = 26;
  const top = 18;
  const bottom = 42;
  const x = (voltage: number) =>
    left + (voltage / 12) * (chartWidth - left - right);
  const y = (current: number) =>
    top + ((1.2 - current) / 1.2) * (chartHeight - top - bottom);
  const points = Array.from({ length: 31 }, (_, index) => {
    const sampleVoltage = (index * 12) / 30;
    return `${x(sampleVoltage).toFixed(2)},${y(sampleVoltage / resistance).toFixed(2)}`;
  }).join(" ");
  return (
    <div className="sim-content">
      <div className="sim-topline">
        <span className="sim-eyebrow">ELEKTRIZITÄT</span>
        <span className="sim-note">Werte verändern & beobachten</span>
      </div>
      <div className="sim-columns">
        <div className="sim-control-panel">
          <h2>Versuchsaufbau</h2>
          <div className="control-group">
            <label htmlFor="voltage">
              Spannung <strong>{voltage.toFixed(1)} V</strong>
            </label>
            <input
              id="voltage"
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
            />
            <div className="range-limits">
              <span>0 V</span>
              <span>12 V</span>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="resistance">
              Widerstand <strong>{resistance} Ω</strong>
            </label>
            <input
              id="resistance"
              type="range"
              min="10"
              max="100"
              step="5"
              value={resistance}
              onChange={(e) => setResistance(Number(e.target.value))}
            />
            <div className="range-limits">
              <span>10 Ω</span>
              <span>100 Ω</span>
            </div>
          </div>
          <button
            className="secondary-button"
            onClick={() => {
              setVoltage(6);
              setResistance(20);
            }}
          >
            Zurücksetzen ↺
          </button>
          <div
            className="formula-strip"
            aria-label={`I gleich ${voltage} Volt geteilt durch ${resistance} Ohm`}
          >
            I = U ÷ R
          </div>
        </div>
        <div className="sim-display">
          <div className="metric-card">
            <span>STROMSTÄRKE</span>
            <strong>
              {current.toLocaleString("de-DE", { maximumFractionDigits: 3 })}{" "}
              <small>A</small>
            </strong>
            <p>
              Bei {voltage.toLocaleString("de-DE")} V und {resistance} Ω
            </p>
          </div>
          <div className="chart-card">
            <h3>Spannung–Stromstärke-Diagramm</h3>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label={`Gerade durch den Ursprung; aktuell ${current.toFixed(3)} Ampere bei ${voltage} Volt`}
            >
              {[0, 0.3, 0.6, 0.9, 1.2].map((i) => (
                <g key={i}>
                  <line
                    className="chart-gridline"
                    x1={left}
                    x2={chartWidth - right}
                    y1={y(i)}
                    y2={y(i)}
                  />
                  <text
                    className="chart-tick"
                    x={left - 12}
                    y={y(i) + 4}
                    textAnchor="end"
                  >
                    {i.toFixed(1)}
                  </text>
                </g>
              ))}
              {[0, 3, 6, 9, 12].map((u) => (
                <text
                  key={u}
                  className="chart-tick"
                  x={x(u)}
                  y={chartHeight - 18}
                  textAnchor="middle"
                >
                  {u}
                </text>
              ))}
              <text className="chart-label" x="18" y="16">
                I (A)
              </text>
              <text className="chart-label" x="445" y="235">
                U (V)
              </text>
              <polyline points={points} className="chart-curve" />
              <line
                x1={x(voltage)}
                x2={x(voltage)}
                y1={y(current)}
                y2={y(0)}
                className="chart-guide"
              />
              <circle
                cx={x(voltage)}
                cy={y(current)}
                r="7"
                className="chart-dot"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
