import { T } from "../../design/tokens";
import { fmt } from "../../lib/format";

/**
 * Slider — domain-aware. domain/field props로 schema 위치 지정.
 *
 * <Slider
 *   domain="conversion"
 *   field="baseConvRate"
 *   value={state.conversion.baseConvRate}
 *   defaultValue={20}            // optional, 변경 표시용
 *   onChange={update}            // (domain, field, value) => void
 *   min={5} max={50} unit="%"
 * />
 */
export default function Slider({
  label, value, onChange, domain, field, defaultValue,
  min, max, step = 1, unit = "", tip,
}) {
  const handle = (e) => {
    const v = Number(e.target.value);
    if (domain && field) onChange(domain, field, v);
    else onChange(v);
  };

  const isModified = defaultValue != null && value !== defaultValue;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{
          fontSize: 12,
          color: T.textSecondary,
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.3,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          {/* Modified indicator */}
          {isModified && (
            <span title="기본값에서 변경됨" style={{
              width: 5, height: 5, borderRadius: "50%",
              background: T.accent,
              boxShadow: `0 0 4px ${T.accent}`,
              flexShrink: 0,
            }} />
          )}
          {label}
          {tip && (
            <span title={tip} style={{ marginLeft: 2, cursor: "help", color: T.textFaint, fontSize: 10 }}>ⓘ</span>
          )}
        </span>
        <span style={{
          fontFamily: "'Source Code Pro', monospace",
          fontSize: 11,
          fontWeight: 400,
          color: T.textPrimary,
          background: T.bgDeep,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: 4,
          padding: "2px 7px",
          minWidth: 56,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}>{fmt(value)}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={handle}
        style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }}
      />
    </div>
  );
}
