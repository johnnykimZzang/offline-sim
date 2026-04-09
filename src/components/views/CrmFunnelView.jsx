import { T } from "../../design/tokens";
import { fmt, fmtW } from "../../lib/format";
import FunnelBar from "../primitives/FunnelBar";
import CodeLabel from "../primitives/CodeLabel";

export default function CrmFunnelView({ summary, state }) {
  const steps = [
    { label: "매장 방문",     value: summary.totalVisitors,        color: "#6366f1" },
    { label: "피팅 이용",     value: summary.totalFittingVisitors, color: "#8b5cf6" },
    { label: "구매",          value: summary.totalPurchasers,      color: T.purple  },
    { label: "회원가입",      value: summary.totalSignups,         color: "#c084fc" },
    { label: "수신동의",      value: summary.totalOptIns,          color: "#e879f9" },
    { label: "스토리 업로드", value: summary.totalStories,         color: "#f0abfc" },
    { label: "온라인 재구매", value: summary.totalOnlineRepurch,   color: T.accent  },
  ];

  return (
    <div style={{ background: T.bgSurface, border: `1px solid ${T.borderDefault}`, borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>CRM 퍼널 (월간)</span>
        <CodeLabel color={T.textMuted}>구매 안 함 ≠ 실패 · CRM 미확보 = 실패</CodeLabel>
      </div>
      <div style={{ marginBottom: 16, fontSize: 11, color: T.textFaint, lineHeight: 1.5 }}>
        방문 → 피팅 → 구매 → 회원가입 → 수신동의 → 스토리 업로드 → 온라인 재구매
      </div>

      {steps.map((step, i) => (
        <FunnelBar
          key={i}
          label={step.label}
          value={step.value}
          maxValue={steps[0].value}
          prevValue={i > 0 ? steps[i - 1].value : null}
          color={step.color}
        />
      ))}

      <div style={{
        marginTop: 16, padding: "12px 14px",
        background: T.bgDeep,
        border: `1px solid ${T.accentBorder}`,
        borderRadius: 8,
      }}>
        <div style={{ marginBottom: 6 }}><CodeLabel color={T.accent}>예상 CRM 장기 기여</CodeLabel></div>
        <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
          회원가입 <span style={{ color: T.textPrimary, fontFamily: "'Source Code Pro', monospace" }}>{fmt(summary.totalSignups)}명</span>
          {" × 재구매율 "}
          <span style={{ color: T.textPrimary, fontFamily: "'Source Code Pro', monospace" }}>{state.crm.onlineRepurchaseRate}%</span>
          {" = "}
          <span style={{ color: T.accent, fontFamily: "'Source Code Pro', monospace" }}>{fmt(summary.totalOnlineRepurch)}명</span>
          <br />
          재구매 객단가 ₩{fmt(state.crm.repurchaseAOV)} → 추가 매출 <span style={{ color: T.accent, fontFamily: "'Source Code Pro', monospace", fontWeight: 500 }}>₩{fmtW(summary.totalCrmRevenue)}</span>
        </div>
      </div>
    </div>
  );
}
