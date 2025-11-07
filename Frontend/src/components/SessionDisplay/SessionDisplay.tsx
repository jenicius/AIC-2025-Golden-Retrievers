import React, { useState } from "react";
import { getEvaluationID, getSessionID } from "../../api/service";
import "./SessionDisplay.css";

export default function SessionDisplay() {
  const [sessionID, setSessionID] = useState<any>(null); 
  const [evalueationID, setEvaluationID] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await getSessionID(); 
      const evaluationId = await getEvaluationID(session.sessionId);
      setSessionID(session);
      setEvaluationID(evaluationId);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch session ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-container">
      <button onClick={handleClick} className="btn-primary" disabled={loading}>
        {loading ? "Fetching..." : "Get IDs"}
      </button>

      {sessionID && (
        <p className="session-success">
          Session ID: <span className="session-id">{sessionID.sessionId}</span>
          <br />
          Evaluation ID: <span className="session-id">{evalueationID.id}</span>
        </p>
      )}

      {error && <p className="session-error">{error}</p>}
    </div>
  );
}
