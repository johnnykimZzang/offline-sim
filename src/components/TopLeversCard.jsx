import { T } from "../design/tokens";
import CodeLabel from "./primitives/CodeLabel";

/**
 * TopLeversCard — 좌측 패널 상단 "지금 손댈 레버 Top 3"
 *
 * leverMap: { "domain.field": { rank, isTopLever, upPct } }
 * sensitivityTargets: [{ domain, field, label }] — sensitivity.js의 TARGETS와 동일 순서
 * 상위 3개를 추출해 표시. 클릭 시 해당 슬라이더로 스크롤 + 1.2초 soft glow.
 */

function scrollToSlider(domain, field) {
  const el = document.getElementById(`slider-${domain}-${field}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.style.background = "rgba(62, 207, 142, 0.18)";
  el.style.transition = "background 0.2s";
  setTimeout(() => {
    el.style.background = "";
  }, 1200);
}

export default function TopLeversCard({ leverMap }) {
  if (!leverMap || Object.keys(leverMap).length === 0) return null;

  // rank 1~3 추출
  const top3 = Object.entries(leverMap)
    .filter(([, v]) => v.rank <= 3)
    .sort(([, a], [, b]) => a.rank - b.rank)
    .map(([key, v]) => {
      const [domain, field] = key.split(".");
      return { key, domain, field, ...v };
    });

  if (top3.length === 0) return null;

  return (
    <div style={{
      background: T.bgSurface,
      border: `1px solid ${T.accentBorder}`,
      borderRadius: 10,
      padding: "10px 12px",
      marginBottom: 0,
    }}>
      <div style={{ marginBottom: 6 }}>
        <CodeLabel color={T.accent}>지금 손댈 레버</CodeLabel>
        <div style={{ fontSize: 10, color: T.textFaint, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
          현재 시나리오 기준 ±10% 예상 매출 영향도
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {top3.map(({ key, domain, field, rank, upPct }) => (
          <button
            key={key}
            onClick={() => scrollToSlider(domain, field)}
            title={`슬라이더로 이동`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "transparent",
              border: `1px solid ${T.borderDefault}`,
              borderRadius: 6,
              padding: "5px 8px",
              cursor: "pointer",
              transition: "border-color 0.12s, background 0.12s",
              textAlign: "left",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.accentBorder;
              e.currentTarget.style.background = T.accentDim;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.borderDefault;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{
                fontSize: 10,
                fontFamily: "'Source Code Pro', monospace",
                color: T.accent,
                fontWeight: 600,
                minWidth: 14,
              }}>{rank}</span>
              <LeverLabel domain={domain} field={field} />
            </div>
            <span style={{
              fontSize: 11,
              fontFamily: "'Source Code Pro', monospace",
              color: upPct >= 0 ? T.accent : T.warn,
              whiteSpace: "nowrap",
            }}>
              {upPct >= 0 ? "+" : ""}{upPct.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// domain + field를 한국어 라벨로 표시
// sensitivity.js의 TARGETS와 동일한 라벨을 인라인으로 관리
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
  "fitting.avgStayMinutes":       "평균 체류 시간",
  "fitting.roomCount":            "피팅룸 수",
  "fitting.useRate":              "피팅룸 이용률",
  "fitting.purchaseRate":         "피팅 후 구매율",
  "crm.signupRate":               "회원가입률",
  "crm.onlineRepurchaseRate":     "온라인 재구매율",
  "crm.repurchaseAOV":            "재구매 객단가",
  "operations.staffCount":        "직원 수",
  "operations.staffCapacity":     "직원 1인 capacity",
};

function LeverLabel({ domain, field }) {
  const label = LABEL_MAP[`${domain}.${field}`] || field;
  return (
    <span style={{
      fontSize: 11,
      fontFamily: "'Inter', sans-serif",
      color: T.textSecondary,
    }}>{label}</span>
  );
}
