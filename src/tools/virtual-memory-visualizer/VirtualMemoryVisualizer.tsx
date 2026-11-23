const visualizerUrl = `${import.meta.env.BASE_URL}virtual-memory-visualizer/`;

export default function VirtualMemoryVisualizer() {
  return (
    <div className="sim-content datatype-content">
      <p>
        Verfolge Java-Beispiele Schritt für Schritt und untersuche, wie sich Stack,
        Heap und Klassendaten in einem vereinfachten Speichermodell verändern.
        Die Speicherzustände sind vorgegeben; Java wird nicht ausgeführt.
      </p>
      <p>
        <a href={visualizerUrl} target="_blank" rel="noopener noreferrer">
          Visualizer in einem neuen Fenster öffnen ↗
        </a>
      </p>
      <div className="datatype-workspace">
        <iframe
          className="datatype-visualizer"
          src={visualizerUrl}
          title="Virtuellen Java-Speicher visualisieren"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
