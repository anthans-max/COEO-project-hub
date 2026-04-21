import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { ThemesList } from "@/components/program/themes-list";
import type { ProgramDecision, ProgramSetting, ProgramTheme } from "@/lib/types";

export default async function StrategyPage() {
  const supabase = await createClient();
  const [themesResult, decisionsResult, settingsResult] = await Promise.all([
    supabase.from("coeo_program_themes").select("*").order("sort_order"),
    supabase.from("coeo_program_decisions").select("*").order("sort_order"),
    supabase.from("coeo_program_settings").select("*"),
  ]);

  const themes = (themesResult.data ?? []) as ProgramTheme[];
  const decisions = (decisionsResult.data ?? []) as ProgramDecision[];
  const settings = (settingsResult.data ?? []) as ProgramSetting[];

  return (
    <>
      <Topbar title="Strategy & Themes" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <ThemesList
          initialThemes={themes}
          initialDecisions={decisions}
          initialSettings={settings}
        />
      </div>
    </>
  );
}
