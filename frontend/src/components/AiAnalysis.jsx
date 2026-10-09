import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api, streamAnalysis } from "@/lib/api";

export const AiAnalysis = ({ match, setMatch }) => {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      await api.put(`/matches/${match.id}`, match);
      setMatch((m) => ({ ...m, ai_analysis: "" }));
      await streamAnalysis(match.id, (t) => setMatch((m) => ({ ...m, ai_analysis: m.ai_analysis + t })));
    } catch (e) {
      toast.error(`Analisi AI non riuscita: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div data-testid="ai-analysis-card" className="avoid-break bg-gradient-to-br from-slate-900 to-slate-900/40 border border-sky-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-xl font-bold uppercase flex items-center gap-2"><Sparkles size={18} className="text-sky-400" /> Analisi AI del coach</h4>
        <button data-testid="ai-analysis-btn" onClick={run} disabled={loading}
          className="no-print tap h-10 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-bold flex items-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {match.ai_analysis ? "Rigenera" : "Genera analisi"}
        </button>
      </div>
      {match.ai_analysis ? (
        <div data-testid="ai-analysis-text" className="ai-md"><ReactMarkdown>{match.ai_analysis}</ReactMarkdown></div>
      ) : (
        <p className="text-sm text-slate-400">{loading ? "Analisi in corso..." : "Genera un report tattico automatico basato su tiri, +/- e statistiche della partita."}</p>
      )}
    </div>
  );
};
