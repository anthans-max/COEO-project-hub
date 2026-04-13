import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { SystemsGrid } from "@/components/systems/systems-grid";

export default async function SystemsPage() {
  const supabase = await createClient();
  const { data: systems } = await supabase
    .from("coeo_systems")
    .select("*")
    .order("sort_order");

  return (
    <>
      <Topbar title="Systems" />
      <div className="p-7 px-8 flex-1">
        <SystemsGrid initialData={systems ?? []} />
      </div>
    </>
  );
}
