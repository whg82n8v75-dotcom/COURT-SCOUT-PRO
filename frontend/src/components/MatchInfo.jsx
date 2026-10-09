const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">{label}</span>
    {children}
  </label>
);

const cls = "h-10 px-3 rounded-md bg-slate-800/70 border border-white/10 text-sm text-slate-100 outline-none focus:border-blue-500 [color-scheme:dark]";

export const MatchInfo = ({ match, mutate }) => {
  const set = (k) => (e) => mutate((m) => (m[k] = e.target.value));
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Field label="Data"><input type="date" className={cls} value={match.date} onChange={set("date")} data-testid="match-date-input" /></Field>
      <Field label="Ora"><input type="time" className={cls} value={match.time} onChange={set("time")} data-testid="match-time-input" /></Field>
      <Field label="Palazzetto / Luogo"><input className={`${cls} col-span-2`} value={match.location} onChange={set("location")} placeholder="Es. PalaDozza" data-testid="match-location-input" /></Field>
    </div>
  );
};
