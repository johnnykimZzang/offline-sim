# Frontend 문서

> 최종 업데이트: 2026-04-09

---

## 기술 스택

- React 18 (Vite)
- 인라인 스타일 + CSS 클래스 혼합 (Tailwind 없음)
- 디자인 토큰: `src/design/tokens.js` (T 객체)
- 레이아웃 토큰: `src/index.css` CSS 변수

---

## 레이아웃 원칙 (2026-04-09~)

- **Full-width product layout** — centered marketing layout 아님. `#root`는 고정폭 없이 뷰포트 100% 사용.
- **레이아웃 치수는 CSS 토큰 기준** — sidebar width, page gutter는 `--sim-sidebar-width`, `--sim-page-gutter`로 관리. JSX에 px 수치 하드코딩 지양.
- **Mobile: off-canvas drawer sidebar** — 767px 이하에서 사이드바는 fixed + transform 슬라이드. backdrop + ESC + resize 자동 닫기 포함.
- **새 패널/카드 설계 시** — full-width 환경 기준으로 확장 가능한 최소폭을 고려. 고정폭 요소 지양.
- **Breakpoint 기준**:
  - mobile: ≤ 767px (off-canvas sidebar)
  - compact/tablet: 768~1199px (sidebar 240px)
  - wide desktop: ≥ 1200px (sidebar 260px)

---

## 화면 구조

```
App (height: 100vh, flex column)
├── Header (fixed height: 52px)
└── Content Row (flex: 1, overflow: hidden)
    ├── .sim-sidebar (width: var(--sim-sidebar-width))
    │   ├── TopLeversCard (sticky top)
    │   └── ControlPanel (scrollable)
    └── .sim-main (flex: 1, overflow-y: auto)
        ├── KpiGrid
        ├── DiffSummary
        ├── Tab bar
        └── View (calendar / weekly / funnel / crm / goal / compare / sensitivity)
```

---

## 상태 관리

- `useSimulator` hook (`src/state/useSimulator.js`) — 모든 시뮬레이터 상태
- `useState` in App — `baseline`, `baselineToast`, `sidebarOpen`
- localStorage 자동 저장 (슬라이더 변경 시)

---

## 컴포넌트 규칙

- 스타일은 인라인 `style={{}}` 우선, 구조/반응형만 CSS 클래스
- 색상/폰트/간격은 `T.xxx` 디자인 토큰 사용
- 새 섹션 추가 시 `primitives/Section.jsx` 래퍼 사용 (padding: `8px 10px`)
- 슬라이더는 `primitives/Slider.jsx` 공통 컴포넌트 사용

---

## 반응형 구현 방식

CSS 클래스 기반 (`src/index.css`):
- `.sim-sidebar` — CSS 변수로 width 제어, 모바일에서 fixed drawer
- `.sim-sidebar-backdrop` — 모바일 overlay backdrop
- `.sim-sidebar-toggle` — 모바일 햄버거 버튼 (데스크탑에서는 display: none)
- `.sim-main` — 모바일에서 full-width + gutter padding

body scroll lock: App.jsx의 `useEffect`에서 `sidebarOpen` 상태에 따라 `document.body.style.overflow` 제어.

---

## 다음 단계 (예정)

- KPI/섹션 정보 위계 재정비 (prominence, density 조정)
- comfortable / dense view 옵션
- `--sim-sidebar-width` 등 design token 시스템으로 확장
