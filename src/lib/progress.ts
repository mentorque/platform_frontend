// src/lib/progress.ts
import { db } from "@/lib/firebase";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  serverTimestamp, Timestamp
} from "firebase/firestore";

export type WeekItem = {
  week: number;
  title: string;
  description: string;
  done: boolean;
  completedAt: Timestamp | null;
  notes: string;
  color: string;
};

export const DEFAULT_WEEKS: WeekItem[] = [
  { 
    week: 1, 
    title: "Resume Review & Analysis", 
    description: "Get your resume reviewed and analysed by your personal mentor",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-blue-50 border-blue-200"
  },
  { 
    week: 2, 
    title: "Resume Rebuild & Optimization", 
    description: "Completely rebuild your resume with expert guidance and ATS optimization",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-green-50 border-green-200"
  },
  { 
    week: 3, 
    title: "AI Assistant & Job Tracker Setup, Portfolio Building", 
    description: "Get your AI assistant setup and build a stunning portfolio that showcases your skills and projects",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-purple-50 border-purple-200"
  },
  { 
    week: 4, 
    title: "Cheat Sheet & Mock Interview Prep Plan", 
    description: "Get your cheat sheets and comprehensive mock interview preparation plan",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-orange-50 border-orange-200"
  },
  { 
    week: 5, 
    title: "Elevator Pitch", 
    description: "Perfect your 30-second introduction",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-green-100 border-green-200"
  },
  { 
    week: 6, 
    title: "Competency Interview", 
    description: "Behavioral questions and soft skills assessment",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-yellow-100 border-yellow-200"
  },
  { 
    week: 7, 
    title: "Technical Interview", 
    description: "Coding challenges and technical deep-dives",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-orange-100 border-orange-200"
  },
  { 
    week: 8, 
    title: "Final Behavioral Round", 
    description: "Executive-level behavioral assessment",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-red-100 border-red-200"
  },
];

export async function initUserProgressIfMissing(uid: string) {
  const ref = doc(db, `users/${uid}/progress/default`);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    await setDoc(ref, {
      weeks: DEFAULT_WEEKS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const existingWeeks = snap.data().weeks as WeekItem[];
    
    // Update if structure changed
    if (existingWeeks.length !== DEFAULT_WEEKS.length || 
        existingWeeks[0]?.title !== DEFAULT_WEEKS[0]?.title) {
      
      const updatedWeeks = DEFAULT_WEEKS.map((newWeek) => {
        const existingWeek = existingWeeks.find(w => w.week === newWeek.week);
        return existingWeek ? { 
          ...newWeek, 
          done: existingWeek.done,
          completedAt: existingWeek.completedAt,
          notes: existingWeek.notes
        } : newWeek;
      });
      
      await updateDoc(ref, {
        weeks: updatedWeeks,
        updatedAt: serverTimestamp(),
      });
    }
  }
}

export function onUserProgress(uid: string, cb: (weeks: WeekItem[] | null) => void) {
  const ref = doc(db, `users/${uid}/progress/default`);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) cb(snap.data().weeks as WeekItem[]);
    else cb(null);
  });
}

export async function updateWeekDone(uid: string, index: number, nextDone: boolean) {
  const ref = doc(db, `users/${uid}/progress/default`);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Progress doc missing");
  
  const weeks = snap.data().weeks as WeekItem[];
  const updated = weeks.map((w, i) =>
    i === index
      ? { ...w, done: nextDone, completedAt: nextDone ? new Date() : null }
      : w
  );

  await updateDoc(ref, { weeks: updated, updatedAt: serverTimestamp() });
}

export async function updateWeekNotes(uid: string, index: number, notes: string) {
  const ref = doc(db, `users/${uid}/progress/default`);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Progress doc missing");
  
  const weeks = snap.data().weeks as WeekItem[];
  const updated = weeks.map((w, i) => (i === index ? { ...w, notes } : w));

  await updateDoc(ref, { weeks: updated, updatedAt: serverTimestamp() });
}
