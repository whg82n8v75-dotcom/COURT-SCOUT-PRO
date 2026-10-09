export const OpponentBar = ({ name, onPoints }) => (
  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
    <span className="text-[11px] uppercase font-bold tracking-wider text-red-300 mr-1 truncate">Canestro {name || "avversario"}</span>
    {[1, 2, 3].map((n) => (
      <button key={n} data-testid={`opp-points-${n}`} onClick={() => onPoints(n)}
        className="tap h-11 min-w-[56px] px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm">
        +{n}{n === 1 ? " TL" : ""}
      </button>
    ))}
  </div>
);
