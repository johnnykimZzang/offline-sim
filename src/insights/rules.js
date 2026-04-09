// ─────────────────────────────────────────────────────────────────────────────
// Insight rules — 룰 베이스 인사이트 엔진
//
// 각 룰은 (state, summary) 컨텍스트를 받아 trigger 여부와 메시지를 리턴한다.
// 새 룰 추가 시 이 배열에 push만 하면 된다.
//
// 향후 Phase 4에서 reason / impact / actions 구조로 확장 예정. 현재는 단순 메시지.
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
        };
      }
      return {
        severity: "good",
        text: `목표 초과 달성 (+₩${fmtW(-gap)}, ${fmtPct((-gap / target) * 100)})`,
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
        { name: "유입",     raw: entryPct,  hint: "외관·간판·사인 개선" },
        { name: "구매전환", raw: convPct,   hint: "접객·상품 구성 강화" },
        { name: "회원가입", raw: signupPct, hint: "결제 직전 가입 UX 개선" },
      ];
      const bottleneck = stages.reduce((a, b) => (b.raw < a.raw ? b : a));
      return {
        severity: bottleneck.raw < 15 ? "warn" : "info",
        text: `병목: ${bottleneck.name} ${fmtPct(bottleneck.raw)} — ${bottleneck.hint} 우선`,
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
        };
      }
      const wkndAvg = summary.wkndStats.count ? summary.wkndStats.revenue / summary.wkndStats.count : 0;
      const wkdyAvg = summary.wkdyStats.count ? summary.wkdyStats.revenue / summary.wkdyStats.count : 0;
      if (wkndAvg > wkdyAvg * 1.3 && wkdyAvg > 0) {
        return {
          severity: "info",
          text: `주말 일평균 ₩${fmtW(wkndAvg)} (평일 대비 ${(wkndAvg / wkdyAvg).toFixed(1)}배)`,
        };
      }
      const fitConvPct = summary.totalFittingVisitors > 0
        ? summary.totalFittingPurch / summary.totalFittingVisitors * 100
        : 0;
      return {
        severity: "info",
        text: `피팅 전환율 ${fmtPct(fitConvPct)} — ${fitConvPct > 40 ? "우수" : "체험 동선 점검"}`,
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
