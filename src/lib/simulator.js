// ─────────────────────────────────────────────────────────────────────────────
// Simulator — 순수 함수 계층화
//
// 각 함수는 입력만 받고 결과만 리턴. React/state 의존성 0.
// 책임 분리:
//   computeEffectiveAOV  ← product
//   computeTraffic       ← demand, dow, isWeekend
//   computeStaffing      ← operations, fitting, traffic
//   computeFittingPath   ← fitting, decisionMakers, convMult
//   computeConversion    ← state, traffic, staffing
//   computeRevenue       ← effectiveAOV, conversion
//   computeCRM           ← crm, conversion, traffic
//   simulateDay          ← state, dow, isOpen, isWeekend  (오케스트레이터)
//   simulateMonth        ← state, year, month
//   computeSummary       ← days array
// ─────────────────────────────────────────────────────────────────────────────

import { DOW_MULT, IS_WEEKEND, OP_MINUTES, PEAK_FACTOR } from "./constants";

// ── 1. 객단가 자동 산정 ──────────────────────────────────────────────────────
export function computeEffectiveAOV(product) {
  const setShare    = product.setPurchaseRate / 100;
  const hoodieShare = product.hoodieSetShare / 100;
  const singleShare = Math.max(0, 1 - setShare - hoodieShare);
  const baseAOV =
      product.priceSingle      * singleShare
    + product.priceSet         * setShare
    + product.priceHoodieSetup * hoodieShare;
  const addonContribution = product.addonPrice * (product.addonPurchaseRate / 100);
  return Math.round(baseAOV + addonContribution);
}

// ── 2. 유동인구 → 유입 ──────────────────────────────────────────────────────
export function computeTraffic(demand, dow, isWeekend) {
  const dowMult  = DOW_MULT[dow];
  const wkndMult = isWeekend ? (demand.weekendWeight / 100) : 1;
  const dailyFoot = demand.footTraffic * dowMult * wkndMult;
  const visitors  = dailyFoot * (demand.storeEntryRate / 100);
  return { dailyFoot, visitors };
}

// ── 3. 동행 보정 → 결정자 ───────────────────────────────────────────────────
export function computeDecisionMakers(conversion, visitors) {
  const companions = visitors * (conversion.companionRatio / 100);
  const solo       = visitors - companions;
  const decisionMakers = solo + companions * (conversion.companionDecisionRate / 100);
  return { decisionMakers, companions, solo };
}

// ── 4. 혼잡도 보정 ──────────────────────────────────────────────────────────
export function computeStaffing(operations, fitting, visitors) {
  const capacity   = Math.max(1, operations.staffCount * operations.staffCapacity);
  const concurrent = visitors * (fitting.avgStayMinutes / OP_MINUTES) * PEAK_FACTOR;
  const overflow   = (concurrent - capacity) / capacity;
  let convMult = 1.0;
  if      (overflow > 1.0) convMult = 0.65;
  else if (overflow > 0.5) convMult = 0.80;
  else if (overflow > 0.2) convMult = 0.90;
  return { capacity, concurrent, overflow, convMult };
}

// ── 5. 피팅 경로 ────────────────────────────────────────────────────────────
export function computeFittingPath(fitting, decisionMakers, convMult) {
  let fittingVisitors = decisionMakers * (fitting.useRate / 100);
  const turnsPerDay   = fitting.roomCount * (OP_MINUTES / Math.max(15, fitting.avgStayMinutes));
  let fittingDropped = 0;
  if (fittingVisitors > turnsPerDay) {
    const overflowFit = fittingVisitors - turnsPerDay;
    fittingDropped = overflowFit * (fitting.waitDropRate / 100);
    fittingVisitors -= fittingDropped;
  }
  const fittingPurchasers = fittingVisitors * (fitting.purchaseRate / 100) * convMult;
  return { fittingVisitors, fittingPurchasers, fittingDropped };
}

// ── 6. 비피팅 세분 전환 ─────────────────────────────────────────────────────
export function computeSegmentConversion(conversion, demand, decisionMakers, fittingUseRate, convMult) {
  // 관광객 페널티 (관광객은 구매율 절반)
  const touristPenalty = 1 - (demand.touristRatio / 100) * 0.5;

  // 비피팅 결정자
  const nonFitDM = decisionMakers - decisionMakers * (fittingUseRate / 100);
  const purposeDM = nonFitDM * (conversion.purposeVisitRatio / 100);
  const casualDM  = nonFitDM - purposeDM;

  const purposePurchasers = purposeDM * (conversion.purposeConvRate / 100) * convMult * touristPenalty;
  const casualPurchasers  = casualDM  * (conversion.baseConvRate    / 100) * convMult * touristPenalty;

  return { purposePurchasers, casualPurchasers, purposeDM, casualDM };
}

