import { money, prettyDate, units } from "../lib/format";

function BillDetails({ data, meta }) {
  const rate = data.netBilledUnits ? data.energyCharges / data.netBilledUnits : null;
  const hasRebate = data.payableByDueDate != null && data.payableByDueDate !== data.payableAmount;

  return (
    <section className="card">
      <div className="card-head">
        <h2>Bill summary</h2>
        {data.consumerName && <span className="muted">{data.consumerName}</span>}
      </div>

      {meta?.warnings?.length > 0 && (
        <div className="alert alert-warn">
          <strong>Some numbers didn't add up. Check them against the bill:</strong>
          <ul>
            {meta.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="due">
        <span className="due-label">
          {hasRebate ? `Pay by ${prettyDate(data.dueDate)}` : "Amount payable"}
        </span>
        <span className="due-amount">{money(hasRebate ? data.payableByDueDate : data.payableAmount)}</span>
        {hasRebate && (
          <span className="hint">
            {money(data.payableAmount)} after the due date ({money(data.dueDateRebate)} rebate for paying on time)
          </span>
        )}
      </div>

      <dl className="facts">
        <div><dt>Units billed</dt><dd>{units(data.netBilledUnits)}</dd></div>
        <div><dt>Energy rate</dt><dd>{rate ? `${money(rate)}/unit` : "—"}</dd></div>
        <div><dt>Bill date</dt><dd>{prettyDate(data.billDate)}</dd></div>
        <div><dt>Account</dt><dd>{data.accountNumber || "—"}</dd></div>
      </dl>

      {meta && <p className="read-by">Read by {meta.provider} ({meta.model})</p>}
    </section>
  );
}

export default BillDetails;
