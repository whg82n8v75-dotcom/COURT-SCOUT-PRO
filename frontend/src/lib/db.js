import { createStore, del, entries, get, set, setMany } from "idb-keyval";
import { oppScore, ourScore } from "@/lib/stats";

const store = createStore("court-scout-pro", "kv");
const now = () => new Date().toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const byPrefix = async (pre) => (await entries(store)).filter(([k]) => String(k).startsWith(pre)).map(([, v]) => v);

export const requestPersistence = () => navigator.storage?.persist?.().catch(() => false);

export async function listMatches() {
  const all = await byPrefix("m:");
  return all
    .map((m) => ({ ...m, our_score: ourScore(m), opp_score: oppScore(m) }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export const getMatch = (id) => get(`m:${id}`, store);

export async function createMatch(body) {
  const m = { ai_analysis: "", quarter: "Q1", ...body, id: uid(), created_at: now(), updated_at: now() };
  await set(`m:${m.id}`, m, store);
  return m;
}

export const saveMatch = (m) => set(`m:${m.id}`, { ...m, updated_at: now() }, store);
export const deleteMatch = (id) => del(`m:${id}`, store);

export async function listRosters() {
  return (await byPrefix("r:")).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createRoster(body) {
  const r = { ...body, id: uid(), created_at: now() };
  await set(`r:${r.id}`, r, store);
  return r;
}

export const deleteRoster = (id) => del(`r:${id}`, store);

export async function exportAll() {
  return { app: "court-scout-pro", version: 1, exported_at: now(), matches: await byPrefix("m:"), rosters: await byPrefix("r:") };
}

export async function importAll(data) {
  if (data?.app !== "court-scout-pro" || !Array.isArray(data.matches) || !Array.isArray(data.rosters)) {
    throw new Error("File di backup non valido");
  }
  const okMatch = (m) => m?.id && Array.isArray(m.players) && Array.isArray(m.opponent_events);
  const matches = data.matches.filter(okMatch);
  const rosters = data.rosters.filter((r) => r?.id && Array.isArray(r.players));
  await setMany([...matches.map((m) => [`m:${m.id}`, m]), ...rosters.map((r) => [`r:${r.id}`, r])], store);
  return { matches: matches.length, rosters: rosters.length };
}
