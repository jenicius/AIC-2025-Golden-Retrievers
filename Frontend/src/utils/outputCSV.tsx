import { type Item } from "../components/MakeCSV/types";
import fillCsvConfig from "../../config/fillCSV.json"; // <- read from file

function csvEscape(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function fillCSVforTRAKE(
  data: Item[],
  maxRow: number,
  frameStep: number,
  num_events: number
): Item[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  let result = data.filter(
    it => Array.isArray(it.frames) && it.frames.length === num_events
  );

  if (result.length >= maxRow) {
    return result.slice(0, maxRow);
  }

  let remainingRows = maxRow - result.length;
  let cnt = 1;

  while (remainingRows > 0) {
    for (const it of result) {
      if (remainingRows <= 0) break;

      const newEntry: Item = {
        ...it,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        frame_idx: it.frame_idx,
        frames: Array.isArray(it.frames)
          ? it.frames.map(f => f + cnt * frameStep)
          : [],
      };

      result.push(newEntry);
      remainingRows--;
    }
    cnt++;
  }

  return result;
}

export function fillCSVforQAandKIS(
  data: Item[],
  maxRow: number,
  frameStep: number
): Item[] {
  const sz = data.length;
  if (sz === 0) return [];

  const result: Item[] = data.map(d => ({ ...d }));

  for (let i = 0; i < maxRow - sz; i++) {
    const it = data[i % sz];
    const direction = Math.floor(i / sz) % 2 === 0 ? 1 : -1;
    const step = Math.floor(i /(2 * sz) + 1) * frameStep;

    const newEntry: Item = {
      ...it,
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      frame_idx: it.frame_idx + direction * step,
    };

    result.push(newEntry);
  }
  return result;
}

function downloadCSV(lines: string[], filename: string) {
  const csv = "\uFEFF" + lines.join("\n");
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


export function KIStoCSV(data: Item[], filename: string) {
  const maxRow =
    Number.isFinite((fillCsvConfig as any).maxRow) && (fillCsvConfig as any).maxRow > 0
      ? Math.floor((fillCsvConfig as any).maxRow)
      : data.length;

  const frameStep =
    Number.isFinite((fillCsvConfig as any).frameStep) && (fillCsvConfig as any).frameStep > 0
      ? Math.floor((fillCsvConfig as any).frameStep)
      : 1;

  const filled = fillCSVforQAandKIS(data, maxRow, frameStep);
  
  const lines = filled.map((it: any) => {
    const cells = [csvEscape(it.video_id), String(it.frame_idx)];
    return cells.join(",");
  }); 
  downloadCSV(lines, filename);
}

export function QAtoCSV(data: Item[], filename: string) {
  const maxRow =
    Number.isFinite((fillCsvConfig as any).maxRow) && (fillCsvConfig as any).maxRow > 0
      ? Math.floor((fillCsvConfig as any).maxRow)
      : data.length;

  const frameStep =
    Number.isFinite((fillCsvConfig as any).frameStep) && (fillCsvConfig as any).frameStep > 0
      ? Math.floor((fillCsvConfig as any).frameStep)
      : 1;

  const filled = fillCSVforQAandKIS(data, maxRow, frameStep);

  const lines = filled.map((it: Item) => {
    const cells = [csvEscape(it.video_id), String(it.frame_idx)];
    const ans = typeof it.answer === "string" ? it.answer : "";
    cells.push(`"${ans.replace(/"/g, '""')}"`);
    return cells.join(",");
  });

  downloadCSV(lines, filename);
}


export function TRAKEtoCSV(data: Item[], filename: string, num_events: number) {
  const maxRow =
    Number.isFinite((fillCsvConfig as any).maxRow) && (fillCsvConfig as any).maxRow > 0
      ? Math.floor((fillCsvConfig as any).maxRow)
      : data.length;

  const frameStep =
    Number.isFinite((fillCsvConfig as any).frameStep) && (fillCsvConfig as any).frameStep > 0
      ? Math.floor((fillCsvConfig as any).frameStep)
      : 1;

  const filled = fillCSVforTRAKE(data, maxRow, frameStep, num_events);
  console.log(filled)
  console.log(data)

  if (filled.length === 0) {
    alert("No TRAKE rows with full capacity found.");
    return;
  }

  const lines = filled.map(
    (it: Item) => [it.video_id, ...((it.frames ?? []).map(String))].join(",")
  );

  downloadCSV(lines, filename);
}

