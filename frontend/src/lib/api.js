import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API });

export async function streamAnalysis(id, onChunk) {
  const res = await fetch(`${API}/matches/${id}/analysis`, { method: "POST" });
  if (!res.ok) throw new Error("Errore richiesta analisi");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop();
    for (const part of parts) {
      const data = part.replace(/^data: /, "");
      if (data === "[DONE]") return;
      const ev = JSON.parse(data);
      if (ev.error) throw new Error(ev.error);
      onChunk(ev.t);
    }
  }
}
