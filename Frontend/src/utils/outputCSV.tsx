import { type Item } from "../components/MakeCSV/MakeCSV";
import fillCsvConfig from "../../config/fillCSV.json"; // <- read from file

/** Helper: escape fields for CSV */
function csvEscape(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Fill up to maxRow by adding items that keep the same video_id but advance
 * frame_idx in steps of `frameStep`. New rows are distributed across videos
 * in a round-robin way for evenness.
 */
export function fillCSV(data: Item[], maxRow: number, frameStep: number): Item[] {
  const step = Math.max(1, Math.floor(frameStep || 1));
  if (!Array.isArray(data) || data.length === 0) return [];

  // Start with a shallow copy of the existing items (preserve order)
  const result: Item[] = data.map(d => ({ ...d }));

  // If we already have enough, truncate to maxRow
  if (result.length >= maxRow) {
    return result.slice(0, maxRow);
  }

  // Group frames by video_id, track existing frames and the "next" frame to add
  type Group = { frames: Set<number>; next: number };
  const byVid = new Map<string, Group>();
  const order: string[] = []; // preserve order of first appearance

  for (const it of data) {
    let g = byVid.get(it.video_id);
    if (!g) {
      g = { frames: new Set<number>(), next: 0 };
      byVid.set(it.video_id, g);
      order.push(it.video_id);
    }
    g.frames.add(Number(it.frame_idx));
  }

  // Initialize each group's next frame (max existing + step)
  for (const vid of order) {
    const g = byVid.get(vid)!;
    const max = g.frames.size ? Math.max(...g.frames) : 0;
    let candidate = max + step;
    while (g.frames.has(candidate)) candidate += step;
    g.next = candidate;
  }

  // Round-robin add until we reach maxRow
  let remaining = maxRow - result.length;
  if (order.length === 0) return result;

  let i = 0;
  while (remaining > 0) {
    const vid = order[i % order.length];
    const g = byVid.get(vid)!;

    let frame = g.next;
    // Ensure uniqueness within the video (shouldn’t usually loop, but safe)
    while (g.frames.has(frame)) frame += step;

    g.frames.add(frame);
    result.push({
        video_id: vid, frame_idx: frame,
        id: ""
    });

    // Prepare next candidate for this video
    g.next = frame + step;

    remaining--;
    i++;
  }

  return result;
}

/**
 * Fill then export as CSV.  In a browser we can't write to a real directory,
 * so we trigger a download. The `directory` is used only to prefix the file name.
 *
 * If you need a specific maxRow/frameStep here, either:
 *   1) call `fillCSV` yourself and pass the result into this function, or
 *   2) set (window as any).__csvFill = { maxRow, frameStep } before calling.
 */
export function exportToCSV(
  data: Item[],
  filename: string
) {
  // Pull values from config; use safe defaults if missing/invalid
  const maxRow =
    Number.isFinite((fillCsvConfig as any).maxRow) && (fillCsvConfig as any).maxRow > 0
      ? Math.floor((fillCsvConfig as any).maxRow)
      : data.length;

  const frameStep =
    Number.isFinite((fillCsvConfig as any).frameStep) && (fillCsvConfig as any).frameStep > 0
      ? Math.floor((fillCsvConfig as any).frameStep)
      : 1;

  // Build the filled list
  const filled = fillCSV(data, maxRow, frameStep);

  // Compose CSV (UTF-8 BOM for Excel)
  const header = "video_id,frame_idx";
  const lines = filled.map((it) => `${csvEscape(it.video_id)},${it.frame_idx}`);
  const csv = "\uFEFF" + [header, ...lines].join("\n");

  // Make a blob + object URL
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Ensure .csv extension and a sane default name
  const baseName =
    (filename && filename.trim().length > 0 ? filename.trim() : "export") +
    (filename.toLowerCase().endsWith(".csv") ? "" : ".csv");

  // Trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = baseName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}