import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import { buildAnalysis } from "@/lib/analysis";

export const AiAnalysis = ({ match, mutate }) => (
  <div data-testid="ai-analysis-card" className="avoid-break bg-gradient-to-br from-slate-900 to-slate-900/40 border border-sky-500/30 rounded-xl p-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h4 className="text-xl font-bold uppercase flex items-center gap-2"><Sparkles size={18} className="text-sky-400" /> Analisi automatica</h4>
      <button data-testid="ai-analysis-btn" onClick={() => mutate((m) => (m.ai_analysis = buildAnalysis(m)))}
        className="no-print tap h-10 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-bold flex items-center gap-2">
        <Sparkles size={16} /> {match.ai_analysis ? "Aggiorna analisi" : "Genera analisi"}
      </button>
    </div>
    {match.ai_analysis ? (
      <div data-testid="ai-analysis-text" className="ai-md"><ReactMarkdown>{match.ai_analysis}</ReactMarkdown></div>
    ) : (
      <p className="text-sm text-slate-400">Report tattico generato sul dispositivo, offline, a partire da tiri, +/- e statistiche della partita.</p>
    )}
  </div>
);
