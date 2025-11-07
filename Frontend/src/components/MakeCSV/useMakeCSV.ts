import { useState, useEffect, useCallback } from "react";
import type { Item } from "./types";
import { sanitizeFileName } from "./helper";
import { getEvaluationID, getSessionID, submitKIS, submitQA, submitTRAKE } from "../../api/service";

export function useMakeCSV() {
  const [queryType, setQueryType] = useState<"" | "KIS" | "QA" | "TRAKE">("");
  const [fileName, setFileName] = useState("");
  const [videoId, setVideoId] = useState("");
  const [frameIdx, setFrameIdx] = useState<string>("0");
  const [numEvents, setNumEvents] = useState<string>("0");
  const [answer, setAnswer] = useState(""); 
  const [items, setItems] = useState<Item[]>([]);
  const [sessionID, setSessionID] = useState<any>(null); 
  const [evaluationID, setEvaluationID] = useState<any | null>(null);
  const [videoTime, setVideoTime] = useState<string>("0"); // in milliseconds

  const isQA = queryType === "QA";
  const isTRAKE = queryType === "TRAKE";

  useEffect(() => {
    if (!isQA) setAnswer("");
  }, [isQA]);

  useEffect(() => {
    if (!isTRAKE) setNumEvents("0");
  }, [isTRAKE]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ video_id?: string; frame_idx?: number, time_ms?: number }>;
      const { video_id, frame_idx, time_ms } = ce.detail || {};
      if (!video_id || typeof frame_idx !== "number" || !Number.isFinite(frame_idx)) return;
      setVideoId(video_id);
      setFrameIdx(String(frame_idx));
      setVideoTime(String(time_ms));
    };
    window.addEventListener("csv:add", handler as EventListener);
    return () => window.removeEventListener("csv:add", handler as EventListener);
  }, []);

  const fetchSession = async () => {
    try {
      const session = await getSessionID();
      setSessionID(session.sessionId);
      console.log("Session ID:", session);
    } catch (error) {
      console.error("Error fetching session and evaluation IDs:", error);
    }
  };

  const fetchEvaluation = async () => {
    try {
      console.log(sessionID);
      if (!sessionID) {
        console.warn("Session ID is not set. Cannot fetch Evaluation ID.");
        return;
      }
      const evaluationId = await getEvaluationID(sessionID);
      setEvaluationID(evaluationId.id);
      console.log("Fetched Evaluation ID:", evaluationId.id);
    } catch (error) {
      console.error("Error fetching evaluation ID:", error);
    }
  };


  useEffect(() => {
    fetchSession();
    fetchEvaluation();
  }, []);

  const idx = Number(frameIdx);
  const nEvents = Number(numEvents);

  const idxInvalid = !frameIdx || isNaN(idx);
  const numEventsInvalid = isTRAKE && (!numEvents || isNaN(nEvents) || nEvents <= 0);

  const addDisabled =
    !videoId.trim() ||
    idxInvalid ||
    (isQA && !answer.trim()) ||
    numEventsInvalid ||
    (isTRAKE && nEvents > 1000);



  const addItem = useCallback(() => {
    if (addDisabled) return;
    const vid = videoId.trim();

    setItems((prev) => {
      if (isTRAKE) {
        const candidates = prev.filter((it) => it.video_id === vid);
        const notFull = candidates.find((it) => (it.frames?.length || 0) < nEvents);
        if (notFull) {
            if(notFull.frames?.includes(idx)) {
                alert(`Frame ${idx} already exists for video ${vid}.`);
                return prev;
            }
            return prev.map((it) => {
                if (it === notFull) {
                    const newFrames = [...(it.frames || []), idx].sort((a, b) => a - b);
                    return { ...it, frames: newFrames };
                }
                return it;
            });
        }
        const newItem: Item = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            video_id: vid,
            frame_idx: -1,
            time_ms: -1,
            frames: [idx],
        };
        return [...prev, newItem];
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          video_id: vid,
          frame_idx: idx,
          time_ms: Number(videoTime),
          ...(isQA ? { answer: answer.trim() } : {}),
        },
      ];
    });
  }, [addDisabled, isTRAKE, isQA, idx, nEvents, videoId, answer, videoTime]);

  const removeAt = useCallback((i: number) => {
    setItems((prev) => prev.filter((_, j) => j !== i));
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (items.length !== 1) {
        alert("Please add exactly one item before submitting.");
        return;
      }
      if (isTRAKE) {
        submitTRAKE(sessionID, evaluationID, items[0].video_id, items.flatMap(item => item.frames || []));
      } else if (isQA) {
        submitQA(sessionID, evaluationID, items[0].video_id, items[0].time_ms || 0, items[0].answer || "");
      } else {
        submitKIS(sessionID, evaluationID, items[0].video_id, items[0].time_ms || 0);
      }
    },
    [evaluationID, isQA, isTRAKE, items, sessionID]
  );

  return {
    queryType, setQueryType,
    fileName, setFileName,
    videoId, setVideoId,
    frameIdx, setFrameIdx,
    videoTime, setVideoTime,
    numEvents, setNumEvents,
    answer, setAnswer,
    items, addItem, removeAt, onSubmit,
    idxInvalid, numEventsInvalid, addDisabled,
    isQA, isTRAKE,
    sessionID, setSessionID,
    evaluationID, setEvaluationID,
    fetchSession,
    fetchEvaluation,
  };
}
