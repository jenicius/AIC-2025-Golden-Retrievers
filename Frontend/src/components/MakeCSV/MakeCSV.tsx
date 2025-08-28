import { useEffect, useState } from "react";
import { Card, Form, Button, Dropdown } from "react-bootstrap";
import "./MakeCSV.css";
import { exportToCSV } from "../../utils/outputCSV";
import DropDown from "../DropDown/DropDown";

export type Item = {
  id: string;
  video_id: string;
  frame_idx: number;
  answer?: string; // only for QA
};

function MakeCSV() {
  const [queryType, setQueryType] = useState("");
  const [fileName, setFileName] = useState("");
  const [videoId, setVideoId] = useState("");
  const [frameIdx, setFrameIdx] = useState<number | "">(0);
  const [answer, setAnswer] = useState(""); // new
  const [items, setItems] = useState<Item[]>([]);

  const isQA = queryType === "QA";

  // If user leaves QA, clear the answer box so we don't carry stale data
  useEffect(() => {
    if (!isQA) setAnswer("");
  }, [isQA]);

  // useEffect(() => {
  //   const handler = (e: Event) => {
  //     const ce = e as CustomEvent<{ video_id?: string; frame_idx?: number }>;
  //     const { video_id, frame_idx } = ce.detail || {};
  //     if (!video_id || typeof frame_idx !== "number" || !Number.isFinite(frame_idx)) return;

  //     const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  //     setItems((prev) => [...prev, { id, video_id, frame_idx }]); // no answer via event
  //   };
  //   window.addEventListener("csv:add", handler as EventListener);
  //   return () => window.removeEventListener("csv:add", handler as EventListener);
  // }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ video_id?: string; frame_idx?: number }>;
      const { video_id, frame_idx } = ce.detail || {};
      if (!video_id || typeof frame_idx !== "number" || !Number.isFinite(frame_idx)) return;

      // 🔄 auto-fill the form inputs instead of adding an item
      setVideoId(video_id);
      setFrameIdx(frame_idx);
    };

    window.addEventListener("csv:add", handler as EventListener);
    return () => window.removeEventListener("csv:add", handler as EventListener);
  }, []);

  const idxInvalid = frameIdx === "" || !Number.isFinite(Number(frameIdx));
  const addDisabled =
    !videoId.trim() || idxInvalid || (isQA && !answer.trim());

  const addItem = () => {
    const idx = typeof frameIdx === "string" ? Number(frameIdx) : frameIdx;
    if (!videoId.trim() || !Number.isFinite(idx)) return;
    if (isQA && !answer.trim()) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [
      ...prev,
      { id, video_id: videoId.trim(), frame_idx: idx, ...(isQA ? { answer: answer.trim() } : {}) },
    ]);
  };

  const removeAt = (i: number) =>
    setItems((prev) => prev.filter((_, j) => j !== i));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If your CSV schema differs by query type, pass queryType to exportToCSV or branch here.
    exportToCSV(items, fileName);
  };

  return (
    <Card className="mcsv-card">
      <Card.Body>
        <form className="mcsv" onSubmit={onSubmit}>
          {/* Row 1: file name + query type + Make CSV */}
          <div className="mcsv-row">
            <label className="mcsv-label">File Name</label>
            <Form.Control
              className="mcsv-input mcsv-grow"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="golden-retrievers"
            />

            <DropDown
              options={["KIS", "QA", "TRAKE"]}
              onChange={(option) => setQueryType(option)} value={""}
            />

            <Button
              type="submit"
              className="mcsv-btn mcsv-shrink"
              disabled={!fileName.trim() || items.length === 0}
            >
              Make CSV
            </Button>
          </div>

          {/* Row 2: video_id + frame_idx + Answer (QA only) + Add + Items */}
          <div className="mcsv-row">
            <label className="mcsv-label">video_id</label>
            <Form.Control
              className="mcsv-input"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="vid_001"
            />

            <label className="mcsv-label">frame_idx</label>
            <Form.Control
              className="mcsv-input mcsv-idx"
              type="number"
              value={frameIdx}
              onChange={(e) =>
                setFrameIdx(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="0"
              isInvalid={idxInvalid}
            />

            <label className="mcsv-label">Answer</label>
            <Form.Control
              className="mcsv-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="bindepzai"
              disabled={!isQA} 
            />

            <Button
              type="button"
              className="mcsv-btn mcsv-shrink"
              onClick={addItem}
              disabled={addDisabled}
            >
              Add
            </Button>

            {/* Items dropdown isolated in a non-flexing wrapper */}
            <div className="mcsv-items mcsv-shrink">
              <Dropdown align="end">
                <Dropdown.Toggle className="mcsv-items-toggle">
                  Items ({items.length})
                </Dropdown.Toggle>
                <Dropdown.Menu className="mcsv-items-menu">
                  {items.length === 0 ? (
                    <span className="mcsv-items-empty">No items yet</span>
                  ) : (
                    items.map((it, i) => (
                      <div className="mcsv-items-row" key={it.id}>
                        <span
                          className="mcsv-items-text"
                          title={
                            it.answer
                              ? `${it.video_id} — ${it.frame_idx} — ${it.answer}`
                              : `${it.video_id} — ${it.frame_idx}`
                          }
                        >
                          {it.video_id} — {it.frame_idx}
                          {it.answer ? <> — {it.answer}</> : null}
                        </span>
                        <button
                          type="button"
                          className="mcsv-items-del"
                          onClick={() => removeAt(i)}
                          aria-label="remove"
                          title="Remove"
                        >
                          −
                        </button>
                      </div>
                    ))
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}

export default MakeCSV;
