// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — Supabase-inspired
// 컴포넌트는 raw hex를 직접 쓰지 않고 이 토큰만 참조한다.
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Surface
  bg:           "#111111",
  panel:        "#181818",
  panelRaised:  "#1f1f1f",
  panelDeep:    "#0d0d0d",

  // Border
  borderSubtle:  "#242424",
  border:        "#2e2e2e",
  borderStrong:  "#363636",

  // Text
  textPrimary:   "#fafafa",
  textSecondary: "#b4b4b4",
  textMuted:     "#898989",
  textFaint:     "#5a5a5a",

  // Semantic
  brand:    "#3ecf8e",
  brandDim: "rgba(62, 207, 142, 0.10)",
  brandBorder: "rgba(62, 207, 142, 0.25)",

  success:    "#3ecf8e",
  successDim: "rgba(62, 207, 142, 0.10)",
  successBorder: "rgba(62, 207, 142, 0.25)",

  warning:    "#f5a623",
  warningDim: "rgba(245, 166, 35, 0.10)",
  warningBorder: "rgba(245, 166, 35, 0.25)",

  danger:     "#f87171",
  dangerDim:  "rgba(248, 113, 113, 0.10)",
  dangerBorder: "rgba(248, 113, 113, 0.25)",

  info:       "#60a5fa",
  infoDim:    "rgba(96, 165, 250, 0.08)",
  infoBorder: "rgba(96, 165, 250, 0.22)",

  purple:     "#a78bfa",
  purpleDim:  "rgba(167, 139, 250, 0.10)",
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 28,
  "3xl": 40,
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  pill: 9999,
};

export const font = {
  body: "'Inter', 'Noto Sans KR', sans-serif",
  mono: "'Source Code Pro', 'Menlo', monospace",
};

export const fontSize = {
  label:   10,
  caption: 11,
  body:    12,
  sub:     13,
  h3:      14,
  h2:      16,
  h1:      20,
};

// Backwards-compatible flat object for components that prefer single import
export const T = {
  ...colors,
  // legacy aliases used in existing code
  bgSurface:     colors.panel,
  bgSurface2:    colors.panelRaised,
  bgDeep:        colors.panelDeep,
  borderDefault: colors.border,
  accent:        colors.brand,
  accentDim:     colors.brandDim,
  accentBorder:  colors.brandBorder,
  warn:          colors.danger,
  warnDim:       colors.dangerDim,
  warnBorder:    colors.dangerBorder,
};

export default { colors, space, radius, font, fontSize, T };
