import { useRef } from "react";
import { Q_COLORS } from "@/lib/stats";

const ShotMark = ({ s, r = 9 }) => {
  const c = Q_COLORS[s.quarter];
  if (s.result === "made")
    return <circle className="shot-pop" cx={s.x} cy={s.y} r={r} fill={c} fillOpacity="0.3" stroke={c} strokeWidth="4" />;
  const d = r - 2;
  return (
    <g className="shot-pop" stroke={c} strokeWidth="4" strokeLinecap="round">
      <line x1={s.x - d} y1={s.y - d} x2={s.x + d} y2={s.y + d} />
      <line x1={s.x + d} y1={s.y - d} x2={s.x - d} y2={s.y + d} />
    </g>
  );
};

export const Court = ({ shots, onShot, testId }) => {
  const ref = useRef(null);
  const click = (e) => {
    if (!onShot) return;
    const r = ref.current.getBoundingClientRect();
    onShot(((e.clientX - r.left) / r.width) * 500, ((e.clientY - r.top) / r.height) * 470);
  };
  return (
    <div className="court-wrap">
      <svg ref={ref} viewBox="0 0 500 470" onClick={click} data-testid={testId}
        className={`block w-full h-auto ${onShot ? "cursor-crosshair" : ""}`}>
        <g fill="none" stroke="#FEF3C7" strokeWidth="3">
          <rect x="0" y="0" width="500" height="470" strokeWidth="5" />
          <rect x="170" y="0" width="160" height="190" fill="#92400E" fillOpacity="0.45" />
          <path d="M 170 190 A 80 80 0 0 0 330 190" />
          <path d="M 170 190 A 80 80 0 0 1 330 190" strokeDasharray="6,6" />
          <path d="M 50 0 L 50 140 A 200 200 0 0 0 450 140 L 450 0" />
          <line x1="220" y1="40" x2="280" y2="40" strokeWidth="4" />
        </g>
        <circle cx="250" cy="55" r="15" fill="none" stroke="#ef4444" strokeWidth="4" />
        <g>{shots.map((s, i) => <ShotMark key={s.t || i} s={s} r={onShot ? 9 : 8} />)}</g>
      </svg>
    </div>
  );
};

export const QuarterLegend = () => (
  <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs font-semibold text-slate-300">
    {Object.entries(Q_COLORS).map(([q, c]) => (
      <span key={q} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /> {q}
      </span>
    ))}
    <span className="text-slate-500">○ segnato · ✕ sbagliato</span>
  </div>
);
