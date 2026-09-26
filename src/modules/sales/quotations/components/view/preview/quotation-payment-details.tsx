"use client";

export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface UpiDetails {
  upiId: string;
  linkedBank?: string;
}

interface QuotationPaymentDetailsProps {
  showBank?: boolean;
  showUpi?: boolean;
  bank?: BankDetails;
  upi?: UpiDetails;
}

const DEFAULT_BANK: BankDetails = {
  accountName: "AAS International",
  bankName: "State Bank of India",
  accountNumber: "123456789012",
  ifsc: "SBIN0001234",
};

const DEFAULT_UPI: UpiDetails = {
  upiId: "paymentaasint@sbi",
  linkedBank: "State Bank of India",
};

export function QuotationPaymentDetails({
  showBank = true,
  showUpi = true,
  bank = DEFAULT_BANK,
  upi = DEFAULT_UPI,
}: QuotationPaymentDetailsProps) {
  if (!showBank && !showUpi) return null;

  return (
    <div className="space-y-3 p-2 text-[10px] text-slate-700 sm:text-[11px]">
      {showBank && (
        <div>
          <div className="mb-1 font-semibold text-slate-800">
            Bank Account Details
          </div>
          <div className="space-y-0.5 leading-[1.5]">
            <div className="font-medium text-slate-800">{bank.accountName}</div>
            <div>
              <span className="text-slate-500">Bank:</span> {bank.bankName}
            </div>
            <div>
              <span className="text-slate-500">Acc. No:</span>{" "}
              {bank.accountNumber}
            </div>
            <div>
              <span className="text-slate-500">IFSC:</span> {bank.ifsc}
            </div>
          </div>
        </div>
      )}

      {showUpi && (
        <div>
          <div className="mb-1 font-semibold text-slate-800">UPI Details</div>
          <div className="space-y-0.5 leading-[1.5]">
            <div>
              <span className="text-slate-500">UPI ID:</span> {upi.upiId}
            </div>
            {upi.linkedBank && (
              <div>
                <span className="text-slate-500">Linked Bank:</span>{" "}
                {upi.linkedBank}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}