// ── 7. 매출 산정 ────────────────────────────────────────────────────────────
export function computeRevenue(effectiveAOV, segments) {
  // 세그먼트별 AOV 보정 — 피팅 +15%, 목적형 +25%
  const fittingRev = segments.fittingPurchasers * effectiveAOV * 1.15;
  const purposeRev = segments.purposePurchasers * effectiveAOV * 1.25;
  const casualRev  = segments.casualPurchasers  * effectiveAOV;
  return {
    revenue: fittingRev + purposeRev + casualRev,
    byChannel: { fittingRev, purposeRev, casualRev },
  };
}

// ── 8. CRM 유도 지표 ────────────────────────────────────────────────────────
export function computeCRM(crm, totalPurchasers, visitors) {
  const signups            = totalPurchasers * (crm.signupRate / 100);
  const optIns             = signups * (crm.optInRate / 100);
  const stories            = visitors * (crm.storyUploadRate / 100);
  const qrScans            = visitors * (crm.qrScanRate / 100);
  const onlineRepurchasers = signups * (crm.onlineRepurchaseRate / 100);
  const crmRevenue         = onlineRepurchasers * crm.repurchaseAOV;
  return { signups, optIns, stories, qrScans, onlineRepurchasers, crmRevenue };
}

// ── 9. 단일 일자 시뮬레이션 (오케스트레이터) ────────────────────────────────
export function simulateDay(state, dayNum, dow, isOpen, isWeekend, effectiveAOV) {
  if (!isOpen) {
    return {
      day: dayNum, dow, isOpen: false, isWeekend,
      dailyFoot: 0, visitors: 0,
      decisionMakers: 0,
      fittingVisitors: 0, fittingPurchasers: 0,
      purposePurchasers: 0, casualPurchasers: 0,
      purchasers: 0,
      revenue: 0,
      signups: 0, optIns: 0, stories: 0, qrScans: 0,
      onlineRepurchasers: 0, crmRevenue: 0,
      congestionOverflow: 0,
      convMult: 1,
    };
  }

  const { dailyFoot, visitors }      = computeTraffic(state.demand, dow, isWeekend);
  const { decisionMakers }           = computeDecisionMakers(state.conversion, visitors);
  const staffing                     = computeStaffing(state.operations, state.fitting, visitors);
  const fittingPath                  = computeFittingPath(state.fitting, decisionMakers, staffing.convMult);
  const segments                     = computeSegmentConversion(
    state.conversion,
    state.demand,
    decisionMakers,
    state.fitting.useRate,
    staffing.convMult,
  );
  const totalPurchasers = fittingPath.fittingPurchasers + segments.purposePurchasers + segments.casualPurchasers;
  const { revenue }     = computeRevenue(effectiveAOV, { ...fittingPath, ...segments });
  const crmResult       = computeCRM(state.crm, totalPurchasers, visitors);

  return {
    day: dayNum, dow, isOpen: true, isWeekend,
    dailyFoot,
    visitors,
    decisionMakers,
    fittingVisitors:    fittingPath.fittingVisitors,
    fittingPurchasers:  fittingPath.fittingPurchasers,
    purposePurchasers:  segments.purposePurchasers,
    casualPurchasers:   segments.casualPurchasers,
    purchasers:         totalPurchasers,
    revenue,
    signups:            crmResult.signups,
    optIns:             crmResult.optIns,
    stories:            crmResult.stories,
    qrScans:            crmResult.qrScans,
    onlineRepurchasers: crmResult.onlineRepurchasers,
    crmRevenue:         crmResult.crmRevenue,
    congestionOverflow: staffing.overflow,
    convMult:           staffing.convMult,
  };
}

