interface InvoiceTermsProps {
  termsAndConditions?: string | null;
  notes?: string | null;
}

function asText(html?: string | null) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

export function InvoiceTerms({
  termsAndConditions,
  notes,
}: InvoiceTermsProps) {
  const terms = asText(termsAndConditions);
  const note = asText(notes);
  if (!terms && !note) return null;

  return (
    <div className="mt-3 space-y-3 border border-slate-800 p-2 text-[10px] text-slate-700 sm:mt-4 sm:p-3 sm:text-[11px]">
      {terms ? (
        <div>
          <div className="mb-1 font-semibold text-slate-800">
            Terms & Conditions
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{terms}</div>
        </div>
      ) : null}
      {note ? (
        <div>
          <div className="mb-1 font-semibold text-slate-800">Notes</div>
          <div className="whitespace-pre-wrap leading-relaxed">{note}</div>
        </div>
      ) : null}
    </div>
  );
}
