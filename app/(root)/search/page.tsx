// app/search/page.tsx
import React from "react";
import SearchPageClient from "./searchpage-client";
import {
  getAllCategories,
    getAllProducts,
      getAllTags,
      } from "@/lib/actions/product.actions";
      import { toSlug } from "@/lib/utils";
      import { IProduct } from "@/lib/db/models/product.model";

      type SearchParams = {
        q?: string;
          category?: string;
            tag?: string;
              rating?: string;
                sort?: string;
                  page?: string;
                    price?: string;
                    };

                    const defaultPriceRange: [number, number] = [0, 10000];

                    function parsePrice(price?: string): [number, number] {
                      if (!price) return defaultPriceRange;
                        const [a, b] = price.split("-").map(Number);
                          return [a || 0, b || 10000];
                          }

                          export default async function Page({
                            searchParams,
                            }: {
                              searchParams?: SearchParams;
                              }) {
                                // Build initial params from incoming searchParams (server-side)
                                  const q = (searchParams?.q as string) || "all";
                                    const category = (searchParams?.category as string) || "all";
                                      const tag = (searchParams?.tag as string) || "all";
                                        const rating = (searchParams?.rating as string) || "all";
                                          const sort = (searchParams?.sort as string) || "best-selling";
                                            const page = (searchParams?.page as string) || "1";
                                              const price = (searchParams?.price as string) || `${defaultPriceRange[0]}-${defaultPriceRange[1]}`;

                                                const params = { q, category, tag, rating, price, sort, page };

                                                  // Fetch initial data server-side
                                                    const [categories, tags, data] = await Promise.all([
                                                        getAllCategories(),
                                                            getAllTags(),
                                                                getAllProducts(params),
                                                                  ]);

                                                                    // Normalize tags to plain strings (server-side)
                                                                      // NOTE: tags returned by getAllTags assumed to be array of strings in your actions
                                                                        const initialProducts: IProduct[] = data.products || [];
                                                                          const initialTotalProducts: number = data.totalProducts || 0;
                                                                            const initialTotalPages: number = data.totalPages || 1;
                                                                              const initialFromTo = { from: data.from || 0, to: data.to || 0 };

                                                                                // Pass everything into the client component as props
                                                                                  return (
                                                                                      <SearchPageClient
                                                                                            initialCategories={categories}
                                                                                                  initialTags={tags}
                                                                                                        initialProducts={initialProducts}
                                                                                                              initialTotalProducts={initialTotalProducts}
                                                                                                                    initialTotalPages={initialTotalPages}
                                                                                                                          initialFromTo={initialFromTo}
                                                                                                                                initialParams={params}
                                                                                                                                    />
                                                                                                                                      );
                                                                                                                                      }
                                                                                                                                      