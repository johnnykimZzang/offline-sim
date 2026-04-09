import { T } from "../../design/tokens";
import FunnelBar from "../primitives/FunnelBar";

export default function FunnelView({ summary }) {
  const steps = [
    { label: "유동인구",            value: summary.totalFoot,           color: "#6366f1" },
    { label: "매장 유입",           value: summary.totalVisitors,       color: "#8b5cf6" },
    { label: "결정자 (동행 보정)", value: summary.totalDecisionMakers, color: T.purple },
    { label: "구매 전환",           value: summary.totalPurchasers,     color: T.accent },
  ];

  return (
    <div style={{ background: T.bgSurface, border: `1px solid ${T.borderDefault}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>전환 퍼널 (월간)</div>
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
    </div>
  );
}
