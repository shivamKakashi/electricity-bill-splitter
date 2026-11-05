import { money, units } from "../lib/format";

function FloorCalculationSummary({ bill, split, isSaved, saveState, onSave }) {
  return (
    <section className="card">
      <h2>Who pays what</h2>

      <ul className="shares">
        {split.floors.map((f) => (
          <li key={f.key}>
            <span>
              <strong>{f.label}</strong>
              <span className="hint">{units(f.units)} units</span>
            </span>
            <span className="share-amount">{money(f.share)}</span>
          </li>
        ))}
      </ul>

      <div className="row total">
        <span>Total collected</span>
        <span>{money(split.totalShares)}</span>
      </div>
      <div className="row muted">
        <span>Bill amount</span>
        <span>{money(bill.payableAmount)}</span>
      </div>

      {split.carryUsed > 0 && (
        <div className="alert alert-info">
          {units(split.carryUsed)} extra units from the last bill were taken off this month's water
          usage, so {money(split.carryUsed * split.rate)} less is collected.
        </div>
      )}
      {split.carryOutUnits > 0 && (
        <div className="alert alert-warn">
          {split.newExtraUnits > 0 &&
            `The floor meters show ${units(split.newExtraUnits)} units more than the main meter. Each floor still pays for its own meter, so the extra is collected now. `}
          <strong>
            {units(split.carryOutUnits)} units ({money(split.carryOutUnits * split.rate)})
          </strong>{" "}
          will be taken off next month's water usage once you save.
        </div>
      )}

      <details className="breakdown">
        <summary>How this was worked out</summary>
        <div className="row"><span>Energy rate</span><span>{money(split.rate)}/unit</span></div>
        <div className="row"><span>Water pump units</span><span>{units(split.waterUnits)}</span></div>
        <div className="row"><span>Water cost per floor</span><span>{money(split.waterShare)}</span></div>
        <div className="row"><span>Taxes &amp; charges per floor</span><span>{money(split.taxShare)}</span></div>
        <div className="row"><span>Discount, split 1 : 1 : 2</span><span>{money(split.overcharge)}</span></div>
        {split.floors.map((f) => (
          <div className="row formula" key={f.key}>
            <span>{f.label}</span>
            <span>
              {money(f.energyCost)} + {money(split.waterShare)} + {money(split.taxShare)} − {money(f.discount)}
            </span>
          </div>
        ))}
      </details>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={onSave}
        disabled={isSaved || saveState.status === "saving"}
      >
        {saveState.status === "saving" ? "Saving…" : isSaved ? "Saved ✓" : "Save this month"}
      </button>
      {saveState.status === "error" ? (
        <p className="field-error" role="alert">{saveState.message}</p>
      ) : (
        !isSaved && (
          <p className="hint center">Saving keeps a record and lets next month's bill pick up carried units.</p>
        )
      )}
    </section>
  );
}

export default FloorCalculationSummary;
