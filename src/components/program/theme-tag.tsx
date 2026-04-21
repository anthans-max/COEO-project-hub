import type { ProgramTheme } from "@/lib/types";

export const THEME_SHORT_LABELS: Record<string, string> = {
  "T-01": "Data Quality",
  "T-02": "Integration",
  "T-03": "Ops Visibility",
  "T-04": "Self-Service",
  "T-05": "Identity & Access",
  "T-06": "Workflow",
  "T-07": "Reporting",
};

export function getThemeShortLabel(code: string, themes: ProgramTheme[]): string {
  return THEME_SHORT_LABELS[code] ?? themes.find((t) => t.code === code)?.title ?? code;
}

interface ThemeTagProps {
  code: string;
  themes: ProgramTheme[];
  label?: string;
}

export function ThemeTag({ code, themes, label }: ThemeTagProps) {
  const theme = themes.find((t) => t.code === code);
  const color = theme?.color ?? "#5a6a7e";
  const displayLabel = label ?? getThemeShortLabel(code, themes);

  return (
    <span
      className="inline-block text-sm font-bold tracking-[0.04em] mr-1 mb-1 rounded-[3px] px-[7px] py-[2px] border"
      style={{
        background: `${color}18`,
        color,
        borderColor: `${color}30`,
      }}
    >
      {displayLabel}
    </span>
  );
}
