import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { type ImageDropperProps } from "./types";

function useImageDropper({ enabled = true, onChange }: ImageDropperProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      if (onChange) onChange(file);
    },
    [onChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) handleFile(acceptedFiles[0]);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
    disabled: !enabled,
  });

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!enabled || !event.clipboardData) return;

      for (const item of event.clipboardData.items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [enabled, handleFile]);

  const clear = useCallback(() => {
    setPreview(null);
    if (onChange) onChange(null);
  }, [onChange]);

  return { preview, getRootProps, getInputProps, isDragActive, clear };
}

export { useImageDropper };
