// modules/sales/analytics/types/sales-billing-analytics.types.ts

export interface AnalyticsFilterParams {
  branchId?: string;
  fromDate?: string;
  toDate?: string;
  financialYear?: string;
  topLimit?: number;
}

export interface ComparisonMetric {
  currentValue: number;
  previousValue: number;
  difference: number;
  percentageChange: number;
}

export interface PeriodSalesPoint {
  period: string;
  sales: number;
  invoiceCount: number;
  quantity: number;
  averageInvoiceValue: number;
}

export interface PeriodCollectionPoint {
  period: string;
  collection: number;
  paymentCount: number;
}

export interface PeriodQuotationPoint {
  period: string;
  quotationCount: number;
  quotationValue: number;
}

export interface ProductPerformanceItem {
  productId: string | null;
  itemCode: string;
  itemName: string;
  quantity: number;
  revenue: number;
  invoiceCount: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  categoryId: string | null;
  categoryName: string | null;
}

export interface CustomerPerformanceItem {
  customerId: string;
  name: string;
  companyName: string | null;
  revenue: number;
  invoiceCount: number;
  quantity: number;
  outstanding: number;
  paid: number;
  averageInvoiceValue: number;
}

export interface PaymentModeItem {
  paymentMode: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AgeingBucket {
  bucket: string;
  amount: number;
  customerCount: number;
  invoiceCount: number;
}

export interface OutstandingCustomerItem {
  customerId: string;
  name: string;
  outstanding: number;
  overdue: number;
}

export interface SalesBillingAnalytics {
  filters: {
    tenantId: string;
    branchId: string | null;
    fromDate: string;
    toDate: string;
    financialYear: string | null;
    topLimit: number;
  };
  generatedAt: string;
  overview: {
    totalSales: number;
    totalInvoicedAmount: number;
    totalTaxableAmount: number;
    totalDiscount: number;
    totalTax: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueOutstanding: number;
    numberOfSalesInvoices: number;
    averageInvoiceValue: number;
    totalQuantitySold: number;
    totalItemsSold: number;
  };
  sales: {
    summary: {
      sales: number;
      invoiceCount: number;
      quantitySold: number;
      averageInvoiceValue: number;
      highestInvoiceValue: number;
      lowestInvoiceValue: number;
    };
    trends: {
      day: PeriodSalesPoint[];
      week: PeriodSalesPoint[];
      month: PeriodSalesPoint[];
      quarter: PeriodSalesPoint[];
      year: PeriodSalesPoint[];
    };
    growth: {
      sales: ComparisonMetric;
      invoiceCount: ComparisonMetric;
      quantity: ComparisonMetric;
      averageInvoiceValue: ComparisonMetric;
    };
    bestPeriods: {
      day: { best: PeriodSalesPoint | null; lowest: PeriodSalesPoint | null };
      week: { best: PeriodSalesPoint | null; lowest: PeriodSalesPoint | null };
      month: { best: PeriodSalesPoint | null; lowest: PeriodSalesPoint | null };
      quarter: { best: PeriodSalesPoint | null; lowest: PeriodSalesPoint | null };
      year: { best: PeriodSalesPoint | null; lowest: PeriodSalesPoint | null };
    };
    dayOfWeek: {
      highest: {
        day: string;
        sales: number;
        invoiceCount: number;
        quantity: number;
      } | null;
      lowest: {
        day: string;
        sales: number;
        invoiceCount: number;
        quantity: number;
      } | null;
      breakdown: Array<{
        day: string;
        sales: number;
        invoiceCount: number;
        quantity: number;
      }>;
    };
    statusBreakdown: Array<{ status: string; count: number; value: number }>;
  };
  products: {
    topSelling: {
      byQuantity: ProductPerformanceItem[];
      byRevenue: ProductPerformanceItem[];
      byInvoiceCount: ProductPerformanceItem[];
    };
    lowSelling: {
      byQuantity: ProductPerformanceItem[];
      byRevenue: ProductPerformanceItem[];
      byInvoiceCount: ProductPerformanceItem[];
    };
    highestRevenue: ProductPerformanceItem[];
    lowestRevenue: ProductPerformanceItem[];
    performance: ProductPerformanceItem[];
    categoryBreakdown: Array<{
      categoryId: string | null;
      categoryName: string;
      revenue: number;
      quantity: number;
      invoiceCount: number;
    }>;
  };
  customers: {
    summary: {
      customersWhoPurchased: number;
      newCustomers: number;
      repeatCustomers: number;
      newCustomerSales: number;
      repeatCustomerSales: number;
      newCustomerRevenuePercentage: number;
      repeatCustomerRevenuePercentage: number;
    };
    topCustomers: {
      byRevenue: CustomerPerformanceItem[];
      byInvoiceCount: CustomerPerformanceItem[];
      byQuantity: CustomerPerformanceItem[];
    };
    outstandingCustomers: CustomerPerformanceItem[];
  };
  collections: {
    summary: {
      totalCollected: number;
      paymentCount: number;
      averagePaymentAmount: number;
      largestPayment: number;
      collectionRate: number;
      invoiceCount: number;
    };
    paymentModes: PaymentModeItem[];
    fullyPaidInvoices: number;
    partiallyPaidInvoices: number;
    unpaidInvoices: number;
    trends: {
      day: PeriodCollectionPoint[];
      week: PeriodCollectionPoint[];
      month: PeriodCollectionPoint[];
      quarter: PeriodCollectionPoint[];
      year: PeriodCollectionPoint[];
    };
    growth: {
      collection: ComparisonMetric;
      paymentCount: ComparisonMetric;
    };
  };
  paymentBehaviour: {
    fullyPaidInvoices: number;
    partiallyPaidInvoices: number;
    unpaidInvoices: number;
    paidAmount: number;
    partiallyCollectedAmount: number;
    uncollectedAmount: number;
  };
  receivables: {
    summary: {
      totalReceivable: number;
      totalOutstanding: number;
      overdueOutstanding: number;
      currentOutstanding: number;
      overduePercentage: number;
      invoicesWithOutstanding: number;
      invoicesOverdue: number;
      customersWithOutstanding: number;
      customersWithOverdue: number;
    };
    ageing: AgeingBucket[];
    topOutstandingCustomers: OutstandingCustomerItem[];
    topOverdueCustomers: OutstandingCustomerItem[];
  };
  quotations: {
    summary: {
      totalQuotations: number;
      totalQuotationValue: number;
      acceptedValue: number;
      rejectedValue: number;
      expiredValue: number;
    };
    statusBreakdown: Array<{ status: string; count: number; value: number }>;
    conversion: {
      finalizedQuotations: number;
      acceptedQuotations: number;
      acceptanceRate: number;
      quotationToInvoiceConversion: number | null;
      note: string;
    };
    trends: {
      day: PeriodQuotationPoint[];
      week: PeriodQuotationPoint[];
      month: PeriodQuotationPoint[];
      quarter: PeriodQuotationPoint[];
      year: PeriodQuotationPoint[];
    };
    comparison: {
      quotationCount: ComparisonMetric;
      quotationValue: ComparisonMetric;
    };
  };
  tax: {
    summary: {
      taxableSales: number;
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
      totalTax: number;
    };
    rateBreakdown: Array<{
      rate: number;
      taxableAmount: number;
      taxAmount: number;
    }>;
  };
  discounts: {
    summary: {
      totalDiscount: number;
      averageDiscount: number;
      discountPercentage: number;
    };
    topDiscountedItems: Array<{
      itemName: string;
      discount: number;
      quantity: number;
    }>;
  };
  operational: {
    date: string;
    invoicesCreatedToday: number;
    invoicesFinalizedToday: number;
    salesToday: number;
    paymentsReceivedToday: number;
    paymentCountToday: number;
    quotationsCreatedToday: number;
    quotationsFinalizedToday: number;
    quotationsAcceptedToday: number;
    outstandingGeneratedToday: number;
  };
  comparisons: {
    sales: ComparisonMetric;
    invoiceCount: ComparisonMetric;
    quantity: ComparisonMetric;
    averageInvoiceValue: ComparisonMetric;
    collections: ComparisonMetric;
    paymentCount: ComparisonMetric;
    quotations: ComparisonMetric;
    quotationValue: ComparisonMetric;
  };
  future: {
    deliveryChallans: { implemented: boolean; message: string };
    creditNotes: { implemented: boolean; message: string };
    debitNotes: { implemented: boolean; message: string };
    returns: { implemented: boolean; message: string };
    loyalty: { implemented: boolean; message: string };
  };
}

export interface SalesBillingAnalyticsResponse {
  success: boolean;
  message: string;
  data: SalesBillingAnalytics;
}