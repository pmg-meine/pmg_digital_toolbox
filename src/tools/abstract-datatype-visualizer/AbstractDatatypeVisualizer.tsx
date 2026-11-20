const visualizerUrl = `${import.meta.env.BASE_URL}abstract-datatype-visualizer/`;

export default function AbstractDatatypeVisualizer() {
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
      <iframe
        className="datatype-visualizer"
        src={visualizerUrl}
        title="Visualisierung abstrakter Datentypen mit Java-IDE"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
