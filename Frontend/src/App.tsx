import { useState } from 'react'
import './App.css'
import MakeCSV from './components/MakeCSV/MakeCSV'
import VideoGallery from './components/VideoGallery/VideoGallery'

function App() {
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
      </div>
    </div>
  )
}
export default App
