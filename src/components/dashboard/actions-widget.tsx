"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Action } from "@/lib/types";

interface Props {
  actions: Action[];
}

export function ActionsWidget({ actions: initialActions }: Props) {
  const [actions, setActions] = useState(initialActions);
  const toast = useToast();

  const toggleComplete = async (action: Action) => {
    const newStatus = action.status === "Complete" ? "Open" : "Complete";
    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? { ...a, status: newStatus } : a))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_actions")
      .update({ status: newStatus })
      .eq("id", action.id);

    if (error) {
      setActions((prev) =>
        prev.map((a) => (a.id === action.id ? { ...a, status: action.status } : a))
      );
      toast.error("Failed to update action");
    }
  };

  return (
    <Card>
      {actions.map((action) => {
        const done = action.status === "Complete";
        return (
          <div
            key={action.id}
            className="flex items-start gap-[10px] px-4 py-[10px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]"
          >
            <button
              onClick={() => toggleComplete(action)}
              className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-[1px] flex items-center justify-center transition-all cursor-pointer ${
                done
                  ? "bg-primary border-primary"
                  : "border-[#C8C0B4] hover:border-primary"
              }`}
            >
              {done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <div
              className={`text-[15px] flex-1 leading-[1.45] ${
                done ? "line-through text-[#C8C0B4]" : "text-text-primary"
              }`}
            >
              {action.description}
            </div>
            <span className="text-[10px] font-semibold text-text-secondary bg-cream px-2 py-[2px] rounded-pill shrink-0">
              {action.owner_initials}
            </span>
          </div>
        );
      })}
    </Card>
  );
}
