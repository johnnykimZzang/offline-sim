import { memo, useState } from "react";
import { createPortal } from "react-dom";
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

  const [tipPos, setTipPos] = useState(null);

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
            <span
              style={{ display: "inline-flex", marginLeft: 2 }}
              onMouseEnter={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setTipPos({ x: r.left + r.width / 2, y: r.top });
              }}
              onMouseLeave={() => setTipPos(null)}
            >
              <span style={{
                cursor: "help",
                color: T.textFaint,
                fontSize: 9,
                fontFamily: "'Source Code Pro', monospace",
                fontWeight: 700,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: "50%",
                width: 14,
                height: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                flexShrink: 0,
                userSelect: "none",
              }}>!</span>
              {tipPos && createPortal(
                <div style={{
                  position: "fixed",
                  top: tipPos.y - 8,
                  left: Math.max(125, Math.min(tipPos.x, window.innerWidth - 125)),
                  transform: "translate(-50%, -100%)",
                  background: T.bgSurface2,
                  border: `1px solid ${T.borderStrong}`,
                  borderRadius: 8,
                  padding: "8px 11px",
                  fontSize: 11,
                  color: T.textSecondary,
                  fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
                  lineHeight: 1.55,
                  width: 230,
                  whiteSpace: "normal",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.9)",
                  zIndex: 99999,
                  pointerEvents: "none",
                  opacity: 1,
                }}>
                  {tip}
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0, height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `5px solid ${T.borderStrong}`,
                  }} />
                </div>,
                document.body
              )}
            </span>
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
