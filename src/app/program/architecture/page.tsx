import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { ArchitectureView } from "@/components/program/architecture-view";
import type { ProgramTheme } from "@/lib/types";

export default async function ArchitecturePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coeo_program_themes")
    .select("*")
    .order("sort_order");

  const themes = (data ?? []) as ProgramTheme[];

  return (
    <>
      <Topbar title="Architecture" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <ArchitectureView themes={themes} />
      </div>
    </>
  );
}
