import { Card, Form, Button, Dropdown } from "react-bootstrap";
import "./MakeCSV.css";
import { useMakeCSV } from "./useMakeCSV";
import { useEffect } from "react";

function MakeCSV() {
  const {
    queryType, setQueryType,
    videoId, setVideoId,
    frameIdx, setFrameIdx,
    videoTime, setVideoTime,
    numEvents, setNumEvents, 
    answer, setAnswer,
    items, isQA, isTRAKE,
    idxInvalid, numEventsInvalid,
    addDisabled, addItem, removeAt, onSubmit,
    sessionID, setSessionID,
    evaluationID, setEvaluationID,
    fetchSession,
    fetchEvaluation,
  } = useMakeCSV();
  return (
    <Card className="mcsv-card">
      <Card.Body>
        <form className="mcsv" onSubmit={onSubmit}>
          <div className="mcsv-row">
            <Button 
              type="button"
              className="mcsv-btn mcsv-shrink"
              onClick={fetchSession}
            >
              Fetch
            </Button>
            <label className="mcsv-label">Session ID</label>
            <Form.Control
              className="mcsv-input mcsv-grow"
              value={sessionID}
              onChange={(e) => setSessionID(e.target.value)}
              placeholder="Session ID"
            />
            
            <Button 
              type="button"
              className="mcsv-btn mcsv-shrink"
              onClick={fetchEvaluation}
            >
              Fetch
            </Button>
            <label className="mcsv-label">Evaluation ID</label>
            <Form.Control 
              className="mcsv-input mcsv-grow"
              value={evaluationID}
              onChange={(e) => setEvaluationID(e.target.value)}
              placeholder="Evaluation ID"
            />

            {/* <DropDown
              options={["KIS", "QA", "TRAKE"]}
              value={queryType}
              onChange={(value: string) => setQueryType(value as "" | "KIS" | "QA" | "TRAKE")}
            /> */}

            <Button
              type="submit"
              className="mcsv-btn mcsv-shrink"
              disabled={items.length !== 1}
            >
              Submit
            </Button>
          </div>

          <div className="mcsv-row">
            {/* <DropDown
              options={["KIS", "QA", "TRAKE"]}
              value={queryType}
              onChange={(value: string) => setQueryType(value as "" | "KIS" | "QA" | "TRAKE")}
            /> */}
            <Form.Select
              className="mcsv-input mcsv-grow"
              value={queryType}
              onChange={(e) => setQueryType(e.target.value as "" | "KIS" | "QA" | "TRAKE")}
            >
              <option value="">Select Query Type</option>
              <option value="KIS">KIS</option>
              <option value="QA">QA</option>
              <option value="TRAKE">TRAKE</option>
            </Form.Select>
            <label className="mcsv-label">video_id</label>
            <Form.Control
              className="mcsv-input"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="video123"
            />

            {queryType !== "TRAKE" ? (
              <>
              <label className="mcsv-label">time(ms)</label>
              <Form.Control
                className="mcsv-input mcsv-idx"
                type="number"
                value={videoTime}
                onChange={(e) => setVideoTime(e.target.value)}
                placeholder="0"
                isInvalid={idxInvalid}
              />
              </>
            ) : (
              <>
              <label className="mcsv-label">frame_idx</label>
              <Form.Control
                className="mcsv-input mcsv-idx"
                type="number"
                value={frameIdx}
                onChange={(e) => setFrameIdx(e.target.value)}
                placeholder="0"
                isInvalid={idxInvalid}
              />
              </>
            )}

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
                          {queryType !== "TRAKE" && <> — {it.time_ms}</>}
                          {queryType === "QA"  && <> — {it.frame_idx} — {it.answer}</>}
                          {queryType === "TRAKE" && it.frames &&  <> — [{it.frames.join(", ")}]</>}
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
