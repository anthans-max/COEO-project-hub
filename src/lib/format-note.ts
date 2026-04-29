export function preprocessNoteText(text: string): string {
  if (!text) return text;

  let out = text.replace(/\r\n/g, "\n");

  out = out.replace(/^([ \t]*)•[ \t]+/gm, "$1- ");

  out = out.replace(/^([ \t]*)([A-Za-z][^\n.?!:]*):[ \t]*$/gm, "$1**$2:**");

  const isListLine = (line: string) => /^[ \t]*([-*]|\d+\.)[ \t]+/.test(line);
  const source = out;
  out = source.replace(/\n+/g, (match, offset: number, full: string) => {
    if (match.length >= 2) return "\n\n";
    const before = full.slice(0, offset).split("\n").pop() ?? "";
    const after = full.slice(offset + match.length).split("\n")[0] ?? "";
    if (isListLine(before) && isListLine(after)) return "\n";
    return "\n\n";
  });

  return out;
}
