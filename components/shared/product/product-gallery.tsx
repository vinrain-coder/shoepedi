"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useEmblaCarousel } from "embla-carousel-react";

export default function ProductGallery({ images }: { images: string[] }) {
  // 🧼 Validate images
  const validImages = useMemo(
    () =>
      (images || []).filter(
        (img) => typeof img === "string" && img.trim() !== ""
      ),
    [images]
  );

  const safeImages = validImages.length ? validImages : ["/placeholder.png"];

  const [selectedImage, setSelectedImage] = useState(0);

  // === MOBILE CAROUSEL ===
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (!embla) return;

    const handler = () => {
      setSelectedImage(embla.selectedScrollSnap());
    };

    embla.on("select", handler);
    handler();
  }, [embla]);

  return (
    <>
      {/* === MOBILE VIEW === */}
      <div className="md:hidden w-full relative">
        {/* Counter */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded-md z-10">
          {selectedImage + 1} / {safeImages.length}
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {safeImages.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] relative h-[380px]">
                <Zoom>
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    unoptimized
                  />
                </Zoom>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-3">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => embla?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedImage === index
                  ? "bg-blue-500 scale-110"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* === DESKTOP VIEW === */}
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
                  ? "ring-2 ring-blue-500"
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
                unoptimized
              />
            </div>
          </Zoom>
        </div>
      </div>
    </>
  );
      }
    
