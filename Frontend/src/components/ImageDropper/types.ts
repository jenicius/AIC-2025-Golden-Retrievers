export interface ImageDropperProps {
  label?: string;
  enabled?: boolean;
  onChange?: (file: File | null) => void;
}
