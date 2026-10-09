import { Home, Plane } from "lucide-react";
import { ourScore, oppScore } from "@/lib/stats";

const TeamSide = ({ label, value, onChange, score, mine, testId }) => (
  <div className="flex-1 min-w-0 text-center">
    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">{label}</div>
    <input value={value} onChange={(e) => onChange(e.target.value)} data-testid={`${testId}-name`}
      className={`w-full bg-transparent text-center font-display text-lg sm:text-2xl font-bold uppercase truncate outline-none border-b border-transparent focus:border-blue-500 ${mine ? "text-sky-300" : "text-slate-200"}`} />
    <div data-testid={`${testId}-score`} className="font-mono text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">{score}</div>
  </div>
);

export const Scoreboard = ({ match, mutate }) => {
  const atHome = match.venue === "casa";
  const mine = { value: match.my_team, onChange: (v) => mutate((m) => (m.my_team = v)), score: ourScore(match), mine: true, testId: "scoreboard-my" };
  const opp = { value: match.opponent_team, onChange: (v) => mutate((m) => (m.opponent_team = v)), score: oppScore(match), testId: "scoreboard-opp" };
  const [left, right] = atHome ? [mine, opp] : [opp, mine];
  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3">
      <TeamSide label="Casa" {...left} />
      <div className="flex flex-col items-center gap-2 shrink-0">
        <span className="font-display text-slate-500 text-xl font-bold">VS</span>
        <button data-testid="venue-toggle-btn" onClick={() => mutate((m) => (m.venue = atHome ? "trasferta" : "casa"))}
          className={`tap flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${atHome ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" : "bg-amber-500/15 text-amber-300 border-amber-500/40"}`}>
          {atHome ? <Home size={13} /> : <Plane size={13} />} {atHome ? "In casa" : "Fuori casa"}
        </button>
      </div>
      <TeamSide label="Ospiti" {...right} />
    </div>
  );
};
