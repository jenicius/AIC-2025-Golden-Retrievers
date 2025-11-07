import VideoCard from "../VideoCard/VideoCard";
import "./VideoGallery.css"; 
import { useVideoGallery } from "./useVideoGallery";

export default function VideoGallery() {
  const { viewItems } = useVideoGallery();
  return (
    <div className="vg-grid">
      {viewItems.map((v, i) => (
        <VideoCard key={`${v.id}-${i}`} item={v} />
      ))}
    </div>
  );
}
