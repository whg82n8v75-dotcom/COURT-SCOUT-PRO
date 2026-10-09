import { FileDown } from "lucide-react";
import { Boxscore } from "@/components/Boxscore";
import { PointsChart, QuarterChart, TeamShotMap } from "@/components/Charts";
import { AiAnalysis } from "@/components/AiAnalysis";
import { ourScore, oppScore } from "@/lib/stats";

export const Report = ({ match, setMatch, pmMap }) => (
  <div className="print-light flex flex-col gap-6 fade-up">
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
      <div>
        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase">Report di fine partita</h2>
        <p data-testid="report-subtitle" className="text-slate-400 text-sm mt-1">
          {match.my_team} {ourScore(match)} - {oppScore(match)} {match.opponent_team} · {match.venue === "casa" ? "In casa" : "Fuori casa"}
          {match.date && ` · ${match.date}`}{match.time && ` ${match.time}`}{match.location && ` · ${match.location}`}
        </p>
      </div>
      <button data-testid="export-pdf-btn" onClick={() => window.print()}
        className="no-print tap h-11 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm font-bold flex items-center gap-2">
        <FileDown size={16} /> Esporta PDF
      </button>
    </div>
    <section>
      <h3 className="text-xl font-bold uppercase mb-3">1. Boxscore</h3>
      <Boxscore match={match} pmMap={pmMap} />
    </section>
    <section>
      <h3 className="text-xl font-bold uppercase mb-3">2. Mappe tiri & distribuzione</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TeamShotMap match={match} />
        <PointsChart match={match} />
        <QuarterChart match={match} />
      </div>
    </section>
    <section>
      <h3 className="text-xl font-bold uppercase mb-3">3. Analisi tattica</h3>
      <AiAnalysis match={match} setMatch={setMatch} />
    </section>
  </div>
);
