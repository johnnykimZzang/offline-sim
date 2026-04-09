import { T } from "../design/tokens";
import { presetList } from "../state/presets";
import CodeLabel from "./primitives/CodeLabel";

/**
 * 시나리오 프리셋 칩 + 전체 초기화 버튼.
 *
 * <PresetBar onApply={applyPreset} onResetAll={resetAll} hasModifications={...} />
 */
export default function PresetBar({ onApply, onResetAll, hasModifications }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      marginBottom: 10,
      background: T.bgSurface,
      border: `1px solid ${T.borderDefault}`,
      borderRadius: 10,
      flexWrap: "wrap",
    }}>
      <CodeLabel>시나리오</CodeLabel>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
        {presetList.map((p) => (
          <button
            key={p.id}
            onClick={() => onApply(p.state)}
            title={p.description}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 500,
              border: `1px solid ${T.borderDefault}`,
              background: "transparent",
              color: p.color,
              borderRadius: 9999,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.12s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = p.color;
              e.currentTarget.style.background = `${p.color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.borderDefault;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: p.color, flexShrink: 0,
            }} />
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={onResetAll}
        disabled={!hasModifications}
        title={hasModifications ? "모든 값 기본값으로 복원" : "변경 사항 없음"}
        style={{
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 500,
          border: `1px solid ${T.borderDefault}`,
          background: "transparent",
          color: hasModifications ? T.warn : T.textFaint,
          borderRadius: 9999,
          cursor: hasModifications ? "pointer" : "not-allowed",
          fontFamily: "'Inter', sans-serif",
          opacity: hasModifications ? 1 : 0.5,
          transition: "all 0.12s",
        }}
      >↺ 전체 초기화</button>
    </div>
  );
}
