import { useEffect, useState } from "react";
import { channel, currentVersion, parseVersions, root, saveDeveloperMode, versionUrl, type Version } from "../versioning/versions";

export default function VersionSelector({ onDisable }: { onDisable: () => void }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${root}versions.json`, { signal: controller.signal, cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        const entries = parseVersions(data);
        if (!entries.length) throw new Error("Empty catalogue");
        setVersions(entries);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);

  return <div className="version-selector">
    {channel === "preview" && <span className="preview-badge">Vorschau</span>}
    <label htmlFor="version-select">Version</label>
    <select id="version-select" value={versions.some((item) => item.id === currentVersion) ? currentVersion : ""}
      onChange={(event) => {
        const target = versions.find((item) => item.id === event.target.value);
        if (!target) return;
        if (channel === "preview" && target.channel === "stable") saveDeveloperMode(true);
        window.location.assign(versionUrl(target, window.location.hash));
      }}>
      {!versions.some((item) => item.id === currentVersion) && <option value="">{currentVersion}</option>}
      {versions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    {failed && <span role="status">Versionsliste nicht verfügbar</span>}
    {channel === "stable" && <button type="button" onClick={onDisable}>Ausblenden</button>}
  </div>;
}
