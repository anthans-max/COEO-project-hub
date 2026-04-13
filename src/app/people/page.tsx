import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { PeopleGrid } from "@/components/people/people-grid";

export default async function PeoplePage() {
  const supabase = await createClient();
  const { data: people } = await supabase
    .from("coeo_people")
    .select("*")
    .order("sort_order");

  return (
    <>
      <Topbar title="People" />
      <div className="p-7 px-8 flex-1">
        <PeopleGrid initialData={people ?? []} />
      </div>
    </>
  );
}
