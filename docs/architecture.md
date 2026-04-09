# Architecture

> 최종 갱신: 2026-04-08

## 개요

toomuchtax 오프라인 매장 시뮬레이터.
브랜드 경험 + CRM + 매출을 통합한 의사결정 도구. 단일 사용자, 정적 SPA, 외부 의존성 최소.

**스택:** React 19 + Vite. 외부 라이브러리 0 (React만). 정적 호스팅 가능.

## 디렉터리 구조

```
src/
├── App.jsx                       # 조립 + 레이아웃 (~120줄)
├── main.jsx                      # 엔트리포인트
│
├── design/
│   └── tokens.js                 # 디자인 토큰 (semantic colors, space, radius, font)
│
├── lib/                          # 순수 함수만. React 의존성 0.
│   ├── constants.js              # DAYS_KR, DOW_MULT, OP_MINUTES …
│   ├── format.js                 # fmt, fmtW, fmtPct
│   ├── simulator.js              # 12개 계산 함수 (계층화)
│   └── sensitivity.js            # ±N% 섭동 → 매출 변화율 측정 (Phase 5)
│
├── state/                        # 상태 관리
│   ├── schema.js                 # 도메인 그룹 초기값
│   ├── reducer.js                # 7개 액션
│   ├── presets.js                # 보수/현실/낙관/목표 (Phase 2)
│   └── useSimulator.js           # useReducer + localStorage persist
│
├── insights/
│   └── rules.js                  # 룰 베이스 인사이트 엔진
│
└── components/
    ├── primitives/               # 재사용 UI 유닛
    │   ├── CodeLabel.jsx
    │   ├── Slider.jsx            # domain-aware + modified indicator
    │   ├── Section.jsx           # collapsible + reset button
    │   ├── StatCard.jsx
    │   ├── Tab.jsx
    │   └── FunnelBar.jsx
    ├── Header.jsx                # sticky header + 월 선택
    ├── PresetBar.jsx             # 시나리오 칩 + 전체 초기화
    ├── ControlPanel.jsx          # 좌측 7개 섹션
    ├── KpiGrid.jsx               # KPI 카드 2줄
    ├── InsightPanel.jsx          # 인사이트 카드
    └── views/
        ├── CalendarView.jsx
        ├── WeeklyView.jsx
        ├── FunnelView.jsx
        ├── CrmFunnelView.jsx
        ├── GoalView.jsx
        ├── CompareView.jsx       # 평일 vs 주말
        └── SensitivityView.jsx   # 민감도 tornado chart (Phase 5)
```

## 데이터 흐름

```
   localStorage
        ▲
        │ (debounced 300ms persist)
        │
   ┌────┴─────┐  schema (도메인 그룹)
   │  state   │◀────── initialState
   └────┬─────┘
        │ (state, year, month)
        ▼
   simulateMonth(state)              ┌──── computeEffectiveAOV (product)
        │                            ├──── computeTraffic       (demand)
        │ days[]                     ├──── computeDecisionMakers (conversion)
        ▼                            ├──── computeStaffing       (operations)
   computeSummary(monthData)         ├──── computeFittingPath    (fitting)
        │                            ├──── computeSegmentConversion
        │ summary                    ├──── computeRevenue        (product)
        ▼                            └──── computeCRM            (crm)
   ┌─────────┬──────────┬───────────┐
   │ KpiGrid │  Views   │ Insights  │
   └─────────┴──────────┴───────────┘
```

## 상태 관리 (state/)

### Schema

도메인 단위 그룹화. 슬라이더 = "domain.field" 경로.

```js
state = {
  demand:     { footTraffic, storeEntryRate, weekendWeight, touristRatio },
  product:    { priceSingle, priceSet, priceHoodieSetup, setPurchaseRate, hoodieSetShare, addonPurchaseRate, addonPrice },
  conversion: { purposeVisitRatio, baseConvRate, purposeConvRate, companionRatio, companionDecisionRate },
  fitting:    { avgStayMinutes, roomCount, useRate, purchaseRate, waitDropRate },
  crm:        { signupRate, optInRate, storyUploadRate, qrScanRate, onlineRepurchaseRate, repurchaseAOV },
  operations: { staffCount, staffCapacity, operatingDays, closedDows[] },
  goal:       { targetRevenue },
  meta:       { selectedMonth, selectedYear, view },
}
```

### Reducer 액션

