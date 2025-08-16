import { useState } from "react";
import "./App.css";
import { TextInput, DropDown, ImageDropper, Button } from "./components";
import config from "../config/models.json";
import MakeCSV from "./components/MakeCSV/MakeCSV";
import VideoGallery from "./components/VideoGallery/VideoGallery";

function App() {
  const [text, setText] = useState("");
  const [topK, setTopK] = useState(1);
  const [modelOption, setModelOption] = useState("");
  const [metricOption, setMetricOption] = useState("");
  const [queryOption, setQueryOption] = useState("");

  // Models = keys of JSON
  const modelOptions = Object.keys(config);

  // Metrics = values under selected model
  const metricOptions = modelOption
    ? Object.values(config[modelOption].metrics)
    : [];

  // QueryBy = entries under selected model
  const queryOptions = modelOption
    ? Object.entries(config[modelOption].queryBy) // [["text","Query by Embedding"],["image","Query by Image"]]
    : [];

  return (
    <div className="app-shell">
      {/* LEFT PANEL */}
      <div className="app-left">
        {/* Row: Model + Metric */}
        <div className="form-group row">
          <DropDown
            label="Model"
            options={modelOptions}
            value={modelOption}
            onChange={setModelOption}
          />
          <DropDown
            label="Metric"
            options={metricOptions}
            value={metricOption}
            onChange={setMetricOption}
          />
        </div>

        {/* TopK */}
        <div className="form-group text-input-small">
          <label className="form-label">Top K</label>
          <TextInput
            type="number"
            min={1}
            value={topK}
            onChange={setTopK}
            placeholder="Number"
          />
        </div>

        {/* Query by Text */}
        <div className="form-group text-input-large">
          <label className="form-label">Query by Text</label>
          <TextInput
            multiline
            placeholder="Enter query text here..."
            onChange={setText}
          />
        </div>

        {/* Query options (dynamic buttons) */}
        <div className="form-group button-row">
          {queryOptions.map(([key, label]) => (
            <Button
              key={key}
              label={label}
              variant="primary"
              toggle
              defaultActive={queryOption === key}
              onClick={() => setQueryOption(key)}
            />
          ))}
        </div>

        <ImageDropper />
      </div>

      {/* RIGHT PANEL */}
      <div className="app-right">
        <div className="app-content">
          <div className="app-header">
            <h1 className="app-title">Golden Retrievers AI</h1>
          </div>

          <div className="app-makecsv">
            <MakeCSV />
          </div>

          <div className="app-display">
            <VideoGallery />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
