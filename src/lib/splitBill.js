export const FLOORS = [
  ["ground", "Ground floor"],
  ["first", "First floor"],
  ["second", "Second floor"],
];

const num = (value) => Number(value) || 0;
const sum = (values) => values.reduce((a, b) => a + b, 0);

export function canSplit(bill) {
  return num(bill.energyCharges) > 0 && num(bill.netBilledUnits) > 0 && num(bill.payableAmount) > 0;
}

// Splits the bill between the three floors.
// - Each floor pays its own meter's units at the bill's energy rate.
// - Units the main meter billed that no floor meter recorded are the shared
//   water pump, split equally, after first using up any units carried in.
// - When the floor meters add up to more than the main meter, there is no
//   water this month and the extra units are carried to the next bill.
// - Taxes and charges are split equally; any amount above what's payable is
//   given back 1:1:2 (ground:first:second).
export function splitBill(bill, floors, carryInUnits) {
  const units = num(bill.netBilledUnits);
  const energy = num(bill.energyCharges);
  const rate = energy / units;

  const floorUnits = Object.fromEntries(FLOORS.map(([key]) => [key, Math.max(num(floors[key]), 0)]));
  const floorTotal = sum(Object.values(floorUnits));
  const carryIn = Math.max(num(carryInUnits), 0);

  const unmetered = Math.max(units - floorTotal, 0);
  const carryUsed = Math.min(carryIn, unmetered);
  const waterUnits = unmetered - carryUsed;
  const newExtraUnits = Math.max(floorTotal - units, 0);
  const carryOutUnits = carryIn - carryUsed + newExtraUnits;

  const taxes =
    num(bill.demandCharges) +
    num(bill.electricityDuty) +
    num(bill.excessDemandPenalty) +
    num(bill.fppaSurcharge) +
    num(bill.otherCharges);

  const waterShare = (waterUnits * rate) / 3;
  const taxShare = taxes / 3;

  // Compared with what the bill itself charges, so carried units don't count as overcharge.
  const overcharge = Math.max(energy + taxes - num(bill.payableAmount), 0);
  const discounts = { ground: overcharge / 4, first: overcharge / 4, second: overcharge / 2 };

  const floorsOut = FLOORS.map(([key, label]) => {
    const energyCost = floorUnits[key] * rate;
    return {
      key,
      label,
      units: floorUnits[key],
      energyCost,
      discount: discounts[key],
      share: energyCost + waterShare + taxShare - discounts[key],
    };
  });

  return {
    rate,
    taxes,
    floorTotal,
    carryIn,
    carryUsed,
    waterUnits,
    newExtraUnits,
    carryOutUnits,
    waterShare,
    taxShare,
    overcharge,
    floors: floorsOut,
    totalShares: sum(floorsOut.map((f) => f.share)),
  };
}
