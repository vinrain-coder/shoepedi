"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import type { EmblaCarouselType } from "embla-carousel";

export default function ProductGallery({ images }: { images: string[] }) {
  const validImages = useMemo(
    () =>
      (images || []).filter(
        (img) => typeof img === "string" && img.trim() !== ""
      ),
    [images]
  );

  const safeImages = validImages.length ? validImages : ["/placeholder.png"];

  const [selectedImage, setSelectedImage] = useState(0);

  // Embla refs for syncing
  const emblaMainRef = useRef<EmblaCarouselType | null>(null);
  const emblaThumbRef = useRef<EmblaCarouselType | null>(null);

  // Sync when user selects manually
  const scrollTo = (index: number) => {
    emblaMainRef.current?.scrollTo(index);
    emblaThumbRef.current?.scrollTo(index);
    setSelectedImage(index);
  };

  // Sync when carousel changes by swipe
  const onMainSelect = () => {
    if (!emblaMainRef.current) return;
    const index = emblaMainRef.current.selectedScrollSnap();
    setSelectedImage(index);
    emblaThumbRef.current?.scrollTo(index);
  };

  return (
    <div className="w-full">
      {/* ============= DESKTOP VIEW ============= */}
      <div className="hidden md:flex gap-4">
        {/* Thumbnails (vertical) */}
        <Carousel
          ref={(c: any) => (emblaThumbRef.current = c?.embla ?? null)}
          opts={{ axis: "y", containScroll: false, loop: true }}
          className="max-h-[500px]"
        >
          <CarouselContent className="flex flex-col gap-3">
            {safeImages.map((img, i) => (
              <CarouselItem key={i} className="basis-auto">
                <button
                  onClick={() => scrollTo(i)}
                  className={`rounded-lg overflow-hidden border ${
                    selectedImage === i
                      ? "border-blue-500"
                      : "border-gray-300 opacity-50"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={60}
                    height={60}
                    className="object-cover"
                    unoptimized
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Main Image */}
        <div className="relative flex-1">
          {/* Counter Overlay */}
          <span className="absolute top-3 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
            {selectedImage + 1}/{safeImages.length}
          </span>

          <Carousel
            ref={(c: any) => {
              emblaMainRef.current = c?.embla ?? null;
              emblaMainRef.current?.on("select", onMainSelect);
            }}
            opts={{ loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {safeImages.map((img, i) => (
                <CarouselItem key={i}>
                  <Zoom>
                    <div className="relative h-[500px]">
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </Zoom>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* ============= MOBILE VIEW ============= */}
      <div className="md:hidden flex flex-col items-center gap-3 relative">
        {/* Counter */}
        <span className="absolute top-3 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
          {selectedImage + 1}/{safeImages.length}
        </span>

        {/* Main Carousel */}
        <Carousel
          ref={(c: any) => {
            emblaMainRef.current = c?.embla ?? null;
            emblaMainRef.current?.on("select", onMainSelect);
          }}
          opts={{ loop: true }}
          className="w-full"
        >
          <CarouselContent>
            {safeImages.map((img, i) => (
              <CarouselItem key={i}>
                <Zoom>
                  <div className="relative h-[380px] w-full">
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </Zoom>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Thumbnails Bottom (horizontal scroll) */}
        <Carousel
          ref={(c: any) => (emblaThumbRef.current = c?.embla ?? null)}
          opts={{ axis: "x", loop: true }}
          className="w-full"
        >
          <CarouselContent className="flex gap-2 py-2">
            {safeImages.map((img, i) => (
              <CarouselItem key={i} className="basis-auto">
                <button
                  onClick={() => scrollTo(i)}
                  className={`rounded-lg overflow-hidden border min-w-[60px] ${
                    selectedImage === i
                      ? "border-blue-500"
                      : "border-gray-300 opacity-50"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={60}
                    height={60}
                    className="object-cover"
                    unoptimized
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
