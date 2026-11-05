import { splitBill } from "./splitBill";

// October 2026 bill
const bill = {
  netBilledUnits: 362, energyCharges: 2128, demandCharges: 165, electricityDuty: 108.64,
  excessDemandPenalty: 0, fppaSurcharge: -120.15, otherCharges: 0, payableAmount: 2281,
};
const round = (n) => Math.round(n * 100) / 100;

test("floors over the main meter: each pays its own units and the extra carries over", () => {
  const r = splitBill(bill, { ground: 115, first: 219.3, second: 43.9 }, 0);
  expect(round(r.newExtraUnits)).toBe(16.2);
  expect(round(r.carryOutUnits)).toBe(16.2);
  expect(r.waterUnits).toBe(0);
  // The bill is covered, plus the extra units' cost held for next month.
  expect(round(r.totalShares)).toBe(round(2281 + 16.2 * r.rate));
});

test("carried units come off next month's water first", () => {
  const r = splitBill(bill, { ground: 100, first: 200, second: 40 }, 16.2);
  expect(round(r.carryUsed)).toBe(16.2);
  expect(round(r.waterUnits)).toBe(5.8);
  expect(r.carryOutUnits).toBe(0);
});

test("carry bigger than this month's water keeps the rest for later", () => {
  const r = splitBill(bill, { ground: 120, first: 200, second: 40 }, 16.2);
  expect(round(r.carryUsed)).toBe(2);
  expect(round(r.carryOutUnits)).toBe(14.2);
});

test("normal month matches the original split", () => {
  const r = splitBill(bill, { ground: 100, first: 200, second: 40 }, 0);
  expect(round(r.waterUnits)).toBe(22);
  expect(round(r.totalShares)).toBe(2281);
});
