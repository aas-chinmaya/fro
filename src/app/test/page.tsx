"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/inventory/products-with-inventory"
        );

        const data = await response.json();

        console.table(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return <div>Check browser console</div>;
}