import { Card } from "@/components/ui/card";
import {
  IndianRupee,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";

/* =========================================================
   DASHBOARD METRIC
========================================================= */

export type DashboardMetric = {
  title: string;
  value: string;
  tone: string;
};

/* =========================================================
   BUSINESS TYPE
========================================================= */

export type DashboardBusiness = {
  id?: string;
  name?: string;
  legalName?: string;
  businessType?: string;
  status?: string;
  branches?: unknown[];
  banks?: unknown[];
  documents?: unknown[];
};

/* =========================================================
   EMPTY BUSINESS STATS
========================================================= */

export const emptyDashboardStats: DashboardMetric[] = [
  {
    title: "Branches",
    value: "0",
    tone: "text-blue-600",
  },
  {
    title: "Bank Accounts",
    value: "0",
    tone: "text-green-600",
  },
  {
    title: "Documents",
    value: "0",
    tone: "text-amber-600",
  },
  {
    title: "Status",
    value: "ACTIVE",
    tone: "text-violet-600",
  },
];

/* =========================================================
   BUILD BUSINESS STATS
========================================================= */

export function buildDashboardStats(
  business?: DashboardBusiness
): DashboardMetric[] {
  if (!business) {
    return emptyDashboardStats;
  }

  return [
    {
      title: "Branches",
      value: String(business.branches?.length ?? 0),
      tone: "text-blue-600",
    },
    {
      title: "Bank Accounts",
      value: String(business.banks?.length ?? 0),
      tone: "text-green-600",
    },
    {
      title: "Documents",
      value: String(business.documents?.length ?? 0),
      tone: "text-amber-600",
    },
    {
      title: "Status",
      value: business.status
        ? String(business.status).toUpperCase()
        : "ACTIVE",
      tone: "text-violet-600",
    },
  ];
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

const dashboardStats = [
  {
    title: "Total Items",
    value: "1,245",
    icon: Package,
    color: "text-blue-600",
  },
  {
    title: "Today's Sales",
    value: "₹42,580",
    icon: ShoppingCart,
    color: "text-green-600",
  },
  {
    title: "Purchase",
    value: "₹18,900",
    icon: Receipt,
    color: "text-orange-600",
  },
  {
    title: "Revenue",
    value: "₹8,45,230",
    icon: IndianRupee,
    color: "text-violet-600",
  },
];

/* =========================================================
   LOW STOCK
========================================================= */

const lowStockItems = [
  ["Apple iPhone 15", 3],
  ["Samsung A55", 5],
  ["HP Laptop", 2],
] as const;

/* =========================================================
   EMPTY BUSINESS DASHBOARD
========================================================= */

interface EmptyBusinessDashboardProps {
  business?: DashboardBusiness | null;
}

export function EmptyBusinessDashboard({
  business,
}: EmptyBusinessDashboardProps) {
  return (
    console.log("EmptyBusinessDashboardProps", business),
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Welcome to Biznex ERP. Here&apos;s an overview of your business.
        </p>

        {business?.name && (
          <p className="mt-2 text-sm font-medium text-primary">
            {business.name}
          </p>
        )}
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="flex items-center justify-between p-6"
            >
              <div>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl bg-gray-100 p-4 ${item.color}`}
              >
                <Icon className="h-7 w-7" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* =====================================================
          SALES + LOW STOCK
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">
            Sales Overview
          </h3>

          <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
            Sales Chart
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Low Stock
          </h3>

          <div className="space-y-4">
            {lowStockItems.map(([name, stock]) => (
              <div
                key={name}
                className="rounded-lg border p-3"
              >
                {name}

                <p className="text-sm text-red-500">
                  Stock: {stock}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* =====================================================
          RECENT SALES
      ===================================================== */}

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Recent Sales
        </h3>

        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed">
          DataTable Component
        </div>
      </Card>
    </div>
  );
}
















// import { Card } from "@/components/ui/card";
// import {
//   IndianRupee,
//   Package,
//   Receipt,
//   ShoppingCart,
// } from "lucide-react";

// export type DashboardMetric = {
//   title: string;
//   value: string;
//   tone: string;
// };

// export const emptyDashboardStats: DashboardMetric[] = [
//   { title: "Branches", value: "0", tone: "text-blue-600" },
//   { title: "Bank Accounts", value: "0", tone: "text-green-600" },
//   { title: "Documents", value: "0", tone: "text-amber-600" },
//   { title: "Status", value: "ACTIVE", tone: "text-violet-600" },
// ];

// type DashboardBusiness = {
//   branches?: unknown[];
//   banks?: unknown[];
//   documents?: unknown[];
//   status?: string;
// };

// export function buildDashboardStats(
//   business?: DashboardBusiness
// ): DashboardMetric[] {
//   if (!business) return emptyDashboardStats;

//   return [
//     {
//       title: "Branches",
//       value: String(business.branches?.length ?? 0),
//       tone: "text-blue-600",
//     },
//     {
//       title: "Bank Accounts",
//       value: String(business.banks?.length ?? 0),
//       tone: "text-green-600",
//     },
//     {
//       title: "Documents",
//       value: String(business.documents?.length ?? 0),
//       tone: "text-amber-600",
//     },
//     {
//       title: "Status",
//       value: business.status ? String(business.status).toUpperCase() : "ACTIVE",
//       tone: "text-violet-600",
//     },
//   ];
// }

// const dashboardStats = [
//   {
//     title: "Total Items",
//     value: "1,245",
//     icon: Package,
//     color: "text-blue-600",
//   },
//   {
//     title: "Today's Sales",
//     value: "₹42,580",
//     icon: ShoppingCart,
//     color: "text-green-600",
//   },
//   {
//     title: "Purchase",
//     value: "₹18,900",
//     icon: Receipt,
//     color: "text-orange-600",
//   },
//   {
//     title: "Revenue",
//     value: "₹8,45,230",
//     icon: IndianRupee,
//     color: "text-violet-600",
//   },
// ];

// const lowStockItems = [
//   ["Apple iPhone 15", 3],
//   ["Samsung A55", 5],
//   ["HP Laptop", 2],
// ] as const;

// export function EmptyBusinessDashboard() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//         <p className="mt-1 text-gray-500">
//           Welcome to Biznex ERP. Here&apos;s an overview of your business.
//         </p>
//       </div>

//       <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
//         {dashboardStats.map((item) => {
//           const Icon = item.icon;

//           return (
//             <Card
//               key={item.title}
//               className="flex items-center justify-between p-6"
//             >
//               <div>
//                 <p className="text-sm text-gray-500">{item.title}</p>
//                 <h2 className="mt-2 text-2xl font-bold">{item.value}</h2>
//               </div>
//               <div className={`rounded-xl bg-gray-100 p-4 ${item.color}`}>
//                 <Icon className="h-7 w-7" />
//               </div>
//             </Card>
//           );
//         })}
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         <Card className="p-6 lg:col-span-2">
//           <h3 className="mb-4 text-lg font-semibold">Sales Overview</h3>
//           <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
//             Sales Chart
//           </div>
//         </Card>

//         <Card className="p-6">
//           <h3 className="mb-4 text-lg font-semibold">Low Stock</h3>
//           <div className="space-y-4">
//             {lowStockItems.map(([name, stock]) => (
//               <div key={name} className="rounded-lg border p-3">
//                 {name}
//                 <p className="text-sm text-red-500">Stock: {stock}</p>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>

//       <Card className="p-6">
//         <h3 className="mb-4 text-lg font-semibold">Recent Sales</h3>
//         <div className="flex h-72 items-center justify-center rounded-lg border border-dashed">
//           DataTable Component
//         </div>
//       </Card>
//     </div>
//   );
// }