| Action | Payload | 책임 |
|---|---|---|
| `UPDATE` | `{ domain, key, value }` | 단일 슬라이더 변경 |
| `TOGGLE_CLOSED_DOW` | `{ dow }` | 정기 휴무 요일 토글 |
| `SET_VIEW` | `{ view }` | 탭 전환 |
| `SET_MONTH` | `{ month }` | 월 선택 |
| `RESET_DOMAIN` | `{ domain }` | 섹션 초기화 |
| `RESET_ALL` | — | 전체 초기화 |
| `APPLY_PRESET` | `{ preset }` | 프리셋 partial state 적용 |
| `LOAD` | `{ state }` | localStorage에서 복원 |

### Persistence

`useSimulator` 훅에서 자동 처리:
- **저장**: state 변경 후 300ms 디바운스 → `localStorage["offline-sim-state-v1"]`
- **로드**: 마운트 시 1회. 도메인 백필로 schema 변경 시 누락 방지.
- **실패 처리**: try/catch + console.warn. 사용자에게 노출 X.

## 시뮬레이션 계층 (lib/simulator.js)

순수 함수 12개. React 의존성 없음. 각각 단독 호출/테스트 가능.

| 함수 | 입력 | 출력 |
|---|---|---|
| `computeEffectiveAOV(product)` | 단품/세트/후드셋업 가격, 비중 | 실효 객단가 |
| `computeTraffic(demand, dow, isWeekend)` | 유동인구 + DOW + 주말 가중치 | `{ dailyFoot, visitors }` |
| `computeDecisionMakers(conversion, visitors)` | 동행 비율 + 결정자 비율 | `{ decisionMakers, companions, solo }` |
| `computeStaffing(operations, fitting, visitors)` | 직원 capacity vs 동시 체류 | `{ capacity, concurrent, overflow, convMult }` |
| `computeFittingPath(fitting, decisionMakers, convMult)` | 피팅룸 capacity, 대기 이탈 | `{ fittingVisitors, fittingPurchasers, fittingDropped }` |
| `computeSegmentConversion(...)` | 비피팅 결정자 → 목적/일반 분리 | `{ purposePurchasers, casualPurchasers, ... }` |
| `computeRevenue(effectiveAOV, segments)` | 세그먼트별 AOV 보정 | `{ revenue, byChannel }` |
| `computeCRM(crm, totalPurchasers, visitors)` | 구매자 → 가입/수신/스토리/재구매 | `{ signups, optIns, stories, qrScans, onlineRepurchasers, crmRevenue }` |
| `simulateDay(...)` | 위 함수들의 오케스트레이터 | 단일 일자 결과 |
| `simulateMonth(state, year, month)` | 한 달 루프 | `{ days, firstDow, daysInMonth, effectiveAOV }` |
| `computeSummary(monthData)` | 집계 + 주간 그룹 + 평일/주말 분리 | summary 객체 |
| `computeGoalReversal(state, summary)` | 목표 대비 필요 수치 역산 | requirements 객체 |

## 인사이트 엔진 (insights/rules.js)

룰 배열 + 실행기 패턴. 새 룰 추가 시 컴포넌트 수정 없이 배열에 push만.

```js
{
  id: "low-purchase-rate",
  evaluate: ({ state, summary }) => ({
    severity: "warn",  // good | warn | info
    text: "...",
  })
}
```

향후 Phase 4에서 `title + reason + impact + actions[]` 구조로 확장 예정.

## 디자인 토큰 (design/tokens.js)

Supabase-inspired. Semantic 토큰만 사용. raw hex는 토큰 정의 시점에서만 등장.

- `colors.bg / panel / border / textPrimary / brand / success / warning / danger / info`
- `space.xs/sm/md/lg/xl/2xl/3xl` (4 / 8 / 12 / 16 / 20 / 28 / 40 px)
- `radius.xs/sm/md/lg/xl/pill`
- `font.body / mono`

`T` 객체는 backwards-compat 별칭 — 컴포넌트들이 점진적으로 `colors.*`로 마이그레이션 예정.

## 무엇을 하지 않는가

도구의 단순함을 지키기 위한 의도적 회피:

- TypeScript 마이그레이션
- Redux/Zustand 등 상태 라이브러리
- shadcn/ui 등 컴포넌트 라이브러리
- 백엔드/DB
- 차트 라이브러리 (recharts, chart.js)
- 애니메이션 라이브러리 (framer-motion)
- 실시간 협업 / 다중 사용자
- i18n
- PWA / 오프라인 모드
