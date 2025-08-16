import { useState } from "react";
import "./App.css";
import { TextInput, DropDown, ImageDropper, Button } from "./components";
import config from "../config/models.json";
import MakeCSV from './components/MakeCSV/MakeCSV'
import VideoGallery from './components/VideoGallery/VideoGallery'

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
    <div className="app-shell">
      <div className="app-left">Left (2)</div>
      <div className="app-right">
        <div className="app-content">
          <div className="app-header">
            <h1 className="app-title">Golden Retrievers AI</h1>
          </div>
          <div className="app-makecsv">
            <MakeCSV />
          </div>
          <div className="app-display">
            {/* Display component will go here */}
            <VideoGallery />
          </div>
        </div>

        <ImageDropper />
      </div>

      <div className="right">
      </div>
    </div>
  )
}
export default App
