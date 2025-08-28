import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import "./VideoCard.css";

export type VideoItem = {
  youtube_id: string;
  start_time: number;               // seconds
  preview_image_directory: string;  // direct image path/URL (e.g., /previews/abc.jpg)
};

const LiteYouTubeEmbed = lazy(() => import("react-lite-youtube-embed"));

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

const VideoCard = memo(function VideoCard({ item }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [showVideo, setShowVideo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // With no FPS, use a simple integer-ish “frame index”
  const frameIdx = useMemo(
    () => Math.max(0, Math.round(item.start_time)),
    [item.start_time]
  );

  // preview_image_directory is already the image path
  useEffect(() => {
    setPreviewUrl(item.preview_image_directory || null);
  }, [item.preview_image_directory]);

  const addToCsv = () => {
    window.dispatchEvent(
      new CustomEvent("csv:add", {
        detail: { video_id: item.youtube_id, frame_idx: frameIdx },
      })
    );
  };

  return (
    <div ref={ref} className="vg-card">
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
                <Suspense
                  fallback={
                    <div className="vg-embed vg-loading" aria-label="Loading video…" />
                  }
                >
                  <LiteYouTubeEmbed
                    key={`yt-${item.youtube_id}-${frameIdx}`}
                    id={item.youtube_id}
                    title={`YouTube ${item.youtube_id}`}
                    params={`start=${Math.floor(item.start_time)}&autoplay=1`}
                    poster="hqdefault"
                  />
                </Suspense>
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
            <h3 className="vg-title">{item.youtube_id}</h3>

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
              <button type="button" className="vg-btn" onClick={addToCsv}>
                Add to CSV
              </button>
            </div>

            <p className="vg-sub">
              Start: {Math.floor(item.start_time)}s · frame ≈ {frameIdx}
            </p>
          </div>
        </>
      )}
    </div>
  );
});

export default VideoCard;
