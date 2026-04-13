import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { VendorsGrid } from "@/components/vendors/vendors-grid";

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("coeo_vendors")
    .select("*")
    .order("sort_order");

  return (
    <>
      <Topbar title="Vendors" />
      <div className="p-7 px-8 flex-1">
        <VendorsGrid initialData={vendors ?? []} />
      </div>
    </>
  );
}
