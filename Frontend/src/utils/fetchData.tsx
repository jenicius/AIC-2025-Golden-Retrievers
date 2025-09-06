
export async function queryByText(
  text: string,
  topK: number,
  model: string,
  metric: string
) {
  const res = await fetch("http://127.0.0.1:8000/api/query/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryText: text, topK, model, metric }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  console.log(data);
  return data;
}

export async function queryByImage(
  file: File,
  topK: number,
  model: string,
  metric: string
) {
  const formData = new FormData();
  formData.append("image", file);        // must match the backend param name
  formData.append("topK", String(topK));
  formData.append("model", model);
  formData.append("metric", metric);

  const res = await fetch("http://127.0.0.1:8000/api/query/image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  // Response is { results: VideoItem[] }
  return res.json();
}

export async function queryByOCR(
  text: string,
  topK: number,
  model: string,
  metric: string
) {
  const res = await fetch("http://127.0.0.1:8000/api/query/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryText: text, topK, model, metric }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  console.log(data);
  return data;
}

export async function queryByFrameIdx(
  video_name: string,
  frame_idx: number,
  range: number 
) {
  const form = new FormData();
  form.append("video_name", video_name);
  form.append("frame_idx", frame_idx.toString());
  form.append("window", range.toString());

  const res = await fetch("http://127.0.0.1:8000/api/query/frame-idx", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }
  console.log(res);

  return await res.json();
}

export async function queryVideoByTextList(
  text: string,
  topK: number,
  model: string,
  metric: string
) {
  // seperate text by \n into string list
  const text_list = text.split("\n").map((t) => t.trim()).filter(Boolean);
  console.log("Text list:", text_list);

  const res = await fetch("http://127.0.0.1:8000/api/query/text-list-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryTextList: text_list, topK, model, metric }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  console.log(data);
  return data;
}

export async function convertTimeToFrameIdx(
  video_name: string,
  time: string
) {
  // The format of time is "HH:MM:SS" or "MM:SS" or "SS"
  // Convert to total seconds
  const parts = time.split(":").map((p) => parseFloat(p));
  let totalSeconds = 0;
  if (parts.length === 3) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  else if (parts.length === 2) {
    totalSeconds = parts[0] * 60 + parts[1];
  }
  else if (parts.length === 1) {
    totalSeconds = parts[0];
  }
  else {
    throw new Error("Invalid time format");
  }

  const form = new FormData();
  form.append("video_name", video_name);
  form.append("time", totalSeconds.toString());
  const res = await fetch("http://127.0.0.1:8000/api/query/time-to-frame-idx", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  return await res.json();
}