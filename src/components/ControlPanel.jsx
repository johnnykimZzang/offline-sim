import { T } from "../design/tokens";

// 카테고리별 accent 색상
const CAT = {
  demand:     "#60a5fa",  // 수요 — 파랑
  product:    "#3ecf8e",  // 상품 — 브랜드 그린
  conversion: "#a78bfa",  // 전환 — 보라
  ops:        "#fb923c",  // CRM/운영 — 주황
  goal:       "#f87171",  // 목표 — 레드
};

function CategoryDivider({ label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 6px" }}>
      <span style={{
        fontSize: 9,
        fontFamily: "'Source Code Pro', monospace",
        color,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontWeight: 600,
        flexShrink: 0,
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `${color}38` }} />
    </div>
  );
}
import { DAYS_KR } from "../lib/constants";
import { fmt, fmtPct, fmtW } from "../lib/format";
import { initialState } from "../state/schema";
import Section from "./primitives/Section";
import Slider from "./primitives/Slider";
import CodeLabel from "./primitives/CodeLabel";

/** 도메인 객체 비교 — 어떤 필드라도 기본값과 다르면 modified */
function isDomainModified(domain, current) {
  const init = initialState[domain];
  for (const key of Object.keys(init)) {
    const a = current[key];
    const b = init[key];
    if (Array.isArray(a) || Array.isArray(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) return true;
    } else if (a !== b) {
      return true;
    }
  }
  return false;
}

/** leverMap에서 특정 도메인의 최대 upPct (그룹 영향도 점수) */
function groupScore(leverMap, domain) {
  if (!leverMap) return undefined;
  let max = 0;
  for (const [key, v] of Object.entries(leverMap)) {
    if (key.startsWith(domain + ".") && v.upPct > max) max = v.upPct;
  }
  return max;
}

/** leverMap에서 domain.field의 rank 반환 */
function rank(leverMap, domain, field) {
  return leverMap?.[`${domain}.${field}`]?.rank;
}

/** leverMap에 Top5가 하나라도 있으면 true */
function hasAnyTopLever(leverMap) {
  if (!leverMap) return false;
  return Object.values(leverMap).some(v => v.isTopLever);
}

