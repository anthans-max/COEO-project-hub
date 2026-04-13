import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { ProjectsTable } from "@/components/projects/projects-table";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("coeo_projects")
    .select("*")
    .order("sort_order");

  return (
    <>
      <Topbar title="Projects" />
      <div className="p-7 px-8 flex-1">
        <ProjectsTable initialData={projects ?? []} />
      </div>
    </>
  );
}
