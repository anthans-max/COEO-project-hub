import { useRealtime } from "./use-realtime";
import type { Doc } from "@/lib/types";

export function useDocs(initialData: Doc[]) {
  return useRealtime<Doc>("coeo_docs", initialData);
}
