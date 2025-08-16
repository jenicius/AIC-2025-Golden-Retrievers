import { useState } from "react";
import "./App.css";
import { TextInput, DropDown, ImageDropper, Button } from "./components";
import config from "../config/models.json";

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

  // QueryBy = values under selected model
  const queryOptions = modelOption
    ? Object.entries(config[modelOption].queryBy) // [["text","Query by Embedding"],["image","Query by Image"]]
    : [];

  return (
    <div className="container">
      <div className="left">
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

        {/* Query by Text input */}
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

      <div className="right">
      </div>
    </div>
  );
}

export default App;
