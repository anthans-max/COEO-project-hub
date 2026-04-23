import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { AiCapabilityMap } from "@/components/program/ai-capability-map";
import type {
  AiCapability,
  ArchitectureLayer,
  ProgramTheme,
} from "@/lib/types";

export default async function AiCapabilitiesPage() {
  const supabase = await createClient();
  const [themesResult, layersResult, capabilitiesResult] = await Promise.all([
    supabase.from("coeo_program_themes").select("*").order("sort_order"),
    supabase.from("coeo_architecture_layers").select("*").order("sort_order"),
    supabase.from("coeo_ai_capabilities").select("*").order("sort_order"),
  ]);

  const themes = (themesResult.data ?? []) as ProgramTheme[];
  const layers = (layersResult.data ?? []) as ArchitectureLayer[];
  const capabilities = (capabilitiesResult.data ?? []) as AiCapability[];

  return (
    <>
      <Topbar title="AI Capability Map" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <AiCapabilityMap
          initialThemes={themes}
          initialLayers={layers}
          initialCapabilities={capabilities}
        />
      </div>
    </>
  );
}
