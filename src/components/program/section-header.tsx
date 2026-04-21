interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="text-[11px] font-bold tracking-[0.12em] uppercase mb-[6px]" style={{ color: "#c87d2f" }}>
        {label}
      </div>
      <h1
        className="text-[26px] font-bold text-primary m-0 mb-2 tracking-[-0.02em]"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[14px] m-0 leading-[1.6] max-w-[680px]" style={{ color: "#5a6a7e" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
