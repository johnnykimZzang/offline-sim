import { T } from "../../design/tokens";

export default function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px",
      fontSize: 12,
      fontWeight: 500,
      border: "1px solid",
      cursor: "pointer",
      borderColor: active ? T.accent : T.borderDefault,
      background:  active ? T.accentDim : "transparent",
      color:       active ? T.accent : T.textMuted,
      borderRadius: 9999,
      fontFamily: "'Inter', sans-serif",
      transition: "all 0.12s",
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}
