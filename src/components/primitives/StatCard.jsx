import { T } from "../../design/tokens";

const PALETTE = {
  default: { bg: T.bgSurface, border: T.borderDefault, color: T.textPrimary },
  accent:  { bg: T.accentDim, border: T.accentBorder,  color: T.accent      },
  warn:    { bg: T.warnDim,   border: T.warnBorder,    color: T.warn        },
  info:    { bg: "rgba(96, 165, 250, 0.08)", border: "rgba(96, 165, 250, 0.22)", color: "#60a5fa" },
};

// size: "hero" | "primary" | "secondary"
const SIZE_STYLE = {
  hero:      { padding: "12px 16px", valueSize: 22, labelSize: 11, subSize: 11 },
  primary:   { padding: "8px 10px",  valueSize: 14, labelSize: 11, subSize: 10 },
  secondary: { padding: "7px 10px",  valueSize: 12, labelSize: 10, subSize: 10 },
};

export default function StatCard({ label, value, sub, tone = "default", flex = 1, minWidth = 120, size = "primary" }) {
  const p = PALETTE[tone] || PALETTE.default;
  const s = SIZE_STYLE[size] || SIZE_STYLE.primary;
  return (
    <div style={{
      background: p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: 10,
      padding: s.padding,
      flex,
      minWidth,
      boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
    }}>
      {/* Label — Inter semi-bold, textSecondary로 value와 시각적 위계 구분 */}
      <div style={{
        fontSize: s.labelSize,
        fontWeight: 600,
        color: T.textSecondary,
        fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
        letterSpacing: "0.01em",
        lineHeight: 1.2,
        marginBottom: size === "hero" ? 6 : 4,
      }}>{label}</div>
      <div style={{
        fontSize: s.valueSize,
        fontWeight: 500,
        color: p.color,
        fontFamily: "'Source Code Pro', monospace",
        lineHeight: 1.05,
      }}>{value}</div>
      {sub && (
        <div style={{
          fontSize: s.subSize,
          color: T.textFaint,
          marginTop: 3,
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.3,
        }}>{sub}</div>
      )}
    </div>
  );
}
