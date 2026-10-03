interface QuotationTermsProps {
  termsAndConditions?: string | null;
  notes?: string | null;
}

/**
 * Convert HTML terms (ul/li/p or plain text) into clean list lines.
 */
function htmlToLines(html?: string | null): string[] {
  if (!html) return [];
  let s = String(html).trim();
  if (!s) return [];

  // Decode common entities
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Prefer <li> items as separate lines
  const liMatches = s.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches
      .map((li) =>
        li
          .replace(/<li\b[^>]*>/i, "")
          .replace(/<\/li>/i, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
  }

  // Fallback: strip tags, split on newlines
  const plain = s
    .replace(/<\/(p|div|br|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return [];

  const lines = plain
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : [plain];
}

export function QuotationTerms({
  termsAndConditions,
  notes,
}: QuotationTermsProps) {
  const termLines = htmlToLines(termsAndConditions);
  const noteLines = htmlToLines(notes);
  if (!termLines.length && !noteLines.length) return null;

  return (
    <div className="mt-3 space-y-3 border border-slate-800 p-2 text-[10px] text-slate-700 sm:mt-4 sm:p-3 sm:text-[11px]">
      {termLines.length > 0 ? (
        <div>
          <div className="mb-1.5 font-semibold text-slate-800">
            Terms & Conditions
          </div>
          <ol className="list-decimal space-y-1 pl-4 leading-relaxed">
            {termLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {noteLines.length > 0 ? (
        <div>
          <div className="mb-1.5 font-semibold text-slate-800">Notes</div>
          <div className="space-y-1 leading-relaxed">
            {noteLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
