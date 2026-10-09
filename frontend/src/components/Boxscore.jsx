import { fmtPm, pmClass, playerLine, teamTotals } from "@/lib/stats";

const HEAD = ["#", "Giocatore", "PTS", "2PT", "3PT", "FG", "FG%", "TL", "RO", "RD", "RT", "AST", "STL", "TO", "BLK", "PF", "DF", "+/-"];

const cells = (l) => [
  <b key="p">{l.pts}</b>, `${l.m2}/${l.a2}`, `${l.m3}/${l.a3}`, `${l.fgM}/${l.fgA}`,
  l.fgA ? `${Math.round((l.fgM / l.fgA) * 100)}%` : "-", `${l.ftM}/${l.ftA}`,
  l.ro, l.rd, l.rt, l.ast, l.stl, l.to, l.blk, l.pf, l.df,
];

export const Boxscore = ({ match, pmMap }) => {
  const lines = match.players.map((p) => ({ p, l: playerLine(p, pmMap) }));
  const tot = teamTotals(lines.map((x) => x.l));
  return (
    <div className="overflow-x-auto scroll-thin rounded-lg border border-white/10">
      <table data-testid="boxscore-table" className="w-full text-sm text-center font-mono tabular-nums">
        <thead>
          <tr>{HEAD.map((h) => <th key={h} className="bg-slate-800 text-slate-300 font-sans font-semibold text-xs px-2 py-2.5 whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody>
          {lines.map(({ p, l }, i) => (
            <tr key={p.id} data-testid={`boxscore-row-${i}`} className="border-t border-white/5 odd:bg-slate-900/40">
              <td className="px-2 py-2">{p.number}</td>
              <td className="px-2 py-2 text-left font-sans font-semibold whitespace-nowrap">{p.name} {p.surname}</td>
              {cells(l).map((c, j) => <td key={j} className="px-2 py-2">{c}</td>)}
              <td className={`px-2 py-2 font-bold ${pmClass(l.pm)}`}>{fmtPm(l.pm)}</td>
            </tr>
          ))}
          <tr data-testid="boxscore-total" className="border-t-2 border-blue-500/50 bg-blue-500/10 font-bold">
            <td colSpan={2} className="px-2 py-2.5 text-left font-sans">TOTALE SQUADRA</td>
            {cells(tot).map((c, j) => <td key={j} className="px-2 py-2.5">{c}</td>)}
            <td className="px-2 py-2.5">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
