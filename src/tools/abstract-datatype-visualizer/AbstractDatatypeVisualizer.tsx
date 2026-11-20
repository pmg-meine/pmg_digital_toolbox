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
          <button type="button" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? "Vollbild verlassen" : "Vollbild"}
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
