"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddDocDialog } from "./add-doc-dialog";
import { EditDocDialog } from "./edit-doc-dialog";
import { useDocs } from "@/lib/hooks/use-docs";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatBytes } from "@/lib/utils";
import type { Doc } from "@/lib/types";

interface Props {
  projectId: string;
  initialData: Doc[];
}

export function DocsList({ projectId, initialData }: Props) {
  const [allDocs, setDocs] = useDocs(initialData);
  const docs = allDocs
    .filter((d) => d.project_id === projectId)
    .sort((a, b) => (b.date ?? b.created_at).localeCompare(a.date ?? a.created_at));
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleSave = (u: Doc) => setDocs((prev) => prev.map((d) => (d.id === u.id ? u : d)));

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = allDocs.find((d) => d.id === deleteId);
    setDocs((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
    const supabase = createClient();
    if (original?.file_path) {
      // Best-effort storage cleanup; surface but don't block on failure.
      const rm = await supabase.storage.from("project-docs").remove([original.file_path]);
      if (rm.error) toast.error("File could not be removed from storage");
    }
    const { error } = await supabase.from("coeo_docs").delete().eq("id", deleteId);
    if (error) {
      if (original) setDocs((prev) => [...prev, original]);
      toast.error("Failed to delete doc");
    }
  };

  const fetchSignedUrl = async (doc: Doc, asDownload: boolean): Promise<string | null> => {
    if (!doc.file_path) return null;
    try {
      const params = new URLSearchParams({ file_path: doc.file_path });
      if (asDownload) params.set("download", "1");
      const res = await fetch(
        `/api/projects/${doc.project_id}/docs/signed-url?${params.toString()}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(body.error || "Failed to generate download link");
        return null;
      }
      const { url } = (await res.json()) as { url: string };
      return url;
    } catch {
      toast.error("Failed to generate download link");
      return null;
    }
  };

  const handleView = async (doc: Doc) => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      toast.error("Popup blocked — please allow popups for this site");
      return;
    }
    const url = await fetchSignedUrl(doc, false);
    if (url) {
      newWindow.location.href = url;
    } else {
      newWindow.close();
    }
  };

  const handleDownload = async (doc: Doc) => {
    const url = await fetchSignedUrl(doc, true);
    if (!url) return;
    // Server set content-disposition: attachment via the `download` option
    // on createSignedUrl, so any navigation to this URL triggers a download.
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add doc</Button>
      </div>

      {docs.length === 0 ? (
        <Card className="p-8 text-center text-[15px] text-text-muted">No docs yet</Card>
      ) : (
        <Card>
          {docs.map((d) => {
            const isUpload = d.file_path != null;
            return (
              <div key={d.id} className="flex items-start gap-3 px-4 py-3 border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]">
                <div className="flex-1 min-w-0">
                  {isUpload ? (
                    <div className="text-[15px] font-medium text-text-primary">{d.title}</div>
                  ) : d.url ? (
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-[15px] font-medium text-text-primary hover:text-accent hover:underline underline-offset-2">
                      {d.title}
                    </a>
                  ) : (
                    <div className="text-[15px] font-medium text-text-primary">{d.title}</div>
                  )}
                  <div className="text-[12px] text-text-muted mt-[2px]">
                    {isUpload
                      ? [formatBytes(d.file_size), d.mime_type].filter(Boolean).join(" · ") || "Uploaded file"
                      : d.date
                      ? formatDate(d.date)
                      : "No date"}
                  </div>
                  {d.notes && <div className="text-[13px] text-text-secondary mt-1">{d.notes}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {isUpload && (
                    <>
                      <Button size="sm" onClick={() => handleView(d)}>View</Button>
                      <Button size="sm" onClick={() => handleDownload(d)}>Download</Button>
                    </>
                  )}
                  <Button size="sm" onClick={() => setEditing(d)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(d.id)}>Delete</Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <AddDocDialog
        open={showAdd}
        projectId={projectId}
        onClose={() => setShowAdd(false)}
        onAdd={(d) => setDocs((prev) => [...prev, d])}
      />

      <EditDocDialog
        doc={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={(id) => {
          setEditing(null);
          setDeleteId(id);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete doc"
        message="Are you sure you want to delete this doc entry?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
