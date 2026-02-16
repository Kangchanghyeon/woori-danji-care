"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Accident, AccidentStatus } from "@/types/accident";

const STORAGE_KEY = "woori-accidents";

type AccidentContextValue = {
  accidents: Accident[];
  addAccident: (accident: Omit<Accident, "id" | "status">) => void;
  updateStatus: (id: string, status: AccidentStatus) => void;
};

const AccidentContext = createContext<AccidentContextValue | null>(null);

function generateId() {
  return `acc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 문자열(data URL)만 저장, File은 제외 */
function toStorable(accident: Accident): Accident {
  const photoUrls = accident.photos.filter(
    (p): p is string => typeof p === "string"
  );
  return { ...accident, photos: photoUrls };
}

function loadFromStorage(): Accident[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Accident[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(accidents: Accident[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(accidents.map(toStorable))
    );
  } catch {
    // ignore
  }
}

export function AccidentProvider({ children }: { children: React.ReactNode }) {
  const [accidents, setAccidents] = useState<Accident[]>([]);

  useEffect(() => {
    setAccidents(loadFromStorage());
  }, []);

  const addAccident = useCallback(
    (data: Omit<Accident, "id" | "status">) => {
      const newAccident: Accident = {
        ...data,
        id: generateId(),
        status: "Pending",
      };
      setAccidents((prev) => {
        const next = [newAccident, ...prev];
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const updateStatus = useCallback((id: string, status: AccidentStatus) => {
    setAccidents((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
      saveToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ accidents, addAccident, updateStatus }),
    [accidents, addAccident, updateStatus]
  );

  return (
    <AccidentContext.Provider value={value}>{children}</AccidentContext.Provider>
  );
}

export function useAccidents() {
  const ctx = useContext(AccidentContext);
  if (!ctx) {
    throw new Error("useAccidents must be used within AccidentProvider");
  }
  return ctx;
}
