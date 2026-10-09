import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, CloudOff, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatch } from "@/hooks/useMatch";
import { courtIds, emptyStats, is3pt, playerName, plusMinusMap } from "@/lib/stats";
import { Scoreboard } from "@/components/Scoreboard";
import { MatchInfo } from "@/components/MatchInfo";
import { Roster } from "@/components/Roster";
import { ShotPanel } from "@/components/ShotPanel";
import { StatsPad } from "@/components/StatsPad";
import { OpponentBar } from "@/components/OpponentBar";
import { Report } from "@/components/Report";
import { SaveRosterDialog } from "@/components/SaveRosterDialog";
import { ConfirmButton } from "@/components/ConfirmButton";

const SaveState = ({ s }) => (
  <span data-testid="save-status" className="flex items-center gap-1.5 text-xs text-slate-400">
    {s === "saving" ? <><Loader2 size={13} className="animate-spin" /> Salvataggio</> : s === "error" ? <><CloudOff size={13} className="text-red-400" /> Errore</> : <><Check size={13} className="text-emerald-400" /> Salvato</>}
  </span>
);

function latestEvent(m) {
  let best = null;
  const check = (list, kind, pi) => list.forEach((e, i) => { if (!best || (e.t || 0) >= best.t) best = { t: e.t || 0, kind, pi, i }; });
  m.players.forEach((p, pi) => { check(p.shots, "shots", pi); check(p.fts, "fts", pi); });
  check(m.opponent_events, "opp");
  return best;
}

export default function ScoutPage() {
  const { id } = useParams();
  const { match, mutate, setMatch, saving } = useMatch(id);
  const [activeId, setActiveId] = useState(1);
  const [result, setResult] = useState("made");
  const pmMap = useMemo(() => (match ? plusMinusMap(match) : {}), [match]);

  if (match === null) return <div className="p-10 text-slate-400">Caricamento...</div>;
  if (match === false) return <div className="p-10">Partita non trovata. <Link to="/" className="text-sky-400">Torna alle partite</Link></div>;

  const pIdx = Math.max(0, match.players.findIndex((p) => p.id === activeId));
  const player = match.players[pIdx];
  const benchWarn = () => !player.inCourt && toast.warning(`${playerName(player)} è in panchina`);

  const onShot = (x, y) => {
    benchWarn();
    mutate((m) => m.players[pIdx].shots.push({ x, y, result, quarter: m.quarter, is3Point: is3pt(x, y), onCourt: courtIds(m), t: Date.now() }));
  };
  const onFt = (made) => { benchWarn(); mutate((m) => m.players[pIdx].fts.push({ made, quarter: m.quarter, onCourt: courtIds(m), t: Date.now() })); };
  const onStat = (k, d) => mutate((m) => { const s = m.players[pIdx].stats; s[k] = k === "pmAdj" ? s[k] + d : Math.max(0, s[k] + d); });
  const onOpp = (pts) => mutate((m) => m.opponent_events.push({ pts, quarter: m.quarter, onCourt: courtIds(m), t: Date.now() }));
  const ev = latestEvent(match);
  const onUndo = () => mutate((m) => {
    const e = latestEvent(m);
    if (!e) return;
    if (e.kind === "opp") m.opponent_events.splice(e.i, 1);
    else m.players[e.pi][e.kind].splice(e.i, 1);
  });
  const resetAll = () => mutate((m) => {
    m.opponent_events = []; m.quarter = "Q1";
    m.players.forEach((p, i) => { p.shots = []; p.fts = []; p.stats = emptyStats(); p.inCourt = i < 5; });
  });

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-4">
      <header className="no-print flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" data-testid="back-to-matches" className="tap flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft size={16} /> <span className="font-display text-xl font-bold uppercase tracking-wide">Basket Scout Sheet Pro</span>
          </Link>
          <div className="flex items-center gap-2">
            <SaveState s={saving} />
            <SaveRosterDialog match={match} />
            <ConfirmButton testId="reset-stats-btn" title="Azzerare la partita?" description="Tutti i tiri, i punti avversari e le statistiche verranno azzerati. Il roster resta invariato." onConfirm={resetAll}
              className="tap h-10 px-3 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 text-sm font-semibold flex items-center gap-2">
              <RotateCcw size={15} /> <span className="hidden sm:inline">Azzera</span>
            </ConfirmButton>
          </div>
        </div>
        <Scoreboard match={match} mutate={mutate} />
      </header>

      <Tabs defaultValue="live">
        <TabsList className="no-print bg-slate-900 border border-white/10 mb-4 h-11">
          <TabsTrigger value="live" data-testid="tab-live" className="px-6 h-9 font-semibold">Scouting Live</TabsTrigger>
          <TabsTrigger value="report" data-testid="tab-report" className="px-6 h-9 font-semibold">Report</TabsTrigger>
          <TabsTrigger value="info" data-testid="tab-info" className="px-6 h-9 font-semibold">Dati partita</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-baseline gap-3 min-w-0">
              <h2 data-testid="current-player-title" className="text-2xl sm:text-3xl font-extrabold uppercase truncate">{playerName(player)}</h2>
              <span data-testid="current-player-status" className={`text-xs font-bold uppercase ${player.inCourt ? "text-emerald-400" : "text-slate-500"}`}>
                {player.inCourt ? "● In campo" : "○ In panchina"}
              </span>
            </div>
            <OpponentBar name={match.opponent_team} onPoints={onOpp} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] xl:grid-cols-[300px_minmax(0,1fr)_340px] gap-4 items-start">
            <Roster match={match} mutate={mutate} activeId={player.id} setActiveId={setActiveId} pmMap={pmMap} />
            <ShotPanel match={match} mutate={mutate} player={player} result={result} setResult={setResult} onShot={onShot} onUndo={onUndo} canUndo={!!ev} />
            <div className="md:col-start-2 xl:col-start-auto">
              <StatsPad player={player} pm={pmMap[player.id]} onStat={onStat} onFt={onFt} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="report" className="mt-0">
          <Report match={match} setMatch={setMatch} pmMap={pmMap} />
        </TabsContent>

        <TabsContent value="info" className="mt-0">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 max-w-3xl">
            <h3 className="text-xl font-bold uppercase mb-4">Dati partita</h3>
            <MatchInfo match={match} mutate={mutate} />
            <p className="text-xs text-slate-500 mt-4">I nomi delle squadre e la sede (in casa / fuori casa) si modificano direttamente dal tabellone.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
