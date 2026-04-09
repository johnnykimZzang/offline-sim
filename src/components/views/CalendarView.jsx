import { useMemo } from "react";
import { T } from "../../design/tokens";
import { DAYS_KR, MONTHS_KR } from "../../lib/constants";
import { fmtW } from "../../lib/format";
import CodeLabel from "../primitives/CodeLabel";

export default function CalendarView({ monthData, summary, year, month }) {
  const maxDayRev = Math.max(...monthData.days.map(d => d.revenue), 1);

  const grid = useMemo(() => {
    const cells = [];
    for (let i = 0; i < monthData.firstDow; i++) cells.push(null);
    monthData.days.forEach(d => cells.push(d));
    return cells;
  }, [monthData]);

  return (
    <div style={{ background: T.bgSurface, border: `1px solid ${T.borderDefault}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{year}년 {MONTHS_KR[month]}</span>
        <CodeLabel>{summary.openCount}일 영업</CodeLabel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {DAYS_KR.map((d, i) => (
          <div key={d} style={{
            textAlign: "center", padding: "4px 0",
            fontFamily: "'Source Code Pro', monospace",
            fontSize: 10, letterSpacing: "1px",
            color: (i === 0 || i === 6) ? T.accent : T.textMuted,
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const intensity = cell.isOpen ? cell.revenue / maxDayRev : 0;
          return (
            <div key={i} style={{
              background: cell.isOpen
                ? `rgba(62, 207, 142, ${0.03 + intensity * 0.20})`
                : "transparent",
              border: `1px solid ${cell.isOpen
                ? (cell.isWeekend ? "rgba(62,207,142,0.22)" : T.borderSubtle)
                : T.borderSubtle}`,
              borderRadius: 7,
              padding: "7px 6px",
              minHeight: 64,
            }}>
              <div style={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: 10,
                color: cell.isOpen ? (cell.isWeekend ? T.accent : T.textMuted) : T.textFaint,
                marginBottom: 5,
                fontWeight: cell.isWeekend ? 500 : 400,
              }}>{cell.day}</div>
              {cell.isOpen ? (
                <>
                  <div style={{
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: 11, fontWeight: 500,
                    color: T.textPrimary, lineHeight: 1,
                  }}>{fmtW(cell.revenue)}</div>
                  <div style={{
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: 9, color: T.textMuted, marginTop: 4,
                  }}>{Math.round(cell.visitors)}→{Math.round(cell.purchasers)}</div>
                </>
              ) : (
                <div style={{ fontSize: 9, color: T.textFaint, marginTop: 6 }}>휴무</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
