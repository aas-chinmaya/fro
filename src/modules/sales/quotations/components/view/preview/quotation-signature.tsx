"use client";

interface QuotationSignatureProps {
  amountInWords?: string;
}

export function QuotationSignature({ amountInWords }: QuotationSignatureProps) {
  return (
    <div className="grid grid-cols-1 border-t border-slate-800 sm:grid-cols-[1.25fr_1fr]">
      <div className="min-h-[80px] border-b border-slate-800 p-2 sm:min-h-[100px] sm:border-b-0 sm:border-r">
        <div className="text-[10px] font-medium sm:text-[11px]">
          Total (in words) :
        </div>
        <div className="mt-0.5 text-[10px] sm:text-[11px]">
          {amountInWords || "—"}
        </div>
      </div>

      <div className="relative min-h-[90px] p-2 sm:min-h-[100px]">
        <div className="absolute bottom-2 right-4 text-center sm:right-8">
          <div className="mb-6 h-8 sm:h-10" />
          <div className="border-t border-slate-400 px-4 pt-1 text-[9px] text-slate-500 sm:px-5">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}