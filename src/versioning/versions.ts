export type Version = {
  id: string;
  label: string;
  channel: "stable" | "preview";
  basePath: string;
};

export const root = import.meta.env.VITE_TOOLBOX_ROOT || "/pmg_digital_toolbox/";
export const channel = import.meta.env.VITE_TOOLBOX_CHANNEL === "preview" ? "preview" : "stable";
export const currentVersion = import.meta.env.VITE_TOOLBOX_VERSION || "main";
export const storageKey = "pmg-digital-toolbox:developer-mode";

export function readDeveloperMode(): boolean {
  try {
    return sessionStorage.getItem(storageKey) === "enabled";
  } catch {
    return false;
  }
}

export function saveDeveloperMode(enabled: boolean): void {
  try {
    if (enabled) sessionStorage.setItem(storageKey, "enabled");
    else sessionStorage.removeItem(storageKey);
  } catch {
    // The selector remains usable for this page when storage is unavailable.
  }
}

export function parseVersions(data: unknown): Version[] {
  if (!data || typeof data !== "object" || !Array.isArray((data as { versions?: unknown }).versions)) return [];
  const seen = new Set<string>();
  return (data as { versions: unknown[] }).versions.filter((entry): entry is Version => {
    if (!entry || typeof entry !== "object") return false;
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.label !== "string" || typeof item.basePath !== "string") return false;
    const expected = item.id === "main" && item.channel === "stable" ? root :
      /^pr-[1-9]\d*$/.test(item.id) && item.channel === "preview" ? `${root}previews/${item.id}/` : null;
    if (!expected || item.basePath !== expected || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function versionUrl(version: Version, hash: string): string {
  return `${version.basePath}${hash.startsWith("#/") ? hash : "#/"}`;
}
