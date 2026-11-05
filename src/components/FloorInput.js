import { FLOORS } from "../lib/splitBill";
import { prettyDate, units } from "../lib/format";

function UnitsInput(props) {
  return (
    <span className="input-suffix">
      <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0" {...props} />
      <span>units</span>
    </span>
  );
}

function FloorInput({ floors, onChange, carryIn, onCarryInChange, previous, split, billedUnits }) {
  const over = split.floorTotal > billedUnits;

  return (
    <section className="card">
      <h2>Floor meter units</h2>

      {FLOORS.map(([key, label]) => (
        <label key={key} className="field field-row">
          <span className="field-label">{label}</span>
          <UnitsInput name={key} value={floors[key]} onChange={onChange} />
        </label>
      ))}

      <label className="field field-row">
        <span className="field-label">
          Carried from last bill
          <span className="hint">
            {previous
              ? `From ${prettyDate(previous.billDate)}, change it if needed`
              : "Extra floor units not yet settled"}
          </span>
        </span>
        <UnitsInput value={carryIn} onChange={(e) => onCarryInChange(e.target.value)} />
      </label>

      {split.floorTotal > 0 && (
        <p className={`meter-check${over ? " is-over" : ""}`}>
          Floors total <strong>{units(split.floorTotal)}</strong> of {units(billedUnits)} units billed
          {over
            ? `: ${units(split.newExtraUnits)} units over the main meter`
            : `: ${units(billedUnits - split.floorTotal)} units for the water pump`}
        </p>
      )}
    </section>
  );
}

export default FloorInput;