// ── 10. 한 달 시뮬레이션 ────────────────────────────────────────────────────
export function simulateMonth(state, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();
  const effectiveAOV = computeEffectiveAOV(state.product);

  const days = [];
  let opCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dow       = new Date(year, month, d).getDay();
    const isClosed  = state.operations.closedDows.includes(dow);
    const isOpen    = !isClosed && opCount < state.operations.operatingDays;
    const isWeekend = IS_WEEKEND[dow];

    if (isOpen) opCount++;

    days.push(simulateDay(state, d, dow, isOpen, isWeekend, effectiveAOV));
  }

  return { days, firstDow, daysInMonth, effectiveAOV };
}

// ── 11. 집계 ────────────────────────────────────────────────────────────────
export function computeSummary(monthData) {
  const open = monthData.days.filter(d => d.isOpen);
  const sum  = (key) => open.reduce((s, d) => s + (d[key] || 0), 0);

  const totalRevenue        = sum("revenue");
  const totalVisitors       = sum("visitors");
  const totalPurchasers     = sum("purchasers");
  const totalFoot           = sum("dailyFoot");
  const totalDecisionMakers = sum("decisionMakers");
  const totalSignups        = sum("signups");
  const totalOptIns         = sum("optIns");
  const totalStories        = sum("stories");
  const totalOnlineRepurch  = sum("onlineRepurchasers");
  const totalCrmRevenue     = sum("crmRevenue");
  const totalFittingVisitors = sum("fittingVisitors");
  const totalFittingPurch    = sum("fittingPurchasers");

  const openCount = open.length;
  const avgDaily  = openCount ? totalRevenue / openCount : 0;
  const avgPurch  = openCount ? totalPurchasers / openCount : 0;

  // Weekend / weekday split
  const wknd = open.filter(d => d.isWeekend);
  const wkdy = open.filter(d => !d.isWeekend);
  const wkndStats = aggStats(wknd);
  const wkdyStats = aggStats(wkdy);

  // Weekly groups
  const weeks = [];
  let week = newWeek();
  monthData.days.forEach((d, i) => {
    week.days.push(d);
    week.revenue    += d.revenue;
    week.visitors   += d.visitors;
    week.purchasers += d.purchasers;
    week.signups    += d.signups;
    if (d.dow === 6 || i === monthData.days.length - 1) {
      week.label = `${week.days[0].day}일 – ${d.day}일`;
      weeks.push(week);
      week = newWeek();
    }
  });

  // Congestion days
  const congestionDays = open.filter(d => d.congestionOverflow > 0.2).length;

  return {
    totalRevenue, totalVisitors, totalPurchasers, totalFoot, totalDecisionMakers,
    totalSignups, totalOptIns, totalStories, totalOnlineRepurch, totalCrmRevenue,
    totalFittingVisitors, totalFittingPurch,
    avgDaily, avgPurch, openCount,
    weeks, wkndStats, wkdyStats,
    congestionDays,
    effectiveAOV: monthData.effectiveAOV,
  };
}

function aggStats(days) {
  if (days.length === 0) return { count: 0, revenue: 0, visitors: 0, purch: 0, signups: 0 };
  return {
    count:    days.length,
    revenue:  days.reduce((s,d)=>s+d.revenue,0),
    visitors: days.reduce((s,d)=>s+d.visitors,0),
    purch:    days.reduce((s,d)=>s+d.purchasers,0),
    signups:  days.reduce((s,d)=>s+d.signups,0),
  };
}

function newWeek() {
  return { days: [], revenue: 0, visitors: 0, purchasers: 0, signups: 0, label: "" };
}

// ── 12. 목표 역산 ───────────────────────────────────────────────────────────
export function computeGoalReversal(state, summary) {
  const aov = summary.effectiveAOV;
  const target = state.goal.targetRevenue;
  const requiredPurchases = aov > 0 ? target / aov : 0;
  const realConv  = summary.totalVisitors > 0 ? summary.totalPurchasers / summary.totalVisitors : 0.2;
  const realEntry = summary.totalFoot > 0     ? summary.totalVisitors    / summary.totalFoot     : 0.05;
  const requiredVisitors = realConv > 0  ? requiredPurchases / realConv  : 0;
  const requiredFoot     = realEntry > 0 ? requiredVisitors / realEntry  : 0;
  const requiredSignups  = requiredPurchases * (state.crm.signupRate / 100);
  const requiredStories  = requiredVisitors  * (state.crm.storyUploadRate / 100);
  const requiredCRM      = requiredSignups   * (state.crm.optInRate / 100);

  return {
    requiredPurchases, requiredVisitors, requiredFoot,
    requiredSignups, requiredStories, requiredCRM,
  };
}
