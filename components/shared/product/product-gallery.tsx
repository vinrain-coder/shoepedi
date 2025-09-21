"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function ProductGallery({ images }: { images: string[] }) {
  // ✅ Clean out invalid entries
  const validImages = useMemo(
    () =>
      (images || []).filter(
        (img) => typeof img === "string" && img.trim() !== ""
      ),
    [images]
  );

  // ✅ Always have at least one fallback
  const safeImages = validImages.length ? validImages : ["/placeholder.png"]; // <-- put a real fallback path in your project (e.g. public/placeholder.png)

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex gap-2">
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
  );
}
