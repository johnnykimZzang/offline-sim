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

function scrollToSlider(targetControl) {
  if (!targetControl) return;
  const [domain, field] = targetControl.split(".");
  const el = document.getElementById(`slider-${domain}-${field}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.style.background = "rgba(62, 207, 142, 0.18)";
  el.style.transition = "background 0.2s";
  setTimeout(() => { el.style.background = ""; }, 1200);
}

export default function InsightPanel({ insights }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ marginBottom: 8 }}>
        <CodeLabel>인사이트 / 다음 우선 개선 포인트</CodeLabel>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {insights.map((ins, i) => {
          const p = PALETTE[ins.severity] || PALETTE.info;
          return (
            <div key={i} style={{
              flex: 1, minWidth: 200,
              padding: "8px 10px",
              background: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: 8,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: ins.action ? 6 : 0 }}>
                <span style={{ fontSize: 11, marginTop: 1, flexShrink: 0, color: p.color }}>{p.mark}</span>
                <span style={{
                  fontSize: 12, lineHeight: 1.5,
                  fontFamily: "'Inter', sans-serif",
                  color: p.color,
                }}>{ins.text}</span>
              </div>

              {/* Action 버튼 */}
              {ins.action && ins.targetControl && (
                <button
                  onClick={() => scrollToSlider(ins.targetControl)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 2,
                    marginLeft: 19,
                    background: "transparent",
                    border: `1px solid ${p.border}`,
                    borderRadius: 5,
                    padding: "3px 9px",
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: "'Inter', sans-serif",
                    color: p.color,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${p.color}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  title="해당 슬라이더로 이동"
                >
                  <span style={{ fontSize: 10 }}>→</span>
                  {ins.action}
                  {ins.suggestedDelta && (
                    <span style={{ opacity: 0.7, fontFamily: "'Source Code Pro', monospace", fontSize: 10 }}>
                      {ins.suggestedDelta}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
