import { useEffect, useState } from "react";
import VideoCard, { type VideoItem } from "../VideoCard/VideoCard";
import "./VideoGallery.css"; // <-- grid/scroll-only CSS

export default function VideoGallery() {
  // Own the list here; update from elsewhere if you like
  const [videos, setVideos] = useState<VideoItem[]>([]);
  // Optional external updates
  useEffect(() => {
    type SetEvt = CustomEvent<VideoItem[]>;
    type AddEvt = CustomEvent<VideoItem>;
    const onSet = (e: Event) => {
      const list = (e as SetEvt).detail;
      if (Array.isArray(list)) setVideos(list);
    };
    const onAdd = (e: Event) => {
      const item = (e as AddEvt).detail;
      if (item?.youtube_id) setVideos((prev) => [...prev, item]);
    };
    window.addEventListener("gallery:set", onSet as EventListener);
    window.addEventListener("gallery:add", onAdd as EventListener);
    return () => {
      window.removeEventListener("gallery:set", onSet as EventListener);
      window.removeEventListener("gallery:add", onAdd as EventListener);
    };
  }, []);

  return (
    <div className="vg-grid">
      {videos.map((v, i) => (
        <VideoCard key={`${v.youtube_id}-${i}`} item={v} />
      ))}
    </div>
  );
}
