import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  TextInput,
  DropDown,
  ImageDropper,
  Button,
  MakeCSV,
  VideoGallery,
  DeathNote,
  QueryView
} from "./components";
import rawConfig from "../config/models.json";
import {
  queryByImage,
  queryByText,
  queryByOCR,
  queryByFrameIdx,
  queryVideoByTextList,
  convertTimeToFrameIdx
} from "../src/utils/fetchData";
import { FaSearch, FaRegArrowAltCircleRight } from "react-icons/fa";
import { readQueryFromFolder } from "../src/utils/readQuery";

type ModelConfig = {
  metrics?: string[] | Record<string, string>;
  queryBy: Record<string, string>;
};

const config = rawConfig as Record<string, ModelConfig>;

function App() {
  const [text, setText] = useState("");
  const [OCRtext, setOCRText] = useState("");
  const [topK, setTopK] = useState<number>(1);
  const [modelOption, setModelOption] = useState("");
  const [metricOption, setMetricOption] = useState("");
  const [queryOption, setQueryOption] = useState("  ");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [frameIdx, setFrameIdx] = useState<string>("");
  const [frameIdxRange, setFrameIdxRange] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [videoTime, setVideoTime] = useState<string>("");

  const modelOptions = useMemo(() => Object.keys(config ?? {}), []);

  const queryOptions = useMemo(() => {
    return modelOption ? Object.entries(config[modelOption]?.queryBy ?? {}) : [];
  }, [modelOption]);

  useEffect(() => {
    if(modelOption) {
      setQueryOption(Object.keys(config[modelOption]?.queryBy ?? {})[0] ?? "");
      setMetricOption("");
    }
  }, [modelOption]);

  const setGallery = useCallback((results: unknown) => {
    window.dispatchEvent(new CustomEvent("gallery:set", { detail: results }));
  }, []);

  const handleOnClickQuery = useCallback(
    async (key: string) => {
      setQueryOption(key);

      if (!modelOption) {
        console.warn("Select a model first.");
        return;
      }

      try {
        setLoading(true);
        if (key === "ocr") {
          const data = await queryByOCR(text, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "text") {
          const data = await queryByText(text, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "textlist") {
          const data = await queryVideoByTextList(text, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "image") {
          if (!imageFile) {
            console.warn("No image selected for image query.");
            return;
          }
          const data = await queryByImage(imageFile, topK, modelOption, metricOption);
          setGallery(data.results);
        } else {
          console.warn("Unknown query option:", key);
        }
      } catch (err) {
        console.error("Query failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [imageFile, metricOption, modelOption, setGallery, text, topK]
  );

  const handleFrameSearch = useCallback(async () => {
    const idx = Number(frameIdx);
    const range = Number(frameIdxRange);
    if (!videoName || Number.isNaN(idx) || Number.isNaN(range)) {
      console.warn("Provide video name, frame index, and a numeric range.");
      return;
    }
    try {
      setLoading(true);
      const data = await queryByFrameIdx(videoName, idx, range);
      setGallery(data.results);
    } catch (err) {
      console.error("FrameIdx query failed:", err);
    } finally {
      setLoading(false);
    }
  }, [frameIdx, frameIdxRange, setGallery, videoName]);

  const handleTimeToFrameIdx = useCallback(async () => {
    if (!videoName || !videoTime) {
      console.warn("Provide video name and time.");
      return;
    }
    try{
      setLoading(true);
      const data = await convertTimeToFrameIdx(videoName, videoTime);
      setFrameIdx(data.frame_idx.toString());
      console.log("Frame index", frameIdx);
    } catch (err) {
      console.error("TimeToFrameIdx query failed:", err);
      alert("Failed to convert time to frame index. Please check the video name and time format.");
    } finally {
      setLoading(false);
    }
  }, [videoName, videoTime]);

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
            onChange={(v: string) => {
              setModelOption(v);
              // reset dependent selections on model change
              setMetricOption("");
              setQueryOption("");
            }}
          />
          <div className="text-input-small">
            <label className="form-label">Top K</label>
            <TextInput
              type="number"
              min={1}
              onChange={(value) => {
                const n = Math.max(1, Number(value) || 1);
                setTopK(n);
              }}
              placeholder="1"
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="text-input-small">
            <label className="form-label">Video</label>
            <TextInput
              placeholder="E.g., L29_V007"
              onChange={setVideoName}
            />
          </div>
          
          <div className="text-input-with-icon">
            <label className="form-label">Time</label>
            <div className="input-wrapper">
            <TextInput
              type="string"
              placeholder="HH:MM:SS or MM:SS or SS"
              onChange={setVideoTime}
            />
            <button
                className="icon-btn-inside"
                onClick={handleTimeToFrameIdx}
                disabled={loading}
                aria-label="Convert time to frame index"
                title="Convert"
              >
                <FaRegArrowAltCircleRight />

          </button>
          </div>
          </div>
        </div>

        {/* Row: Frame index + Frame idx range with search inside */}
        <div className="form-group row">
          <div className="text-input-small">
            <label className="form-label">Frame index</label>
            <TextInput
              placeholder="Enter frame index here..."
              onChange={setFrameIdx}
              value={frameIdx}
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
                onClick={handleFrameSearch}
                disabled={loading}
                aria-label="Search frame index range"
                title="Search"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        <div className="form-group button-row">
          {queryOptions.map(([key, label]) => (
            <Button
              key={key}
              label={label}
              variant={queryOption === key ? "primary" : "secondary"}
              onClick={() => setQueryOption(key)}
            />
          ))}
        </div>


        { queryOption === "image" ? (
        <div className="form-group">
          <ImageDropper onChange={setImageFile} />
        </div>
        ) : (
          <div className="form-group">
            <label className="form-label">{queryOption === "ocr" ? "Query by OCR" : "Query by Text"}</label>
            <TextInput
              multiline
              placeholder="Enter query text here..."
              onChange={queryOption === "ocr" ? setOCRText : setText}
              value={queryOption === "ocr" ? OCRtext : text}
            />
          </div>
        ) }
        <Button
          label={loading ? "Loading..." : "Run Query"}
          variant="primary"
          disabled={loading}
          onClick={() => {
                if (queryOption === "image" && !imageFile) {
                  alert("Please select an image before running an image query.");
                  return;
                }
                handleOnClickQuery(queryOption);
              }}
        />
        <DeathNote />
        <QueryView />
      </div>

      <div className="app-right">
        <div className="app-content">
          {/* <div className="app-header">
            <h1 className="app-title">Golden Retrievers</h1>
          </div> */}

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
