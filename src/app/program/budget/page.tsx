import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { BudgetView } from "@/components/program/budget-view";
import type { ProgramBudgetRow } from "@/lib/types";

export default async function BudgetPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coeo_program_budget")
    .select("*")
    .order("sort_order");

  const rows = (data ?? []) as ProgramBudgetRow[];

  return (
    <>
      <Topbar title="Budget & Investment" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <BudgetView initialRows={rows} />
      </div>
    </>
  );
}
