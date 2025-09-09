import { Dropdown } from "react-bootstrap";
import "./DeathNote.css";
import { useDeathNote } from "./useDeathNote";

function DeathNote() {
  const { deathNote, onRemove, applyFilter } = useDeathNote();

  return (
    <div className="deathnote">
      <label className="dn-label">Death Note</label>
      <div className="dn-controls">
        <Dropdown className="dn-dropdown">
  <Dropdown.Toggle id="dropdown-basic">
    View Blacklist
  </Dropdown.Toggle>
  <Dropdown.Menu>
    {deathNote.length === 0 ? (
      <span className="dn-empty">No items</span>
    ) : (
      deathNote.map((it, i) => (
        <div className="dn-row" key={`${it}-${i}`}>
          <span className="dn-text">{it}</span>
          <button
            type="button"
            className="dn-del"
            onClick={() => onRemove(it)}
            aria-label="remove"
            title="Remove"
          >
            x
          </button>
        </div>
      ))
    )}
  </Dropdown.Menu>
</Dropdown>


        <button type="button" className="dn-clear" onClick={applyFilter}>
          Apply 
        </button>
      </div>
    </div>
  );
}

export default DeathNote;
