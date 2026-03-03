// src/lib/reportStore.ts
export type ReportType = "draft" | "report";

export type StoredReport = {
  id: string;
  type: ReportType;

  title: string;

  // handy fields for search + display
  clientName: string;
  healthCoach: string;
  medicalAdvisor: string;
  template: string;

  // IMPORTANT: store these so “Load draft” restores the form perfectly
  instructions: string;
  jsonInput: string;

  // payload you send to builder (merged preview payload is fine here)
  payload: any;

  // set for completed reports
  reportUrl?: string;

  createdAt: string;
  updatedAt: string;
};

const KEY = "oi:reports:v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readAll(): StoredReport[] {
  if (typeof window === "undefined") return [];
  const data = safeParse<StoredReport[]>(localStorage.getItem(KEY));
  return Array.isArray(data) ? data : [];
}

function writeAll(items: StoredReport[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function upsertReport(next: StoredReport) {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === next.id);

  if (idx >= 0) all[idx] = next;
  else all.unshift(next);

  // newest first
  all.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  writeAll(all);
}

export function listReports(type?: ReportType): StoredReport[] {
  const all = readAll();
  return type ? all.filter((r) => r.type === type) : all;
}

export function getReport(id: string): StoredReport | undefined {
  return readAll().find((r) => r.id === id);
}

export function deleteReport(id: string) {
  const all = readAll().filter((r) => r.id !== id);
  writeAll(all);
}

export function duplicateReport(id: string): StoredReport | null {
  const src = getReport(id);
  if (!src) return null;

  const copy: StoredReport = {
    ...src,
    id: crypto.randomUUID(),
    title: `${src.title} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reportUrl: src.type === "draft" ? undefined : src.reportUrl,
  };

  upsertReport(copy);
  return copy;
}