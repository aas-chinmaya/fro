export type CustomerType =
  | "WALK_IN"
  | "REGULAR"
  | "WHOLESALE";

export interface CustomerAddress {
  id?: string;
  businessId?: string;
  customerId?: string;
  type?: string;
  label?: string;
  contactPerson?: string;
  contactNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  pincode?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Customer {
  id: string;
  businessId: string;
  branchId?: string | null;
  customerCode?: string | null;
  customerType: CustomerType;
  name: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  gstin?: string | null;
  pan?: string | null;
  companyName?: string | null;
  creditLimit: number | string;
  creditDays: number;
  openingBalance: number | string;
  outstandingBalance: number | string;
  rewardPoints: number;
  isActive: boolean;
  notes?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  addresses?: CustomerAddress[];
}

export interface CustomerDashboardSummary {
  totalInvoices: number;
  totalPurchaseAmount: number;
  totalPaidAmount: number;
  totalOutstanding: number;
  totalQuantityPurchased: number;
  averageInvoiceValue: number;
  firstPurchaseDate: string | null;
  lastPurchaseDate: string | null;
}

export interface CustomerDashboardTopProduct {
  productId: string;
  itemName: string;
  quantity: number;
  amount: number;
}

export interface CustomerDashboardAging {
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOverdue: number;
  overdueInvoiceCount: number;
  overdueInvoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    grandTotal: number | string;
    paidAmount: number | string;
    pendingAmount: number | string;
    overdueDays: number;
    dueDate: string;
  }>;
}

export interface CustomerDashboardCredit {
  creditLimit: number;
  availableCredit: number;
  creditUtilization: number;
}

export interface CustomerDashboardAnalytics {
  purchaseFrequency: number | string;
  averageDaysBetweenPurchases: number;
  monthlyPurchases: Array<{
    month: string;
    invoices: number;
    amount: number;
  }>;
  topProducts: CustomerDashboardTopProduct[];
  aging: CustomerDashboardAging;
  credit: CustomerDashboardCredit;
}

export interface CustomerPurchaseItem {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string;
  invoiceStatus: string;
  invoiceType: string;
  grandTotal: number | string;
  paidAmount: number | string;
  pendingAmount: number | string;
}

export interface CustomerTransactionItem {
  id: string;
  transactionDate: string;
  documentType: string;
  documentId: string | null;
  documentNumber: string | null;
  debit: number | string;
  credit: number | string;
  balance: number | string;
  remarks: string;
}

export interface CustomerDashboardResponse {
  customer: Customer;
  summary: CustomerDashboardSummary;
  analytics: CustomerDashboardAnalytics;
  recentPurchases: CustomerPurchaseItem[];
  recentTransactions: CustomerTransactionItem[];
}














// export type CustomerType =
//   | "WALK_IN"
//   | "REGULAR"
//   | "WHOLESALE";

// export interface CustomerAddress {
//   id?: string;
//   businessId?: string;
//   customerId?: string;
//   type?: string;
//   label?: string;
//   contactPerson?: string;
//   contactNumber?: string;
//   addressLine1?: string;
//   addressLine2?: string;
//   landmark?: string;
//   city?: string;
//   district?: string;
//   state?: string;
//   stateCode?: string;
//   country?: string;
//   pincode?: string;
//   isDefault: boolean;
//   isActive: boolean;
// }

// export interface Customer {
//   id: string;
//   businessId: string;
//   branchId?: string | null;
//   customerCode?: string | null;
//   customerType: CustomerType;
//   name: string;
//   mobile: string;
//   alternateMobile?: string | null;
//   email?: string | null;
//   gstin?: string | null;
//   pan?: string | null;
//   companyName?: string | null;
//   creditLimit: number | string;
//   creditDays: number;
//   openingBalance: number | string;
//   outstandingBalance: number | string;
//   rewardPoints: number;
//   isActive: boolean;
//   notes?: string | null;
//   createdBy: string;
//   updatedBy?: string | null;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt?: string | null;
//   addresses?: CustomerAddress[];
// }

// export interface CustomerDashboardSummary {
//   totalInvoices: number;
//   totalPurchaseAmount: number;
//   totalPaidAmount: number;
//   totalOutstanding: number;
//   totalQuantityPurchased: number;
//   averageInvoiceValue: number;
//   firstPurchaseDate: string | null;
//   lastPurchaseDate: string | null;
// }

// export interface CustomerDashboardTopProduct {
//   productId: string;
//   itemName: string;
//   quantity: number;
//   amount: number;
// }

// export interface CustomerDashboardAging {
//   current: number;
//   days1To30: number;
//   days31To60: number;
//   days61To90: number;
//   days90Plus: number;
//   totalOverdue: number;
//   overdueInvoiceCount: number;
//   overdueInvoices: Array<{
//     id: string;
//     invoiceNumber: string;
//     invoiceDate: string;
//     grandTotal: number | string;
//     paidAmount: number | string;
//     pendingAmount: number | string;
//     overdueDays: number;
//     dueDate: string;
//   }>;
// }

// export interface CustomerDashboardCredit {
//   creditLimit: number;
//   availableCredit: number;
//   creditUtilization: number;
// }

// export interface CustomerDashboardAnalytics {
//   purchaseFrequency: number | string;
//   averageDaysBetweenPurchases: number;
//   monthlyPurchases: Array<{
//     month: string;
//     invoices: number;
//     amount: number;
//   }>;
//   topProducts: CustomerDashboardTopProduct[];
//   aging: CustomerDashboardAging;
//   credit: CustomerDashboardCredit;
// }

// export interface CustomerPurchaseItem {
//   id: string;
//   invoiceNumber: string | null;
//   invoiceDate: string;
//   invoiceStatus: string;
//   invoiceType: string;
//   grandTotal: number | string;
//   paidAmount: number | string;
//   pendingAmount: number | string;
// }

// export interface CustomerTransactionItem {
//   id: string;
//   transactionDate: string;
//   documentType: string;
//   documentId: string | null;
//   documentNumber: string | null;
//   debit: number | string;
//   credit: number | string;
//   balance: number | string;
//   remarks: string;
// }

// export interface CustomerDashboardResponse {
//   customer: Customer;
//   summary: CustomerDashboardSummary;
//   analytics: CustomerDashboardAnalytics;
//   recentPurchases: CustomerPurchaseItem[];
//   recentTransactions: CustomerTransactionItem[];
// }
