import { useMemo } from "react";

import { T } from "./design/tokens";
import { useSimulator } from "./state/useSimulator";
import { initialState, DOMAINS } from "./state/schema";
import { simulateMonth, computeSummary, computeGoalReversal } from "./lib/simulator";
import { runInsights } from "./insights/rules";

import Header        from "./components/Header";
import PresetBar     from "./components/PresetBar";
import ControlPanel  from "./components/ControlPanel";
import KpiGrid       from "./components/KpiGrid";
import InsightPanel  from "./components/InsightPanel";
import Tab           from "./components/primitives/Tab";

import CalendarView  from "./components/views/CalendarView";
import WeeklyView    from "./components/views/WeeklyView";
import FunnelView    from "./components/views/FunnelView";
import CrmFunnelView from "./components/views/CrmFunnelView";
import GoalView      from "./components/views/GoalView";
import CompareView   from "./components/views/CompareView";
import SensitivityView from "./components/views/SensitivityView";

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

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.textPrimary,
      fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
      fontSize: 14,
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Source+Code+Pro:wght@400;500&family=Noto+Sans+KR:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Header selectedMonth={state.meta.selectedMonth} onMonthChange={setMonth} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>

          <ControlPanel
            state={state}
            update={update}
            toggleClosedDow={toggleClosedDow}
            resetDomain={resetDomain}
            summary={summary}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <PresetBar
              onApply={applyPreset}
              onResetAll={resetAll}
              hasModifications={hasModifications}
            />

            <KpiGrid summary={summary} targetRevenue={state.goal.targetRevenue} />

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <Tab active={state.meta.view === "calendar"}  onClick={() => setView("calendar")}>일별 캘린더</Tab>
              <Tab active={state.meta.view === "weekly"}    onClick={() => setView("weekly")}>주간 요약</Tab>
              <Tab active={state.meta.view === "funnel"}    onClick={() => setView("funnel")}>전환 퍼널</Tab>
              <Tab active={state.meta.view === "crmFunnel"} onClick={() => setView("crmFunnel")}>CRM 퍼널</Tab>
              <Tab active={state.meta.view === "goal"}      onClick={() => setView("goal")}>목표 역산</Tab>
              <Tab active={state.meta.view === "compare"}   onClick={() => setView("compare")}>평일 vs 주말</Tab>
              <Tab active={state.meta.view === "sensitivity"} onClick={() => setView("sensitivity")}>민감도</Tab>
            </div>

            {state.meta.view === "calendar" && (
              <CalendarView
                monthData={monthData}
                summary={summary}
                year={state.meta.selectedYear}
                month={state.meta.selectedMonth}
              />
            )}
            {state.meta.view === "weekly"    && <WeeklyView    summary={summary} />}
            {state.meta.view === "funnel"    && <FunnelView    summary={summary} />}
            {state.meta.view === "crmFunnel" && <CrmFunnelView summary={summary} state={state} />}
            {state.meta.view === "goal"      && (
              <GoalView summary={summary} state={state} goalReversal={goalReversal} />
            )}
            {state.meta.view === "compare"   && <CompareView summary={summary} />}
            {state.meta.view === "sensitivity" && <SensitivityView state={state} />}

            <InsightPanel insights={insights} />
          </div>
        </div>
      </div>
    </div>
  );
}
