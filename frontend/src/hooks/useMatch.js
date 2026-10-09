import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export function useMatch(id) {
  const [match, setMatch] = useState(null);
  const [saving, setSaving] = useState("saved");
  const dirty = useRef(false);

  useEffect(() => {
    api.get(`/matches/${id}`).then((r) => setMatch(r.data)).catch(() => setMatch(false));
  }, [id]);

  useEffect(() => {
    if (!match || !dirty.current) return;
    setSaving("saving");
    const t = setTimeout(() => {
      api.put(`/matches/${id}`, match).then(() => setSaving("saved")).catch(() => setSaving("error"));
    }, 600);
    return () => clearTimeout(t);
  }, [match, id]);

  const mutate = useCallback((fn) => {
    dirty.current = true;
    setMatch((m) => {
      const c = structuredClone(m);
      fn(c);
      return c;
    });
  }, []);

  return { match, mutate, setMatch, saving };
}
