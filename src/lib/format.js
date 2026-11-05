const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const unitFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export const money = (value) => moneyFormat.format(Number(value) || 0);
export const units = (value) => unitFormat.format(Number(value) || 0);

// "09-OCT-2026" -> "9 Oct 2026"; anything else is shown as it came.
export const prettyDate = (value) => {
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(String(value || ""));
  if (!m) return value || "—";
  return `${Number(m[1])} ${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()} ${m[3]}`;
};
