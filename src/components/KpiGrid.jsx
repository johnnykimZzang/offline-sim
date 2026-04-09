import { fmt, fmtW, fmtPct } from "../lib/format";
import StatCard from "./primitives/StatCard";

export default function KpiGrid({ summary, targetRevenue }) {
  const realConvPct = summary.totalVisitors > 0
    ? (summary.totalPurchasers / summary.totalVisitors) * 100
    : 0;
  const fitConvPct = summary.totalFittingVisitors > 0
    ? (summary.totalFittingPurch / summary.totalFittingVisitors) * 100
    : 0;
  const storyPct = summary.totalVisitors > 0
    ? (summary.totalStories / summary.totalVisitors) * 100
    : 0;

  const tone1 =
      summary.totalRevenue >= targetRevenue ? "accent"
    : summary.totalRevenue < targetRevenue * 0.7 ? "warn"
    : "default";

  return (
    <>
      {/* Row 1: 매출 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <StatCard
          label="월 매출"
          value={`₩${fmtW(summary.totalRevenue)}`}
          sub={`일 평균 ₩${fmtW(summary.avgDaily)}`}
          tone={tone1}
        />
        <StatCard
          label="총 구매 건수"
          value={`${fmt(summary.totalPurchasers)}건`}
          sub={`일 평균 ${Math.round(summary.avgPurch)}건`}
        />
        <StatCard
          label="객단가"
          value={`₩${fmt(summary.effectiveAOV)}`}
          sub="자동 산정"
        />
        <StatCard
          label="총 유입"
          value={`${fmt(summary.totalVisitors)}명`}
          sub={`실 전환 ${fmtPct(realConvPct)}`}
        />
      </div>

      {/* Row 2: CRM / 체험 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard
          label="회원가입 수"
          value={`${fmt(summary.totalSignups)}명`}
          sub={`수신동의 ${fmt(summary.totalOptIns)}명`}
          tone="accent"
        />
        <StatCard
          label="피팅 구매율"
          value={fmtPct(fitConvPct)}
          sub={`피팅 ${fmt(summary.totalFittingVisitors)}명`}
        />
        <StatCard
          label="스토리 업로드"
          value={`${fmt(summary.totalStories)}건`}
          sub={`방문 대비 ${fmtPct(storyPct)}`}
        />
        <StatCard
          label="온라인 재구매"
          value={`₩${fmtW(summary.totalCrmRevenue)}`}
          sub={`${fmt(summary.totalOnlineRepurch)}명 예상`}
          tone="accent"
        />
      </div>
    </>
  );
}
