// ─────────────────────────────────────────────────────────────────────────────
// State schema — 도메인 단위 그룹
//
// 모든 비율은 % 정수로 저장 (예: 30 = 30%). 계산 함수가 / 100 분기 처리.
// 새 슬라이더 추가 시 여기 한 곳만 수정.
// ─────────────────────────────────────────────────────────────────────────────

export const initialState = {
  // 유동인구 / 유입
  demand: {
    footTraffic: 2500,        // 일 유동인구 (명)
    storeEntryRate: 5,        // 매장 유입률 (%)
    weekendWeight: 140,       // 주말 가중치 (% — 140 = 1.4배)
    touristRatio: 15,         // 해외 관광객 비중 (%)
  },

  // 제품 구성 — 객단가는 자동 산정
  product: {
    priceSingle: 89000,       // 단품 가격
    priceSet: 165000,         // 세트 가격
    priceHoodieSetup: 285000, // 후드 셋업 가격
    setPurchaseRate: 40,      // 세트 구매율 (%)
    hoodieSetShare: 35,       // 후드 셋업 비중 (%)
    addonPurchaseRate: 20,    // 추가 구매율 (%)
    addonPrice: 25000,        // 추가 구매 단가
  },

  // 방문 유형 / 세분 전환
  conversion: {
    purposeVisitRatio: 80,    // 목적형 방문 비율 (%)
    baseConvRate: 20,         // 일반 전환율 (%)
    purposeConvRate: 35,      // 목적형 전환율 (%)
    companionRatio: 60,       // 동행 방문 비율 (%)
    companionDecisionRate: 50,// 동행 내 결정자 비율 (%)
  },

  // 피팅 / 체류
  fitting: {
    avgStayMinutes: 20,
    roomCount: 2,
    useRate: 20,              // 피팅룸 이용률 (%)
    purchaseRate: 50,         // 피팅 후 구매율 (%)
    waitDropRate: 10,         // 대기 이탈률 (%)
  },

  // CRM
  crm: {
    signupRate: 30,           // 회원가입률 (%)
    optInRate: 90,            // 수신동의율 (%)
    storyUploadRate: 45,      // 스토리 업로드율 (%)
    qrScanRate: 50,           // QR 스캔률 (%)
    onlineRepurchaseRate: 18, // 온라인 재구매율 (%)
    repurchaseAOV: 180000,    // 재구매 객단가
  },

  // 운영 / 혼잡도
  operations: {
    staffCount: 2,
    staffCapacity: 5,         // 직원 1인당 동시 응대 가능 인원
    operatingDays: 28,        // 월 영업일 상한
    closedDows: [],           // 정기 휴무 요일 [0=일, 1=월, …]
  },

  // 목표
  goal: {
    targetRevenue: 100_000_000,
  },

  // UI 메타 (영속화 대상 아님)
  meta: {
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    view: "calendar", // calendar | weekly | funnel | crmFunnel | goal | compare
  },
};

// 도메인 목록 (reducer/preset/reset 등에서 사용)
export const DOMAINS = [
  "demand",
  "product",
  "conversion",
  "fitting",
  "crm",
  "operations",
  "goal",
];
