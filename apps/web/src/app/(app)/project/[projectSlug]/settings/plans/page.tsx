'use client';

import {useEffect, useState } from "react";
import Pricing from "@/components/Pricing";
import { Tables } from "supabase/types";
import { useAuthStatus } from "@/hooks/useAuthStatus";

interface ProductWithPrices extends Tables<"products"> {
  prices: Tables<"prices">[];
}

function PricingSkeleton() {
  return (
    <div className="pt-24 sm:pt-32 w-full space-y-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="h-8 w-64 mx-auto">
            <div className="h-full bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-6 w-96 mx-auto">
            <div className="h-full bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-lg border p-8 space-y-4">
              <div className="h-6 w-24 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded-lg" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
              <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
              <div className="space-y-3 pt-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 w-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const { user } = useAuthStatus();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full space-y-12 flex flex-col justify-center items-center p-6 mt-12">
      {products.length > 0 ? (
        <Pricing
          products={products}
          user={user}
        />
      ) : (
        <PricingSkeleton />
      )}
    </div>
  );
}
