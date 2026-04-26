"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function ProductGallery({ images }: { images: string[] }) {
  const blurImage = "/icons/logo.svg";

  // Validate images
  const safeImages = useMemo(() => {
    const valid = (images || []).filter(
      (img) => typeof img === "string" && img.trim() !== "",
    );
    return valid.length ? valid : [blurImage];
  }, [images]);

  // Selected (clicked) image
  const [selectedImage, setSelectedImage] = useState(0);

  // Hover preview image
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const activeImage = hoveredImage !== null ? hoveredImage : selectedImage;

  const [carouselApi, setCarouselApi] = useState<any>(null);

  return (
    <>
      {/* ==================== MOBILE VIEW ==================== */}
      <div className="md:hidden relative w-full">
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
            handleSelect();
          }}
        >
          <CarouselContent>
            {safeImages.map((image, index) => (
              <CarouselItem
                key={index}
                className="relative flex justify-center h-95"
              >
                <Zoom>
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    placeholder="blur"
                    blurDataURL={blurImage}
                    priority={index === 0}
                  />
                </Zoom>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-3">
          {safeImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedImage === index ? "bg-primary scale-110" : "bg-gray-300"
              }`}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </div>

      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex gap-4 items-start">
        {/* THUMBNAILS */}
        <div className="flex flex-col gap-3 mt-4">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              onMouseEnter={() => setHoveredImage(index)}
              onMouseLeave={() => setHoveredImage(null)}
              className={`
                relative w-16 h-16 rounded-lg overflow-hidden
                border transition-all duration-200
                hover:scale-[1.05] hover:border-primary
                focus:outline-none focus:ring-2 focus:ring-primary
                cursor-pointer
                ${
                  activeImage === index
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-gray-200"
                }
              `}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div className="w-full">
          <Zoom>
            <div className="relative h-130 w-full transition-opacity duration-300">
              <Image
                key={safeImages[activeImage]}
                src={safeImages[activeImage]}
                alt={`Product image ${activeImage + 1}`}
                fill
                sizes="90vw"
                className="object-contain transition-opacity duration-300"
                priority
                placeholder="blur"
                blurDataURL={blurImage}
              />
            </div>
          </Zoom>
        </div>
      </div>
    </>
  );
}
  