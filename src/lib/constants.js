// ─────────────────────────────────────────────────────────────────────────────
// Domain constants
// ─────────────────────────────────────────────────────────────────────────────

export const DAYS_KR   = ["일", "월", "화", "수", "목", "금", "토"];
export const MONTHS_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// 한남동/이태원 패턴 — Sun=1.3, Mon=0.7 … Sat=1.4
export const DOW_MULT   = [1.3, 0.7, 0.75, 0.85, 0.9, 1.1, 1.4];
export const IS_WEEKEND = [true, false, false, false, false, false, true];

// 영업 시간 / 혼잡도 모델 파라미터
export const OP_MINUTES  = 480;  // 8시간 영업
export const PEAK_FACTOR = 1.8;  // 동시 체류 피크 환산 계수
