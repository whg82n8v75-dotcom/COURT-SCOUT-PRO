import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Court, QuarterLegend } from "@/components/Court";
import { QUARTERS, Q_COLORS, playerPoints, quarterPoints } from "@/lib/stats";

const Card = ({ title, children, testId }) => (
  <div data-testid={testId} className="avoid-break bg-slate-900/60 border border-white/10 rounded-xl p-4">
    <h4 className="text-lg font-bold uppercase mb-3">{title}</h4>
    {children}
  </div>
);

const tip = { contentStyle: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8 } };

export const TeamShotMap = ({ match }) => {
  const [q, setQ] = useState("ALL");
  const shots = match.players.flatMap((p) => p.shots).filter((s) => q === "ALL" || s.quarter === q);
  return (
    <Card title="Mappa tiri di squadra" testId="team-shot-map">
      <div className="flex gap-1 mb-3 no-print">
        {["ALL", ...QUARTERS].map((k) => (
          <button key={k} data-testid={`shotmap-filter-${k}`} onClick={() => setQ(k)}
            className={`tap px-2.5 py-1 rounded text-xs font-bold ${q === k ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            {k === "ALL" ? "Tutti" : k}
          </button>
        ))}
      </div>
      <Court shots={shots} />
      <QuarterLegend />
    </Card>
  );
};

export const PointsChart = ({ match }) => {
  const data = match.players.map((p) => ({ name: `#${p.number} ${p.surname}`, pts: playerPoints(p) })).filter((d) => d.pts > 0);
  return (
    <Card title="Distribuzione punti" testId="points-chart">
      {data.length === 0 ? <p className="text-slate-500 text-sm py-10 text-center">Nessun punto registrato</p> : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" stroke="#64748b" allowDecimals={false} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" width={110} tick={{ fontSize: 12 }} />
            <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar dataKey="pts" name="Punti" fill="#38BDF8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export const QuarterChart = ({ match }) => {
  const data = quarterPoints(match);
  return (
    <Card title="Punti per quarto" testId="quarter-chart">
      <div className="flex flex-wrap gap-2 mb-3">
        {data.map((d) => (
          <span key={d.quarter} data-testid={`quarter-badge-${d.quarter}`} className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: Q_COLORS[d.quarter] }}>
            {d.quarter}: {d.nostri}-{d.avversari}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid stroke="#1e293b" vertical={false} />
          <XAxis dataKey="quarter" stroke="#94a3b8" />
          <YAxis stroke="#64748b" allowDecimals={false} />
          <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
          <Legend />
          <Bar dataKey="nostri" name={match.my_team} fill="#38BDF8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avversari" name={match.opponent_team} fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
