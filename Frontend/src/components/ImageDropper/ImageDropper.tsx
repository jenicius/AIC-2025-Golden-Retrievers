import { useImageDropper } from "./useImageDropper";
import "./ImageDropper.css";

interface ImageDropperProps {
  label?: string;
  enabled?: boolean;
  onChange?: (file: File | null) => void;
}

function ImageDropper({
  label = "Query by Image",
  enabled = true,
  onChange,
}: ImageDropperProps) {
  const { preview, getRootProps, getInputProps, isDragActive, clear } =
    useImageDropper({ enabled, onChange });

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <div
        {...getRootProps({
          className: `image-dropper ${!enabled ? "disabled" : ""}`,
        })}
      >
        <input {...getInputProps()} disabled={!enabled} />

        {preview ? (
          <div className="preview-wrapper">
            <img src={preview} alt="Preview" className="preview" />
            <button
              type="button"
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation(); 
                clear();
              }}
            >
              ✕
            </button>
          </div>
        ) : isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <p>{enabled ? "Click, drag, or paste an image" : "Disabled"}</p>
        )}
      </div>
    </div>
  );
}

export default ImageDropper;
