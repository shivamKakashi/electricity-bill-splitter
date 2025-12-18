function BillDetails({ data }) {
  return (
    <div className="card">
      <h3>Bill Summary</h3>

      <div className="row"><span>Name</span><span>{data.consumerName}</span></div>
      <div className="row"><span>Units</span><span>{data.netBilledUnits}</span></div>
      <div className="row"><span>Due Date</span><span>{data.dueDate}</span></div>

      <hr />

      <div className="row highlight">
        <span>Payable</span>
        <span>₹{data.payableByDueDate}</span>
      </div>
    </div>
  );
}

export default BillDetails;
