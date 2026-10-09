import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { buildPlayers } from "@/lib/stats";

const inp = "h-11 px-3 rounded-md bg-slate-800 border border-white/10 outline-none focus:border-blue-500 text-sm [color-scheme:dark] w-full";
const Lbl = ({ t, children }) => <label className="flex flex-col gap-1"><span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">{t}</span>{children}</label>;

export const NewMatchDialog = ({ rosters }) => {
  const nav = useNavigate();
  const [f, setF] = useState({ my_team: "", opponent_team: "", venue: "casa", date: "", time: "", location: "", roster: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const create = async () => {
    const roster = rosters.find((r) => r.id === f.roster);
    const { roster: _r, ...rest } = f;
    const body = { ...rest, my_team: f.my_team || "Squadra Casa", opponent_team: f.opponent_team || "Avversari", players: buildPlayers(roster?.players), opponent_events: [] };
    const { data } = await api.post("/matches", body);
    nav(`/match/${data.id}`);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button data-testid="new-match-btn" className="tap h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40">
          <Plus size={18} /> Nuova partita
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-3xl uppercase">Nuova partita</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Lbl t="La mia squadra"><input data-testid="new-my-team" className={inp} value={f.my_team} onChange={set("my_team")} placeholder="Es. Olimpia" /></Lbl>
          <Lbl t="Avversari"><input data-testid="new-opp-team" className={inp} value={f.opponent_team} onChange={set("opponent_team")} placeholder="Es. Virtus" /></Lbl>
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {[["casa", "In casa"], ["trasferta", "Fuori casa"]].map(([v, l]) => (
              <button key={v} data-testid={`new-venue-${v}`} onClick={() => setF({ ...f, venue: v })}
                className={`tap h-11 rounded-lg font-bold text-sm border ${f.venue === v ? "bg-blue-600 border-blue-500" : "bg-slate-800 border-white/10 text-slate-400"}`}>{l}</button>
            ))}
          </div>
          <Lbl t="Data"><input type="date" data-testid="new-date" className={inp} value={f.date} onChange={set("date")} /></Lbl>
          <Lbl t="Ora"><input type="time" data-testid="new-time" className={inp} value={f.time} onChange={set("time")} /></Lbl>
          <div className="col-span-2"><Lbl t="Luogo"><input data-testid="new-location" className={inp} value={f.location} onChange={set("location")} placeholder="Palazzetto" /></Lbl></div>
          <div className="col-span-2">
            <Lbl t="Roster">
              <select data-testid="new-roster-select" className={inp} value={f.roster} onChange={set("roster")}>
                <option value="">Roster vuoto (20 giocatori)</option>
                {rosters.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.players.length})</option>)}
              </select>
            </Lbl>
          </div>
        </div>
        <button data-testid="create-match-btn" onClick={create} className="tap h-12 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold mt-2">Inizia scouting</button>
      </DialogContent>
    </Dialog>
  );
};
