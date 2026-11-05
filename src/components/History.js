import { money, prettyDate, units } from "../lib/format";

function History({ history, currentBillDate }) {
  if (!history.length) return null;

  return (
    <section className="card">
      <h2>Saved months</h2>
      <ul className="history">
        {history.map((r) => (
          <li key={r.billIso} className={r.billDate === currentBillDate ? "is-current" : ""}>
            <div className="history-head">
              <strong>{prettyDate(r.billDate)}</strong>
              <span className="muted">{units(r.netBilledUnits)} units</span>
            </div>
            <div className="history-shares">
              <span>Ground {money(r.shares.ground)}</span>
              <span>First {money(r.shares.first)}</span>
              <span>Second {money(r.shares.second)}</span>
            </div>
            {r.carryOutUnits > 0 && (
              <span className="badge">{units(r.carryOutUnits)} units carried forward</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default History;
