"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function ProductGallery({ images }: { images: string[] }) {
  const blurImage = "/icons/logo.svg";

  // Validate images
  const validImages = useMemo(
    () =>
      (images || []).filter(
        (img) => typeof img === "string" && img.trim() !== ""
      ),
    [images]
  );

  const safeImages = validImages.length ? validImages : [blurImage];

  const [selectedImage, setSelectedImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);



  return (
    <>
      {/* ==================== MOBILE VIEW ==================== */}
      <div className="md:hidden relative w-full">
        {/* Counter */}
        <div className="absolute top-3 right-2 z-20 bg-black/60 text-white text-sm px-2 py-1 rounded-full">
          {selectedImage + 1} / {safeImages.length}
        </div>

        <Carousel
          opts={{ loop: true }}
          className="w-full"
          setApi={(api) => {
            setCarouselApi(api);
            if (!api) return;

            const handleSelect = () => {
              setSelectedImage(api.selectedScrollSnap());
            };

            api.on("select", handleSelect);

            // set initial selected index when mounted
            handleSelect();
          }}
        >
          <CarouselContent>
            {safeImages.map((image, index) => (
              <CarouselItem
                key={index}
                className="relative flex justify-center h-[380px]"
              >
                <Zoom>
                  <Image
                    src={image}
                    alt={`${image} ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    //unoptimized
                    placeholder="blur"
                    blurDataURL="/icons/logo.svg"
                    priority={index === 0}
                  />
                </Zoom>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {safeImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedImage === index
                  ? "bg-primary scale-110"
                  : "bg-gray-300"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>

      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex gap-2">
        {/* Thumbnails */}
        <div className="flex flex-col gap-2 mt-8">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              onMouseOver={() => setSelectedImage(index)}
              className={`bg-white rounded-lg overflow-hidden ${
                selectedImage === index
                  ? "ring-2 ring-primary"
                  : "ring-1 ring-gray-300"
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                width={48}
                height={48}
                unoptimized
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="w-full">
          <Zoom>
            <div className="relative h-[500px]">
              <Image
                key={safeImages[selectedImage]}
                src={safeImages[selectedImage]}
                alt={`Product image ${selectedImage + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
                //unoptimized
                placeholder="blur"
                blurDataURL="/icons/logo.svg"
              />
            </div>
          </Zoom>
        </div>
      </div>
    </>
  );
}
