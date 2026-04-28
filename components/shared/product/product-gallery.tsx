"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import "react-inner-image-zoom/lib/styles.min.css";

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

  const activeImage = selectedImage;
  const [previewImage, setPreviewImage] = useState<number | null>(null);
  const displayImage = previewImage ?? selectedImage;

  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [lens, setLens] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  const [scale, setScale] = useState(3); // zoom strength

  const [smoothLens, setSmoothLens] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const lastDistance = useRef<number | null>(null);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastDistance.current) {
        const diff = distance - lastDistance.current;

        setScale((prev) => Math.min(5, Math.max(2, prev + diff * 0.005)));
      }

      lastDistance.current = distance;
    }
  };

  return (
    <>
      {/* ==================== MOBILE VIEW ==================== */}
      <div
        className="md:hidden relative w-full"
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          lastDistance.current = null;
        }}
      >
        <div className="absolute top-3 right-2 z-20 bg-black/60 text-white text-sm px-2 py-1 rounded-full">
          {selectedImage + 1} / {safeImages.length}
        </div>

        <Carousel
          opts={{ loop: true }}
          className="w-full"
          setApi={(api) => {
            setCarouselApi(api);
            if (!api) return;

            api.on("select", () => {
              setSelectedImage(api.selectedScrollSnap());
            });
          }}
        >
          <CarouselContent>
            {safeImages.map((image, index) => (
              <CarouselItem
                key={index}
                className="relative flex justify-center h-95"
              >
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
      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex gap-4 items-start">
        {/* THUMBNAILS */}
        <div className="flex flex-col gap-3 mt-4">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onMouseEnter={() => setPreviewImage(index)}
              onMouseLeave={() => setPreviewImage(null)}
              onClick={() => setSelectedImage(index)}
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

        {/* MAIN IMAGE (FIXED ZOOM) */}
        <div className="w-full">
          <div
            className="relative w-full h-130 rounded-xl overflow-hidden cursor-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();

              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;

              setLens((prev) => ({
                ...prev,
                visible: true,
                x,
                y,
              }));

              setSmoothLens((prev) => ({
                x: prev.x + (x - prev.x) * 0.2,
                y: prev.y + (y - prev.y) * 0.2,
              }));
            }}
            onMouseLeave={() => {
              setLens((prev) => ({ ...prev, visible: false }));
              setSmoothLens({ x: 50, y: 50 });

              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
              }
            }}
          >
            {/* Base Image */}
            <Image
              src={safeImages[displayImage]}
              alt={`Product image ${activeImage + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />

            {/* FLOATING MAGNIFIER LENS */}
            {lens.visible && (
              <div
                className="absolute pointer-events-none rounded-2xl border border-white/60 shadow-2xl"
                style={{
                  width: 170,
                  height: 170,
                  left: `calc(${smoothLens.x}% - 85px)`,
                  top: `calc(${smoothLens.y}% - 85px)`,
                  backgroundImage: `url(${safeImages[displayImage]})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${scale * 150}% ${scale * 150}%`,
                  transition:
                    "background-size 0.15s ease, transform 0.08s linear",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
                  backgroundPosition: `${lens.x}% ${lens.y}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
