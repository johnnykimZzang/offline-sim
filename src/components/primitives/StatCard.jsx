import { T } from "../../design/tokens";
import CodeLabel from "./CodeLabel";

const PALETTE = {
  default: { bg: T.bgSurface, border: T.borderDefault, color: T.textPrimary },
  accent:  { bg: T.accentDim, border: T.accentBorder,  color: T.accent      },
  warn:    { bg: T.warnDim,   border: T.warnBorder,    color: T.warn        },
  info:    { bg: "rgba(96, 165, 250, 0.08)", border: "rgba(96, 165, 250, 0.22)", color: "#60a5fa" },
};

export default function StatCard({ label, value, sub, tone = "default", flex = 1, minWidth = 120 }) {
  const p = PALETTE[tone] || PALETTE.default;
  return (
    <div style={{
      background: p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: 10,
      padding: "12px 14px",
      flex,
      minWidth,
    }}>
      <div style={{ marginBottom: 6 }}><CodeLabel>{label}</CodeLabel></div>
      <div style={{
        fontSize: 18,
        fontWeight: 500,
        color: p.color,
        fontFamily: "'Source Code Pro', monospace",
        lineHeight: 1.05,
      }}>{value}</div>
      {sub && (
        <div style={{
          fontSize: 11, color: T.textMuted, marginTop: 5,
          fontFamily: "'Inter', sans-serif", lineHeight: 1.3,
        }}>{sub}</div>
      )}
    </div>
  );
}