export default function ControlPanel({ state, update, toggleClosedDow, resetDomain, summary, leverMap }) {
  const D = state.demand;
  const P = state.product;
  const C = state.conversion;
  const F = state.fitting;
  const R = state.crm;
  const O = state.operations;
  const G = state.goal;

  // initial defaults for diff indicators
  const id = initialState.demand;
  const ip = initialState.product;
  const ic = initialState.conversion;
  const ifit = initialState.fitting;
  const ir = initialState.crm;
  const io = initialState.operations;
  const ig = initialState.goal;

  const topLeversExist = hasAnyTopLever(leverMap);

  return (
    <div style={{ width: "100%" }}>

      <CategoryDivider label="수요" color={CAT.demand} />

      {/* 유동인구 / 유입 */}
      <Section
        label="유동인구 / 유입"
        modified={isDomainModified("demand", D)}
        onReset={() => resetDomain("demand")}
        groupScore={groupScore(leverMap, "demand")}
        accentColor={CAT.demand}
      >
        <Slider domain="demand" field="footTraffic"    label="일 유동인구"      value={D.footTraffic}    defaultValue={id.footTraffic}    onChange={update} min={500}  max={20000} step={100} unit="명" tip="매장 앞을 지나가는 일평균 인원. 상권 분석·네이버 플레이스 조회수 기반으로 추정. 모든 전환 계산의 출발점." leverRank={rank(leverMap,"demand","footTraffic")}    hasTopLevers={topLeversExist} />
        <Slider domain="demand" field="storeEntryRate" label="매장 유입률"      value={D.storeEntryRate} defaultValue={id.storeEntryRate} onChange={update} min={1}    max={30}              unit="%" tip="유동인구 중 실제 매장 안으로 들어오는 비율. 쇼윈도·간판·향기 등 외부 어트랙션 요소에 직접 영향을 받음." leverRank={rank(leverMap,"demand","storeEntryRate")} hasTopLevers={topLeversExist} />
        <Slider domain="demand" field="weekendWeight"  label="주말 가중치"      value={D.weekendWeight}  defaultValue={id.weekendWeight}  onChange={update} min={100}  max={250}             unit="%" tip="주말 유동인구를 평일 대비 몇 배로 볼지 설정. 140 = 주말이 평일의 1.4배. 상권·입지 특성에 따라 조정." leverRank={rank(leverMap,"demand","weekendWeight")}  hasTopLevers={topLeversExist} />
        <Slider domain="demand" field="touristRatio"   label="해외 관광객 비중" value={D.touristRatio}   defaultValue={id.touristRatio}   onChange={update} min={0}    max={50}              unit="%" tip="전체 방문객 중 외국인 관광객 비율. 관광객은 국내 구매 경험상 전환율이 높아 50%로 별도 계산됨." leverRank={rank(leverMap,"demand","touristRatio")} hasTopLevers={topLeversExist} />
      </Section>

      <CategoryDivider label="상품" color={CAT.product} />

      {/* 제품 구성 */}
      <Section
        label="제품 구성 (객단가 자동 산정)"
        modified={isDomainModified("product", P)}
        onReset={() => resetDomain("product")}
        groupScore={groupScore(leverMap, "product")}
        accentColor={CAT.product}
      >
        <div style={{
          background: T.accentDim,
          border: `1px solid ${T.accentBorder}`,
          borderRadius: 6,
          padding: "8px 10px",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}>
          <CodeLabel color={T.accent}>실효 객단가</CodeLabel>
          <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 14, color: T.accent, fontWeight: 500 }}>
            ₩{fmt(summary.effectiveAOV)}
          </span>
        </div>
        <Slider domain="product" field="priceSingle"       label="단품 가격"      value={P.priceSingle}       defaultValue={ip.priceSingle}       onChange={update} min={20000}  max={300000} step={1000} unit="원" tip="후드·티셔츠 등 단품 1개 판매가. 세트 미구매 고객의 객단가 기준이 되며, 가격 정책 시뮬레이션의 핵심 변수." leverRank={rank(leverMap,"product","priceSingle")}       hasTopLevers={topLeversExist} />
        <Slider domain="product" field="priceSet"          label="세트 가격"      value={P.priceSet}          defaultValue={ip.priceSet}          onChange={update} min={50000}  max={500000} step={5000} unit="원" tip="단품 2개 이상 또는 시그니처 세트 구성 판매가. 세트 구매율과 곱해 전체 객단가에 반영됨." leverRank={rank(leverMap,"product","priceSet")}          hasTopLevers={topLeversExist} />
        <Slider domain="product" field="priceHoodieSetup"  label="후드 셋업 가격" value={P.priceHoodieSetup}  defaultValue={ip.priceHoodieSetup}  onChange={update} min={100000} max={600000} step={5000} unit="원" tip="후드+셋업 패키지 가격. 후드 셋업 비중과 함께 전체 객단가를 끌어올리는 고단가 SKU." leverRank={rank(leverMap,"product","priceHoodieSetup")}  hasTopLevers={topLeversExist} />
        <Slider domain="product" field="setPurchaseRate"   label="세트 구매율"    value={P.setPurchaseRate}   defaultValue={ip.setPurchaseRate}   onChange={update} min={0} max={80} unit="%" tip="구매 고객 중 단품이 아닌 세트로 구매하는 비율. 높을수록 객단가 상승. 스타일링 제안·세트 전시 진열이 영향." leverRank={rank(leverMap,"product","setPurchaseRate")}   hasTopLevers={topLeversExist} />
        <Slider domain="product" field="hoodieSetShare"    label="후드 셋업 비중" value={P.hoodieSetShare}    defaultValue={ip.hoodieSetShare}    onChange={update} min={0} max={70} unit="%" tip="세트 구매자 중 고단가인 후드 셋업 패키지를 선택하는 비율. 매장 VMD·직원 추천이 핵심 드라이버." leverRank={rank(leverMap,"product","hoodieSetShare")}    hasTopLevers={topLeversExist} />
        <Slider domain="product" field="addonPurchaseRate" label="추가 구매율"    value={P.addonPurchaseRate} defaultValue={ip.addonPurchaseRate} onChange={update} min={0} max={60} unit="%" tip="본 상품 외 굿즈·액세서리·소품을 추가 구매하는 고객 비율. 계산대 주변 전시 배치가 크게 영향을 줌." leverRank={rank(leverMap,"product","addonPurchaseRate")} hasTopLevers={topLeversExist} />
        <Slider domain="product" field="addonPrice"        label="추가 구매 단가" value={P.addonPrice}        defaultValue={ip.addonPrice}        onChange={update} min={5000} max={80000} step={1000} unit="원" tip="추가 구매 발생 시 평균 결제 금액. 키링·엽서·스티커 등 소품이 주를 이룸." leverRank={rank(leverMap,"product","addonPrice")}        hasTopLevers={topLeversExist} />
      </Section>

      <CategoryDivider label="전환" color={CAT.conversion} />

      {/* 방문 유형 / 세분 전환 */}
      <Section
        label="방문 유형 / 세분 전환"
        modified={isDomainModified("conversion", C)}
        onReset={() => resetDomain("conversion")}
        groupScore={groupScore(leverMap, "conversion")}
        accentColor={CAT.conversion}
      >
        <Slider domain="conversion" field="purposeVisitRatio"     label="목적형 방문 비율"  value={C.purposeVisitRatio}     defaultValue={ic.purposeVisitRatio}     onChange={update} min={0} max={100} unit="%" tip="유입 고객 중 브랜드를 미리 알고 구매 의도를 갖고 온 비율. 인스타·SNS 팔로워, 지인 추천 방문 등이 해당됨." leverRank={rank(leverMap,"conversion","purposeVisitRatio")}     hasTopLevers={topLeversExist} />
        <Slider domain="conversion" field="baseConvRate"          label="일반 전환율"       value={C.baseConvRate}          defaultValue={ic.baseConvRate}          onChange={update} min={5}  max={50} unit="%" tip="사전 구매 의도 없이 입장한 일반 방문객의 구매 전환율. 매장 분위기·직원 응대·상품 매력도가 핵심." leverRank={rank(leverMap,"conversion","baseConvRate")}          hasTopLevers={topLeversExist} />
        <Slider domain="conversion" field="purposeConvRate"       label="목적형 전환율"     value={C.purposeConvRate}       defaultValue={ic.purposeConvRate}       onChange={update} min={10} max={80} unit="%" tip="브랜드를 알고 목적형으로 방문한 고객의 구매 전환율. 통상 일반 전환율보다 2~3배 높게 나타남." leverRank={rank(leverMap,"conversion","purposeConvRate")}       hasTopLevers={topLeversExist} />
        <Slider domain="conversion" field="companionRatio"        label="동행 방문 비율"    value={C.companionRatio}        defaultValue={ic.companionRatio}        onChange={update} min={0}  max={90} unit="%" tip="전체 방문객 중 2인 이상 동행으로 온 고객 비율. 동행 방문은 구매 결정 구조가 달라 별도 전환율 적용." leverRank={rank(leverMap,"conversion","companionRatio")}        hasTopLevers={topLeversExist} />
        <Slider domain="conversion" field="companionDecisionRate" label="동행 결정자 비율"  value={C.companionDecisionRate} defaultValue={ic.companionDecisionRate} onChange={update} min={10} max={100} unit="%" tip="동행 그룹 중 실제로 구매 결정을 내리는 사람의 비율. 나머지는 결정자의 영향을 받아 구매로 이어짐." leverRank={rank(leverMap,"conversion","companionDecisionRate")} hasTopLevers={topLeversExist} />
      </Section>

      {/* 피팅 / 체류 — 전환 카테고리 연속 */}
      <Section
        label="피팅 / 체류"
        modified={isDomainModified("fitting", F)}
        onReset={() => resetDomain("fitting")}
        groupScore={groupScore(leverMap, "fitting")}
        accentColor={CAT.conversion}
      >
        <Slider domain="fitting" field="avgStayMinutes" label="평균 체류시간"         value={F.avgStayMinutes} defaultValue={ifit.avgStayMinutes} onChange={update} min={5}  max={60} unit="분" tip="방문 고객 1인의 평균 매장 체류 시간. 체류 시간이 길수록 피팅·추가 구매 전환 가능성이 높아짐." leverRank={rank(leverMap,"fitting","avgStayMinutes")} hasTopLevers={topLeversExist} />
        <Slider domain="fitting" field="roomCount"      label="피팅룸 수"            value={F.roomCount}      defaultValue={ifit.roomCount}      onChange={update} min={1}  max={6}  unit="개" tip="매장 내 실제 이용 가능한 피팅룸 개수. 동시 피팅 수용 인원을 결정하며 병목 계산에 사용됨." leverRank={rank(leverMap,"fitting","roomCount")}      hasTopLevers={topLeversExist} />
        <Slider domain="fitting" field="useRate"        label="피팅룸 이용률"        value={F.useRate}        defaultValue={ifit.useRate}        onChange={update} min={0}  max={50} unit="%" tip="방문객 중 피팅룸을 실제로 이용하는 비율. 피팅룸 위치 안내·직원 추천이 이용률을 높이는 주요 방법." leverRank={rank(leverMap,"fitting","useRate")}        hasTopLevers={topLeversExist} />
        <Slider domain="fitting" field="purchaseRate"   label="피팅 구매율"          value={F.purchaseRate}   defaultValue={ifit.purchaseRate}   onChange={update} min={20} max={80} unit="%" tip="피팅룸 이용 고객 중 최종 구매로 이어지는 비율. 피팅 경험의 품질과 직원의 클로징 능력이 핵심." leverRank={rank(leverMap,"fitting","purchaseRate")}   hasTopLevers={topLeversExist} />
        <Slider domain="fitting" field="waitDropRate"   label="피팅 대기 이탈률"    value={F.waitDropRate}   defaultValue={ifit.waitDropRate}   onChange={update} min={0}  max={40} unit="%" tip="피팅룸 대기 중 구매를 포기하고 떠나는 고객 비율. 피팅룸 수·직원 수와 연계하여 혼잡도가 결정됨." leverRank={rank(leverMap,"fitting","waitDropRate")}   hasTopLevers={topLeversExist} />
        <Slider domain="fitting" field="peakTimeShare"  label="피크 유입 집중도"    value={F.peakTimeShare}  defaultValue={ifit.peakTimeShare}  onChange={update} min={10} max={60} unit="%" tip="일 유입 고객 중 피크 2시간에 집중되는 비율. 예: 30% → 일 방문의 30%가 점심·저녁 피크 2시간에 몰림. 시간당 체류 고객(피크) 계산에 사용." leverRank={rank(leverMap,"fitting","peakTimeShare")}  hasTopLevers={topLeversExist} />
      </Section>

      <CategoryDivider label="CRM / 운영" color={CAT.ops} />

      {/* CRM */}
      <Section
        label="CRM"
        modified={isDomainModified("crm", R)}
        onReset={() => resetDomain("crm")}
        groupScore={groupScore(leverMap, "crm")}
        accentColor={CAT.ops}
      >
        <Slider domain="crm" field="signupRate"           label="회원가입률"      value={R.signupRate}           defaultValue={ir.signupRate}           onChange={update} min={5}  max={80}  unit="%" tip="구매 고객 중 앱·카카오 등으로 회원 가입하는 비율. 재방문·CRM 캠페인 도달 가능 모수의 기초 데이터." leverRank={rank(leverMap,"crm","signupRate")}           hasTopLevers={topLeversExist} />
        <Slider domain="crm" field="optInRate"            label="수신동의율"      value={R.optInRate}            defaultValue={ir.optInRate}            onChange={update} min={50} max={100} unit="%" tip="회원 중 마케팅 메시지 수신에 동의한 비율. 실제 CRM 캠페인 발송 가능 인원을 결정함." leverRank={rank(leverMap,"crm","optInRate")}            hasTopLevers={topLeversExist} />
        <Slider domain="crm" field="storyUploadRate"      label="스토리 업로드율" value={R.storyUploadRate}      defaultValue={ir.storyUploadRate}      onChange={update} min={0}  max={80}  unit="%" tip="구매 고객 중 인스타그램 스토리에 매장·상품을 업로드하는 비율. UGC 바이럴 확산 지표." leverRank={rank(leverMap,"crm","storyUploadRate")}      hasTopLevers={topLeversExist} />
        <Slider domain="crm" field="qrScanRate"           label="QR 스캔률"       value={R.qrScanRate}           defaultValue={ir.qrScanRate}           onChange={update} min={0}  max={100} unit="%" tip="매장 내 QR코드를 스캔하는 고객 비율. 온라인 채널 연동·디지털 경험 진입점으로 활용됨." leverRank={rank(leverMap,"crm","qrScanRate")}           hasTopLevers={topLeversExist} />
        <Slider domain="crm" field="onlineRepurchaseRate" label="온라인 재구매율"    value={R.onlineRepurchaseRate} defaultValue={ir.onlineRepurchaseRate} onChange={update} min={0}  max={50}  unit="%" tip="회원 중 월 내 온라인 채널로 재구매하는 비율. CRM 캠페인·팔로업 메시지의 효과를 반영." leverRank={rank(leverMap,"crm","onlineRepurchaseRate")} hasTopLevers={topLeversExist} />
        <Slider domain="crm" field="repurchaseAOV"        label="재구매 객단가"      value={R.repurchaseAOV}        defaultValue={ir.repurchaseAOV}        onChange={update} min={50000} max={400000} step={5000} unit="원" tip="온라인 재구매 발생 시 평균 결제 금액. 오프라인 객단가보다 낮게 설정하는 경우가 많음." leverRank={rank(leverMap,"crm","repurchaseAOV")}        hasTopLevers={topLeversExist} />
        <Slider domain="crm" field="returnVisitRate"      label="오프라인 재방문율"  value={R.returnVisitRate}      defaultValue={ir.returnVisitRate}      onChange={update} min={0}  max={30}  unit="%" tip="방문 고객 중 이전 구매 이력이 있는 재방문 고객의 비율. 운영 현황 스트립의 일 재방문 고객 수 계산에 사용됨." leverRank={rank(leverMap,"crm","returnVisitRate")}      hasTopLevers={topLeversExist} />
      </Section>

      {/* 운영 / 혼잡도 — CRM/운영 카테고리 연속 */}
      <Section
        label="운영 / 혼잡도"
        modified={isDomainModified("operations", O)}
        onReset={() => resetDomain("operations")}
        groupScore={groupScore(leverMap, "operations")}
        accentColor={CAT.ops}
      >
        <Slider domain="operations" field="staffCount"      label="직원 수"             value={O.staffCount}      defaultValue={io.staffCount}      onChange={update} min={1}   max={10}  unit="명"  tip="매장 운영 인원. 직원 수는 동시 응대 가능 고객 수를 제한하며 혼잡도·전환율 계산에 직접 사용됨." leverRank={rank(leverMap,"operations","staffCount")}      hasTopLevers={topLeversExist} />
        <Slider domain="operations" field="staffCapacity"  label="직원 1인당 동시 응대" value={O.staffCapacity}  defaultValue={io.staffCapacity}  onChange={update} min={1}   max={10}  unit="명"  tip="직원 한 명이 동시에 응대 가능한 최대 고객 수. 피팅룸 도움·상품 추천 등 상호작용 강도에 따라 결정." leverRank={rank(leverMap,"operations","staffCapacity")}  hasTopLevers={topLeversExist} />
        <Slider domain="operations" field="operatingHours" label="일 영업시간"          value={O.operatingHours} defaultValue={io.operatingHours} onChange={update} min={6}   max={12}  unit="시간" tip="하루 실제 영업 시간. 시간당 체류 고객 수와 피팅룸 회전율 계산의 기준이 됨. 기본값 8시간 (480분)." leverRank={rank(leverMap,"operations","operatingHours")} hasTopLevers={topLeversExist} />
        <Slider domain="operations" field="operatingDays"  label="월 영업일 (상한)"     value={O.operatingDays}  defaultValue={io.operatingDays}  onChange={update} min={20}  max={31}  unit="일"  tip="한 달 실제 영업일 수 상한. 아래 정기 휴무 요일 설정과 함께 최종 실제 영업일이 자동 계산됨." leverRank={rank(leverMap,"operations","operatingDays")}  hasTopLevers={topLeversExist} />

        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 6 }}><CodeLabel>정기 휴무 요일</CodeLabel></div>
          <div style={{ display: "flex", gap: 4 }}>
            {DAYS_KR.map((d, i) => (
              <button key={i} onClick={() => toggleClosedDow(i)} style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 11,
                fontFamily: "'Source Code Pro', monospace",
                border: "1px solid",
                borderColor: O.closedDows.includes(i) ? T.warnBorder : T.borderDefault,
                background:  O.closedDows.includes(i) ? T.warnDim : "transparent",
                color:       O.closedDows.includes(i) ? T.warn : T.textMuted,
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.12s",
              }}>{d}</button>
            ))}
          </div>
        </div>
      </Section>

      <CategoryDivider label="목표" color={CAT.goal} />

      {/* 목표 */}
      <Section
        label="목표"
        modified={isDomainModified("goal", G)}
        onReset={() => resetDomain("goal")}
        accentColor={CAT.goal}
      >
        <Slider domain="goal" field="targetRevenue" label="월 매출 목표" value={G.targetRevenue} defaultValue={ig.targetRevenue} onChange={update} min={20_000_000} max={300_000_000} step={5_000_000} unit="원" tip="이번 달 달성하려는 목표 매출액. 목표 달성률 KPI와 목표 역산 탭의 기준값으로 사용됨." />
        <div style={{
          marginTop: 4, padding: "10px 12px",
          background: T.bgDeep,
          border: `1px solid ${summary.totalRevenue >= G.targetRevenue ? T.accentBorder : T.warnBorder}`,
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <CodeLabel>달성 상태</CodeLabel>
            <CodeLabel color={summary.totalRevenue >= G.targetRevenue ? T.accent : T.warn}>
              {summary.totalRevenue >= G.targetRevenue ? "달성" : `${fmtPct((summary.totalRevenue / G.targetRevenue) * 100, 0)}`}
            </CodeLabel>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <CodeLabel>현재 예측</CodeLabel>
            <CodeLabel color={T.textSecondary}>{fmtW(summary.totalRevenue)}원</CodeLabel>
          </div>
          <div style={{ height: 3, background: T.borderSubtle, borderRadius: 9999, overflow: "hidden" }}>
            <div style={{
              width: `${Math.min((summary.totalRevenue / G.targetRevenue) * 100, 100)}%`,
              height: "100%",
              background: summary.totalRevenue >= G.targetRevenue ? T.accent : T.warn,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      </Section>
    </div>
  );
}
