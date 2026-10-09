import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Plane, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteMatch, deleteRoster, listMatches, listRosters } from "@/lib/db";
import { NewMatchDialog } from "@/components/NewMatchDialog";
import { ConfirmButton } from "@/components/ConfirmButton";
import { BackupBar } from "@/components/BackupBar";
import HERO from "@/assets/hero.jpg";

const MatchRow = ({ m, i, onDelete }) => {
  const atHome = m.venue === "casa";
  const res = m.our_score > m.opp_score ? "V" : m.our_score < m.opp_score ? "P" : "=";
  return (
    <div data-testid={`match-row-${i}`} className="fade-up flex items-center gap-4 bg-slate-900/60 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-colors" style={{ animationDelay: `${i * 40}ms` }}>
      <span className={`w-9 h-9 shrink-0 rounded-md flex items-center justify-center font-display text-xl font-bold ${res === "V" ? "bg-emerald-500/20 text-emerald-300" : res === "P" ? "bg-red-500/20 text-red-300" : "bg-slate-700 text-slate-300"}`}>{res}</span>
      <Link to={`/match/${m.id}`} data-testid={`open-match-${i}`} className="flex-1 min-w-0">
        <div className="font-display text-xl sm:text-2xl font-bold uppercase truncate">{m.my_team} <span className="text-slate-500">vs</span> {m.opponent_team}</div>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
          <span className="flex items-center gap-1">{atHome ? <Home size={12} /> : <Plane size={12} />} {atHome ? "In casa" : "Fuori casa"}</span>
          {m.date && <span>{m.date} {m.time}</span>}
          {m.location && <span className="truncate">{m.location}</span>}
        </div>
      </Link>
      <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums">{m.our_score}<span className="text-slate-600">-</span>{m.opp_score}</span>
      <ConfirmButton testId={`delete-match-${i}`} title="Eliminare la partita?" description="L'operazione non è reversibile." onConfirm={onDelete}
        className="tap w-10 h-10 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center"><Trash2 size={17} /></ConfirmButton>
    </div>
  );
};

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [rosters, setRosters] = useState([]);
  const load = () => {
    listMatches().then(setMatches);
    listRosters().then(setRosters);
  };
  useEffect(load, []);
  const del = async (fn, msg) => { await fn(); toast.success(msg); load(); };

  return (
    <div>
      <div className="relative overflow-hidden border-b border-white/10">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/85 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-5 py-14 sm:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-400 font-semibold mb-3">Scouting a bordo campo</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase leading-[0.9]">Basket Scout<br />Sheet Pro</h1>
          <p className="text-slate-300 mt-4 max-w-md text-sm sm:text-base">Mappa tiri, +/- automatico, boxscore e analisi tattica. Funziona offline: ogni partita resta salvata su questo dispositivo.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <NewMatchDialog rosters={rosters} />
            <BackupBar onImported={load} />
          </div>
          <p className="text-xs text-slate-500 mt-4">I dati sono salvati solo su questo dispositivo: esporta un backup regolarmente.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10 grid lg:grid-cols-[1fr_320px] gap-10">
        <section>
          <h2 className="text-2xl font-bold uppercase mb-4">Storico partite</h2>
          {matches.length === 0 ? (
            <p data-testid="no-matches" className="text-slate-500 border border-dashed border-white/10 rounded-xl p-10 text-center">Nessuna partita salvata. Crea la prima!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((m, i) => <MatchRow key={m.id} m={m} i={i} onDelete={() => del(() => deleteMatch(m.id), "Partita eliminata")} />)}
            </div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2"><Users size={20} /> Roster salvati</h2>
          {rosters.length === 0 ? (
            <p className="text-slate-500 text-sm">Salva un roster dalla schermata di scouting per riutilizzarlo nelle prossime partite.</p>
          ) : rosters.map((r, i) => (
            <div key={r.id} data-testid={`roster-row-${i}`} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-4 py-3 mb-2">
              <div><div className="font-semibold">{r.name}</div><div className="text-xs text-slate-500">{r.players.length} giocatori</div></div>
              <button data-testid={`delete-roster-${i}`} onClick={() => del(() => deleteRoster(r.id), "Roster eliminato")} className="tap text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
