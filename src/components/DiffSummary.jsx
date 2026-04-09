import { useMemo } from "react";
import { T } from "../design/tokens";

// 슬라이더 한국어 라벨 (sensitivity.js TARGETS와 동일)
const LABEL_MAP = {
  "demand.footTraffic":           "유동인구",
  "demand.storeEntryRate":        "매장 유입률",
  "demand.weekendWeight":         "주말 가중치",
  "demand.touristRatio":          "관광객 비중",
  "product.priceSingle":          "단품 가격",
  "product.priceSet":             "세트 가격",
  "product.priceHoodieSetup":     "후드 셋업 가격",
  "product.setPurchaseRate":      "세트 구매율",
  "product.hoodieSetShare":       "후드 셋업 비중",
  "product.addonPurchaseRate":    "추가 구매율",
  "product.addonPrice":           "추가 구매 단가",
  "conversion.purposeVisitRatio": "목적형 방문 비율",
  "conversion.baseConvRate":      "일반 전환율",
  "conversion.purposeConvRate":   "목적형 전환율",
  "conversion.companionRatio":    "동행 방문 비율",
  "conversion.companionDecisionRate": "동행 결정자 비율",
  "fitting.avgStayMinutes":       "체류 시간",
  "fitting.roomCount":            "피팅룸 수",
  "fitting.useRate":              "피팅룸 이용률",
  "fitting.purchaseRate":         "피팅 구매율",
  "crm.signupRate":               "회원가입률",
  "crm.onlineRepurchaseRate":     "온라인 재구매율",
  "crm.repurchaseAOV":            "재구매 객단가",
  "operations.staffCount":        "직원 수",
  "operations.staffCapacity":     "직원 capacity",
  "operations.operatingDays":     "월 영업일",
};

// 비교 대상 도메인+필드 목록
const COMPARE_KEYS = Object.keys(LABEL_MAP);

/**
 * DiffSummary — KPI 위 한 줄 요약
 *
 * props:
 *   currentState:    현재 state
 *   baselineState:   기준 state
 *   baselineLabel:   "현실 프리셋" | "기본 시나리오"
 *   currentRevenue:  현재 월매출
 *   baselineRevenue: 기준 월매출
 *   showToast:       "현재 기준 업데이트됨" 토스트 표시 여부
 */
export default function DiffSummary({
  currentState, baselineState, baselineLabel,
  currentRevenue, baselineRevenue,
  showToast,
}) {
  const diff = useMemo(() => {
    if (!currentState || !baselineState) return null;
    const changes = [];
    for (const key of COMPARE_KEYS) {
      const [domain, field] = key.split(".");
      const cur  = currentState[domain]?.[field];
      const base = baselineState[domain]?.[field];
      if (cur == null || base == null || cur === base || base === 0) continue;
      const deltaPct = ((cur - base) / Math.abs(base)) * 100;
      changes.push({ key, label: LABEL_MAP[key], deltaPct });
    }
    if (changes.length === 0) return null;
    // 절대 변화폭 큰 순
    changes.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
    return {
      top2: changes.slice(0, 2),
      restCount: Math.max(0, changes.length - 2),
    };
  }, [currentState, baselineState]);

  const revDelta    = currentRevenue - baselineRevenue;
  const revDeltaPct = baselineRevenue > 0 ? (revDelta / baselineRevenue) * 100 : 0;
  const hasChange   = diff && diff.top2.length > 0;

  if (!hasChange && Math.abs(revDeltaPct) < 0.1) return null;

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: T.bgSurface,
      border: `1px solid ${T.borderDefault}`,
      borderRadius: 8,
      padding: "5px 10px",
      marginBottom: 8,
      flexWrap: "wrap",
      gap: 6,
    }}>
      {/* 변경 요약 */}
      <span style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", color: T.textSecondary }}>
        {hasChange ? (
          <>
            {diff.top2.map((c, i) => (
              <span key={c.key}>
                {i > 0 && <span style={{ color: T.textFaint }}>, </span>}
                <span style={{ color: T.textPrimary }}>{c.label}</span>
                {" "}
                <span style={{ color: c.deltaPct >= 0 ? T.accent : T.warn }}>
                  {c.deltaPct >= 0 ? "+" : ""}{c.deltaPct.toFixed(0)}%
                </span>
              </span>
            ))}
            {diff.restCount > 0 && (
              <span style={{ color: T.textFaint }}> 외 {diff.restCount}개</span>
            )}
            {" · "}
            <span style={{ color: revDeltaPct >= 0 ? T.accent : T.warn, fontWeight: 500 }}>
              매출 {revDeltaPct >= 0 ? "+" : ""}{revDeltaPct.toFixed(1)}%
            </span>
            {" 예상"}
          </>
        ) : (
          <span style={{ color: T.textFaint }}>기준과 동일한 시나리오</span>
        )}
      </span>

      {/* 기준 표시 + 토스트 */}
      <span style={{ fontSize: 10, fontFamily: "'Source Code Pro', monospace", color: showToast ? T.accent : T.textFaint, transition: "color 0.3s" }}>
        {showToast ? "현재 기준 업데이트됨 ✓" : `기준: ${baselineLabel}`}
      </span>
    </div>
  );
}
