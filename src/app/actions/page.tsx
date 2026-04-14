import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { ActionsList } from "@/components/actions/actions-list";

export default async function ActionsPage() {
  const supabase = await createClient();

  const [{ data: actions }, { data: projects }] = await Promise.all([
    supabase.from("coeo_actions").select("*").order("sort_order"),
    supabase.from("coeo_projects").select("id, name").order("sort_order"),
  ]);

  return (
    <>
      <Topbar title="Action items" />
      <div className="p-7 px-8 flex-1">
        <ActionsList
          initialData={actions ?? []}
          projects={(projects ?? []) as { id: string; name: string }[]}
        />
      </div>
    </>
  );
}
