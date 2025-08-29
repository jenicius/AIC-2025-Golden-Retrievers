export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
}

export function parsePositiveInt(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}
export function hasFrame(frames: number[] | undefined, idx: number): boolean {
  return !!frames?.includes(idx);
}
