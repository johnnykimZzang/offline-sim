import { memo } from "react";
import { T } from "../../design/tokens";
import { fmt } from "../../lib/format";

/**
 * Slider — domain-aware. domain/field props로 schema 위치 지정.
 *
 * leverRank: 1-5 = Top5 민감도 순위 (배지 표시), undefined = 해당 없음
 * hasTopLevers: true이면 Top5 아닌 슬라이더를 dim 처리
 */
function Slider({
  label, value, onChange, domain, field, defaultValue,
  min, max, step = 1, unit = "", tip,
  leverRank, hasTopLevers,
}) {
  const handle = (e) => {
    const v = Number(e.target.value);
    if (domain && field) onChange(domain, field, v);
    else onChange(v);
  };

  const isModified  = defaultValue != null && value !== defaultValue;
  const isTopLever  = leverRank != null && leverRank <= 5;
  // Top5가 있는 상태에서 내가 Top5가 아니면 dim
  const isDimmed    = hasTopLevers && !isTopLever;

  return (
    <div
      id={domain && field ? `slider-${domain}-${field}` : undefined}
      style={{
        marginBottom: 10,
        opacity: isDimmed ? 0.55 : 1,
        transition: "opacity 0.2s, background 0.3s",
        borderRadius: 6,
        padding: isTopLever ? "4px 6px 0" : undefined,
        background: isTopLever ? "rgba(62, 207, 142, 0.06)" : undefined,
        marginLeft: isTopLever ? -6 : undefined,
        marginRight: isTopLever ? -6 : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* 민감도 배지 */}
          {isTopLever && (
            <span title={`민감도 ${leverRank}위 (현재 시나리오 기준)`} style={{
              fontSize: 9,
              fontFamily: "'Source Code Pro', monospace",
              fontWeight: 600,
              color: T.accent,
              background: T.accentDim,
              border: `1px solid ${T.accentBorder}`,
              borderRadius: 4,
              padding: "1px 5px",
              lineHeight: 1.4,
              whiteSpace: "nowrap",
            }}>#{leverRank}</span>
          )}
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
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={handle}
        style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }}
      />
    </div>
  );
}

export default memo(Slider);
