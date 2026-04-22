const COLOR = "#5a6a7e";

interface SourceProjectTagProps {
  name: string;
}

export function SourceProjectTag({ name }: SourceProjectTagProps) {
  return (
    <span
      className="inline-block text-sm font-bold tracking-[0.04em] mr-1 mb-1 rounded-[3px] px-[7px] py-[2px] border"
      style={{
        background: `${COLOR}18`,
        color: COLOR,
        borderColor: `${COLOR}30`,
      }}
    >
      {name}
    </span>
  );
}
