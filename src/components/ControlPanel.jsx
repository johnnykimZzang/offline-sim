import { T } from "../design/tokens";
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

export default function ControlPanel({ state, update, toggleClosedDow, resetDomain, summary }) {
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

  return (
    <div style={{ width: 290, flexShrink: 0 }}>

      {/* 유동인구 / 유입 */}
      <Section
        label="유동인구 / 유입"
        modified={isDomainModified("demand", D)}
        onReset={() => resetDomain("demand")}
      >
        <Slider domain="demand" field="footTraffic"    label="일 유동인구"     value={D.footTraffic}    defaultValue={id.footTraffic}    onChange={update} min={500}  max={20000} step={100} unit="명" tip="매장 앞 일평균 유동인구" />
        <Slider domain="demand" field="storeEntryRate" label="매장 유입률"     value={D.storeEntryRate} defaultValue={id.storeEntryRate} onChange={update} min={1}    max={30}              unit="%" />
        <Slider domain="demand" field="weekendWeight"  label="주말 가중치"     value={D.weekendWeight}  defaultValue={id.weekendWeight}  onChange={update} min={100}  max={250}             unit="%" tip="140 = 1.4배" />
        <Slider domain="demand" field="touristRatio"   label="해외 관광객 비중" value={D.touristRatio}   defaultValue={id.touristRatio}   onChange={update} min={0}    max={50}              unit="%" tip="관광객은 구매율 50%로 적용" />
      </Section>

      {/* 제품 구성 */}
      <Section
        label="제품 구성 (객단가 자동 산정)"
        modified={isDomainModified("product", P)}
        onReset={() => resetDomain("product")}
      >
        <div style={{
          background: T.accentDim,
          border: `1px solid ${T.accentBorder}`,
          borderRadius: 6,
          padding: "8px 10px",
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}>
          <CodeLabel color={T.accent}>실효 객단가</CodeLabel>
          <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 14, color: T.accent, fontWeight: 500 }}>
            ₩{fmt(summary.effectiveAOV)}
          </span>
        </div>
        <Slider domain="product" field="priceSingle"       label="단품 가격"      value={P.priceSingle}       defaultValue={ip.priceSingle}       onChange={update} min={20000}  max={300000} step={1000} unit="원" />
        <Slider domain="product" field="priceSet"          label="세트 가격"      value={P.priceSet}          defaultValue={ip.priceSet}          onChange={update} min={50000}  max={500000} step={5000} unit="원" />
        <Slider domain="product" field="priceHoodieSetup"  label="후드 셋업 가격" value={P.priceHoodieSetup}  defaultValue={ip.priceHoodieSetup}  onChange={update} min={100000} max={600000} step={5000} unit="원" />
        <Slider domain="product" field="setPurchaseRate"   label="세트 구매율"     value={P.setPurchaseRate}   defaultValue={ip.setPurchaseRate}   onChange={update} min={0} max={80} unit="%" />
        <Slider domain="product" field="hoodieSetShare"    label="후드 셋업 비중" value={P.hoodieSetShare}    defaultValue={ip.hoodieSetShare}    onChange={update} min={0} max={70} unit="%" />
        <Slider domain="product" field="addonPurchaseRate" label="추가 구매율"     value={P.addonPurchaseRate} defaultValue={ip.addonPurchaseRate} onChange={update} min={0} max={60} unit="%" tip="굿즈/액세서리 추가" />
        <Slider domain="product" field="addonPrice"        label="추가 구매 단가" value={P.addonPrice}        defaultValue={ip.addonPrice}        onChange={update} min={5000} max={80000} step={1000} unit="원" />
      </Section>

      {/* 방문 유형 / 세분 전환 */}
      <Section
        label="방문 유형 / 세분 전환"
        modified={isDomainModified("conversion", C)}
        onReset={() => resetDomain("conversion")}
      >
        <Slider domain="conversion" field="purposeVisitRatio"     label="목적형 방문 비율"  value={C.purposeVisitRatio}     defaultValue={ic.purposeVisitRatio}     onChange={update} min={0} max={100} unit="%" tip="브랜드 인지 후 방문" />
        <Slider domain="conversion" field="baseConvRate"          label="일반 전환율"       value={C.baseConvRate}          defaultValue={ic.baseConvRate}          onChange={update} min={5}  max={50} unit="%" />
        <Slider domain="conversion" field="purposeConvRate"       label="목적형 전환율"     value={C.purposeConvRate}       defaultValue={ic.purposeConvRate}       onChange={update} min={10} max={80} unit="%" />
        <Slider domain="conversion" field="companionRatio"        label="동행 방문 비율"    value={C.companionRatio}        defaultValue={ic.companionRatio}        onChange={update} min={0}  max={90} unit="%" />
        <Slider domain="conversion" field="companionDecisionRate" label="동행 결정자 비율" value={C.companionDecisionRate} defaultValue={ic.companionDecisionRate} onChange={update} min={10} max={100} unit="%" tip="동행 중 실 구매 결정자" />
      </Section>

      {/* 피팅 / 체류 */}
      <Section
        label="피팅 / 체류"
        modified={isDomainModified("fitting", F)}
        onReset={() => resetDomain("fitting")}
      >
        <Slider domain="fitting" field="avgStayMinutes" label="평균 체류시간"     value={F.avgStayMinutes} defaultValue={ifit.avgStayMinutes} onChange={update} min={5}  max={60} unit="분" />
        <Slider domain="fitting" field="roomCount"      label="피팅룸 수"        value={F.roomCount}      defaultValue={ifit.roomCount}      onChange={update} min={1}  max={6}  unit="개" />
        <Slider domain="fitting" field="useRate"        label="피팅룸 이용률"    value={F.useRate}        defaultValue={ifit.useRate}        onChange={update} min={0}  max={50} unit="%" />
        <Slider domain="fitting" field="purchaseRate"   label="피팅 구매율"      value={F.purchaseRate}   defaultValue={ifit.purchaseRate}   onChange={update} min={20} max={80} unit="%" />
        <Slider domain="fitting" field="waitDropRate"   label="피팅 대기 이탈률" value={F.waitDropRate}   defaultValue={ifit.waitDropRate}   onChange={update} min={0}  max={40} unit="%" />
      </Section>

      {/* CRM */}
      <Section
        label="CRM"
        modified={isDomainModified("crm", R)}
        onReset={() => resetDomain("crm")}
      >
        <Slider domain="crm" field="signupRate"           label="회원가입률"       value={R.signupRate}           defaultValue={ir.signupRate}           onChange={update} min={5}  max={80}  unit="%" />
        <Slider domain="crm" field="optInRate"            label="수신동의율"       value={R.optInRate}            defaultValue={ir.optInRate}            onChange={update} min={50} max={100} unit="%" />
        <Slider domain="crm" field="storyUploadRate"      label="스토리 업로드율" value={R.storyUploadRate}      defaultValue={ir.storyUploadRate}      onChange={update} min={0}  max={80}  unit="%" />
        <Slider domain="crm" field="qrScanRate"           label="QR 스캔률"        value={R.qrScanRate}           defaultValue={ir.qrScanRate}           onChange={update} min={0}  max={100} unit="%" />
        <Slider domain="crm" field="onlineRepurchaseRate" label="온라인 재구매율" value={R.onlineRepurchaseRate} defaultValue={ir.onlineRepurchaseRate} onChange={update} min={0}  max={50}  unit="%" />
        <Slider domain="crm" field="repurchaseAOV"        label="재구매 객단가"   value={R.repurchaseAOV}        defaultValue={ir.repurchaseAOV}        onChange={update} min={50000} max={400000} step={5000} unit="원" />
      </Section>

      {/* 운영 / 혼잡도 */}
      <Section
        label="운영 / 혼잡도"
        modified={isDomainModified("operations", O)}
        onReset={() => resetDomain("operations")}
      >
        <Slider domain="operations" field="staffCount"    label="직원 수"            value={O.staffCount}    defaultValue={io.staffCount}    onChange={update} min={1}  max={10} unit="명" />
        <Slider domain="operations" field="staffCapacity" label="직원 1인당 동시 응대" value={O.staffCapacity} defaultValue={io.staffCapacity} onChange={update} min={1}  max={10} unit="명" />
        <Slider domain="operations" field="operatingDays" label="월 영업일 (상한)"   value={O.operatingDays} defaultValue={io.operatingDays} onChange={update} min={20} max={31} unit="일" />

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

      {/* 목표 */}
      <Section
        label="목표"
        modified={isDomainModified("goal", G)}
        onReset={() => resetDomain("goal")}
      >
        <Slider domain="goal" field="targetRevenue" label="월 매출 목표" value={G.targetRevenue} defaultValue={ig.targetRevenue} onChange={update} min={20_000_000} max={300_000_000} step={5_000_000} unit="원" />
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
