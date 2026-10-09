import { Undo2 } from "lucide-react";
import { Court, QuarterLegend } from "@/components/Court";
import { QUARTERS, Q_COLORS } from "@/lib/stats";

const ResultBtn = ({ on, color, label, onClick, testId }) => (
  <button data-testid={testId} onClick={onClick}
    className={`tap flex-1 h-12 rounded-lg font-bold text-sm uppercase tracking-wide border-2 ${on ? `${color} text-white border-white/70` : "bg-slate-800 text-slate-400 border-transparent"}`}>
    {label}
  </button>
);

export const ShotPanel = ({ match, mutate, player, result, setResult, onShot, onUndo, canUndo }) => (
  <section className="bg-slate-900/50 border border-white/10 rounded-xl p-3 flex flex-col gap-3">
    <div className="flex gap-2">
      <ResultBtn testId="btn-made" on={result === "made"} color="bg-emerald-600" label="Segnato (O)" onClick={() => setResult("made")} />
      <ResultBtn testId="btn-missed" on={result === "missed"} color="bg-red-600" label="Sbagliato (X)" onClick={() => setResult("missed")} />
    </div>
    <div className="flex gap-1.5">
      {QUARTERS.map((q) => (
        <button key={q} data-testid={`quarter-btn-${q}`} onClick={() => mutate((m) => (m.quarter = q))}
          className={`tap flex-1 h-10 rounded-md text-sm font-bold border ${match.quarter === q ? "text-white" : "text-slate-400 bg-slate-800 border-white/10"}`}
          style={match.quarter === q ? { background: Q_COLORS[q], borderColor: Q_COLORS[q] } : undefined}>
          {q}
        </button>
      ))}
    </div>
    <Court shots={player.shots} onShot={onShot} testId="court-shot-svg" />
    <QuarterLegend />
    <button data-testid="undo-btn" onClick={onUndo} disabled={!canUndo}
      className="tap h-11 rounded-lg bg-slate-800 border border-white/10 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
      <Undo2 size={16} /> Annulla ultima azione
    </button>
  </section>
);
