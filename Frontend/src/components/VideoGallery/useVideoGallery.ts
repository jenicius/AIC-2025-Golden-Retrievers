import { use, useEffect, useState } from "react";
import type { VideoItem } from "../VideoCard/VideoCard";

export function useVideoGallery() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [viewItems, setViewItems] = useState<VideoItem[]>([]);
  
  useEffect(() => {
    setViewItems(items);
  }, [items]);

  useEffect(() => {
    type SetEvt = CustomEvent<VideoItem[]>;
    type AddEvt = CustomEvent<VideoItem>;

    const onSet = (e: Event) => {
      const list = (e as SetEvt).detail;
      if (Array.isArray(list)) setItems(list);
    };

    const onAdd = (e: Event) => {
      const item = (e as AddEvt).detail;
      if (item?.youtube_id) setItems((prev) => [...prev, item]);
    };

    window.addEventListener("gallery:set", onSet as EventListener);
    window.addEventListener("gallery:add", onAdd as EventListener);

    return () => {
      window.removeEventListener("gallery:set", onSet as EventListener);
      window.removeEventListener("gallery:add", onAdd as EventListener);
    };
  }, []);


  useEffect(() => {
    const onIgnore = (e: CustomEvent<string[]>) => {
      const deathnoteList = Array.isArray(e.detail) ? e.detail : [];
      setViewItems(items.filter(it => !deathnoteList.includes(it.video_name)));
    };
    window.addEventListener("gallery:filter", onIgnore as EventListener);
    return () => {
      window.removeEventListener("gallery:filter", onIgnore as EventListener);
    };
  }, [items]);

  return { items, viewItems };
}
