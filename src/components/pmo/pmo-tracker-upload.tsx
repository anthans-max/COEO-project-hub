"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

type Row = Record<string, unknown>;

interface ParsedRow {
  item_no: number;
  category: string | null;
  project_description: string | null;
  project_objectives: string | null;
  timing: string | null;
  rcg_owner: string | null;
  coeo_support: string | null;
  third_party_support: string | null;
  project_start: string | null;
  project_complete: string | null;
  project_status: string | null;
  comments_updates: string | null;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

export function PmoTrackerUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    setSuccess(null);
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets["PMO Tracker"];
      if (!sheet) {
        throw new Error('Sheet "PMO Tracker" not found in workbook');
      }

      const raw = XLSX.utils.sheet_to_json<Row>(sheet, { defval: null, raw: false });

      const rows: ParsedRow[] = [];
      for (const r of raw) {
        const itemNo = toInt(r["ItemNo"]);
        if (itemNo === null) continue;
        rows.push({
          item_no: itemNo,
          category: str(r["Category"]),
          project_description: str(r["Project Description"]),
          project_objectives: str(r["Project Objectives"]),
          timing: str(r["Timing"]),
          rcg_owner: str(r["RCG Owner"]),
          coeo_support: str(r["COEO Support"]),
          third_party_support: str(r["3rd Party Support"]),
          project_start: str(r["Project Start"]),
          project_complete: str(r["Project Complete"]),
          project_status: str(r["Project Status"]),
          comments_updates: str(r["Comments/Updates"]),
        });
      }

      if (rows.length === 0) {
        throw new Error("No valid rows found in the PMO Tracker sheet");
      }

      const supabase = createClient();
      const uploaded_at = new Date().toISOString();

      const { error: deleteError } = await supabase
        .from("coeo_pmo_tracker")
        .delete()
        .not("id", "is", null);
      if (deleteError) throw new Error(deleteError.message);

      const payload = rows.map((r) => ({ ...r, uploaded_at }));
      const { error: insertError } = await supabase
        .from("coeo_pmo_tracker")
        .insert(payload);
      if (insertError) throw new Error(insertError.message);

      setSuccess(`Updated — ${rows.length} items loaded`);
      router.refresh();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {success && (
        <span className="text-[12px] font-medium text-[#1A5C32]">{success}</span>
      )}
      {error && (
        <span className="text-[12px] font-medium text-destructive">{error}</span>
      )}
      <Button variant="ghost" onClick={handleClick} disabled={uploading}>
        {uploading ? "Uploading…" : "Upload Tracker"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
