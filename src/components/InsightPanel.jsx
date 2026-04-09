import { T } from "../design/tokens";
import CodeLabel from "./primitives/CodeLabel";

const PALETTE = {
  good: { bg: T.accentDim, border: T.accentBorder, color: T.accent, mark: "▲" },
  warn: { bg: T.warnDim,   border: T.warnBorder,   color: T.warn,   mark: "▼" },
  info: {
    bg:     "rgba(96, 165, 250, 0.08)",
    border: "rgba(96, 165, 250, 0.22)",
    color:  "#60a5fa",
    mark:   "•",
  },
};

export default function InsightPanel({ insights }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ marginBottom: 8 }}>
        <CodeLabel>인사이트 / 다음 우선 개선 포인트</CodeLabel>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {insights.map((ins, i) => {
          const p = PALETTE[ins.severity] || PALETTE.info;
          return (
            <div key={i} style={{
              flex: 1, minWidth: 200,
              padding: "11px 13px",
              background: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}>
              <span style={{ fontSize: 11, marginTop: 1, flexShrink: 0, color: p.color }}>{p.mark}</span>
              <span style={{
                fontSize: 12, lineHeight: 1.5,
                fontFamily: "'Inter', sans-serif",
                color: p.color,
              }}>{ins.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
