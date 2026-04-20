"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "coeo.currentPersonId";

export interface CurrentPerson {
  id: string;
  name: string;
  initials: string | null;
  color: string | null;
}

interface CurrentPersonContextValue {
  allPeople: CurrentPerson[];
  current: CurrentPerson | null;
  setCurrent: (id: string | null) => void;
}

const CurrentPersonContext = createContext<CurrentPersonContextValue | null>(null);

export function CurrentPersonProvider({
  people,
  children,
}: {
  people: CurrentPerson[];
  children: ReactNode;
}) {
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentId(window.localStorage.getItem(STORAGE_KEY));
  }, []);

  const setCurrent = useCallback((id: string | null) => {
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
    setCurrentId(id);
  }, []);

  const value = useMemo<CurrentPersonContextValue>(() => {
    const current = currentId ? people.find((p) => p.id === currentId) ?? null : null;
    return { allPeople: people, current, setCurrent };
  }, [currentId, people, setCurrent]);

  return (
    <CurrentPersonContext.Provider value={value}>
      {children}
    </CurrentPersonContext.Provider>
  );
}

export function useCurrentPerson(): CurrentPersonContextValue {
  const ctx = useContext(CurrentPersonContext);
  if (!ctx) {
    throw new Error("useCurrentPerson must be used within CurrentPersonProvider");
  }
  return ctx;
}
