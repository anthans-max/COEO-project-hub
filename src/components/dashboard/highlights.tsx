interface Highlight {
  bg: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  project: string;
}

const highlights: Highlight[] = [
  {
    bg: "#E8F5E9",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <path d="M3 8.5L6.5 12L13 4" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Data Warehouse Phase 1 nearing completion",
    desc: "Foundational KPIs and reports on track. StarRocks platform operational.",
    project: "Data Warehouse",
  },
  {
    bg: "#E3F2FD",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <circle cx="8" cy="8" r="5" stroke="#2980B9" strokeWidth="1.5" />
        <path d="M8 5.5V8.5L10 10" stroke="#2980B9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Customer Portal requirements gathering underway",
    desc: "Conceptual planning complete. Service and inventory requirements now being defined.",
    project: "Customer Portal",
  },
  {
    bg: "#F3E5F5",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <path d="M4 12L8 4L12 12" stroke="#7B68EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9.5H10.5" stroke="#7B68EE" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Salesforce discovery kicked off with SETGO",
    desc: "Mamata leading the current-state assessment. Key architecture decision targeted for May 30.",
    project: "Salesforce Discovery",
  },
];

export function Highlights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {highlights.map((h) => (
        <div key={h.title} className="p-[14px] border border-border rounded-[10px] bg-white">
          <div className="flex items-center gap-2 mb-[10px]">
            <div
              className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: h.bg }}
            >
              {h.icon}
            </div>
            <div className="text-[12px] text-[#6B6560]">{h.project}</div>
          </div>
          <div className="text-[15px] font-medium text-primary mb-1">{h.title}</div>
          <div className="text-[14px] text-[#6B6560] leading-[1.5]">{h.desc}</div>
        </div>
      ))}
    </div>
  );
}
