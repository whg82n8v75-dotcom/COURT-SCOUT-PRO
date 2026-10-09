import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";

export const SaveRosterDialog = ({ match }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const save = async () => {
    const players = match.players.map(({ number, name, surname }) => ({ number, name, surname }));
    await api.post("/rosters", { name: name || match.my_team, players });
    toast.success("Roster salvato");
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); setName(match.my_team); }}>
      <DialogTrigger asChild>
        <button data-testid="save-roster-btn" className="tap h-10 px-3 rounded-lg bg-slate-800 border border-white/10 text-sm font-semibold flex items-center gap-2">
          <Users size={15} /> <span className="hidden sm:inline">Salva roster</span>
        </button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="bg-slate-900 border-white/10">
        <DialogHeader><DialogTitle className="font-display text-2xl uppercase">Salva roster</DialogTitle></DialogHeader>
        <input data-testid="roster-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome roster"
          className="h-11 px-3 rounded-md bg-slate-800 border border-white/10 outline-none focus:border-blue-500" />
        <button data-testid="roster-save-confirm" onClick={save} className="tap h-11 rounded-lg bg-blue-600 font-bold">Salva</button>
      </DialogContent>
    </Dialog>
  );
};
