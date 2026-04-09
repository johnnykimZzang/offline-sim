# Design Decisions

> 최종 갱신: 2026-04-08

중요한 설계 판단과 그 이유. 새로운 결정은 위에 추가 (역시간순).

---

## 2026-04-09 — Phase 5: 민감도 분석

**결정:** compare view 대신 민감도 분석을 Phase 4(insight 룰 강화)보다 먼저 구현.

**이유:**
- 도구 정체성(의사결정 도구)의 3축 중 "민감도"는 가장 객관적 · 스티키.
- Insight 룰은 주관적 규칙에 의존 → 민감도 수치가 있어야 규칙이 근거를 가짐.
- Phase 4에서 insight가 "이 변수가 +15% 움직이면 매출 X억" 같은 구체적 액션으로 발전 가능.

**구현 판단:**
- **순수 함수 분리** — `lib/sensitivity.js` 에 `runSensitivity(state, deltaPct)` 1개 export. React 의존성 0.
- **단순 섭동 방식** — 각 변수 ±N% 독립 섭동. 변수 간 상호작용은 미측정(향후 2차 분석 가능).
- **정수형 보정** — roomCount, staffCount 는 ±1 단위 (0.2 같은 분수 무의미).
- **매출 정의** — totalRevenue + totalCrmRevenue. CRM 재구매 기여도 포함.
- **UI: tornado chart** — 중앙축 기준 좌우 막대. down/up 양방향 표시가 탄력성 비대칭을 드러냄.
- **정렬 기준** — impact = max(|up%|, |down%|) 내림차순. Top 5 강조.

**의도적으로 하지 않은 것:**
- **차트 라이브러리** — 단순 CSS 막대로 충분. recharts 추가 안 함.
- **2차 분석 (변수 쌍)** — 계산량 O(n²)로 폭증. 필요해지면 별도 탭.
- **목표 대비 gap 표시** — 별도 뷰(GoalView) 책임이라 중복 회피.

---

## 2026-04-08 — Phase 2: localStorage + 프리셋

**결정:** 자동 저장은 useReducer 훅 내부에서 처리. 전역 store나 외부 라이브러리 없음.

**이유:**
- 단일 사용자 단일 세션 가정. 충돌/동기화 이슈 없음.
- 300ms 디바운스로 슬라이더 드래그 중 과다 저장 방지.
- 도메인 백필 로직으로 schema 변경 시 누락 필드 자동 복구.
- 실패 시 silent fallback (console.warn). UX 방해 X.

**프리셋 구조:**
- partial state로 저장. 변경할 도메인만 명시.
- `applyPreset` 액션이 도메인 단위 shallow merge. 명시 안 한 도메인은 보존.
- 4개 프리셋: 보수 / 현실 / 낙관 / 목표(1억).

**대안 검토:**
- IndexedDB → localStorage로 충분 (state 객체 < 5KB).
- URL share → Phase 3 이후 검토.

---

## 2026-04-08 — Phase 1: 단일 파일 → 모듈 분할

**결정:** App.jsx 1178줄을 25개 모듈로 분할. State는 useReducer + 도메인 schema. 시뮬레이션은 12개 순수 함수로 계층화.

**이유:**

1. **30개 useState → useReducer 1개**
   - props drilling/dependency tracking 부담 제거
   - 새 슬라이더 추가가 schema + ControlPanel만 수정으로 끝남
   - 섹션별 reset, 프리셋, diff 계산 구조적으로 자연스러움

2. **시뮬레이션 함수 계층화 (12개)**
   - `computeTraffic / computeStaffing / computeFittingPath / computeSegmentConversion / computeRevenue / computeCRM` 등
   - 각 함수 단독 호출 가능 → 향후 sensitivity analysis, unit test 즉시 추가 가능
   - "매출은 같은데 CRM만 비교" 같은 부분 비교가 함수 단위로 가능

3. **도메인 그룹 schema**
   - `state.conversion.baseConvRate` 같은 경로
   - 단일 액션 `UPDATE` 으로 전체 처리
   - Slider 컴포넌트가 `domain` + `field` props로 dispatch 위치 알려줌

4. **순수 함수 분리 (lib/)**
   - React 의존성 0
   - 향후 vitest 추가 시 즉시 테스트 가능
   - Node 환경에서 시뮬레이션 가능 (CLI 도구 등)

**의도적으로 하지 않은 것:**
- TypeScript 마이그레이션 — 단일 사용자, 좁은 도메인. JSDoc도 충분.
- 상태 라이브러리 (Redux/Zustand) — useReducer 7개 액션으로 충분.
- 컴포넌트 라이브러리 (shadcn/ui) — 디자인 토큰 + primitives로 충분.

---

## 2026-04-08 — 도구 정체성: 의사결정 도구

**결정:** 매출 계산기가 아니라 의사결정 도구로 포지셔닝. 모든 기능은 다음 3가지에 기여하는지로 판단.

1. **민감도** — 어떤 변수가 결과를 가장 크게 움직이나
2. **액션** — 어떤 행동이 KPI를 올리나
3. **비교 용이성** — 시나리오 3개를 얼마나 빠르게 비교하나

**영향:**
- CompareView (시나리오 비교) 우선순위 상향
- Insight rule을 단순 메시지에서 reason + action 구조로 발전
- Sensitivity analysis가 향후 핵심 기능
- 슬라이더 정확도보다 비교/탐색 UX가 더 중요

---

## 2026-04-08 — Supabase 디자인 시스템 채택

**결정:** Supabase 디자인 토큰 (#3ecf8e, dark mode native, Source Code Pro labels) 채택.

**이유:**
- 데이터 밀도 높은 다크 대시보드에 검증된 시스템
- 개발자 도구 미학과 매장 운영 도구의 분석적 성격 일치
- semantic token 구조 (`success`, `warning`, `info`) 가 향후 확장에 유리

**대안:** Linear (보라색, 더 미니멀) / Vercel (흑백) / Sentry (보라색 다크) 검토 후 Supabase 선택.
