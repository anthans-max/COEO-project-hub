import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { SystemsGrid } from "@/components/systems/systems-grid";
import type { SystemCategory } from "@/lib/types";

export default async function SystemsPage() {
  const supabase = await createClient();
  const { data: systems } = await supabase
    .from("coeo_systems")
    .select("*")
    .order("sort_order");

  // Categories table may not exist yet — query independently so it can't crash the page
  let categories: SystemCategory[] = [];
  try {
    const { data } = await supabase
      .from("coeo_system_categories")
      .select("*")
      .order("sort_order");
    if (data) categories = data;
  } catch {
    // Table doesn't exist yet — fall back to empty array
  }

  return (
    <>
      <Topbar title="Systems" />
      <div className="pt-8 pb-7 px-8 flex-1">
        <SystemsGrid
          initialData={systems ?? []}
          initialCategories={categories}
        />
      </div>
    </>
  );
}
