"use client";

import { createContext, useContext, useState } from "react";

interface EditModeCtx {
  isEditing: boolean;
  toggle: () => void;
}

const Ctx = createContext<EditModeCtx>({
  isEditing: false,
  toggle: () => {},
});

export function useEditMode() {
  return useContext(Ctx);
}

export function ExecReportShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className={`exec-report-shell${isEditing ? " editing" : ""}`}>
      <Ctx.Provider
        value={{ isEditing, toggle: () => setIsEditing((v) => !v) }}
      >
        {children}
      </Ctx.Provider>
    </div>
  );
}
