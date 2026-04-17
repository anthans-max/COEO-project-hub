"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

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

// Maps DB columns to accepted header synonyms (post-normalization).
// Normalization: lowercase + strip all non-alphanumeric characters.
const COLUMN_SYNONYMS: Record<keyof ParsedRow, string[]> = {
  item_no: ["itemno", "item", "itemnumber", "itemid", "no", "id"],
  category: ["category"],
  project_description: ["projectdescription", "description", "project"],
  project_objectives: ["projectobjectives", "objectives", "objective"],
  timing: ["timing"],
  rcg_owner: ["rcgowner", "owner", "rcg"],
  coeo_support: ["coeosupport", "coeo"],
  third_party_support: ["3rdpartysupport", "thirdpartysupport", "3rdparty", "thirdparty"],
  project_start: ["projectstart", "start", "startdate"],
  project_complete: ["projectcomplete", "complete", "completedate", "targetcomplete", "enddate", "end"],
  project_status: ["projectstatus", "status"],
  comments_updates: ["commentsupdates", "comments", "commentupdates", "notes", "updates"],
};

function normalize(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

function findSheet(wb: import("xlsx").WorkBook): { name: string; sheet: import("xlsx").WorkSheet } | null {
  // Exact match first, then fall back to normalized comparison.
  if (wb.Sheets["PMO Tracker"]) return { name: "PMO Tracker", sheet: wb.Sheets["PMO Tracker"] };
  const target = normalize("PMO Tracker");
  for (const name of wb.SheetNames) {
    if (normalize(name) === target) return { name, sheet: wb.Sheets[name] };
  }
  return null;
}

type Grid = unknown[][];

function findHeaderRowIndex(grid: Grid): number {
  const itemSynonyms = new Set(COLUMN_SYNONYMS.item_no);
  // Scan up to the first 15 rows for the header; pick the first row that contains an ItemNo-like cell.
  const scanLimit = Math.min(grid.length, 15);
  for (let i = 0; i < scanLimit; i++) {
    const row = grid[i] ?? [];
    for (const cell of row) {
      if (itemSynonyms.has(normalize(cell))) return i;
    }
  }
  return -1;
}

function buildColumnIndexMap(headerRow: unknown[]): Partial<Record<keyof ParsedRow, number>> {
  const normalizedHeaders = headerRow.map(normalize);
  const map: Partial<Record<keyof ParsedRow, number>> = {};
  for (const [col, synonyms] of Object.entries(COLUMN_SYNONYMS) as [keyof ParsedRow, string[]][]) {
    for (const syn of synonyms) {
      const idx = normalizedHeaders.indexOf(syn);
      if (idx !== -1) {
        map[col] = idx;
        break;
      }
    }
  }
  return map;
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

      const found = findSheet(wb);
      if (!found) {
        throw new Error(
          `Sheet "PMO Tracker" not found. Sheets in file: ${wb.SheetNames.join(", ") || "(none)"}`
        );
      }

      const grid = XLSX.utils.sheet_to_json<unknown[]>(found.sheet, {
        header: 1,
        defval: null,
        raw: false,
        blankrows: false,
      });

      const headerIdx = findHeaderRowIndex(grid);
      if (headerIdx === -1) {
        const first = (grid[0] ?? []).map((c) => (c == null ? "" : String(c))).filter((s) => s.length > 0);
        throw new Error(
          `Could not find a header row with an "ItemNo" column. First row read: ${
            first.length ? first.join(" | ") : "(empty)"
          }`
        );
      }

      const headerRow = grid[headerIdx] as unknown[];
      const colMap = buildColumnIndexMap(headerRow);

      if (colMap.item_no === undefined) {
        const detected = headerRow.map((c) => (c == null ? "" : String(c))).filter((s) => s.length > 0);
        throw new Error(
          `Could not find an "ItemNo" column. Headers detected: ${detected.join(" | ") || "(empty)"}`
        );
      }

      const pick = (row: unknown[], col: keyof ParsedRow): unknown => {
        const idx = colMap[col];
        return idx === undefined ? null : row[idx];
      };

      const rows: ParsedRow[] = [];
      for (let i = headerIdx + 1; i < grid.length; i++) {
        const row = grid[i] ?? [];
        const itemNo = toInt(pick(row, "item_no"));
        if (itemNo === null) continue;
        rows.push({
          item_no: itemNo,
          category: str(pick(row, "category")),
          project_description: str(pick(row, "project_description")),
          project_objectives: str(pick(row, "project_objectives")),
          timing: str(pick(row, "timing")),
          rcg_owner: str(pick(row, "rcg_owner")),
          coeo_support: str(pick(row, "coeo_support")),
          third_party_support: str(pick(row, "third_party_support")),
          project_start: str(pick(row, "project_start")),
          project_complete: str(pick(row, "project_complete")),
          project_status: str(pick(row, "project_status")),
          comments_updates: str(pick(row, "comments_updates")),
        });
      }

      if (rows.length === 0) {
        const matched = (Object.keys(colMap) as (keyof ParsedRow)[]).join(", ") || "(none)";
        throw new Error(
          `No rows with a numeric ItemNo found below the header. Matched columns: ${matched}. ` +
            `Check that the "ItemNo" cells contain plain numbers (not formulas or text).`
        );
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
        <span className="text-[12px] font-medium text-destructive max-w-[520px]">{error}</span>
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
