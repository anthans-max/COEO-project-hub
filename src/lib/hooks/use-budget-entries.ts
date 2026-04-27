import { useRealtime } from "./use-realtime";
import type { BudgetEntry } from "@/lib/types";

export function useBudgetEntries(initialData: BudgetEntry[]) {
  return useRealtime<BudgetEntry>("coeo_budget_entries", initialData);
}
