// Ported from the Vite prototype's src/data/mockData.js formatting helpers.
// Accepts plain numbers, strings, or Prisma Decimal instances interchangeably.
type Numberish = number | string | null | undefined | { toString(): string };

function toNumber(v: Numberish): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v.toString());
  return Number.isFinite(n) ? n : 0;
}

export function bdCurrency(value: Numberish, { short = false }: { short?: boolean } = {}) {
  const num = toNumber(value);
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  if (short && abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function numFmt(value: Numberish, decimals = 1) {
  const num = toNumber(value);
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

export function hoursFmt(value: Numberish) {
  return `${numFmt(value)}h`;
}

export { toNumber };
