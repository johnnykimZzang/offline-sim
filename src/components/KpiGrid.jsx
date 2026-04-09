import { fmt, fmtW, fmtPct } from "../lib/format";
import StatCard from "./primitives/StatCard";

// KPI tone 카테고리:
//   goal-tracked — 목표 대비율 기준 (≥100% accent, 80-100% default, <80% warn)
//   growth       — growth KPI, accent 고정 (회원/재구매 등 긍정 지표)
//   neutral      — default 고정, delta badge로만 변화 표현
function goalTone(actual, target) {
  if (actual >= target) return "accent";
  if (actual >= target * 0.8) return "default";
  return "warn";
}

export default function KpiGrid({ summary, targetRevenue }) {
  const realConvPct = summary.totalVisitors > 0
    ? (summary.totalPurchasers / summary.totalVisitors) * 100
    : 0;
  const fitConvPct = summary.totalFittingVisitors > 0
    ? (summary.totalFittingPurch / summary.totalFittingVisitors) * 100
    : 0;

  const revenueTone = goalTone(summary.totalRevenue, targetRevenue);
  const achievePct  = targetRevenue > 0 ? (summary.totalRevenue / targetRevenue) * 100 : 0;
  const achieveTone = goalTone(summary.totalRevenue, targetRevenue);

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Hero — 월 매출 */}
      <div style={{ marginBottom: 6 }}>
        <StatCard
          label="월 매출"
          value={`₩${fmtW(summary.totalRevenue)}`}
          sub={`일 평균 ₩${fmtW(summary.avgDaily)}`}
          tone={revenueTone}
          size="hero"
        />
      </div>

      {/* Primary 3 — 목표 달성률 / 회원가입 / 온라인 재구매 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <StatCard
          label="목표 달성률"
          value={`${fmtPct(achievePct, 1)}`}
          sub={`목표 ₩${fmtW(targetRevenue)}`}
          tone={achieveTone}
          size="primary"
        />
        <StatCard
          label="회원가입 수"
          value={`${fmt(summary.totalSignups)}명`}
          sub={`수신동의 ${fmt(summary.totalOptIns)}명`}
          tone="accent"
          size="primary"
        />
        <StatCard
          label="온라인 재구매"
          value={`₩${fmtW(summary.totalCrmRevenue)}`}
          sub={`${fmt(summary.totalOnlineRepurch)}명 예상`}
          tone="accent"
          size="primary"
        />
      </div>

      {/* Secondary 4 — neutral 지표 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 0, flexWrap: "wrap" }}>
        <StatCard
          label="총 구매 건수"
          value={`${fmt(summary.totalPurchasers)}건`}
          sub={`일 평균 ${Math.round(summary.avgPurch)}건`}
          size="secondary"
        />
        <StatCard
          label="객단가"
          value={`₩${fmt(summary.effectiveAOV)}`}
          sub="자동 산정"
          size="secondary"
        />
        <StatCard
          label="총 유입"
          value={`${fmt(summary.totalVisitors)}명`}
          sub={`실 전환 ${fmtPct(realConvPct)}`}
          size="secondary"
        />
        <StatCard
          label="피팅 구매율"
          value={fmtPct(fitConvPct)}
          sub={`피팅 ${fmt(summary.totalFittingVisitors)}명`}
          size="secondary"
        />
      </div>
    </div>
  );
}
