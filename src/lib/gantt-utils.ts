export interface Quarter {
  label: string;
  start: Date;
  end: Date;
}

// Derives a contiguous list of quarters spanning from this calendar year through
// the latest project end_date plus a 2-month buffer. Used to keep roadmap
// Gantt views in sync with whatever date range the data actually covers.
export function deriveQuarters(
  projects: { end_date: string | null }[],
): Quarter[] {
  const today = new Date();
  const latest = projects
    .map((p) => (p.end_date ? new Date(p.end_date) : null))
    .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()))
    .reduce<Date | null>((acc, d) => (acc && acc > d ? acc : d), null);

  // 2-month buffer past the latest end_date.
  const buffered = latest
    ? new Date(latest.getFullYear(), latest.getMonth() + 2, 1)
    : today;

  const startYear = today.getFullYear();
  const endYear = Math.max(startYear, buffered.getFullYear());

  const quarters: Quarter[] = [];
  for (let y = startYear; y <= endYear; y++) {
    quarters.push(
      { label: `Q1 ${y}`, start: new Date(y, 0, 1), end: new Date(y, 2, 31) },
      { label: `Q2 ${y}`, start: new Date(y, 3, 1), end: new Date(y, 5, 30) },
      { label: `Q3 ${y}`, start: new Date(y, 6, 1), end: new Date(y, 8, 30) },
      { label: `Q4 ${y}`, start: new Date(y, 9, 1), end: new Date(y, 11, 31) },
    );
  }
  return quarters;
}
