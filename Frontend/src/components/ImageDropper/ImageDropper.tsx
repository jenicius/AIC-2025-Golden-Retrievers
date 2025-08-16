import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./ImageDropper.css";

interface ImageDropperProps {
  label?: string;
  enabled?: boolean; // NEW prop
  onChange?: (file: File | null) => void;
}

function ImageDropper({ label = "Query by Image", enabled = true, onChange }: ImageDropperProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
        if (onChange) onChange(file);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
    disabled: !enabled, // respect enabled flag
  });

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
          <img src={preview} alt="Preview" className="preview" />
        ) : isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <p>{enabled ? "Drag & drop an image here, or click to select" : "Disabled"}</p>
        )}
      </div>
    </div>
  );
}

export default ImageDropper;
