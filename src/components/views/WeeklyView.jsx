import { T } from "../../design/tokens";
import { fmt, fmtW } from "../../lib/format";

export default function WeeklyView({ summary }) {
  const maxW = Math.max(...summary.weeks.map(w => w.revenue), 1);

  return (
    <div style={{ background: T.bgSurface, border: `1px solid ${T.borderDefault}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 18 }}>주간 매출 요약</div>
      {summary.weeks.map((w, i) => {
        const openCount = w.days.filter(d => d.isOpen).length;
        return (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <div>
                <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 10, color: T.textMuted, marginRight: 8 }}>W{i + 1}</span>
                <span style={{ fontSize: 12, color: T.textSecondary }}>{w.label}</span>
              </div>
              <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 14, fontWeight: 500 }}>₩{fmtW(w.revenue)}</span>
            </div>
            <div style={{ height: 5, background: T.borderSubtle, borderRadius: 9999, overflow: "hidden" }}>
              <div style={{
                width: `${(w.revenue / maxW) * 100}%`, height: "100%",
                background: `linear-gradient(90deg, ${T.accent}, ${T.accent}77)`,
                borderRadius: 9999, transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{
              display: "flex", gap: 16, marginTop: 5,
              fontFamily: "'Source Code Pro', monospace", fontSize: 10, color: T.textMuted,
            }}>
              <span>유입 {fmt(w.visitors)}</span>
              <span>구매 {fmt(w.purchasers)}</span>
              <span>가입 {fmt(w.signups)}</span>
              <span>일평균 ₩{fmtW(openCount ? w.revenue / openCount : 0)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
