export const QUARTERS = ["Q1", "Q2", "Q3", "Q4", "OT"];
export const Q_COLORS = { Q1: "#2563EB", Q2: "#10B981", Q3: "#F59E0B", Q4: "#8B5CF6", OT: "#EC4899" };
export const Q_LABELS = { Q1: "1° Quarto", Q2: "2° Quarto", Q3: "3° Quarto", Q4: "4° Quarto", OT: "Overtime" };

export const COUNTERS = [
  { key: "pf", label: "Falli (PF)" },
  { key: "ro", label: "Rimb. Off (RO)" },
  { key: "rd", label: "Rimb. Def (RD)" },
  { key: "to", label: "Palle Perse (TO)" },
  { key: "stl", label: "Palle Rec (STL)" },
  { key: "ast", label: "Assist (AST)" },
  { key: "blk", label: "Stoppate (BLK)" },
  { key: "df", label: "Falli Sub (DF)" },
];

export const emptyStats = () => ({ pf: 0, ro: 0, rd: 0, to: 0, stl: 0, ast: 0, blk: 0, df: 0, pmAdj: 0 });

export const buildPlayers = (base) => {
  const src = base?.length ? base : Array.from({ length: 20 }, (_, i) => ({ number: String(i + 1), name: "Giocatore", surname: String(i + 1) }));
  return src.map((b, i) => ({
    id: i + 1, number: b.number, name: b.name, surname: b.surname,
    inCourt: i < 5, stats: emptyStats(), shots: [], fts: [],
  }));
};

// Arco da 3 disegnato: centro (250,140) r=200, linee laterali a x=50/x=450
export const is3pt = (x, y) => (y > 140 ? Math.hypot(x - 250, y - 140) > 200 : x < 50 || x > 450);

export const shotPts = (s) => (s.result === "made" ? (s.is3Point ? 3 : 2) : 0);
export const playerPoints = (p) => p.shots.reduce((a, s) => a + shotPts(s), 0) + p.fts.filter((f) => f.made).length;
export const ourScore = (m) => m.players.reduce((a, p) => a + playerPoints(p), 0);
export const oppScore = (m) => m.opponent_events.reduce((a, e) => a + e.pts, 0);
export const courtIds = (m) => m.players.filter((p) => p.inCourt).map((p) => p.id);

export function plusMinusMap(m) {
  const pm = {};
  m.players.forEach((p) => (pm[p.id] = p.stats.pmAdj || 0));
  const add = (ids, v) => (ids || []).forEach((id) => id in pm && (pm[id] += v));
  m.players.forEach((p) => {
    p.shots.forEach((s) => s.result === "made" && add(s.onCourt, shotPts(s)));
    p.fts.forEach((f) => f.made && add(f.onCourt, 1));
  });
  m.opponent_events.forEach((e) => add(e.onCourt, -e.pts));
  return pm;
}

export function playerLine(p, pm) {
  const t2 = p.shots.filter((s) => !s.is3Point);
  const t3 = p.shots.filter((s) => s.is3Point);
  const made = (arr) => arr.filter((s) => s.result === "made").length;
  const m2 = made(t2), m3 = made(t3);
  return {
    m2, a2: t2.length, m3, a3: t3.length, fgM: m2 + m3, fgA: p.shots.length,
    ftM: p.fts.filter((f) => f.made).length, ftA: p.fts.length,
    pts: playerPoints(p), ro: p.stats.ro, rd: p.stats.rd, rt: p.stats.ro + p.stats.rd,
    ast: p.stats.ast, stl: p.stats.stl, to: p.stats.to, blk: p.stats.blk, pf: p.stats.pf, df: p.stats.df,
    pm: pm[p.id] || 0,
  };
}

export function teamTotals(lines) {
  const t = {};
  lines.forEach((l) => Object.entries(l).forEach(([k, v]) => (t[k] = (t[k] || 0) + v)));
  return t;
}

export function quarterPoints(m) {
  const q = Object.fromEntries(QUARTERS.map((k) => [k, { quarter: k, nostri: 0, avversari: 0 }]));
  m.players.forEach((p) => {
    p.shots.forEach((s) => (q[s.quarter].nostri += shotPts(s)));
    p.fts.forEach((f) => f.made && (q[f.quarter].nostri += 1));
  });
  m.opponent_events.forEach((e) => (q[e.quarter].avversari += e.pts));
  return QUARTERS.map((k) => q[k]);
}

export const pct = (m, a) => (a ? `${Math.round((m / a) * 100)}%` : "-");
export const pct1 = (m, a) => (a ? `${((m / a) * 100).toFixed(1).replace(".", ",")}%` : "-");
export const ftText = (m, a) => `${m}/${a} (${pct1(m, a)})`;
export const fmtPm = (v) => `${v > 0 ? "+" : ""}${v}`;
export const pmClass = (v) => (v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-slate-400");
export const playerName = (p) => `#${p.number} ${p.name} ${p.surname}`.trim();
