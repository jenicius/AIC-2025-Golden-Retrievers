import { useState, useEffect, useCallback } from "react";

export function useDeathNote() {
  const [deathNote, setDeathNote] = useState<string[]>([]);

  const onRemove = (item: string) => {
    setDeathNote((prev) => prev.filter((it) => it !== item));
  };

  // This only triggers when you call it (e.g. from a button click)
  const applyFilter = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("gallery:filter", { detail: [...deathNote] })
    );
  }, [deathNote]);

  useEffect(() => {
    const onAdd = (e: Event) => {
      const ce = e as CustomEvent<{ video_name?: string }>;
      const { video_name } = ce.detail || {};
      if (!video_name) return;
      setDeathNote((prev) => {
        if (prev.includes(video_name)) return prev;
        return [...prev, video_name];
      });
    };
    window.addEventListener("deathnote:add", onAdd as EventListener);
    return () =>
      window.removeEventListener("deathnote:add", onAdd as EventListener);
  }, []);

  return { deathNote, setDeathNote, onRemove, applyFilter };
}
