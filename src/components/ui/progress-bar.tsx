interface ProgressBarProps {
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = "#0A2342" }: ProgressBarProps) {
  return (
    <div className="w-[72px] shrink-0">
      <div className="text-[11px] text-text-secondary mb-[3px] text-right">
        {value}%
      </div>
      <div className="h-[3px] bg-border rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
