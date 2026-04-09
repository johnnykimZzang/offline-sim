import { T } from "../../design/tokens";

export default function CodeLabel({ children, color, size = 10 }) {
  return (
    <span style={{
      fontFamily: "'Source Code Pro', 'Menlo', monospace",
      fontSize: size,
      fontWeight: 400,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: color || T.textMuted,
    }}>{children}</span>
  );
}
