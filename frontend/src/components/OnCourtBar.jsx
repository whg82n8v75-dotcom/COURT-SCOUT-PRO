import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fmtPm, playerPoints, pmClass } from "@/lib/stats";

const SubMenu = ({ out, bench, onSwap }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button data-testid={`sub-btn-${out.id}`} onClick={(e) => e.stopPropagation()} title="Sostituisci"
          className="tap w-9 h-9 shrink-0 rounded-md bg-slate-800 border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/50 flex items-center justify-center">
          <ArrowLeftRight size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 bg-slate-900 border-white/10" align="start">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">Esce #{out.number} {out.surname} · entra:</div>
        <div className="max-h-72 overflow-y-auto scroll-thin flex flex-col gap-1">
          {bench.length === 0 && <p className="text-sm text-slate-500 px-2 py-2">Nessun giocatore in panchina</p>}
          {bench.map((b) => (
            <button key={b.id} data-testid={`sub-in-${out.id}-${b.id}`} onClick={() => { onSwap(out.id, b.id); setOpen(false); }}
              className="tap flex items-center gap-2 text-left px-2 py-2 rounded-md hover:bg-emerald-500/15 text-sm">
              <span className="font-mono font-bold w-8 text-sky-300">#{b.number}</span>
              <span className="flex-1 truncate">{b.name} {b.surname}</span>
              <span className={`text-xs font-mono ${b.stats.pf >= 4 ? "text-red-400" : "text-slate-500"}`}>{b.stats.pf}F</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Chip = ({ p, active, pm, bench, onSelect, onSwap }) => (
  <div data-testid={`oncourt-chip-${p.id}`} onClick={onSelect}
    className={`tap cursor-pointer flex items-center gap-2 rounded-lg border px-2.5 py-2 min-w-0 ${active ? "border-blue-500 bg-blue-500/15 ring-1 ring-blue-500" : "border-white/10 bg-slate-900/80 hover:border-white/25"}`}>
    <span className="font-mono text-2xl font-bold text-sky-300 shrink-0">{p.number}</span>
    <div className="min-w-0 flex-1 leading-tight">
      <div className="font-display text-base font-bold uppercase truncate">{p.surname || p.name}</div>
      <div className="flex gap-2 text-[11px] font-mono text-slate-400">
        <span>{playerPoints(p)}pt</span>
        <span className={p.stats.pf >= 4 ? "text-red-400 font-bold" : ""}>{p.stats.pf}F</span>
        <span className={pmClass(pm)}>{fmtPm(pm)}</span>
      </div>
    </div>
    <SubMenu out={p} bench={bench} onSwap={onSwap} />
  </div>
);

export const OnCourtBar = ({
  match,
  mutate,
  activeId,
  setActiveId,
  pmMap,
  clockDisplay,
  startClock,
  pauseClock,
  resetClock,
  nextQuarter,
  }) => {
  const onCourt = match.players.filter((p) => p.inCourt);
  const bench = match.players.filter((p) => !p.inCourt);
  const swap = (outId, inId) => mutate((m) => {
  const now = Date.now();
  const clockRunning = m.clock?.running && clockDisplay > 0;

  m.players.forEach((p) => {
    if (p.id === outId) {
      if (clockRunning && p.minuteStartedAt != null) {
        p.minutesMs = (p.minutesMs || 0) + Math.max(
          0,
          now - p.minuteStartedAt
        );
      }

      p.minuteStartedAt = null;
      p.inCourt = false;
    }

    if (p.id === inId) {
      p.inCourt = true;
      p.minutesMs = p.minutesMs || 0;
      p.minuteStartedAt = clockRunning ? now : null;
    }
  });
});
  return (
    <section data-testid="oncourt-bar" className="sticky top-0 z-20 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2 mb-3 bg-[#0B1120]/90 backdrop-blur-md border-b border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-900 border border-white/10">
  <div>
    <div className="text-xs uppercase tracking-widest text-slate-400">
      {match.quarter}
    </div>
    <div className="text-4xl font-mono font-bold text-white tabular-nums">
      {Math.floor(clockDisplay / 60000)}:
      {String(Math.floor((clockDisplay % 60000) / 1000)).padStart(2, "0")}
    </div>
  </div>

  <div className="flex flex-wrap gap-2">
    <button
      onClick={match.clock?.running ? pauseClock : startClock}
      className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold"
    >
      {match.clock?.running ? "PAUSA" : "START"}
    </button>

    <button
      onClick={resetClock}
      className="px-4 py-2 rounded-lg bg-slate-700 text-white font-bold"
    >
      RESET
    </button>

    <button
      onClick={nextQuarter}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold"
      disabled={match.quarter === "OT"}
    >
      QUARTO SUCCESSIVO
    </button>
  </div>
</div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400">Quintetto in campo</span>
        <span data-testid="oncourt-count" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${onCourt.length === 5 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{onCourt.length}/5</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {onCourt.map((p) => (
          <Chip key={p.id} p={p} active={p.id === activeId} pm={pmMap[p.id]} bench={bench} onSelect={() => setActiveId(p.id)} onSwap={swap} />
        ))}
        {onCourt.length === 0 && <p className="text-sm text-slate-500 col-span-full">Nessun giocatore in campo: usa IN CAMPO nel roster.</p>}
      </div>
    </section>
  );
};
