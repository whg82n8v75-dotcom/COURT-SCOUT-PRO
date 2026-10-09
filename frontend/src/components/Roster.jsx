import { PlayerCard } from "@/components/PlayerCard";

export const Roster = ({ match, mutate, activeId, setActiveId, pmMap }) => {
  const count = match.players.filter((p) => p.inCourt).length;
  return (
    <section className="bg-slate-900/50 border border-white/10 rounded-xl p-3 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xl font-bold uppercase">Roster</h3>
        <span data-testid="court-count-badge"
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${count === 5 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
          {count}/5 In Campo
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto scroll-thin pr-1 lg:max-h-[calc(100vh-220px)]">
        {match.players.map((p, i) => (
          <PlayerCard key={p.id} p={p} idx={i} active={p.id === activeId} pm={pmMap[p.id]}
            onSelect={() => setActiveId(p.id)}
            onToggle={() => mutate((m) => { const x = m.players[i]; x.inCourt = !x.inCourt; })}
            onEdit={(k, v) => mutate((m) => (m.players[i][k] = v))} />
        ))}
      </div>
    </section>
  );
};
