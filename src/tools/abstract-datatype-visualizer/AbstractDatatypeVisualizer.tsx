import { useEffect, useState } from "react";

const visualizerUrl = `${import.meta.env.BASE_URL}abstract-datatype-visualizer/`;

export default function AbstractDatatypeVisualizer() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  return (
    <div className="sim-content">
      <p>
        Untersuche DynArray und Stapel mit Java und verfolge ihre Zustände im
        Debugger. Die Anwendung läuft direkt im Browser.
      </p>
      <p>
        <a href={visualizerUrl} target="_blank" rel="noopener noreferrer">
          Visualizer in einem neuen Fenster öffnen ↗
        </a>
      </p>
      <div className={`datatype-workspace${expanded ? " datatype-workspace-expanded" : ""}`}>
        <div className="datatype-workspace-toolbar">
          <button
            type="button"
            aria-label={expanded ? "Vollbild verlassen" : "Vollbild"}
            title={expanded ? "Vollbild verlassen" : "Vollbild"}
            aria-pressed={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {expanded ? (
                <path d="M4 8h4V4 M20 8h-4V4 M4 16h4v4 M20 16h-4v4" />
              ) : (
                <path d="M4 8V4h4 M20 8V4h-4 M4 16v4h4 M20 16v4h-4" />
              )}
            </svg>
          </button>
        </div>
        <iframe
          className="datatype-visualizer"
          src={visualizerUrl}
          title="Visualisierung abstrakter Datentypen mit Java-IDE"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
