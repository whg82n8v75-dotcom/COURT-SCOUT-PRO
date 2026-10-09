import { fmtPm, oppScore, ourScore, playerLine, playerName, plusMinusMap, quarterPoints, teamTotals } from "@/lib/stats";

const pc = (m, a) => (a ? Math.round((m / a) * 100) : null);
const pcs = (m, a) => (a ? `${pc(m, a)}%` : "n.d.");
const best = (rows, key, dir = 1) => rows.filter((r) => dir * r.l[key] > 0).sort((a, b) => dir * (b.l[key] - a.l[key]))[0];

function quarters(match) {
  const q = quarterPoints(match).filter((x) => x.nostri || x.avversari);
  if (!q.length) return ["Nessun punto registrato nei quarti."];
  const out = q.map((x) => `- **${x.quarter}**: ${x.nostri}-${x.avversari} (${fmtPm(x.nostri - x.avversari)})`);
  const sorted = [...q].sort((a, b) => b.nostri - b.avversari - (a.nostri - a.avversari));
  const top = sorted[0], low = sorted[sorted.length - 1];
  if (q.length > 1) out.push(`\nQuarto migliore **${top.quarter}** (${fmtPm(top.nostri - top.avversari)}), peggiore **${low.quarter}** (${fmtPm(low.nostri - low.avversari)}).`);
  return out;
}

function leaders(rows) {
  const out = [];
  const add = (r, label, val) => r && out.push(`- **${label}**: ${playerName(r.p)} (${val(r.l)})`);
  add(best(rows, "pts"), "Miglior realizzatore", (l) => `${l.pts} punti, ${l.fgM}/${l.fgA} dal campo`);
  add(best(rows, "pm"), "Miglior +/-", (l) => fmtPm(l.pm));
  add(best(rows, "rt"), "Rimbalzi", (l) => `${l.rt} (${l.ro} off.)`);
  add(best(rows, "ast"), "Assist", (l) => `${l.ast}`);
  add(best(rows, "stl"), "Palle recuperate", (l) => `${l.stl}`);
  return out.length ? out : ["Nessuna statistica individuale registrata."];
}

function issues(match, rows, t) {
  const crit = [], recs = [];
  if (t.to >= 12 || (t.to > 0 && t.to > t.ast)) {
    crit.push(`Troppe palle perse: ${t.to} contro ${t.ast} assist.`);
    recs.push("Curare la gestione del pallone: meno palleggio forzato e più passaggi semplici contro la pressione.");
  }
  if (t.a3 >= 8 && pc(t.m3, t.a3) < 30) {
    crit.push(`Tiro da 3 poco efficace: ${t.m3}/${t.a3} (${pcs(t.m3, t.a3)}).`);
    recs.push("Selezionare meglio i tiri da fuori e cercare di più l'attacco al ferro o i tiri dopo uno scarico.");
  }
  if (t.ftA >= 6 && pc(t.ftM, t.ftA) < 65) {
    crit.push(`Tiri liberi sotto il 65%: ${t.ftM}/${t.ftA}.`);
    recs.push("Inserire serie di tiri liberi a fine allenamento, sotto fatica.");
  }
  if (t.a2 >= 10 && pc(t.m2, t.a2) < 40) crit.push(`Percentuale da 2 bassa: ${t.m2}/${t.a2} (${pcs(t.m2, t.a2)}).`);
  if (t.fgA >= 15 && t.ro <= 3) {
    crit.push(`Pochi rimbalzi offensivi (${t.ro}) su ${t.fgA - t.fgM} tiri sbagliati.`);
    recs.push("Mandare più giocatori a rimbalzo offensivo dopo i tiri sbagliati.");
  }
  const fouls = rows.filter((r) => r.l.pf >= 4);
  if (fouls.length) {
    crit.push(`Problemi di falli: ${fouls.map((r) => `${playerName(r.p)} (${r.l.pf})`).join(", ")}.`);
    recs.push("Gestire le rotazioni dei giocatori carichi di falli e lavorare sulla difesa senza contatto.");
  }
  const worst = best(rows, "pm", -1);
  if (worst && worst.l.pm <= -8) crit.push(`Il quintetto con ${playerName(worst.p)} in campo ha subito un parziale di ${worst.l.pm}.`);
  const badQ = quarterPoints(match).filter((x) => x.avversari - x.nostri >= 6);
  if (badQ.length) {
    crit.push(`Blackout nei quarti ${badQ.map((x) => `${x.quarter} (${x.nostri}-${x.avversari})`).join(", ")}.`);
    recs.push("Preparare uno schema di uscita dal parziale avversario (timeout, cambio di difesa, gioco per il miglior realizzatore).");
  }
  if (t.ast >= 15) recs.push(`Buona circolazione di palla (${t.ast} assist): continuare a cercare l'extra-passaggio.`);
  if (t.stl >= 8) recs.push(`Difesa aggressiva efficace (${t.stl} recuperi): mantenere la pressione sulle linee di passaggio.`);
  if (!recs.length) recs.push("Mantenere l'assetto attuale e confermare le rotazioni che hanno prodotto il +/- migliore.");
  return { crit: crit.length ? crit.map((c) => `- ${c}`) : ["Nessuna criticità evidente dai dati registrati."], recs: recs.map((r) => `- ${r}`) };
}

export function buildAnalysis(match) {
  const pm = plusMinusMap(match);
  const rows = match.players.map((p) => ({ p, l: playerLine(p, pm) }));
  const t = teamTotals(rows.map((r) => r.l));
  const us = ourScore(match), them = oppScore(match), diff = us - them;
  if (!us && !them && !t.fgA && !t.ftA) return "## Sintesi\nNessuna azione registrata: inserisci tiri e statistiche per ottenere l'analisi.";
  const esito = diff > 0 ? `Vittoria di ${diff} punti` : diff < 0 ? `Sconfitta di ${-diff} punti` : "Parità";
  const venue = match.venue === "casa" ? "in casa" : "fuori casa";
  const share = (v) => (us ? `${Math.round((v / us) * 100)}%` : "0%");
  const { crit, recs } = issues(match, rows, t);
  return [
    "## Sintesi",
    `${esito} ${venue}: **${match.my_team} ${us} - ${them} ${match.opponent_team}**.`,
    `Dal campo ${t.fgM}/${t.fgA} (${pcs(t.fgM, t.fgA)}), da 2 ${t.m2}/${t.a2} (${pcs(t.m2, t.a2)}), da 3 ${t.m3}/${t.a3} (${pcs(t.m3, t.a3)}), liberi ${t.ftM}/${t.ftA} (${pcs(t.ftM, t.ftA)}). ${t.rt} rimbalzi (${t.ro} offensivi), ${t.ast} assist, ${t.stl} recuperi, ${t.to} palle perse.`,
    `Provenienza punti: ${share(t.m2 * 2)} da 2, ${share(t.m3 * 3)} da 3, ${share(t.ftM)} dai liberi.`,
    "## Andamento per quarti", ...quarters(match),
    "## Migliori in campo", ...leaders(rows),
    "## Punti critici", ...crit,
    "## Raccomandazioni", ...recs,
  ].join("\n");
}
