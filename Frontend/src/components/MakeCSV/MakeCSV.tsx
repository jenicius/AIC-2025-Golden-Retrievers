import { useEffect, useState } from "react";
import { Card, Form, Button, Dropdown } from "react-bootstrap";
import "./MakeCSV.css";
import { exportToCSV } from "../../utils/outputCSV";

export type Item = { video_id: string; frame_idx: number };

function MakeCSV() {
  const [fileName, setFileName] = useState("");
  const [videoId, setVideoId]   = useState("");
  const [frameIdx, setFrameIdx] = useState<number | "">(0);
  const [items, setItems]       = useState<Item[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { video_id, frame_idx } = (e as CustomEvent<{ video_id: string; frame_idx: number }>).detail || {};
      if (!video_id || Number.isNaN(frame_idx)) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems(prev => [...prev, { id, video_id, frame_idx: frame_idx }]);
    };
    window.addEventListener("csv:add", handler as EventListener);
    return () => window.removeEventListener("csv:add", handler as EventListener);
  }, []);

  const idxInvalid =
    frameIdx === "" || Number.isNaN(Number(frameIdx)) ? true : false;

  const addItem = () => {
    const idx = typeof frameIdx === "string" ? Number(frameIdx) : frameIdx;
    if (!videoId.trim() || Number.isNaN(idx)) return;
    setItems((prev) => [...prev, { video_id: videoId.trim(), frame_idx: idx }]);
  };

  const removeAt = (i: number) =>
    setItems((prev) => prev.filter((_, j) => j !== i));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    exportToCSV(items, fileName); // maxRow & frameStep come from config/fillCSV.json
  };

  return (
    <Card className="mcsv-card">
      <Card.Body>
        <form className="mcsv" onSubmit={onSubmit}>
          {/* Row 1: file name + Make CSV */}
          <div className="mcsv-row">
            <label className="mcsv-label">File name</label>
            <Form.Control
              className="mcsv-input mcsv-grow"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="golden-retrievers"
            />
            <Button
              type="submit"
              className="mcsv-btn mcsv-shrink"
              disabled={!fileName.trim() || items.length === 0}
            >
              Make CSV
            </Button>
          </div>

          {/* Row 2: video_id + frame_idx + Add + Items */}
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

            <Button
              type="button"
              className="mcsv-btn mcsv-shrink"
              onClick={addItem}
              disabled={!videoId.trim() || idxInvalid}
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
                      <div
                        className="mcsv-items-row"
                        key={`${it.video_id}-${it.frame_idx}-${i}`}
                      >
                      <span
                        className="mcsv-items-text"
                        title={`${it.video_id} — ${it.frame_idx}`}
                      >
                        {it.video_id} — {it.frame_idx}
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
