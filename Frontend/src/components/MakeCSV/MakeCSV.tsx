import { useEffect, useState } from "react";
import { Card, Form, InputGroup, Button, Dropdown } from "react-bootstrap";
import "./MakeCSV.css";
import {exportToCSV } from "../../utils/outputCSV"

export type Item = { id: string; video_id: string; frame_idx: number };

function MakeCSV() {
  const [name, setName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [newVid, setNewVid] = useState("");
  const [newIdx, setNewIdx] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
        const { video_id, frame_idx } = (e as CustomEvent<{ video_id: string; frame_idx: number }>).detail || {};
        if (!video_id || Number.isNaN(frame_idx)) return;
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setItems(prev => [...prev, { id, video_id, frame_idx }]);
    };
    window.addEventListener("csv:add", handler as EventListener);
    return () => window.removeEventListener("csv:add", handler as EventListener);
}, []);

  const addItem = () => {
    if (!newVid.trim() || newIdx.trim() === "") return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { id, video_id: newVid.trim(), frame_idx: Number(newIdx.trim()) }]);
    setNewVid("");
    setNewIdx("");
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rows = items.map(({ video_id, frame_idx }) => ({
      video_id,
      frame_idx,
      id: "",
    }));
    console.log("Exporting to CSV:", rows);
    exportToCSV(rows, `${name.trim()}.csv`);
  };

  return (
    <Card className="rb-makecsv" style={{ alignSelf: "flex-start" }}>
      <Card.Body>
        <Form onSubmit={onSubmit}>
          {/* Accessible label (hidden visually) */}
          <Form.Label htmlFor="csvName" className="visually-hidden">
            File name
          </Form.Label>

          {/* One-line: label + input + submit */}
          <InputGroup size="sm">
            <InputGroup.Text className="input-addon input-label">
              <i className="bi bi-file-earmark-text me-1" aria-hidden="true" />
              File name
            </InputGroup.Text>

            <Form.Control
              id="csvName"
              size="sm"
              className="input-retriever"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="golden-retrievers"
            />

            <Button
              size="sm"
              type="submit"
              className="btn-retriever input-btn"
              disabled={!name.trim() || items.length === 0}
              title={items.length === 0 ? "Add at least one item" : "Make CSV"}
              
            >
              Make CSV
            </Button>
          </InputGroup>

          {/* Add row + droplist next to each other */}
          <div className="rb-list-row">
            {/* Add item row (left) */}
            <div className="rb-addrow">
              <InputGroup size="sm" className="rb-addgroup">
                <InputGroup.Text className="input-addon">video_id</InputGroup.Text>
                <Form.Control
                  size="sm"
                  type="text"
                  value={newVid}
                  onChange={(e): void => setNewVid(e.target.value)}
                  placeholder="vid_001"
                />
                <InputGroup.Text className="input-addon">frame_idx</InputGroup.Text>
                <Form.Control
                  size="sm"
                  type="number"
                  min={0}
                  step={1}
                  value={newIdx}
                  onChange={(e) => setNewIdx(e.target.value)}
                  placeholder="0"
                />
                <Button
                  size="sm"
                  type="button"
                  variant="outline-secondary"
                  className="btn-add"
                  onClick={addItem}
                  disabled={!newVid.trim() || newIdx.trim() === ""}
                >
                  <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                  Add
                </Button>
              </InputGroup>
            </div>

            {/* Items droplist (right) */}
            <div className="rb-droplist">
              <Dropdown align="end">
                <Dropdown.Toggle
                  id="items-dropdown"
                  size="sm"
                  className="rb-items-toggle"
                  variant="outline-secondary"
                >
                  <i className="bi bi-list-ul me-1" aria-hidden="true" />
                  Items ({items.length})
                </Dropdown.Toggle>

                <Dropdown.Menu className="rb-items-menu">
                  {items.length === 0 ? (
                    <Dropdown.Item as="div" className="rb-empty" disabled>
                        No items yet
                    </Dropdown.Item>
                    ) : (
                    items.map((it) => (
                        <Dropdown.Item as="div" key={it.id} className="rb-menu-item">
                        <span className="rb-menu-text">
                            {it.video_id} — {it.frame_idx}
                        </span>

                        {/* inline SVG delete button (no icon font needed) */}
                        <button
                            type="button"
                            className="rb-del"
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // keep menu open
                            setItems((prev) => prev.filter((row) => row.id !== it.id));
                            }}
                            aria-label={`Remove ${it.video_id} — ${it.frame_idx}`}
                            title="Remove"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9.5" stroke="currentColor" />
                            <rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" />
                            </svg>
                        </button>
                        </Dropdown.Item>
                    ))
                    )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default MakeCSV;
