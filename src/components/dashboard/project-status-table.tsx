import Link from "next/link";
import type { Project } from "@/lib/types";

interface Props {
  projects: Project[];
}

export function ProjectStatusTable({ projects }: Props) {
  return (
    <div className="bg-white border border-border rounded-[10px] overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-cream">
          <tr>
            <th className="px-3.5 py-2 text-[12px] font-medium text-text-muted uppercase tracking-[0.03em] text-left">Project</th>
            <th className="px-3.5 py-2 text-[12px] font-medium text-text-muted uppercase tracking-[0.03em] text-left">Phase</th>
            <th className="px-3.5 py-2 text-[12px] font-medium text-text-muted uppercase tracking-[0.03em] text-left">Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-cream transition-colors">
              <td className="p-0">
                <Link href={`/projects/${p.id}`} className="block px-3.5 py-2.5 text-[15px] font-medium text-primary">
                  {p.name}
                </Link>
              </td>
              <td className="px-3.5 py-2.5">
                <span className="inline-block text-[12px] font-medium px-2.5 py-0.5 rounded-[8px] bg-cream text-[#6B6560] whitespace-nowrap">
                  {p.phase_current ?? "—"}
                </span>
              </td>
              <td className="px-3.5 py-2.5 text-[15px] text-primary">
                <span className="inline-block w-[60px] h-[5px] bg-border rounded-[3px] align-middle mr-2 overflow-hidden">
                  <span className="block h-full bg-primary rounded-[3px]" style={{ width: `${p.progress}%` }} />
                </span>
                {p.progress}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
