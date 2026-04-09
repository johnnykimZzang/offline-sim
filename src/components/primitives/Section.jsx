import { T } from "../../design/tokens";

/**
 * Collapsible/resettable section panel.
 *
 * groupScore: 0-100. 그룹 내 최대 민감도 영향도 (%). 5%=풀바 기준.
 *
 * <Section label="유동인구 / 유입" onReset={() => resetDomain("demand")} modified groupScore={42}>
 *   ...
 * </Section>
 */
export default function Section({ label, children, onReset, modified, groupScore, accentColor }) {
  // groupScore: upPct (e.g. 4.2) → normalize to 0-100, ceiling at 5% = full bar
  const barPct = groupScore != null ? Math.min((groupScore / 5) * 100, 100) : 0;

  return (
    <div style={{
      background: T.bgSurface,
      border: `1px solid ${T.borderDefault}`,
      borderLeft: `3px solid ${accentColor || T.borderStrong}`,
      borderRadius: 8,
      padding: "8px 10px",
      marginBottom: 6,
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: groupScore != null ? 6 : 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 10,
            fontFamily: "'Source Code Pro', monospace",
            color: T.textFaint,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
          }}>{label}</span>
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

      {/* 그룹 영향도 micro bar */}
      {groupScore != null && (
        <div style={{ marginBottom: 6 }}>
          <div style={{
            height: 2,
            background: T.borderSubtle,
            borderRadius: 9999,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${barPct}%`,
              height: "100%",
              background: barPct > 60 ? T.accent : barPct > 30 ? "rgba(62,207,142,0.5)" : T.borderDefault,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
