interface MetricCardProps {
  label: string;
  value: number | string;
  sub?: string;
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="bg-cream rounded-card px-[18px] py-4">
      <div className="text-[10px] font-semibold text-text-secondary tracking-[0.08em] uppercase mb-2">
        {label}
      </div>
      <div className="text-[32px] font-semibold text-primary leading-none">
        {value}
      </div>
      {sub && (
        <div className="text-[13px] text-text-muted mt-[5px]">{sub}</div>
      )}
    </div>
  );
}
