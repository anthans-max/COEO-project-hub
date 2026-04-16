import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { ActionsList } from "@/components/actions/actions-list";

export default async function ActionsPage() {
  const supabase = await createClient();

  const [{ data: actions }, { data: projects }, { data: people }] = await Promise.all([
    supabase.from("coeo_actions").select("*").order("sort_order"),
    supabase.from("coeo_projects").select("id, name").order("sort_order"),
    supabase.from("coeo_people").select("id, name, initials").order("name"),
  ]);

  return (
    <>
      <Topbar title="Action items" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <ActionsList
          initialData={actions ?? []}
          projects={(projects ?? []) as { id: string; name: string }[]}
          people={(people ?? []) as { id: string; name: string; initials: string | null }[]}
        />
      </div>
    </>
  );
}
