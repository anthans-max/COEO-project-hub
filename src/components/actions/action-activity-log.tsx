"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/browser";
import { useCurrentPerson } from "@/lib/hooks/use-current-person";
import { useToast } from "@/components/ui/toast";
import { formatRelativeTime } from "@/lib/utils";
import type { ActionLogEntry } from "@/lib/types";

interface Props {
  actionId: string;
}

export function ActionActivityLog({ actionId }: Props) {
  const { current } = useCurrentPerson();
  const [entries, setEntries] = useState<ActionLogEntry[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();

    supabase
      .from("coeo_action_log")
      .select("*")
      .eq("action_id", actionId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error("Failed to load activity");
          setEntries([]);
        } else {
          setEntries((data ?? []) as ActionLogEntry[]);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel(`coeo_action_log:${actionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "coeo_action_log",
          filter: `action_id=eq.${actionId}`,
        },
        (payload) => {
          const row = payload.new as ActionLogEntry;
          setEntries((prev) => (prev.some((e) => e.id === row.id) ? prev : [row, ...prev]));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [actionId, toast]);

  const handlePost = async () => {
    const trimmed = body.trim();
    if (!trimmed || !current || submitting) return;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const optimistic: ActionLogEntry = {
      id,
      action_id: actionId,
      body: trimmed,
      author_person_id: current.id,
      author_name: current.name,
      author_initials: current.initials,
      author_color: current.color,
      created_at: new Date().toISOString(),
    };

    setEntries((prev) => [optimistic, ...prev]);
    setBody("");
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_action_log").insert({
      id: optimistic.id,
      action_id: actionId,
      body: optimistic.body,
      author_person_id: current.id,
      author_name: current.name,
      author_initials: current.initials,
      author_color: current.color,
    });

    setSubmitting(false);
    if (error) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      setBody(trimmed);
      toast.error("Failed to post comment");
    }
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[14px] outline-none focus:border-accent w-full";

  const canSubmit = !!current && body.trim().length > 0 && !submitting;

  return (
    <div>
      <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
        Activity log
      </label>

      <div className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handlePost();
            }
          }}
          rows={2}
          disabled={!current}
          placeholder={current ? "Add a comment… (Cmd/Ctrl+Enter to post)" : "Select your name in the top bar to add activity"}
          className={`${inputClass} ${!current ? "bg-gray-50 text-text-muted cursor-not-allowed" : ""}`}
        />
        <div className="flex justify-end">
          <Button type="button" size="sm" disabled={!canSubmit} onClick={handlePost}>
            {submitting ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {loading && entries.length === 0 && (
          <div className="text-[12px] text-text-muted">Loading…</div>
        )}
        {!loading && entries.length === 0 && (
          <div className="text-[12px] text-text-muted">No activity yet.</div>
        )}
        {entries.map((entry) => {
          const initials =
            entry.author_initials ?? entry.author_name?.slice(0, 2).toUpperCase() ?? "?";
          return (
            <div key={entry.id} className="flex gap-2">
              <Avatar
                initials={initials}
                color={entry.author_color ?? "#0A2342"}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-primary">
                    {entry.author_name ?? "Unknown"}
                  </span>
                  <time
                    className="text-[11px] text-text-muted"
                    dateTime={entry.created_at}
                    title={new Date(entry.created_at).toLocaleString()}
                  >
                    {formatRelativeTime(entry.created_at)}
                  </time>
                </div>
                <div className="text-[13px] text-text-primary whitespace-pre-wrap break-words leading-[1.5]">
                  {entry.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
