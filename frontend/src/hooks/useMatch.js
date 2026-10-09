import { useCallback, useEffect, useRef, useState } from "react";
import { getMatch, saveMatch } from "@/lib/db";

export function useMatch(id) {
  const [match, setMatch] = useState(null);
  const [saving, setSaving] = useState("saved");
  const dirty = useRef(false);
  const pending = useRef(null);

  useEffect(() => {
    getMatch(id).then((m) => setMatch(m || false)).catch(() => setMatch(false));
  }, [id]);

  const flush = useCallback(() => {
    const m = pending.current;
    if (!m) return;
    pending.current = null;
    saveMatch(m).then(() => setSaving("saved")).catch(() => setSaving("error"));
  }, []);

  useEffect(() => {
    if (!match || !dirty.current) return;
    pending.current = match;
    setSaving("saving");
    const t = setTimeout(flush, 300);
    return () => clearTimeout(t);
  }, [match, flush]);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [flush]);

  const mutate = useCallback((fn) => {
    dirty.current = true;
    setMatch((m) => {
      const c = structuredClone(m);
      fn(c);
      return c;
    });
  }, []);

  return { match, mutate, saving };
}
