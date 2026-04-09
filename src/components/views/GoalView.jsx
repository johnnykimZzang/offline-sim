import { T } from "../../design/tokens";
import { fmt, fmtW, fmtPct } from "../../lib/format";
import CodeLabel from "../primitives/CodeLabel";

export default function GoalView({ summary, state, goalReversal }) {
  const target = state.goal.targetRevenue;

  const rows = [
    { label: "필요 구매 건수",   req: goalReversal.requiredPurchases, cur: summary.totalPurchasers, unit: "건" },
    { label: "필요 유입",         req: goalReversal.requiredVisitors,  cur: summary.totalVisitors,   unit: "명" },
    { label: "필요 유동인구",     req: goalReversal.requiredFoot,      cur: summary.totalFoot,       unit: "명" },
    { label: "필요 회원가입",     req: goalReversal.requiredSignups,   cur: summary.totalSignups,    unit: "명" },
    { label: "필요 CRM 확보",     req: goalReversal.requiredCRM,       cur: summary.totalOptIns,     unit: "명" },
    { label: "필요 스토리 업로드", req: goalReversal.requiredStories,   cur: summary.totalStories,    unit: "건" },
  ];

  return (
    <div style={{ background: T.bgSurface, border: `1px solid ${T.borderDefault}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>목표 역산</div>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 18 }}>
        목표 매출 달성에 필요한 단계별 수치 (현재 시뮬레이션 기준)
      </div>

      <div style={{
        background: T.bgDeep,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: 8,
        padding: "14px 16px",
        marginBottom: 16,
      }}>
        <CodeLabel>월 매출 목표</CodeLabel>
        <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 24, fontFamily: "'Source Code Pro', monospace", fontWeight: 500, color: T.accent }}>
            ₩{fmtW(target)}
          </span>
          <span style={{ fontSize: 12, color: T.textMuted }}>
            현재 ₩{fmtW(summary.totalRevenue)} ({fmtPct((summary.totalRevenue / target) * 100, 0)})
          </span>
        </div>
      </div>

      {rows.map((row, i) => {
        const gap = row.req - row.cur;
        const ratio = row.req > 0 ? row.cur / row.req : 0;
        const ok = ratio >= 1;
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: T.textSecondary }}>{row.label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, color: T.textMuted }}>
                  {fmt(row.cur)} / {fmt(row.req)}{row.unit}
                </span>
                <span style={{
                  fontFamily: "'Source Code Pro', monospace",
                  fontSize: 10,
                  color: ok ? T.accent : T.warn,
                  background: ok ? T.accentDim : T.warnDim,
                  border: `1px solid ${ok ? T.accentBorder : T.warnBorder}`,
                  borderRadius: 4,
                  padding: "1px 6px",
                }}>
                  {ok ? "+" : "−"}{fmt(Math.abs(gap))}{row.unit}
                </span>
              </div>
            </div>
            <div style={{ height: 4, background: T.borderSubtle, borderRadius: 9999, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(ratio * 100, 100)}%`,
                height: "100%",
                background: ok ? T.accent : T.warn,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
