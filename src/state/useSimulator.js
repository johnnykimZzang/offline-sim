// ─────────────────────────────────────────────────────────────────────────────
// useSimulator — useReducer + localStorage persistence
//
// 자동 저장: 상태 변경 후 300ms 디바운스 → localStorage
// 로드: 마운트 시 1회, 스키마 추가 필드는 initialState로 백필
// ─────────────────────────────────────────────────────────────────────────────

import { useReducer, useCallback, useEffect, useRef } from "react";
import { reducer, actions } from "./reducer";
import { initialState, DOMAINS } from "./schema";

const STORAGE_KEY = "offline-sim-state-v1";

/** localStorage에서 상태 복원. 손상/없음 시 initialState. */
function loadInitialState() {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    // Domain backfill — 새 도메인 추가 시 누락 방지
    const merged = { ...initialState };
    for (const domain of DOMAINS) {
      merged[domain] = { ...initialState[domain], ...(parsed[domain] || {}) };
    }
    merged.meta = { ...initialState.meta, ...(parsed.meta || {}) };
    return merged;
  } catch (err) {
    console.warn("[useSimulator] localStorage 복원 실패:", err);
    return initialState;
  }
}

export function useSimulator() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  // ── Persist (debounced) ───────────────────────────────────────────────
  const timer = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn("[useSimulator] localStorage 저장 실패:", err);
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [state]);

  // ── Action wrappers ───────────────────────────────────────────────────
  const update = useCallback(
    (domain, key, value) => dispatch(actions.update(domain, key, value)),
    []
  );
  const toggleClosedDow = useCallback(
    (dow) => dispatch(actions.toggleClosedDow(dow)),
    []
  );
  const setView      = useCallback((view)  => dispatch(actions.setView(view)),  []);
  const setMonth     = useCallback((month) => dispatch(actions.setMonth(month)), []);
  const resetDomain  = useCallback((domain) => dispatch(actions.resetDomain(domain)), []);
  const resetAll     = useCallback(() => dispatch(actions.resetAll()), []);
  const applyPreset  = useCallback((preset) => dispatch(actions.applyPreset(preset)), []);

  return {
    state,
    update,
    toggleClosedDow,
    setView,
    setMonth,
    resetDomain,
    resetAll,
    applyPreset,
    dispatch,
  };
}
