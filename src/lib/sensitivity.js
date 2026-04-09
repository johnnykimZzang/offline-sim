// ─────────────────────────────────────────────────────────────────────────────
// Sensitivity Analysis — 각 슬라이더를 ±δ% 섭동시켜 월 매출 변화율 측정
//
// 결과는 tornado chart 형태로 정렬:
//   [{ domain, field, label, baseValue, upRevenue, downRevenue, elasticity, impact }]
//
// impact = max(|up%|, |down%|) — 정렬 기준
// elasticity = (%Δrevenue) / (%Δinput) — 탄력성 (해석 가능성)
//
// React 의존성 0. 순수 함수.
// ─────────────────────────────────────────────────────────────────────────────

import { simulateMonth, computeSummary } from "./simulator";

// 민감도 측정 대상 (한국어 라벨 + 도메인 경로)
// closedDows, meta, goal 등 비수치/목표 변수는 제외.
const TARGETS = [
  // demand
  { domain: "demand",     field: "footTraffic",         label: "유동인구" },
  { domain: "demand",     field: "storeEntryRate",      label: "매장 유입률" },
  { domain: "demand",     field: "weekendWeight",       label: "주말 가중치" },
  { domain: "demand",     field: "touristRatio",        label: "관광객 비중" },

  // product
  { domain: "product",    field: "priceSingle",         label: "단품 가격" },
  { domain: "product",    field: "priceSet",            label: "세트 가격" },
  { domain: "product",    field: "priceHoodieSetup",    label: "후드 셋업 가격" },
  { domain: "product",    field: "setPurchaseRate",     label: "세트 구매율" },
  { domain: "product",    field: "hoodieSetShare",      label: "후드 셋업 비중" },
  { domain: "product",    field: "addonPurchaseRate",   label: "추가 구매율" },
  { domain: "product",    field: "addonPrice",          label: "추가 구매 단가" },

  // conversion
  { domain: "conversion", field: "purposeVisitRatio",   label: "목적형 방문 비율" },
  { domain: "conversion", field: "baseConvRate",        label: "일반 전환율" },
  { domain: "conversion", field: "purposeConvRate",     label: "목적형 전환율" },
  { domain: "conversion", field: "companionRatio",      label: "동행 방문 비율" },
  { domain: "conversion", field: "companionDecisionRate", label: "동행 결정자 비율" },

  // fitting
  { domain: "fitting",    field: "avgStayMinutes",      label: "평균 체류 시간" },
  { domain: "fitting",    field: "roomCount",           label: "피팅룸 수" },
  { domain: "fitting",    field: "useRate",             label: "피팅룸 이용률" },
  { domain: "fitting",    field: "purchaseRate",        label: "피팅 후 구매율" },

  // crm
  { domain: "crm",        field: "signupRate",          label: "회원가입률" },
  { domain: "crm",        field: "onlineRepurchaseRate", label: "온라인 재구매율" },
  { domain: "crm",        field: "repurchaseAOV",       label: "재구매 객단가" },

  // operations
  { domain: "operations", field: "staffCount",          label: "직원 수" },
  { domain: "operations", field: "staffCapacity",       label: "직원 1인 capacity" },
];

// 매출 측정 (메인 매출 + CRM 재구매 매출 포함 — 총 기여도)
function measureRevenue(state) {
  const monthData = simulateMonth(state, state.meta.selectedYear, state.meta.selectedMonth);
  const summary = computeSummary(monthData);
  return summary.totalRevenue + summary.totalCrmRevenue;
}

// 특정 도메인/필드에 새 값을 주입한 state 사본 생성
function patchState(state, domain, field, value) {
  return {
    ...state,
    [domain]: {
      ...state[domain],
      [field]: value,
    },
  };
}

/**
 * 민감도 분석 실행.
 * @param {object} state - 현재 시뮬레이터 상태
 * @param {number} deltaPct - 섭동 폭 (기본 10 = ±10%)
 * @returns {{ baseRevenue: number, results: Array, deltaPct: number }}
 */
export function runSensitivity(state, deltaPct = 10) {
  const baseRevenue = measureRevenue(state);
  if (baseRevenue <= 0) {
    return { baseRevenue: 0, results: [], deltaPct };
  }

  const results = TARGETS.map(({ domain, field, label }) => {
    const baseValue = state[domain][field];
    if (baseValue == null || baseValue === 0) {
      return { domain, field, label, baseValue, upRevenue: 0, downRevenue: 0, upPct: 0, downPct: 0, impact: 0, elasticity: 0 };
    }

    const delta = baseValue * (deltaPct / 100);

    // 정수형 필드(roomCount, staffCount) 보정
    const isInt = Number.isInteger(baseValue) && Math.abs(delta) < 1;
    const upVal   = isInt ? baseValue + 1 : baseValue + delta;
    const downVal = isInt ? Math.max(1, baseValue - 1) : Math.max(0, baseValue - delta);

    // 실제 적용된 % 변화 (정수 보정 시 deltaPct와 다를 수 있음)
    const upActualPct   = ((upVal   - baseValue) / baseValue) * 100;
    const downActualPct = ((downVal - baseValue) / baseValue) * 100;

    const upRevenue   = measureRevenue(patchState(state, domain, field, upVal));
    const downRevenue = measureRevenue(patchState(state, domain, field, downVal));

    const upPct   = ((upRevenue   - baseRevenue) / baseRevenue) * 100;
    const downPct = ((downRevenue - baseRevenue) / baseRevenue) * 100;

    // 탄력성 = %Δrevenue / %Δinput (상승 방향 기준)
    const elasticity = upActualPct !== 0 ? upPct / upActualPct : 0;
    const impact = Math.max(Math.abs(upPct), Math.abs(downPct));

    return {
      domain, field, label,
      baseValue,
      upValue: upVal,
      downValue: downVal,
      upRevenue, downRevenue,
      upPct, downPct,
      impact,
      elasticity,
    };
  });

  // impact 내림차순
  results.sort((a, b) => b.impact - a.impact);

  return { baseRevenue, results, deltaPct };
}
