import { T } from "../../design/tokens";
import { fmt } from "../../lib/format";

export default function FunnelBar({ label, value, maxValue, prevValue, color }) {
  const pct  = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const drop = prevValue && prevValue > 0
    ? ((1 - value / prevValue) * 100).toFixed(1)
    : null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Inter', sans-serif" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {drop && (
            <span style={{
              fontFamily: "'Source Code Pro', monospace",
              fontSize: 9, color: T.warn,
              background: T.warnDim,
              border: `1px solid ${T.warnBorder}`,
              borderRadius: 4, padding: "1px 5px",
            }}>−{drop}%</span>
          )}
          <span style={{
            fontFamily: "'Source Code Pro', monospace",
            fontSize: 14, fontWeight: 500,
            color: color || T.textPrimary,
          }}>{fmt(value)}</span>
        </div>
      </div>
      <div style={{ height: 5, background: T.borderSubtle, borderRadius: 9999, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color || T.accent,
          borderRadius: 9999,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}
