import {
  fmtPm,
  ftText,
  pmClass,
  playerLine,
  teamTotals,
  formatMinutes,
  plusMinusPer10,
} from "@/lib/stats";

const HEAD = [
  "#", "Giocatore", "MIN", "PTS", "2PT", "3PT",
  "FG", "FG%", "TL", "RO", "RD", "RT",
  "AST", "STL", "TO", "BLK", "PF", "DF",
  "+/-"
];
const cells = (l) => [
  <b key="p">{l.pts}</b>, `${l.m2}/${l.a2}`, `${l.m3}/${l.a3}`, `${l.fgM}/${l.fgA}`,
  l.fgA ? `${Math.round((l.fgM / l.fgA) * 100)}%` : "-", <span key="ft" className="whitespace-nowrap">{ftText(l.ftM, l.ftA)}</span>,
  l.ro, l.rd, l.rt, l.ast, l.stl, l.to, l.blk, l.pf, l.df,
];


export const Boxscore = ({ match, pmMap, clockDisplay }) => {
  void clockDisplay;
  
  const lines = match.players.map((p) => {
    const l = playerLine(p, pmMap);

const now = Date.now();

const accumulatedMs = p.minutesMs || 0;

const liveMs =
  match.clock?.running &&
  p.inCourt &&
  p.minuteStartedAt != null
    ? Math.min(
        Math.max(0, now - p.minuteStartedAt),
        Math.max(0, match.clock.remainingMs)
      )
    : 0;

const seconds = (accumulatedMs + liveMs) / 1000;

    return {
      p,
      l,
      min: formatMinutes(seconds),
      pm10: plusMinusPer10(l.pm, seconds),
    };
  });

  const tot = teamTotals(lines.map((x) => x.l));

  return (
    <div className="overflow-x-auto scroll-thin rounded-lg border border-white/10">
      <table data-testid="boxscore-table" className="w-full text-sm text-center font-mono tabular-nums">
        <thead>
          <tr>
            {HEAD.map((h) => (
              <th key={h} className="bg-slate-800 text-slate-300 font-sans font-semibold text-xs px-2 py-2.5 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {lines.map(({ p, l, min, pm10 }, i) => (
            <tr key={p.id} data-testid={`boxscore-row-${i}`} className="border-t border-white/5 odd:bg-slate-900/40">
              <td className="px-2 py-2">{p.number}</td>
              <td className="px-2 py-2 text-left font-sans font-semibold whitespace-nowrap">
                {p.name} {p.surname}
              </td>
              <td className="px-2 py-2">{min}</td>
              <td className="px-2 py-2 font-bold">{l.pts}</td>
              {[`${l.m2}/${l.a2}`, `${l.m3}/${l.a3}`, `${l.fgM}/${l.fgA}`,
                l.fgA ? `${Math.round((l.fgM / l.fgA) * 100)}%` : "-",
                ftText(l.ftM, l.ftA),
                l.ro, l.rd, l.rt, l.ast, l.stl, l.to, l.blk, l.pf, l.df
              ].map((c, j) => (
                <td key={j} className="px-2 py-2">{c}</td>
              ))}
              <td className={`px-2 py-2 font-bold ${pmClass(l.pm)}`}>{fmtPm(l.pm)}</td>
              <td className={`px-2 py-2 font-bold ${pmClass(pm10)}`}>
                {min === "0:00" ? "-" : `${pm10 > 0 ? "+" : ""}${pm10.toFixed(1).replace(".", ",")}`}
              </td>
            </tr>
          ))}

          <tr data-testid="boxscore-total" className="border-t-2 border-blue-500/50 bg-blue-500/10 font-bold">
            <td colSpan={3} className="px-2 py-2.5 text-left font-sans">TOTALE SQUADRA</td>
            <td className="px-2 py-2.5">{tot.pts}</td>
            {[`${tot.m2}/${tot.a2}`, `${tot.m3}/${tot.a3}`, `${tot.fgM}/${tot.fgA}`,
              tot.fgA ? `${Math.round((tot.fgM / tot.fgA) * 100)}%` : "-",
              ftText(tot.ftM, tot.ftA),
              tot.ro, tot.rd, tot.rt, tot.ast, tot.stl, tot.to, tot.blk, tot.pf, tot.df
            ].map((c, j) => (
              <td key={j} className="px-2 py-2.5">{c}</td>
            ))}
            <td className="px-2 py-2.5">-</td>
            <td className="px-2 py-2.5">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
