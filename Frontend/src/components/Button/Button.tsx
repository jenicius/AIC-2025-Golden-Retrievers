import { useState } from "react";
import "./Button.css"; 

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "outline";
  onClick?: () => void;
  toggle?: boolean;
  defaultActive?: boolean;
  disabled?: boolean;
}

function Button({
  label,
  variant = "primary",
  onClick,
  toggle = false,
  defaultActive = false,
  disabled = false,
}: ButtonProps) {
  const [isActive, setIsActive] = useState(defaultActive);

  const handleClick = () => {
    if (toggle) {
      setIsActive(prev => !prev);
    }
    if (onClick) {
      onClick();
    }
  };

  const className = `btn-${variant} ${isActive ? "active" : ""}`;

  return (
    <button className={className} onClick={handleClick} disabled={disabled}>
      {label}
    </button>
  );
}

export default Button;
