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
 * 
 * In QA mode, all synthetic rows inherit the same `answer` string from that video_id.
 */
export function fillCSV(data: Item[], maxRow: number, frameStep: number): Item[] {
  const step = Math.max(1, Math.floor(frameStep || 1));
  if (!Array.isArray(data) || data.length === 0) return [];

  // Shallow copy of the existing items (preserve order)
  const result: Item[] = data.map(d => ({ ...d }));

  if (result.length >= maxRow) {
    return result.slice(0, maxRow);
  }

  // Group frames by video_id, track frames and next candidate
  type Group = { frames: Set<number>; next: number };
  const byVid = new Map<string, Group>();
  const answersByVid = new Map<string, string | undefined>(); // keep QA answers
  const order: string[] = [];

  for (const it of data) {
    let g = byVid.get(it.video_id);
    if (!g) {
      g = { frames: new Set<number>(), next: 0 };
      byVid.set(it.video_id, g);
      order.push(it.video_id);
    }
    g.frames.add(Number(it.frame_idx));

    if (typeof it.answer === "string" && it.answer.trim().length > 0) {
      answersByVid.set(it.video_id, it.answer);
    }
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
    while (g.frames.has(frame)) frame += step;

    g.frames.add(frame);

    result.push({
      video_id: vid,
      frame_idx: frame,
      id: "",
      answer: answersByVid.get(vid) // inherit answer if any
    });

    g.next = frame + step;

    remaining--;
    i++;
  }

  return result;
}

/**
 * Fill then export as CSV.  In a browser we can't write to a real directory,
 * so we trigger a download.
 */
export function exportToCSV(
  data: Item[],
  filename: string
) {
  const maxRow =
    Number.isFinite((fillCsvConfig as any).maxRow) && (fillCsvConfig as any).maxRow > 0
      ? Math.floor((fillCsvConfig as any).maxRow)
      : data.length;

  const frameStep =
    Number.isFinite((fillCsvConfig as any).frameStep) && (fillCsvConfig as any).frameStep > 0
      ? Math.floor((fillCsvConfig as any).frameStep)
      : 1;

  const filled = fillCSV(data, maxRow, frameStep);

  // Decide if answer column is needed
  const hasAnswer = filled.some(
    (d: any) => typeof d.answer === "string" && d.answer.trim().length > 0
  );

  const header = hasAnswer ? "video_id,frame_idx,answer" : "video_id,frame_idx";

  const lines = filled.map((it: any) => {
    const cells = [csvEscape(it.video_id), String(it.frame_idx)];
    if (hasAnswer) {
      const ans = typeof it.answer === "string" ? it.answer : "";
      cells.push(csvEscape(ans));
    }
    return cells.join(",");
  });

  const csv = "\uFEFF" + [header, ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const baseName =
    (filename && filename.trim().length > 0 ? filename.trim() : "export") +
    (filename.toLowerCase().endsWith(".csv") ? "" : ".csv");

  const a = document.createElement("a");
  a.href = url;
  a.download = baseName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
