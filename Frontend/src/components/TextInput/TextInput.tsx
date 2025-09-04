import { useState } from "react";
import "./TextInput.css";

interface TextInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  type?: string;              // "text", "number", etc.
  multiline?: boolean;        // NEW: render as textarea
  rows?: number;              // optional: control height for textarea
  min?: number;
  max?: number;
  step?: number;
  value?: string | number; 
}

function TextInput({
  placeholder,
  onChange,
  type = "text",
  multiline = false,
  rows = 4,
  min,
  max,
  step,
  value
}: TextInputProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) onChange(e.target.value);
  };

  return multiline ? (
    <textarea
      className="text-input"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
    />
  ) : (
    <input
      className="text-input"
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
    />
  );
}

export default TextInput;
