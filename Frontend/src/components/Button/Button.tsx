import { useState } from "react";
import PropTypes from "prop-types";
import "./Button.css"; // styles from your main CSS, or scoped if you prefer

function Button({
  label,
  variant = "primary",
  onClick,
  toggle = false,
  defaultActive = false,
  disabled = false,
}) {
  const [isActive, setIsActive] = useState(defaultActive);

  const handleClick = () => {
    if (toggle) {
      setIsActive(!isActive);
    }
    if (onClick) {
      onClick();
    }
  };

  // Build className dynamically
  const classNames = [
    "btn",
    `btn-${variant}`,
    toggle ? (isActive ? "active" : "inactive") : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} onClick={handleClick} disabled={disabled}>
      {label}
    </button>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "outline"]),
  onClick: PropTypes.func,
  toggle: PropTypes.bool,
  defaultActive: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Button;
