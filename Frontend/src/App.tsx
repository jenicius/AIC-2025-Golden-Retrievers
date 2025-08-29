import { useState } from "react";
import "./App.css";
import {
  TextInput,
  DropDown,
  ImageDropper,
  Button,
  MakeCSV,
  VideoGallery,
} from "./components";
import config from "../config/models.json";
//import { Search } from "lucide-react";
import { queryByImage, queryByText, queryByOCR, queryByFrameIdx, queryByFrameRow } from "../src/utils/fetchData";
import { Search } from "lucide-react";

function App() {
  const [text, setText] = useState("");
  const [topK, setTopK] = useState(1);
  const [modelOption, setModelOption] = useState("");
  const [metricOption, setMetricOption] = useState("");
  const [queryOption, setQueryOption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [frameIdx, setFrameIdx] = useState("");
  const [frameIdxRange, setFrameIdxRange] = useState("");
  const [frameRow, setFrameRow] = useState("");
  const [frameRowRange, setFrameRowRange] = useState("");

  // Models = keys of JSON
  const modelOptions = Object.keys(config);

  // Metrics = values under selected model
  const metricOptions = modelOption
    ? (Object.values(config[modelOption].metrics) as string[])
    : [];

  // QueryBy = entries under selected model
  const queryOptions = modelOption
    ? Object.entries(config[modelOption].queryBy)
    : [];

  const handleOnClickQuery = async (key: string) => {
    setQueryOption(key);

    try {
      if (key === "ocr") {
        const data = await queryByOCR(text, topK, modelOption, metricOption);
        window.dispatchEvent(
          new CustomEvent("gallery:set", { detail: data.results })
        );
      } else if (key === "text") {
        const data = await queryByText(text, topK, modelOption, metricOption);
        window.dispatchEvent(
          new CustomEvent("gallery:set", { detail: data.results })
        );
      } else if (key === "image") {
        if (imageFile) {
          const data = await queryByImage(
            imageFile,
            topK,
            modelOption,
            metricOption
          );
          window.dispatchEvent(
            new CustomEvent("gallery:set", { detail: data.results })
          );
        } else {
          console.log("There is no image");
        }
      } else {
        console.log("There is no options else");
      }
    } catch (err) {
      console.error("Query failed:", err);
    }
  };

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

        {/* Row: Video + Top K */}
        <div className="form-group row">
          <div className="text-input-small">
            <label className="form-label">Video</label>
            <TextInput
              placeholder="Enter video title here..."
              onChange={setVideoName}
            />
          </div>
          <div className="text-input-small">
            <label className="form-label">Top K</label>
            <TextInput
              type="number"
              min={1}
              value={topK}
              onChange={(value) => setTopK(Number(value))}
              placeholder="Number"
            />
          </div>
        </div>

        {/* Row: Frame index + Frame idx range with search inside */}
        <div className="form-group row">
          <div className="text-input-small">
            <label className="form-label">Frame index</label>
            <TextInput
              placeholder="Enter frame index here..."
              onChange={setFrameIdx}
            />
          </div>
          <div className="text-input-with-icon">
            <label className="form-label">IDX range</label>
            <div className="input-wrapper">
              <TextInput
                placeholder="Enter frame index range here..."
                onChange={setFrameIdxRange}
              />
              <button
                className="icon-btn-inside"
                onClick={async () => {
                  const data = await queryByFrameIdx(videoName, Number(frameIdx), Number(frameIdxRange));
                  window.dispatchEvent(
                    new CustomEvent("gallery:set", { detail: data.results })
                  ); 
                }}
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Row: Keyframe ID + ID range with search inside */}

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
              onClick={() => {
                handleOnClickQuery(key);
              }}
            />
          ))}
        </div>

        <ImageDropper onChange={setImageFile} />
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
