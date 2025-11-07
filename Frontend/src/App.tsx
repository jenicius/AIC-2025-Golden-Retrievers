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
  QueryView,
  SessionDisplay
} from "./components";
import rawConfig from "../config/models.json";
import {
  queryByImage,
  queryByText,
  queryByOCR,
  queryByFrameIdx,
  queryVideoByTextList,
  convertTimeToFrameIdx,
  queryBySpeech,
  queryByMultiModal
} from "../src/utils/fetchData";
import { FaSearch, FaRegArrowAltCircleRight } from "react-icons/fa";


type ModelDetails = {
  metrics?: Record<string, string>;
  queryBy?: Record<string, string>;
};

type MethodConfig = {
  displayName: string;
  models?: Record<string, ModelDetails>;
  usesEmbeddingModels?: boolean;
  queryBy?: Record<string, string>;
  metrics?: Record<string, string>;
};

type AppConfig = Record<string, MethodConfig>;

const config = rawConfig as AppConfig;

function App() {
  const [text, setText] = useState("");
  const [OCRtext, setOCRText] = useState("");
  const [speechText, setSpeechText] = useState("");
  const [topK, setTopK] = useState<number>(1);
  const [methodOption, setMethodOption] = useState("");
  const [modelOption, setModelOption] = useState("");
  const [metricOption, setMetricOption] = useState("");
  const [queryOption, setQueryOption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [frameIdx, setFrameIdx] = useState<string>("");
  const [frameIdxRange, setFrameIdxRange] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [videoTime, setVideoTime] = useState<string>("");

  const methodOptions = useMemo(() => Object.keys(config), []);

  const modelOptions = useMemo(() => {
    if (!methodOption) return [];
    // Special case: Multimodal uses the embedding models for its dropdown
    if (config[methodOption]?.usesEmbeddingModels) {
      return Object.keys(config.embedding?.models ?? {});
    }
    return Object.keys(config[methodOption]?.models ?? {});
  }, [methodOption]);

  const currentActiveConfig = useMemo(() => {
    if (!methodOption || !modelOption) return config[methodOption]; // Fallback for multimodal
    if (config[methodOption]?.usesEmbeddingModels) {
      return config.embedding?.models?.[modelOption];
    }
    return config[methodOption]?.models?.[modelOption];
  }, [methodOption, modelOption]);


  const queryOptions = useMemo(() => {
    // If multimodal, its queryBy is on the top level
    if (methodOption === 'multimodal') {
        return Object.entries(config.multimodal?.queryBy ?? {});
    }
    return currentActiveConfig ? Object.entries(currentActiveConfig.queryBy ?? {}) : [];
  }, [currentActiveConfig, methodOption]);

  const metricOptions = useMemo(() => {
    if (!currentActiveConfig || !currentActiveConfig.metrics) return [];
    return Object.keys(currentActiveConfig.metrics);
  }, [currentActiveConfig]);

  useEffect(() => {
    if (methodOptions.length > 0 && !methodOption) {
      setMethodOption(methodOptions[0]);
    }
  }, [methodOptions, methodOption]);

  useEffect(() => {
    if (modelOptions.length > 0) {
      // Always select the first available model as the default for the new method
      setModelOption(modelOptions[0]);
    } else {
      setModelOption(""); // Clear if no models
    }
  }, [modelOptions]);

  useEffect(() => {
    const queryBy = methodOption === 'multimodal'
      ? config.multimodal?.queryBy
      : currentActiveConfig?.queryBy;

    const metrics = currentActiveConfig?.metrics;

    setQueryOption(queryBy ? Object.keys(queryBy)[0] : "");
    setMetricOption(metrics ? Object.keys(metrics)[0] : "");
  }, [currentActiveConfig, methodOption]);


  const setGallery = useCallback((results: unknown) => {
    window.dispatchEvent(new CustomEvent("gallery:set", { detail: results }));
  }, []);

  const handleOnClickQuery = useCallback(
    async (key: string) => {
      if (!modelOption) {
          alert("Please select a model.");
          return;
      }

      try {
        setLoading(true);
        console.log("Running query ");
        if (key === "multimodal") {
          const data = await queryByMultiModal(text, imageFile, OCRtext, speechText, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "speech") {
          const data = await queryBySpeech(speechText, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "ocr") {
          const data = await queryByOCR(OCRtext, topK, modelOption, metricOption);
          console.log("OCR data:", OCRtext);
          setGallery(data.results);
        } else if (key === "text") {
          const data = await queryByText(text, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "textlist") {
          const data = await queryVideoByTextList(text, topK, modelOption, metricOption);
          setGallery(data.results);
        } else if (key === "image") {
          if (!imageFile) { alert("Please select an image."); return; }
          const data = await queryByImage(imageFile, topK, modelOption, metricOption);
          setGallery(data.results);
        }
      } catch (err) {
        console.error("Query failed:", err);
        alert(`Query failed: ${(err as Error).message || "An unknown error occurred."}`);
      } finally {
        setLoading(false);
      }
    },
    [imageFile, metricOption, modelOption, text, OCRtext, speechText, topK, setGallery, OCRtext]
  );

  const handleFrameSearch = useCallback(async () => {
    const idx = Number(frameIdx);
    const range = Number(frameIdxRange);
    if (!videoName || Number.isNaN(idx) || Number.isNaN(range)) {
      alert("Provide video name, frame index, and a numeric range.");
      return;
    }
    try {
      setLoading(true);
      const data = await queryByFrameIdx(videoName, idx, range);
      setGallery(data.results);
    } catch (err) {
      console.error("FrameIdx query failed:", err);
      alert(`FrameIdx query failed: ${(err as Error).message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  }, [frameIdx, frameIdxRange, setGallery, videoName]);

  const handleTimeToFrameIdx = useCallback(async () => {
    if (!videoName || !videoTime) {
      alert("Provide video name and time.");
      return;
    }
    try {
      setLoading(true);
      const data = await convertTimeToFrameIdx(videoName, videoTime);
      setFrameIdx(data.frame_idx.toString());
    } catch (err) {
      console.error("TimeToFrameIdx query failed:", err);
      alert(`Failed to convert time to frame index: ${(err as Error).message || "Please check the video name and time format."}`);
    } finally {
      setLoading(false);
    }
  }, [videoName, videoTime]);

  return (
    <div className="app-shell">
      <div className="app-left">
        <div className="form-group row">
          <DropDown
            label="Method"
            options={methodOptions.map(m => config[m].displayName)}
            value={config[methodOption]?.displayName}
            onChange={(v: string) => {
              const newMethod = methodOptions.find(m => config[m].displayName === v);
              if (newMethod) setMethodOption(newMethod);
            }}
          />
          {/* Only show the model dropdown if there is more than one model to choose from */}
          {modelOptions.length >= 1 && (
            <DropDown
              label="Model"
              options={modelOptions}
              value={modelOption}
              onChange={setModelOption}
            />
          )}
        </div>

        <div className="form-group row">
          {metricOptions.length > 0 && (
            <DropDown
              label="Metric"
              options={metricOptions}
              value={metricOption}
              onChange={setMetricOption}
            />
          )}
           <div className="text-input-small">
            <label className="form-label">Top K</label>
            <TextInput
              type="number"
              min={1}
              onChange={(value) => setTopK(Math.max(1, Number(value) || 1))}
              placeholder="1"
              value={topK.toString()}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="text-input-small">
            <label className="form-label">Video</label>
            <TextInput placeholder="E.g., L29_V007" onChange={setVideoName} value={videoName} />
          </div>
          <div className="text-input-with-icon">
            <label className="form-label">Time</label>
            <div className="input-wrapper">
              <TextInput type="string" placeholder="HH:MM:SS or MM:SS or SS" onChange={setVideoTime} value={videoTime} />
              <button className="icon-btn-inside" onClick={handleTimeToFrameIdx} disabled={loading} aria-label="Convert time to frame index" title="Convert">
                <FaRegArrowAltCircleRight />
              </button>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="text-input-small">
            <label className="form-label">Frame index</label>
            <TextInput placeholder="Enter frame index..." onChange={setFrameIdx} value={frameIdx} />
          </div>
          <div className="text-input-with-icon">
            <label className="form-label">IDX range</label>
            <div className="input-wrapper">
              <TextInput placeholder="Enter frame index range..." onChange={setFrameIdxRange} value={frameIdxRange} />
              <button className="icon-btn-inside" onClick={handleFrameSearch} disabled={loading} aria-label="Search frame index range" title="Search">
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

        {/* --- Input rendering logic remains the same --- */}
        {queryOption === 'multimodal' && (
             <>
             <div className="form-group">
               <label className="form-label">Query by Text</label>
               <TextInput multiline placeholder="Enter text query here..." onChange={setText} value={text} />
             </div>
             <div className="form-group">
               <label className="form-label">Query by OCR Text</label>
               <TextInput multiline placeholder="Enter OCR text query here..." onChange={setOCRText} value={OCRtext} />
             </div>
             <div className="form-group">
               <label className="form-label">Query by Speech Text</label>
               <TextInput multiline placeholder="Enter speech query text here..." onChange={setSpeechText} value={speechText} />
             </div>
             <div className="form-group">
               <ImageDropper onChange={setImageFile} />
             </div>
           </>
        )}
        {queryOption === "image" && ( <div className="form-group"> <ImageDropper onChange={setImageFile} /> </div> )}
        {queryOption === "ocr" && ( <div className="form-group"> <label className="form-label">Query by OCR</label> <TextInput multiline placeholder="Enter OCR query text here..." onChange={setOCRText} value={OCRtext} /> </div> )}
        {queryOption === "speech" && ( <div className="form-group"> <label className="form-label">Query by Speech</label> <TextInput multiline placeholder="Enter speech query text here..." onChange={setSpeechText} value={speechText} /> </div> )}
        {(queryOption === "text" || queryOption === "textlist") && ( <div className="form-group"> <label className="form-label">Query by Text</label> <TextInput multiline placeholder="Enter query text here..." onChange={setText} value={text} /> </div> )}

        <Button
          label={loading ? "Loading..." : "Run Query"}
          variant="primary"
          disabled={loading || !methodOption || !modelOption || !queryOption}
          onClick={() => {
            const finalQueryKey = methodOption === 'multimodal' ? 'multimodal' : queryOption;
            console.log("Final query key:", finalQueryKey);
            handleOnClickQuery(finalQueryKey);
          }}
        />
        <DeathNote />
      </div>

      <div className="app-right">
        <div className="app-content">
          <div className="app-makecsv"> <MakeCSV /> </div>
          <div className="app-display"> <VideoGallery /> </div>
        </div>
      </div>
    </div>
  );
}

export default App;