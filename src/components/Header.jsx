import { T } from "../design/tokens";
import { MONTHS_KR } from "../lib/constants";
import CodeLabel from "./primitives/CodeLabel";

export default function Header({ selectedMonth, onMonthChange }) {
  return (
    <div style={{
      borderBottom: `1px solid ${T.borderSubtle}`,
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: T.bgDeep,
      position: "sticky",
      top: 0,
      zIndex: 10,
      gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: T.accent, boxShadow: `0 0 10px ${T.accent}`,
        }} />
        <div>
          <div><CodeLabel color={T.accent}>toomuchtax offline</CodeLabel></div>
          <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.3px", lineHeight: 1.1, marginTop: 2 }}>
            브랜드 경험 + CRM 시뮬레이터
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {MONTHS_KR.map((m, i) => (
          <button key={i} onClick={() => onMonthChange(i)} style={{
            padding: "3px 9px", fontSize: 11, fontWeight: 400,
            border: "1px solid",
            borderColor: selectedMonth === i ? T.accent : T.borderDefault,
            background:  selectedMonth === i ? T.accentDim : "transparent",
            color:       selectedMonth === i ? T.accent : T.textMuted,
            borderRadius: 9999, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", transition: "all 0.12s",
          }}>{m}</button>
        ))}
      </div>
    </div>
  );
}
