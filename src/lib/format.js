// ─────────────────────────────────────────────────────────────────────────────
// Number formatters
// ─────────────────────────────────────────────────────────────────────────────

export const fmt = (n) => Math.round(n).toLocaleString("ko-KR");

export const fmtW = (n) => {
  if (!isFinite(n)) return "0";
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + "억";
  if (n >= 10_000)      return (n / 10_000).toFixed(0) + "만";
  return fmt(n);
};

export const fmtPct = (n, d = 1) => (isFinite(n) ? n.toFixed(d) : "0") + "%";

export const fmtDelta = (n, d = 0) => {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(d)}`;
};
