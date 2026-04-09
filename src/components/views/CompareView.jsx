import { T } from "../../design/tokens";
import { fmt, fmtW } from "../../lib/format";
import CodeLabel from "../primitives/CodeLabel";

/** 평일 vs 주말 비교 (단일 시나리오 내) */
export default function CompareView({ summary }) {
  const wkndAvg = summary.wkndStats.count ? summary.wkndStats.revenue / summary.wkndStats.count : 0;
  const wkdyAvg = summary.wkdyStats.count ? summary.wkdyStats.revenue / summary.wkdyStats.count : 0;

  const buildRows = (stats) => [
    { l: "총 매출",   v: `₩${fmtW(stats.revenue)}` },
    { l: "일평균",    v: `₩${fmtW(stats.count ? stats.revenue / stats.count : 0)}` },
    { l: "유입",      v: `${fmt(stats.visitors)}명` },
    { l: "구매",      v: `${fmt(stats.purch)}건` },
    { l: "회원가입", v: `${fmt(stats.signups)}명` },
  ];

  return (
    <div style={{ background: T.bgSurface, border: `1px solid ${T.borderDefault}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 18 }}>평일 vs 주말 비교</div>

      <div style={{ display: "flex", gap: 12 }}>
        {/* 평일 */}
        <div style={{
          flex: 1, padding: 18,
          background: T.bgDeep,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: 10,
        }}>
          <CodeLabel>평일 ({summary.wkdyStats.count}일)</CodeLabel>
          <div style={{ marginTop: 14 }}>
            {buildRows(summary.wkdyStats).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{row.l}</span>
                <span style={{ fontSize: 13, color: T.textPrimary, fontFamily: "'Source Code Pro', monospace", fontWeight: 500 }}>
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 주말 */}
        <div style={{
          flex: 1, padding: 18,
          background: T.accentDim,
          border: `1px solid ${T.accentBorder}`,
          borderRadius: 10,
        }}>
          <CodeLabel color={T.accent}>주말 ({summary.wkndStats.count}일)</CodeLabel>
          <div style={{ marginTop: 14 }}>
            {buildRows(summary.wkndStats).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: T.textSecondary }}>{row.l}</span>
                <span style={{ fontSize: 13, color: T.accent, fontFamily: "'Source Code Pro', monospace", fontWeight: 500 }}>
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14, padding: "10px 14px",
        background: T.bgDeep,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <CodeLabel>주말 매출 배수</CodeLabel>
        <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 14, color: T.accent, fontWeight: 500 }}>
          {wkdyAvg > 0 ? `${(wkndAvg / wkdyAvg).toFixed(2)}x` : "—"}
        </span>
      </div>
    </div>
  );
}
