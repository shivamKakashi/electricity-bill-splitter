



function FloorCalculationSummary({ bill, floors }) {


    const totalUnits = Number(bill.netBilledUnits);
    const rate = totalUnits > 0 ? Number(bill.energyCharges) / totalUnits : 0;


  const groundUnits = Number(floors.ground) || 0;
  const firstUnits = Number(floors.first) || 0;
  const secondUnits = Number(floors.second) || 0;

  const totalFloorUnits =
    groundUnits + firstUnits + secondUnits;

    const waterUnits = Math.max(
    Number(bill.netBilledUnits) - totalFloorUnits,
    0
    );
  const waterCost = waterUnits * rate;
  const waterShare = waterCost / 3;


  const taxes = Number(bill.demandCharges) + Number(bill.electricityDuty) + Number(bill.excessDemandPenalty) + Number(bill.miscCharges) ;
  const taxShare = taxes / 3;

    const baseFloorCost = (units) =>
    units * rate + waterShare + taxShare;

  const groundBase = baseFloorCost(groundUnits);
  const firstBase = baseFloorCost(firstUnits);
  const secondBase = baseFloorCost(secondUnits);

    const baseTotal =
    groundBase + firstBase + secondBase;



    const payableAmount = Number(bill.payableAmount);

  const overcharge = Math.max(
    baseTotal - payableAmount,
    0
  );

  const discountUnit = overcharge / 4;

  const discounts = {
    ground: discountUnit,
    first: discountUnit,
    second: discountUnit * 2,
  };

  const finalGround = groundBase - discounts.ground;
  const finalFirst = firstBase - discounts.first;
  const finalSecond = secondBase - discounts.second;


  return (
    <div className="card">
      <h3>Per Floor Calculation</h3>

      <div className="row">
        <span>Rate / Unit</span>
        <span>₹{rate.toFixed(2)}</span>
      </div>

      <div className="row">
        <span>Water Units (Central)</span>
        <span>{waterUnits.toFixed(2)}</span>
      </div>
      <div className="row">
        <span>Water Cost / Floor</span>
        <span>{waterShare.toFixed(2)}</span>
      </div>
      <div className="row">
        <span>Taxes / Floor</span>
        <span>{taxShare.toFixed(2)}</span>
      </div>
        
        <div className="row">
        <span>Total Discount Applied</span>
        <span>₹{overcharge.toFixed(2)}</span>
      </div>

      <hr />

      <div className="floor-row">
        <strong>Ground Floor</strong>
        <span>₹{finalGround.toFixed(2)}</span>
      </div>

      <div className="floor-row">
        <strong>First Floor</strong>
        <span>₹{finalFirst.toFixed(2)}</span>
      </div>

      <div className="floor-row">
        <strong>Second Floor</strong>
        <span>₹{finalSecond.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default FloorCalculationSummary;
