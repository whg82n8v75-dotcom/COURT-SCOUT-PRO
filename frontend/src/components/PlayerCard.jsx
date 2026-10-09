import { fmtPm, pmClass, playerPoints } from "@/lib/stats";

const inp = "h-9 px-2 rounded bg-slate-950/60 border border-white/10 text-sm outline-none focus:border-blue-500 min-w-0";

const FoulDots = ({ n }) => (
  <span className="flex gap-0.5" title={`${n} falli`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? (n >= 5 ? "bg-red-500" : "bg-amber-400") : "bg-slate-700"}`} />
    ))}
  </span>
);

export const PlayerCard = ({ p, idx, active, pm, onSelect, onToggle, onEdit }) => (
  <div data-testid={`player-item-${idx}`} onClick={onSelect}
    className={`tap cursor-pointer rounded-lg border p-2.5 ${active ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500" : "border-white/10 bg-slate-900/60 hover:border-white/25"} ${p.inCourt ? "border-l-4 border-l-emerald-500" : ""}`}>
    <div className="flex items-center justify-between mb-2">
      <button data-testid={`toggle-in-campo-${idx}`} onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`tap text-[10px] font-bold tracking-wider px-2.5 py-1 rounded ${p.inCourt ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 border border-white/10"}`}>
        {p.inCourt ? "IN CAMPO" : "PANCHINA"}
      </button>
      <div className="flex items-center gap-3 text-xs">
        <FoulDots n={p.stats.pf} />
        <span className={`font-mono font-bold ${pmClass(pm)}`} data-testid={`player-pm-${idx}`}>{fmtPm(pm)}</span>
      </div>
    </div>
    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
      <input className={`${inp} w-12 text-center font-mono font-bold`} value={p.number} onChange={(e) => onEdit("number", e.target.value)} placeholder="#" data-testid={`player-number-${idx}`} />
      <input className={`${inp} flex-1`} value={p.name} onChange={(e) => onEdit("name", e.target.value)} placeholder="Nome" data-testid={`player-name-${idx}`} />
      <input className={`${inp} flex-1`} value={p.surname} onChange={(e) => onEdit("surname", e.target.value)} placeholder="Cognome" data-testid={`player-surname-${idx}`} />
    </div>
    <div className="flex gap-4 mt-2 text-[11px] text-slate-400">
      <span>PTS <b className="text-slate-100 font-mono" data-testid={`player-pts-${idx}`}>{playerPoints(p)}</b></span>
      <span>Tiri <b className="text-slate-100 font-mono">{p.shots.length}</b></span>
      <span>PF <b className={`font-mono ${p.stats.pf >= 5 ? "text-red-400" : "text-slate-100"}`}>{p.stats.pf}</b></span>
      {p.stats.pf >= 5 && <span className="text-red-400 font-bold">ESCLUSO</span>}
    </div>
  </div>
);
