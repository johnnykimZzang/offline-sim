import { useMemo, useState } from "react";
import { colors, space, radius, font, fontSize } from "../../design/tokens";
import { runSensitivity } from "../../lib/sensitivity";
import { fmtW } from "../../lib/format";

// 도메인별 색상 (범례 + 막대 틴트)
const DOMAIN_COLOR = {
  demand:     colors.info,
  product:    colors.brand,
  conversion: colors.purple,
  fitting:    colors.warning,
  crm:        "#ec4899",
  operations: colors.textMuted,
};

const DOMAIN_LABEL = {
  demand: "수요", product: "제품", conversion: "전환",
  fitting: "피팅", crm: "CRM", operations: "운영",
};

// 도메인별 조언 텍스트
const DOMAIN_ACTION = {
  demand:     "유동인구·유입률 개선 (마케팅/위치/간판)",
  product:    "가격 구조·구매 구성 최적화",
  conversion: "방문 목적 유도·동행 전환 전략",
  fitting:    "피팅룸 운영·체류 환경 개선",
  crm:        "회원 확보·재구매 채널 강화",
  operations: "직원 배치·운영 효율화",
};

export default function SensitivityView({ state }) {
  const [deltaPct, setDeltaPct] = useState(10);

  const { baseRevenue, results } = useMemo(
    () => runSensitivity(state, deltaPct),
    [state, deltaPct],
  );

  const maxImpact = Math.max(...results.map(r => r.impact), 1);
  const top5 = results.slice(0, 5);
  const nearZero = results.filter(r => r.impact < 1);

  // 상위 5개 중 가장 많이 등장한 도메인
  const domainCount = {};
  top5.forEach(r => { domainCount[r.domain] = (domainCount[r.domain] || 0) + 1; });
  const topDomain = Object.entries(domainCount).sort((a, b) => b[1] - a[1])[0];

  // 탄력성 2.0 이상 변수
  const highElasticity = results.filter(r => r.elasticity >= 2.0);

  return (
    <div style={{
      background: colors.panel,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: space.xl,
      marginBottom: space.lg,
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.lg,
      }}>
        <div>
          <div style={{
            fontSize: fontSize.h2,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 4,
          }}>
            민감도 분석
          </div>
          <div style={{
            fontSize: fontSize.caption,
            color: colors.textMuted,
            fontFamily: font.mono,
          }}>
            슬라이더를 ±{deltaPct}%씩 움직이면 월 매출이 얼마나 달라지나 · 현재 기준 {fmtW(baseRevenue)}원
          </div>
        </div>

        {/* Delta selector */}
        <div style={{ display: "flex", gap: 4 }}>
          {[5, 10, 20].map(d => (
            <button
              key={d}
              onClick={() => setDeltaPct(d)}
              style={{
                background: deltaPct === d ? colors.brandDim : "transparent",
                border: `1px solid ${deltaPct === d ? colors.brandBorder : colors.border}`,
                color: deltaPct === d ? colors.brand : colors.textSecondary,
                padding: "6px 10px",
                borderRadius: radius.sm,
                fontSize: fontSize.caption,
                fontFamily: font.mono,
                cursor: "pointer",
              }}
            >
              ±{d}%
            </button>
          ))}
        </div>
      </div>

      {/* ── 인사이트 카드 ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: space.sm,
        marginBottom: space.lg,
      }}>

        {/* 지금 당장 건드려야 할 레버 */}
        {results[0] && (
          <InsightCard
            icon="🎯"
            title="지금 가장 효과적인 레버"
            color={colors.brand}
            dimColor={colors.brandDim}
            borderColor={colors.brandBorder}
          >
            <span style={{ color: colors.textPrimary, fontWeight: 600 }}>{results[0].label}</span>
            을(를) {deltaPct}% 높이면 매출이{" "}
            <span style={{ color: colors.brand, fontWeight: 700 }}>+{results[0].upPct.toFixed(1)}%</span>{" "}
            오릅니다.{" "}
            <span style={{ color: colors.textMuted }}>
              ({fmtW(results[0].upRevenue - baseRevenue)}원 추가)
            </span>
          </InsightCard>
        )}

        {/* 집중해야 할 영역 */}
        {topDomain && (
          <InsightCard
            icon="📌"
            title="집중해야 할 영역"
            color={DOMAIN_COLOR[topDomain[0]]}
            dimColor={`${DOMAIN_COLOR[topDomain[0]]}15`}
            borderColor={`${DOMAIN_COLOR[topDomain[0]]}40`}
          >
            상위 5개 변수 중{" "}
            <span style={{ color: DOMAIN_COLOR[topDomain[0]], fontWeight: 600 }}>
              {DOMAIN_LABEL[topDomain[0]]}
            </span>
            {" "}영역이 {topDomain[1]}개 포함됩니다.
            <br />
            <span style={{ color: colors.textMuted, fontSize: fontSize.label }}>
              → {DOMAIN_ACTION[topDomain[0]]}
            </span>
          </InsightCard>
        )}

        {/* 조금만 달라져도 큰 변화 */}
        {highElasticity.length > 0 && (
          <InsightCard
            icon="⚡"
            title="소폭 변화로도 큰 영향"
            color={colors.warning}
            dimColor={colors.warningDim}
            borderColor={`${colors.warning}40`}
          >
            {highElasticity.slice(0, 2).map(r => (
              <span key={r.field} style={{ color: colors.warning, fontWeight: 600, marginRight: 6 }}>
                {r.label}
              </span>
            ))}
            <br />
            <span style={{ color: colors.textMuted, fontSize: fontSize.label }}>
              탄력성 2.0× 이상 — 1% 바꾸면 매출이 2% 이상 움직입니다
            </span>
          </InsightCard>
        )}

        {/* 지금은 신경 쓸 필요 없는 변수 */}
        {nearZero.length > 0 && (
          <InsightCard
            icon="🙈"
            title="지금은 신경 쓰지 않아도 됨"
            color={colors.textMuted}
            dimColor="rgba(137,137,137,0.08)"
            borderColor="rgba(137,137,137,0.2)"
          >
            <span style={{ color: colors.textSecondary }}>
              {nearZero.map(r => r.label).join(", ")}
            </span>
            <br />
            <span style={{ color: colors.textFaint, fontSize: fontSize.label }}>
              ±{deltaPct}% 바꿔도 매출 변화 1% 미만
            </span>
          </InsightCard>
        )}
      </div>

      {/* ── 범례 ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: space.md,
        marginBottom: space.md,
        paddingBottom: space.md,
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}>
        {Object.entries(DOMAIN_LABEL).map(([dom, label]) => (
          <div key={dom} style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: fontSize.caption,
            color: colors.textMuted,
            fontFamily: font.mono,
          }}>
            <div style={{
              width: 8, height: 8,
              background: DOMAIN_COLOR[dom],
              borderRadius: 2,
            }} />
            {label}
          </div>
        ))}
        <div style={{
          fontSize: fontSize.caption,
          color: colors.textFaint,
          fontFamily: font.mono,
          marginLeft: "auto",
        }}>
          왼쪽 막대 = 줄였을 때 · 오른쪽 막대 = 늘렸을 때
        </div>
      </div>

      {/* ── 토네이도 바 ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {results.map((r, idx) => (
          <TornadoRow
            key={`${r.domain}-${r.field}`}
            rank={idx + 1}
            row={r}
            maxImpact={maxImpact}
          />
        ))}
      </div>

      {/* ── 하단 설명 ── */}
      <div style={{
        marginTop: space.lg,
        paddingTop: space.md,
        borderTop: `1px solid ${colors.borderSubtle}`,
        fontSize: fontSize.caption,
        color: colors.textFaint,
        fontFamily: font.mono,
        lineHeight: 1.6,
      }}>
        반응 배율 = 입력을 1% 바꿀 때 매출이 몇 % 움직이는지. 1.0이면 비례, 2.0이면 2배 증폭.
        초록색 강조 = 의사결정 우선순위 Top 5.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InsightCard — 인사이트 요약 카드
// ─────────────────────────────────────────────────────────────────────────────
function InsightCard({ icon, title, color, dimColor, borderColor, children }) {
  return (
    <div style={{
      background: dimColor,
      border: `1px solid ${borderColor}`,
      borderRadius: radius.md,
      padding: `${space.md}px ${space.md}px`,
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      lineHeight: 1.7,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
        fontSize: fontSize.label,
        color,
        fontWeight: 600,
        fontFamily: font.mono,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        <span>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TornadoRow — 좌우 막대
// ─────────────────────────────────────────────────────────────────────────────
function TornadoRow({ rank, row, maxImpact }) {
  const { domain, label, upPct, downPct, elasticity, baseValue } = row;
  const barColor = DOMAIN_COLOR[domain] || colors.textMuted;
  const isTop5 = rank <= 5;

  const scale = (pct) => (Math.abs(pct) / maxImpact) * 100;
  const upWidth   = scale(upPct);
  const downWidth = scale(downPct);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "28px 180px 1fr 80px",
      alignItems: "center",
      gap: space.sm,
      padding: "8px 6px",
      borderRadius: radius.sm,
      background: isTop5 ? "rgba(62, 207, 142, 0.04)" : "transparent",
    }}>

      {/* Rank */}
      <div style={{
        fontSize: fontSize.caption,
        color: isTop5 ? colors.brand : colors.textFaint,
        fontFamily: font.mono,
        textAlign: "center",
        fontWeight: isTop5 ? 600 : 400,
      }}>
        #{rank}
      </div>

      {/* Label */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: fontSize.body,
          color: colors.textPrimary,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: fontSize.label,
          color: colors.textFaint,
          fontFamily: font.mono,
        }}>
          {DOMAIN_LABEL[domain]} · 현재 {baseValue.toLocaleString("ko-KR")}
        </div>
      </div>

      {/* Bar */}
      <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
        {/* Center line */}
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: 1, background: colors.borderStrong,
        }} />

        {/* Down (left) bar */}
        <div style={{
          position: "absolute",
          right: "50%",
          height: 16,
          width: `${downWidth / 2}%`,
          background: `${barColor}40`,
          borderRight: `2px solid ${barColor}`,
          borderRadius: "3px 0 0 3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: 4,
        }}>
          {Math.abs(downPct) > 1 && (
            <span style={{ fontSize: fontSize.label, color: colors.textSecondary, fontFamily: font.mono }}>
              {downPct.toFixed(1)}%
            </span>
          )}
        </div>

        {/* Up (right) bar */}
        <div style={{
          position: "absolute",
          left: "50%",
          height: 16,
          width: `${upWidth / 2}%`,
          background: `${barColor}60`,
          borderLeft: `2px solid ${barColor}`,
          borderRadius: "0 3px 3px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 4,
        }}>
          {Math.abs(upPct) > 1 && (
            <span style={{ fontSize: fontSize.label, color: colors.textPrimary, fontFamily: font.mono, fontWeight: 500 }}>
              +{upPct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Elasticity → "반응 배율"로 친숙하게 */}
      <div style={{
        fontSize: fontSize.caption,
        color: Math.abs(elasticity) > 0.5 ? colors.brand : colors.textMuted,
        fontFamily: font.mono,
        textAlign: "right",
        fontWeight: Math.abs(elasticity) > 0.5 ? 600 : 400,
      }}>
        {elasticity.toFixed(2)}×
      </div>
    </div>
  );
}
