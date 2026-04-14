import { useRealtime } from "./use-realtime";
import type { MeetingNote } from "@/lib/types";

export function useMeetingNotes(initialData: MeetingNote[]) {
  return useRealtime<MeetingNote>("coeo_meeting_notes", initialData);
}
