import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { DecisionsList } from "@/components/program/decisions-list";
import type { ProgramDecision, ProgramTheme } from "@/lib/types";

export default async function DecisionsPage() {
  const supabase = await createClient();
  const [decisionsResult, themesResult] = await Promise.all([
    supabase.from("coeo_program_decisions").select("*").order("sort_order"),
    supabase.from("coeo_program_themes").select("*").order("sort_order"),
  ]);

  const decisions = (decisionsResult.data ?? []) as ProgramDecision[];
  const themes = (themesResult.data ?? []) as ProgramTheme[];

  return (
    <>
      <Topbar title="Decisions & Alignment" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <DecisionsList initialDecisions={decisions} initialThemes={themes} />
      </div>
    </>
  );
}
