import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { exportAll, importAll } from "@/lib/db";

async function shareOrDownload(name, text) {
  const file = new File([text], name, { type: "application/json" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

const btn = "tap h-10 px-3 rounded-lg bg-slate-800 border border-white/10 text-sm font-semibold flex items-center gap-2";

export const BackupBar = ({ onImported }) => {
  const input = useRef(null);
  const doExport = async () => {
    const data = await exportAll();
    await shareOrDownload(`court-scout-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
    toast.success(`Backup pronto: ${data.matches.length} partite, ${data.rosters.length} roster`);
  };
  const doImport = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const res = await importAll(JSON.parse(await f.text()));
      toast.success(`Importate ${res.matches} partite e ${res.rosters} roster`);
      onImported();
    } catch (err) {
      toast.error(err instanceof SyntaxError ? "File JSON non leggibile" : err.message);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <button data-testid="export-backup-btn" onClick={doExport} className={btn}><Download size={15} /> Esporta backup</button>
      <button data-testid="import-backup-btn" onClick={() => input.current.click()} className={btn}><Upload size={15} /> Importa backup</button>
      <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={doImport} data-testid="import-backup-input" />
    </div>
  );
};
