interface QuotationTermsProps {
  termsAndConditions?: string | null;
}

function asText(html?: string | null) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

/** Terms only — internal notes never shown on document */
export function QuotationTerms({ termsAndConditions }: QuotationTermsProps) {
  const terms = asText(termsAndConditions);
  if (!terms) return null;

  return (
    <div className="mt-3 sm:mt-4">
      <div className="border border-slate-800 p-2 text-[10px] text-slate-700 sm:p-3 sm:text-[11px]">
        <div className="mb-1.5 border-b border-slate-200 pb-1 font-semibold text-slate-800">
          Terms & Conditions
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{terms}</div>
      </div>
    </div>
  );
}
