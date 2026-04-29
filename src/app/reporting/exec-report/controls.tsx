"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEditMode } from "./ExecReportShell";

interface Props {
  initialFrom: string;
  initialTo: string;
}

export function ExecReportControls({ initialFrom, initialTo }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const { isEditing, toggle } = useEditMode();

  const update = () => {
    router.push(`/reporting/exec-report?from=${from}&to=${to}`);
  };

  return (
    <div className="controls-bar">
      <label>Week of</label>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      />
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <button type="button" className="btn btn-update" onClick={update}>
        Update
      </button>
      <button
        type="button"
        className={`btn ${isEditing ? "btn-edit-active" : "btn-edit"}`}
        onClick={toggle}
      >
        {isEditing ? "Done editing" : "Edit report"}
      </button>
      <a
        href={`/api/exec-report/pdf?from=${from}&to=${to}`}
        className="btn btn-print"
        download
      >
        ↓ Save as PDF
      </a>
    </div>
  );
}
