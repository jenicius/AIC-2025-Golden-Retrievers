import { useEffect, useMemo, useRef, useState, memo } from "react";
import "./VideoCard.css";
import { FaSkull } from "react-icons/fa";

export type VideoItem = {
  id: string;
  youtube_id: string;
  video_name: string;
  frame_idx: number;
  start_time: number;               
};

/* ---------- helpers ---------- */

function getScrollParent(el: Element | null): Element | null {
  let node: Element | null = el;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (style.overflowY === "auto" || style.overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

function useInView<T extends Element>(opts?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current || inView) return;
    const root = getScrollParent(ref.current) || null;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { root, rootMargin: "200px 0px", ...opts }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, opts]);

  return { ref, inView };
}

/* ---------- component ---------- */

type Props = {
  item: VideoItem;
  className?: string;
};

const VideoCard = memo(function VideoCard({ item, className }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [showVideo, setShowVideo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Approx “frame index” without FPS (just rounded seconds)

  // preview_image_directory is already the image path
  useEffect(() => {
    setPreviewUrl(`previews/${item.id}.jpg`);
  }, [item.id]);

  const addToCsv = () => {
    window.dispatchEvent(
      new CustomEvent("csv:add", {
        detail: { video_id: item.video_name, frame_idx: item.frame_idx },
      })
    );
  };

  const addToDeathNote = () => {
    window.dispatchEvent(
      new CustomEvent("deathnote:add", {
        detail: { video_name: item.video_name },
      })
    );
  };

  const start = Math.max(0, Math.floor(item.start_time || 0));
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    item.youtube_id
  )}?start=${start}&autoplay=1&modestbranding=1&rel=0`;
  return (
    <div ref={ref} className={`vg-card${className ? ` ${className}` : ""}`}>
      {!inView ? (
        <div className="vg-skel">
          <div className="vg-skel-media" />
          <div className="vg-skel-lines">
            <div />
            <div />
          </div>
        </div>
      ) : (
        <>
          <div className="vg-media">
            {showVideo ? (
              <div className="vg-embed">
                <iframe
                  src={src}
                  title={`YouTube ${item.youtube_id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : previewUrl ? (
              <button
                type="button"
                className="vg-thumb"
                onClick={() => setShowVideo(true)}
                aria-label="Play video"
                style={{ backgroundImage: `url("${previewUrl}")` }}
              />
            ) : (
              <div className="vg-skel-media" />
            )}
          </div>

          <div className="vg-meta">
            <h3 className="vg-title">{item.video_name}</h3>

            <div className="vg-actions">
              {showVideo && (
                <button
                  type="button"
                  className="vg-switch-meta"
                  onClick={() => setShowVideo(false)}
                >
                  Preview image
                </button>
              )}
              <div className="vg-btn-group">
                <button type="button" className="vg-btn" onClick={addToCsv}>
                  CSV
                </button>
                <button type ="button" className="vg-btn-deathnote" onClick={addToDeathNote}>
                  <FaSkull/>
              </button>
              </div>
            </div>

            <p className="vg-sub">
              frame ≈ {item.frame_idx}
            </p>
          </div>
        </>
      )}
    </div>
  );
});

export default VideoCard;
