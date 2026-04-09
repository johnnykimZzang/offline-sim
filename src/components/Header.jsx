import { T } from "../design/tokens";
import { MONTHS_KR } from "../lib/constants";
import { presetList } from "../state/presets";

export default function Header({ selectedMonth, onMonthChange, onApply, onResetAll, hasModifications, onToggleSidebar, sidebarOpen }) {
  return (
    <div style={{
      borderBottom: `1px solid ${T.borderSubtle}`,
      padding: "0 8px",
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: T.bgDeep,
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Mobile sidebar toggle — hidden on desktop via CSS */}
      <button
        className="sim-sidebar-toggle"
        onClick={onToggleSidebar}
        style={{ borderColor: T.borderDefault, color: T.textMuted, marginRight: 2 }}
        aria-label="사이드바 열기/닫기"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Left — brand identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: T.accent, boxShadow: `0 0 8px ${T.accent}`,
        }} />
        <div>
          <div style={{
            fontSize: 9,
            fontFamily: "'Source Code Pro', monospace",
            color: T.accent,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 500,
            lineHeight: 1,
          }}>TOOMUCHTAX OFFLINE</div>
          <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.2px", lineHeight: 1.2, marginTop: 2, color: T.textPrimary }}>
            브랜드 경험 + CRM 시뮬레이터
          </div>
        </div>
      </div>

      {/* Center — scenario presets */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center", minWidth: 0, overflow: "hidden" }}>
        <span style={{
          fontSize: 9,
          fontFamily: "'Source Code Pro', monospace",
          color: T.textFaint,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          flexShrink: 0,
          marginRight: 2,
        }}>시나리오</span>
        {presetList.map((p) => (
          <button
            key={p.id}
            onClick={() => onApply && onApply(p.state, p.label)}
            title={p.description}
            style={{
              padding: "3px 10px",
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
              gap: 5,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = p.color;
              e.currentTarget.style.background = `${p.color}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.borderDefault;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            {p.label}
          </button>
        ))}
        <button
          onClick={() => onResetAll && onResetAll()}
          disabled={!hasModifications}
          title={hasModifications ? "모든 값 기본값으로 복원" : "변경 사항 없음"}
          style={{
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 500,
            border: `1px solid ${T.borderDefault}`,
            background: "transparent",
            color: hasModifications ? T.warn : T.textFaint,
            borderRadius: 9999,
            cursor: hasModifications ? "pointer" : "not-allowed",
            fontFamily: "'Inter', sans-serif",
            opacity: hasModifications ? 1 : 0.45,
            transition: "all 0.12s",
            whiteSpace: "nowrap",
          }}
        >↺ 초기화</button>
      </div>

      {/* Right — month selector */}
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0 }}>
        {MONTHS_KR.map((m, i) => (
          <button key={i} onClick={() => onMonthChange(i)} style={{
            padding: "2px 7px", fontSize: 10, fontWeight: 400,
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
