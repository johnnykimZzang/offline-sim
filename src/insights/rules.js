// ─────────────────────────────────────────────────────────────────────────────
// Insight rules — 룰 베이스 인사이트 엔진
//
// 각 룰은 (state, summary) 컨텍스트를 받아 trigger 여부와 결과를 리턴한다.
// 새 룰 추가 시 이 배열에 push만 하면 된다.
//
// 출력 구조:
//   { severity, text, reason?, action?, targetControl?, suggestedDelta?, impact? }
//
// targetControl: "domain.field" 형태. InsightPanel에서 슬라이더로 이동하는 데 사용.
// suggestedDelta: "+10%" 같은 제안 변화량 (문자열).
// impact: "+4.2%" 같은 예상 매출 영향 (문자열).
// ─────────────────────────────────────────────────────────────────────────────

import { fmtW, fmtPct } from "../lib/format";

export const rules = [
  // ── 매출 vs 목표 ───────────────────────────────────────────────────────
  {
    id: "revenue-vs-target",
    evaluate: ({ state, summary }) => {
      const target = state.goal.targetRevenue;
      const gap = target - summary.totalRevenue;
      if (gap > 0) {
        const needPerDay = Math.ceil(gap / Math.max(1, summary.openCount) / Math.max(1, summary.effectiveAOV));
        return {
          severity: "warn",
          text: `목표 ₩${fmtW(target)} 대비 ${fmtW(gap)}원 부족 — 일 ${needPerDay}건 추가 필요`,
          reason: `현재 예측 매출이 목표보다 ₩${fmtW(gap)} 낮습니다.`,
          action: "유동인구를 우선 늘려보세요",
          targetControl: "demand.footTraffic",
          suggestedDelta: "+10%",
        };
      }
      return {
        severity: "good",
        text: `목표 초과 달성 (+₩${fmtW(-gap)}, ${fmtPct((-gap / target) * 100)})`,
        reason: "현재 시나리오에서 목표를 초과 달성 중입니다.",
      };
    },
  },

  // ── 병목 단계 식별 ─────────────────────────────────────────────────────
  {
    id: "bottleneck",
    evaluate: ({ summary }) => {
      const entryPct  = summary.totalFoot > 0       ? summary.totalVisitors    / summary.totalFoot     * 100 : 0;
      const convPct   = summary.totalVisitors > 0   ? summary.totalPurchasers  / summary.totalVisitors * 100 : 0;
      const signupPct = summary.totalPurchasers > 0 ? summary.totalSignups     / summary.totalPurchasers * 100 : 0;

      const stages = [
        { name: "유입",     raw: entryPct,  hint: "외관·간판·사인 개선", control: "demand.storeEntryRate", delta: "+2%p" },
        { name: "구매전환", raw: convPct,   hint: "접객·상품 구성 강화",   control: "conversion.baseConvRate", delta: "+5%p" },
        { name: "회원가입", raw: signupPct, hint: "결제 직전 가입 UX 개선", control: "crm.signupRate", delta: "+10%p" },
      ];
      const bottleneck = stages.reduce((a, b) => (b.raw < a.raw ? b : a));
      return {
        severity: bottleneck.raw < 15 ? "warn" : "info",
        text: `병목: ${bottleneck.name} ${fmtPct(bottleneck.raw)} — ${bottleneck.hint} 우선`,
        reason: `${bottleneck.name} 단계 전환율(${fmtPct(bottleneck.raw)})이 가장 낮습니다.`,
        action: `${bottleneck.name} 개선 — ${bottleneck.hint}`,
        targetControl: bottleneck.control,
        suggestedDelta: bottleneck.delta,
      };
    },
  },

  // ── 혼잡도 / 주말 비교 ─────────────────────────────────────────────────
  {
    id: "congestion-or-weekend",
    evaluate: ({ summary }) => {
      if (summary.congestionDays > 5) {
        return {
          severity: "warn",
          text: `혼잡일 ${summary.congestionDays}일 — 주말 인력 추가 검토 (전환율 손실)`,
          reason: `혼잡일이 ${summary.congestionDays}일로 많아 전환율이 낮아지고 있습니다.`,
          action: "직원 수를 늘려 혼잡도를 줄이세요",
          targetControl: "operations.staffCount",
          suggestedDelta: "+1명",
        };
      }
      const wkndAvg = summary.wkndStats.count ? summary.wkndStats.revenue / summary.wkndStats.count : 0;
      const wkdyAvg = summary.wkdyStats.count ? summary.wkdyStats.revenue / summary.wkdyStats.count : 0;
      if (wkndAvg > wkdyAvg * 1.3 && wkdyAvg > 0) {
        return {
          severity: "info",
          text: `주말 일평균 ₩${fmtW(wkndAvg)} (평일 대비 ${(wkndAvg / wkdyAvg).toFixed(1)}배)`,
          reason: "주말 매출이 평일보다 현저히 높습니다. 주말 집중 전략을 고려해보세요.",
        };
      }
      const fitConvPct = summary.totalFittingVisitors > 0
        ? summary.totalFittingPurch / summary.totalFittingVisitors * 100
        : 0;
      return {
        severity: "info",
        text: `피팅 전환율 ${fmtPct(fitConvPct)} — ${fitConvPct > 40 ? "우수" : "체험 동선 점검"}`,
        reason: fitConvPct > 40
          ? "피팅 후 구매 전환율이 양호합니다."
          : "피팅 후 구매율이 낮습니다. 피팅 환경 개선이 필요합니다.",
        action: fitConvPct <= 40 ? "피팅 후 구매율을 높이세요" : undefined,
        targetControl: fitConvPct <= 40 ? "fitting.purchaseRate" : undefined,
        suggestedDelta: fitConvPct <= 40 ? "+5%p" : undefined,
      };
    },
  },
];

// 룰 실행기
export function runInsights(context) {
  return rules
    .map(r => ({ id: r.id, ...r.evaluate(context) }))
    .filter(r => r.severity);
}
