import { useState, useEffect, useCallback } from "react";
import type { Item } from "./types";
import { sanitizeFileName } from "./helper";
import { KIStoCSV, QAtoCSV, TRAKEtoCSV } from "../../utils/outputCSV";

export function useMakeCSV() {
  const [queryType, setQueryType] = useState<"" | "KIS" | "QA" | "TRAKE">("");
  const [fileName, setFileName] = useState("");
  const [videoId, setVideoId] = useState("");
  const [frameIdx, setFrameIdx] = useState<string>("0");
  const [numEvents, setNumEvents] = useState<string>("0");
  const [answer, setAnswer] = useState(""); 
  const [items, setItems] = useState<Item[]>([]);

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
      const ce = e as CustomEvent<{ video_id?: string; frame_idx?: number }>;
      const { video_id, frame_idx } = ce.detail || {};
      if (!video_id || typeof frame_idx !== "number" || !Number.isFinite(frame_idx)) return;
      setVideoId(video_id);
      setFrameIdx(String(frame_idx));
    };
    window.addEventListener("csv:add", handler as EventListener);
    return () => window.removeEventListener("csv:add", handler as EventListener);
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
          ...(isQA ? { answer: answer.trim() } : {}),
        },
      ];
    });
  }, [addDisabled, isTRAKE, isQA, idx, nEvents, videoId, answer]);

  const removeAt = useCallback((i: number) => {
    setItems((prev) => prev.filter((_, j) => j !== i));
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const safeFile = sanitizeFileName(fileName);
      if (isTRAKE) {
        TRAKEtoCSV(items, safeFile, nEvents);
      } else if (isQA) {
        QAtoCSV(items, safeFile);
      } else {
        KIStoCSV(items, safeFile);
      }
    },
    [fileName, isQA, isTRAKE, items, nEvents]
  );

  return {
    queryType, setQueryType,
    fileName, setFileName,
    videoId, setVideoId,
    frameIdx, setFrameIdx,
    numEvents, setNumEvents,
    answer, setAnswer,
    items, addItem, removeAt, onSubmit,
    idxInvalid, numEventsInvalid, addDisabled,
    isQA, isTRAKE
  };
}
