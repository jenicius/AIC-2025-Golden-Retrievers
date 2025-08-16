import "./DropDown.css";

interface DropDownProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function DropDown({ label, options, value, onChange }: DropDownProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        className="dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Select an option --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropDown;
