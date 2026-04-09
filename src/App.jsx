import { useMemo, useDeferredValue, useState, useCallback } from "react";

import { T } from "./design/tokens";
import { useSimulator } from "./state/useSimulator";
import { initialState, DOMAINS } from "./state/schema";
import { simulateMonth, computeSummary, computeGoalReversal } from "./lib/simulator";
import { runInsights } from "./insights/rules";
import { runSensitivity } from "./lib/sensitivity";
import { presets } from "./state/presets";

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
import TopLeversCard from "./components/TopLeversCard";
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

  // ── Hero 배너 state ──
  const [heroDismissed, setHeroDismissed] = useState(() =>
    localStorage.getItem("hero-dismissed-v1") === "true"
  );

  // showHeroBanner: hasModifications가 확정된 뒤 계산
  const showHeroBanner = !heroDismissed && !hasModifications;

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

      <Header selectedMonth={state.meta.selectedMonth} onMonthChange={setMonth} />

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
          {/* Hero 배너 — 첫 진입 안내 */}
          {showHeroBanner && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: T.accentDim,
              border: `1px solid ${T.accentBorder}`,
              borderRadius: 8,
              padding: "7px 12px",
              marginBottom: 8,
              gap: 10,
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 12, color: T.accent, fontFamily: "'Inter', sans-serif" }}>
                처음이세요? <strong>현실 시나리오</strong>부터 불러와서 시작해보세요 →
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => {
                    handleApplyPreset(presets.realistic.state, presets.realistic.label);
                    setHeroDismissed(true);
                    localStorage.setItem("hero-dismissed-v1", "true");
                  }}
                  style={{
                    padding: "4px 14px", fontSize: 11, fontWeight: 500,
                    background: T.accent, color: "#111", border: "none",
                    borderRadius: 6, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}
                >현실 시나리오 불러오기</button>
                <button
                  onClick={() => {
                    setHeroDismissed(true);
                    localStorage.setItem("hero-dismissed-v1", "true");
                  }}
                  style={{
                    background: "transparent", border: "none", color: T.textFaint,
                    cursor: "pointer", fontSize: 11, fontFamily: "'Inter', sans-serif", padding: "4px 6px",
                  }}
                >건너뛰기</button>
              </div>
            </div>
          )}

          <PresetBar
            onApply={handleApplyPreset}
            onResetAll={handleResetAll}
            hasModifications={hasModifications}
          />

          <DiffSummary
            currentState={state}
            baselineState={baseline.state}
            baselineLabel={baseline.label}
            currentRevenue={summary.totalRevenue}
            baselineRevenue={baselineSummary.totalRevenue}
            showToast={baselineToast}
          />

          <KpiGrid summary={summary} targetRevenue={state.goal.targetRevenue} />

          {/* Tabs — 2단 위계 */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <Tab active={state.meta.view === "sensitivity"} onClick={() => setView("sensitivity")}>민감도</Tab>
              <Tab active={state.meta.view === "goal"}        onClick={() => setView("goal")}>목표 역산</Tab>
              <Tab active={state.meta.view === "calendar"}    onClick={() => setView("calendar")}>일별 캘린더</Tab>
            </div>
            <div style={{ display: "flex", gap: 5, paddingLeft: 2 }}>
              {[
                { id: "weekly",    label: "주간 요약" },
                { id: "funnel",    label: "전환 퍼널" },
                { id: "crmFunnel", label: "CRM 퍼널" },
                { id: "compare",   label: "평일 vs 주말" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  style={{
                    fontSize: 11,
                    fontFamily: "'Source Code Pro', monospace",
                    padding: "3px 10px",
                    borderRadius: 5,
                    border: `1px solid ${state.meta.view === id ? T.accentBorder : T.borderDefault}`,
                    background: state.meta.view === id ? T.accentDim : "transparent",
                    color: state.meta.view === id ? T.accent : T.textFaint,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >{label}</button>
              ))}
            </div>
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
