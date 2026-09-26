"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ArrowRight, Package, Wrench } from "lucide-react";

const itemModules = [
  {
    title: "Products",
    description:
      "Manage products, inventory details, pricing, categories, and catalog information.",
    href: "/items/products",
    icon: Package,
  },
  {
    title: "Services",
    description:
      "Create and manage service records, pricing, and operational service information.",
    href: "/items/services",
    icon: Wrench,
  },
];

export default function ItemsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-primary">Catalog Management</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">
          Items
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Choose a module to manage your products and services.
        </p>
      </div>

      {/* Modules */}
      <div className="grid gap-5 md:grid-cols-2">
        {itemModules.map((module) => {
          const Icon = module.icon;

          return (
            <Card
              key={module.title}
              onClick={() => router.push(module.href)}
              className="
                group relative cursor-pointer overflow-hidden
                border border-border bg-surface
                p-0 shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:border-primary/30
                hover:shadow-md
              "
            >
              {/* Top accent */}
              <div className="h-1 bg-primary" />

              <div className="p-6">
                {/* Icon */}
                <div
                  className="
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-secondary
                    text-primary
                    transition-all duration-300
                    group-hover:scale-105
                    group-hover:bg-primary
                    group-hover:text-surface
                  "
                >
                  <Icon className="h-7 w-7" strokeWidth={1.8} />
                </div>

                {/* Content */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-text">
                    {module.title}
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                    {module.description}
                  </p>
                </div>

                {/* Action */}
                <div className="mt-7 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    Open module
                  </span>

                  <div
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-full bg-secondary
                      text-primary
                      transition-all duration-300
                      group-hover:translate-x-1
                      group-hover:bg-primary
                      group-hover:text-surface
                    "
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}