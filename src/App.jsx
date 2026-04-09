import { useMemo, useDeferredValue, useState, useCallback } from "react";

import { T } from "./design/tokens";
import { useSimulator } from "./state/useSimulator";
import { initialState, DOMAINS } from "./state/schema";
import { simulateMonth, computeSummary, computeGoalReversal } from "./lib/simulator";
import { runInsights } from "./insights/rules";
import { runSensitivity } from "./lib/sensitivity";
import Header        from "./components/Header";
import ControlPanel  from "./components/ControlPanel";
import KpiGrid       from "./components/KpiGrid";
import InsightPanel  from "./components/InsightPanel";

import CalendarView  from "./components/views/CalendarView";
import WeeklyView    from "./components/views/WeeklyView";
import FunnelView    from "./components/views/FunnelView";
import CrmFunnelView from "./components/views/CrmFunnelView";
import GoalView      from "./components/views/GoalView";
import CompareView   from "./components/views/CompareView";
import SensitivityView from "./components/views/SensitivityView";
import DiffSummary from "./components/DiffSummary";

// ─────────────────────────────────────────────────────────────────────────────
// App — 조립 + 레이아웃만. 모든 비즈니스 로직은 lib/simulator + insights에.
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    state, update, toggleClosedDow, setView, setMonth,
    resetDomain, resetAll, applyPreset,
  } = useSimulator();

  // ── Memoized derivations ──
  const monthData = useMemo(
    () => simulateMonth(state, state.meta.selectedYear, state.meta.selectedMonth),
    [state],
  );
  const summary  = useMemo(() => computeSummary(monthData),     [monthData]);
  const insights = useMemo(() => runInsights({ state, summary }), [state, summary]);
  const goalReversal = useMemo(
    () => computeGoalReversal(state, summary),
    [state, summary],
  );

  // 변경 여부 (PresetBar의 전체 초기화 버튼 활성화 판단)
  const hasModifications = useMemo(() => {
    for (const domain of DOMAINS) {
      const cur = state[domain], init = initialState[domain];
      for (const key of Object.keys(init)) {
        const a = cur[key], b = init[key];
        if (Array.isArray(a) || Array.isArray(b)) {
          if (JSON.stringify(a) !== JSON.stringify(b)) return true;
        } else if (a !== b) {
          return true;
        }
      }
    }
    return false;
  }, [state]);

  // ── Baseline 추적 (DiffSummary 기준) ──
  const [baseline, setBaseline] = useState({ state: initialState, label: "기본 시나리오" });
  const [baselineToast, setBaselineToast] = useState(false);

  const baselineSummary = useMemo(() => {
    const bd = simulateMonth(baseline.state, baseline.state.meta?.selectedYear ?? state.meta.selectedYear, baseline.state.meta?.selectedMonth ?? state.meta.selectedMonth);
    return computeSummary(bd);
  }, [baseline.state, state.meta.selectedYear, state.meta.selectedMonth]);

  const handleApplyPreset = useCallback((presetState, presetLabel) => {
    applyPreset(presetState);
    setBaseline({ state: { ...initialState, ...presetState }, label: presetLabel });
    setBaselineToast(true);
    setTimeout(() => setBaselineToast(false), 2000);
  }, [applyPreset]);

  const handleResetAll = useCallback(() => {
    resetAll();
    setBaseline({ state: initialState, label: "기본 시나리오" });
    setBaselineToast(true);
    setTimeout(() => setBaselineToast(false), 2000);
  }, [resetAll]);

  // ── 민감도 (deferred — 슬라이더 드래그 중 비차단) ──
  const deferredState = useDeferredValue(state);
  const { results: sensitivityResults } = useMemo(
    () => runSensitivity(deferredState, 10),
    [deferredState],
  );

  // 축약 leverMap: { "domain.field": { rank, isTopLever, upPct } }
  // 원본 results 전체를 하위 컴포넌트에 전파하지 않음
  const leverMap = useMemo(() => {
    const map = {};
    sensitivityResults.forEach((r, i) => {
      map[`${r.domain}.${r.field}`] = {
        rank: i + 1,
        isTopLever: i < 5,
        upPct: r.upPct,
      };
    });
    return map;
  }, [sensitivityResults]);

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      color: T.textPrimary,
      fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
      fontSize: 14,
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Source+Code+Pro:wght@400;500&family=Noto+Sans+KR:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Header
        selectedMonth={state.meta.selectedMonth}
        onMonthChange={setMonth}
        onApply={handleApplyPreset}
        onResetAll={handleResetAll}
        hasModifications={hasModifications}
      />

      {/* 콘텐츠 행 — 헤더 아래 남은 높이 전부 차지, 좌우 독립 스크롤 */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        maxWidth: 1440,
        width: "100%",
        margin: "0 auto",
        padding: "0 20px",
        minWidth: 0,
      }}>

        {/* 좌 패널 — 310px 고정, 독립 스크롤 */}
        <div style={{
          width: 310,
          flexShrink: 0,
          overflowY: "auto",
          height: "100%",
          padding: "14px 14px 20px 0",
          borderRight: `1px solid ${T.borderSubtle}`,
          background: T.bgDeep,
        }}>
          <ControlPanel
            state={state}
            update={update}
            toggleClosedDow={toggleClosedDow}
            resetDomain={resetDomain}
            summary={summary}
            leverMap={leverMap}
          />
        </div>

        {/* 우 패널 — 나머지 너비, 독립 스크롤 */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          height: "100%",
          padding: "14px 0 20px 16px",
          minWidth: 0,
        }}>

          <KpiGrid summary={summary} targetRevenue={state.goal.targetRevenue} />

          {/* Tab bar + DiffSummary — Amplitude underline style */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderBottom: `1px solid ${T.borderSubtle}`,
            marginBottom: 14,
            gap: 8,
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, overflowX: "auto", flexShrink: 0 }}>
              {[
                { id: "sensitivity", label: "민감도" },
                { id: "goal",        label: "목표 역산" },
                { id: "calendar",    label: "일별 캘린더" },
                { id: "weekly",      label: "주간 요약" },
                { id: "funnel",      label: "전환 퍼널" },
                { id: "crmFunnel",   label: "CRM 퍼널" },
                { id: "compare",     label: "평일 vs 주말" },
              ].map(({ id, label }) => {
                const active = state.meta.view === id;
                return (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    style={{
                      padding: "8px 14px",
                      fontSize: 12,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: active ? 500 : 400,
                      background: "transparent",
                      border: "none",
                      borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
                      color: active ? T.accent : T.textMuted,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "color 0.12s, border-color 0.12s",
                      marginBottom: -1,
                    }}
                  >{label}</button>
                );
              })}
            </div>
            {/* DiffSummary — 탭바 우측 인라인 */}
            <DiffSummary
              currentState={state}
              baselineState={baseline.state}
              baselineLabel={baseline.label}
              currentRevenue={summary.totalRevenue}
              baselineRevenue={baselineSummary.totalRevenue}
              showToast={baselineToast}
              inline
            />
          </div>

          {state.meta.view === "calendar" && (
            <CalendarView
              monthData={monthData}
              summary={summary}
              year={state.meta.selectedYear}
              month={state.meta.selectedMonth}
            />
          )}
          {state.meta.view === "weekly"      && <WeeklyView    summary={summary} />}
          {state.meta.view === "funnel"      && <FunnelView    summary={summary} />}
          {state.meta.view === "crmFunnel"   && <CrmFunnelView summary={summary} state={state} />}
          {state.meta.view === "goal"        && <GoalView summary={summary} state={state} goalReversal={goalReversal} />}
          {state.meta.view === "compare"     && <CompareView summary={summary} />}
          {state.meta.view === "sensitivity" && <SensitivityView state={state} />}

          <InsightPanel insights={insights} />
        </div>
      </div>
    </div>
  );
}
