"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface HasId {
  id: string;
  updated_at?: string;
}

export function useRealtime<T extends HasId>(
  table: string,
  initialData: T[]
): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [data, setData] = useState<T[]>(initialData);

  // Reset when initialData changes (e.g. filter applied server-side)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T & Record<string, unknown>>) => {
      setData((prev) => {
        switch (payload.eventType) {
          case "INSERT": {
            const newRow = payload.new as T;
            // Avoid duplicates from optimistic inserts
            if (prev.some((row) => row.id === newRow.id)) return prev;
            return [...prev, newRow];
          }
          case "UPDATE": {
            const updated = payload.new as T;
            return prev.map((row) =>
              row.id === updated.id ? { ...row, ...updated } : row
            );
          }
          case "DELETE": {
            const old = payload.old as Partial<T>;
            return prev.filter((row) => row.id !== old.id);
          }
          default:
            return prev;
        }
      });
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, handleChange]);

  return [data, setData];
}
