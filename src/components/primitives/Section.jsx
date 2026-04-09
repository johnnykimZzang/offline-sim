import { T } from "../../design/tokens";
import CodeLabel from "./CodeLabel";

/**
 * Collapsible/resettable section panel.
 *
 * <Section label="유동인구 / 유입" onReset={() => resetDomain("demand")} modified>
 *   ...
 * </Section>
 */
export default function Section({ label, children, onReset, modified }) {
  return (
    <div style={{
      background: T.bgSurface,
      border: `1px solid ${T.borderDefault}`,
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 8,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CodeLabel color={T.accent}>{label}</CodeLabel>
          {modified && (
            <span title="이 섹션에 변경된 항목 있음" style={{
              width: 5, height: 5, borderRadius: "50%",
              background: T.accent,
              boxShadow: `0 0 4px ${T.accent}`,
            }} />
          )}
        </div>
        {onReset && modified && (
          <button
            onClick={onReset}
            title="섹션 초기화"
            style={{
              background: "transparent",
              border: `1px solid ${T.borderDefault}`,
              borderRadius: 4,
              padding: "1px 6px",
              fontSize: 10,
              color: T.textMuted,
              cursor: "pointer",
              fontFamily: "'Source Code Pro', monospace",
              letterSpacing: "0.5px",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.accent;
              e.currentTarget.style.color = T.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.borderDefault;
              e.currentTarget.style.color = T.textMuted;
            }}
          >↺ 초기화</button>
        )}
      </div>
      {children}
    </div>
  );
}
