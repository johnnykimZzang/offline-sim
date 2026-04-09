// ─────────────────────────────────────────────────────────────────────────────
// Reducer — 단일 액션 디스패치 시스템
//
// Action 종류:
//   UPDATE             { domain, key, value }
//   TOGGLE_CLOSED_DOW  { dow }
//   SET_VIEW           { view }
//   SET_MONTH          { month }
//   RESET_DOMAIN       { domain }
//   RESET_ALL
//   APPLY_PRESET       { preset }   // partial state
//   LOAD               { state }
// ─────────────────────────────────────────────────────────────────────────────

import { initialState } from "./schema";

export function reducer(state, action) {
  switch (action.type) {
    case "UPDATE": {
      const { domain, key, value } = action;
      return {
        ...state,
        [domain]: { ...state[domain], [key]: value },
      };
    }

    case "TOGGLE_CLOSED_DOW": {
      const { dow } = action;
      const cur = state.operations.closedDows;
      const next = cur.includes(dow) ? cur.filter(d => d !== dow) : [...cur, dow];
      return {
        ...state,
        operations: { ...state.operations, closedDows: next },
      };
    }

    case "SET_VIEW":
      return { ...state, meta: { ...state.meta, view: action.view } };

    case "SET_MONTH":
      return { ...state, meta: { ...state.meta, selectedMonth: action.month } };

    case "RESET_DOMAIN":
      return { ...state, [action.domain]: initialState[action.domain] };

    case "RESET_ALL":
      return initialState;

    case "APPLY_PRESET": {
      // partial state shallow-merge per domain
      const next = { ...state };
      for (const domain of Object.keys(action.preset)) {
        next[domain] = { ...state[domain], ...action.preset[domain] };
      }
      return next;
    }

    case "LOAD":
      return { ...initialState, ...action.state };

    default:
      return state;
  }
}

// ── Action creators (편의 함수) ──────────────────────────────────────────────
export const actions = {
  update: (domain, key, value) => ({ type: "UPDATE", domain, key, value }),
  toggleClosedDow: (dow)        => ({ type: "TOGGLE_CLOSED_DOW", dow }),
  setView: (view)               => ({ type: "SET_VIEW", view }),
  setMonth: (month)             => ({ type: "SET_MONTH", month }),
  resetDomain: (domain)         => ({ type: "RESET_DOMAIN", domain }),
  resetAll: ()                  => ({ type: "RESET_ALL" }),
  applyPreset: (preset)         => ({ type: "APPLY_PRESET", preset }),
  load: (state)                 => ({ type: "LOAD", state }),
};
