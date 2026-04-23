import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { AiCapabilityMap } from "@/components/program/ai-capability-map";
import { AI_CAPABILITIES } from "@/lib/data/ai-capabilities";
import type { ArchitectureLayer, ProgramTheme } from "@/lib/types";

export default async function AiCapabilitiesPage() {
  const supabase = await createClient();
  const [themesResult, layersResult] = await Promise.all([
    supabase.from("coeo_program_themes").select("*").order("sort_order"),
    supabase.from("coeo_architecture_layers").select("*").order("sort_order"),
  ]);

  const themes = (themesResult.data ?? []) as ProgramTheme[];
  const layers = (layersResult.data ?? []) as ArchitectureLayer[];

  return (
    <>
      <Topbar title="AI Capability Map" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <AiCapabilityMap
          initialThemes={themes}
          initialLayers={layers}
          capabilities={AI_CAPABILITIES}
        />
      </div>
    </>
  );
}
