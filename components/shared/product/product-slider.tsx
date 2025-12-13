"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from "./product-card";
import { IProduct } from "@/lib/db/models/product.model";

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string;
  products: IProduct[];
  hideDetails?: boolean;
}) {
  return (
    <div className="w-full bg-background">
      <h2 className="h2-bold mb-5">{title}</h2>
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product._id}
              className={[
                "pl-4 basis-[70%] sm:basis-1/2",
                hideDetails
                  ? "md:basis-1/4 lg:basis-1/6"
                  : "md:basis-1/3 lg:basis-1/5",
              ].join(" ")}
            >
              <ProductCard
                product={product}
                hideDetails={hideDetails}
                hideAddToCart
                hideBorder
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 hidden sm:flex"/>
        <CarouselNext className="right-0 hidden sm:flex" />
      </Carousel>
    </div>
  );
}
