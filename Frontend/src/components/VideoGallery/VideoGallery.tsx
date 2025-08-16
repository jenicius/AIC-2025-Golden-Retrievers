import { useEffect, useState } from "react";
import VideoCard, { type VideoItem } from "../VideoCard/VideoCard";
import "./VideoGallery.css"; // <-- grid/scroll-only CSS

export default function VideoGallery() {
  // Own the list here; update from elsewhere if you like
  const [videos, setVideos] = useState<VideoItem[]>([
    { youtube_id: "dQw4w9WgXcQ", start_time: 12, preview_image_directory: "" },
    { youtube_id: "9bZkp7q19f0",  start_time: 5,  preview_image_directory: "" },
    { youtube_id: "3JZ_D3ELwOQ",  start_time: 8,  preview_image_directory: "" },
    { youtube_id: "M7lc1UVf-VE",  start_time: 15, preview_image_directory: "" },
    { youtube_id: "e-ORhEE9VVg",  start_time: 20, preview_image_directory: "" },
    { youtube_id: "60ItHLz5WEA",  start_time: 10, preview_image_directory: "" },
    { youtube_id: "kXYiU_JCYtU",  start_time: 7,  preview_image_directory: "" },
  ]);

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
