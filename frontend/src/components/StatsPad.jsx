import { Minus, Plus } from "lucide-react";
import { COUNTERS, fmtPm, pmClass, playerPoints } from "@/lib/stats";

const Counter = ({ label, value, onChange, k, valueCls = "" }) => (
  <div className="bg-slate-800/60 border border-white/10 rounded-lg p-2 text-center">
    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">{label}</div>
    <div className="flex items-center justify-between gap-1">
      <button data-testid={`btn-sub-stat-${k}`} onClick={() => onChange(-1)} className="tap w-10 h-10 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center"><Minus size={16} /></button>
      <span data-testid={`stat-${k}`} className={`font-mono text-2xl font-bold tabular-nums ${valueCls}`}>{value}</span>
      <button data-testid={`btn-add-stat-${k}`} onClick={() => onChange(1)} className="tap w-10 h-10 rounded-md bg-blue-600 hover:bg-blue-500 flex items-center justify-center"><Plus size={16} /></button>
    </div>
  </div>
);

export const StatsPad = ({ player, pm, onStat, onFt }) => {
  const ftM = player.fts.filter((f) => f.made).length;
  return (
    <section className="bg-slate-900/50 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
      <h3 className="text-xl font-bold uppercase px-1">Statistiche Giocatore</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-2 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wider text-sky-300">Punti (PTS)</div>
          <div data-testid="stat-pts" className="font-mono text-4xl font-bold text-sky-300">{playerPoints(player)}</div>
        </div>
        <Counter k="plusMinus" label="Plus / Minus" value={fmtPm(pm)} valueCls={pmClass(pm)} onChange={(d) => onStat("pmAdj", d)} />
      </div>
      <div className="bg-slate-800/60 border border-white/10 rounded-lg p-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tiri Liberi (TL)</span>
          <span data-testid="stat-ft" className="font-mono font-bold">{ftM}/{player.fts.length}</span>
        </div>
        <div className="flex gap-2">
          <button data-testid="btn-ft-made" onClick={() => onFt(true)} className="tap flex-1 h-10 rounded-md bg-emerald-600 font-bold text-sm">+ Segnato</button>
          <button data-testid="btn-ft-missed" onClick={() => onFt(false)} className="tap flex-1 h-10 rounded-md bg-red-600 font-bold text-sm">+ Sbagliato</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {COUNTERS.map((c) => (
          <Counter key={c.key} k={c.key} label={c.label} value={player.stats[c.key]}
            valueCls={c.key === "pf" && player.stats.pf >= 4 ? (player.stats.pf >= 5 ? "text-red-400" : "text-amber-400") : ""}
            onChange={(d) => onStat(c.key, d)} />
        ))}
      </div>
    </section>
  );
};
