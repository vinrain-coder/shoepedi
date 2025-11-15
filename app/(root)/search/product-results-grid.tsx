// components/search/ProductResultsGrid.tsx
"use client";

import React from "react";
import ProductCard from "@/components/shared/product/product-card";
import Pagination from "@/components/shared/pagination";

export default function ProductResultsGrid({
  products,
    totalPages,
      page,
        setPage,
          totalProducts,
          }: {
            products: any[]; // IProduct[] - keep generic so it compiles even if types differ
              totalPages: number;
                page: number;
                  setPage: (n: number) => void;
                    totalProducts: number;
                    }) {
                      return (
                          <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {products.length === 0 && <div>No product found</div>}
                                                {products.map((p) => (
                                                          <ProductCard key={(p._id || p.id).toString()} product={p} />
                                                                  ))}
                                                                        </div>

                                                                              {totalPages > 1 && (
                                                                                      <Pagination page={page} totalPages={totalPages} />
                                                                                            )}
                                                                                                </>
                                                                                                  );
                                                                                                  }
                                                                                                  