// src/hooks/useUserProgress.ts
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { onUserProgress, updateWeekDone, updateWeekNotes } from "@/lib/progress";
import type { WeekItem } from "@/lib/progress";

export function useUserProgress() {
  const [uid, setUid] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<WeekItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, (u) => setUid(u ? u.uid : null));
    return () => stopAuth();
  }, []);

  useEffect(() => {
    if (!uid) { setWeeks(null); setLoading(false); return; }
    setLoading(true);
    const stop = onUserProgress(uid, (w) => { setWeeks(w); setLoading(false); });
    return () => stop();
  }, [uid]);

  async function toggle(index: number, nextDone: boolean) {
    if (!uid || weeks == null) return;
    // optimistic UI
    const prev = weeks;
    const local = weeks.map((w, i) => (i === index ? { ...w, done: nextDone } : w));
    setWeeks(local);
    try {
      await updateWeekDone(uid, index, nextDone);
    } catch (e) {
      // revert on failure
      setWeeks(prev);
      alert("Could not save. Check console for details.");
    }
  }

  async function saveNotes(index: number, notes: string) {
    if (!uid || weeks == null) return;
    const prev = weeks;
    const local = weeks.map((w, i) => (i === index ? { ...w, notes } : w));
    setWeeks(local);
    try {
      await updateWeekNotes(uid, index, notes);
    } catch (e) {
      setWeeks(prev);
      alert("Could not save notes. Check console for details.");
    }
  }

  return { weeks, loading, toggle, saveNotes };
}
