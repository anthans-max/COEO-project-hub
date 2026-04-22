import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { ArchitectureView } from "@/components/program/architecture-view";
import type {
  ArchitectureLayer,
  ProgramDecision,
  ProgramTheme,
} from "@/lib/types";

export default async function ArchitecturePage() {
  const supabase = await createClient();
  const [themesRes, layersRes, decisionsRes] = await Promise.all([
    supabase.from("coeo_program_themes").select("*").order("sort_order"),
    supabase.from("coeo_architecture_layers").select("*").order("sort_order"),
    supabase.from("coeo_program_decisions").select("*").order("sort_order"),
  ]);

  const themes = (themesRes.data ?? []) as ProgramTheme[];
  const layers = (layersRes.data ?? []) as ArchitectureLayer[];
  const decisions = (decisionsRes.data ?? []) as ProgramDecision[];

  return (
    <>
      <Topbar title="Architecture" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <ArchitectureView
          themes={themes}
          initialLayers={layers}
          initialDecisions={decisions}
        />
      </div>
    </>
  );
}
