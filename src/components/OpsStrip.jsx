import { T } from "../design/tokens";

function StatCell({ label, value, sub, color }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      padding: "6px 12px",
      borderRight: `1px solid ${T.borderSubtle}`,
      minWidth: 0,
      flex: 1,
    }}>
      <span style={{
        fontSize: 10,
        color: T.textMuted,
        fontFamily: "'Source Code Pro', monospace",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontFamily: "'Source Code Pro', monospace",
        fontWeight: 500,
        color: color ?? T.textPrimary,
        whiteSpace: "nowrap",
      }}>{value}</span>
      {sub && (
        <span style={{
          fontSize: 10,
          color: T.textFaint,
          fontFamily: "'Inter', sans-serif",
          whiteSpace: "nowrap",
        }}>{sub}</span>
      )}
    </div>
  );
}

export default function OpsStrip({ summary }) {
  const {
    avgDailyVisitors = 0,
    avgConcurrentPerHour = 0,
    peakConcurrentPerHour = 0,
    avgDailyReturnVisitors = 0,
    openCount = 0,
  } = summary;

  const fmt = (n) => Math.round(n).toLocaleString("ko-KR");
  const fmt1 = (n) => n.toFixed(1);

  return (
    <div style={{
      display: "flex",
      alignItems: "stretch",
      background: T.bgDeep,
      border: `1px solid ${T.borderSubtle}`,
      borderRadius: 8,
      margin: "8px 0",
      overflow: "hidden",
    }}>
      {/* 레이블 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRight: `1px solid ${T.borderSubtle}`,
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 9,
          fontFamily: "'Source Code Pro', monospace",
          color: T.info,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
          writingMode: "horizontal-tb",
          whiteSpace: "nowrap",
        }}>운영 현황</span>
      </div>

      {/* 지표 셀들 */}
      <div style={{ display: "flex", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
        <StatCell
          label="일 평균 유입"
          value={`${fmt(avgDailyVisitors)}명`}
          sub={`월 ${fmt(summary.totalVisitors ?? 0)}명 합산`}
        />
        <StatCell
          label="시간당 체류 (평균)"
          value={`${fmt1(avgConcurrentPerHour)}명`}
          sub="리틀의 법칙 기준"
        />
        <StatCell
          label="시간당 체류 (피크 2시간)"
          value={`${fmt1(peakConcurrentPerHour)}명`}
          sub="피크 집중도 × 체류시간"
          color={peakConcurrentPerHour > avgConcurrentPerHour * 2 ? T.warning : undefined}
        />
        <StatCell
          label="일 재방문 고객"
          value={`${fmt(avgDailyReturnVisitors)}명`}
          sub={`재방문율 ${Math.round((avgDailyReturnVisitors / Math.max(1, avgDailyVisitors)) * 100)}%`}
          color={T.purple}
        />
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "6px 12px",
          minWidth: 0,
          flex: 1,
        }}>
          <span style={{
            fontSize: 10,
            color: T.textMuted,
            fontFamily: "'Source Code Pro', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}>영업 가동일</span>
          <span style={{
            fontSize: 13,
            fontFamily: "'Source Code Pro', monospace",
            fontWeight: 500,
            color: T.textPrimary,
            whiteSpace: "nowrap",
          }}>{openCount}일</span>
          <span style={{
            fontSize: 10,
            color: T.textFaint,
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap",
          }}>이번 달 실제 영업</span>
        </div>
      </div>
    </div>
  );
}
