import { Card, Form, Button, Dropdown } from "react-bootstrap";
import "./MakeCSV.css";
import DropDown from "../DropDown/DropDown";
import { useMakeCSV } from "./useMakeCSV";

function MakeCSV() {
  const {
    queryType, setQueryType,
    fileName, setFileName,
    videoId, setVideoId,
    frameIdx, setFrameIdx,
    numEvents, setNumEvents, 
    answer, setAnswer,
    items, isQA, isTRAKE,
    idxInvalid, numEventsInvalid,
    addDisabled, addItem, removeAt, onSubmit,
  } = useMakeCSV();

  return (
    <Card className="mcsv-card">
      <Card.Body>
        <form className="mcsv" onSubmit={onSubmit}>
          <div className="mcsv-row">
            <label className="mcsv-label">File Name</label>
            <Form.Control
              className="mcsv-input mcsv-grow"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Don't include .csv at the end"
            />

            <DropDown
              options={["KIS", "QA", "TRAKE"]}
              value={queryType}
              onChange={(value: string) => setQueryType(value as "" | "KIS" | "QA" | "TRAKE")}
            />

            <Button
              type="submit"
              className="mcsv-btn mcsv-shrink"
              disabled={!fileName.trim() || items.length === 0}
            >
              Make CSV
            </Button>
          </div>

          <div className="mcsv-row">
            <label className="mcsv-label">video_id</label>
            <Form.Control
              className="mcsv-input"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="video123"
            />

            <label className="mcsv-label">frame_idx</label>
            <Form.Control
              className="mcsv-input mcsv-idx"
              type="number"
              value={frameIdx}
              onChange={(e) => setFrameIdx(e.target.value)}
              placeholder="0"
              isInvalid={idxInvalid}
            />

            {isQA && (
              <>
                <label className="mcsv-label">Answer</label>
                <Form.Control
                  className="mcsv-input"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="answer text"
                />
              </>
            )}

            {isTRAKE && (
              <>
                <label className="mcsv-label">num_events</label>
                <Form.Control
                  className="mcsv-input mcsv-idx"
                  type="number"
                  value={numEvents}
                  onChange={(e) => setNumEvents(e.target.value)}
                  placeholder="0"
                  isInvalid={numEventsInvalid}
                  min={1}
                />
              </>
            )}

            <Button
              type="button"
              className="mcsv-btn mcsv-shrink"
              onClick={addItem}
              disabled={addDisabled}
            >
              Add
            </Button>

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
                        <span className="mcsv-items-text">
                          {it.video_id}
                          {it.answer && <> — {it.frame_idx} — {it.answer}</>}
                          {it.frames && <> — [{it.frames.join(", ")}]</>}
                          {!it.answer && !it.frames && <> — {it.frame_idx}</>}
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
