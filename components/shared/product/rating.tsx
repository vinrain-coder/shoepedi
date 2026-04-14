import React from "react";
import { Star } from "lucide-react";

export default function Rating({
  rating = 0,
  size = 24, // use px instead of Tailwind scale
}: {
  rating: number;
  size?: number;
}) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div
      className="flex items-center"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          style={{ width: size, height: size }}
          className="fill-primary text-primary"
        />
      ))}

      {/* Partial star */}
      {partialStar > 0 && (
        <div style={{ width: size, height: size }} className="relative">
          <Star
            style={{ width: size, height: size }}
            className="text-primary"
          />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialStar * 100}%`, height: "100%" }}
          >
            <Star
              style={{ width: size, height: size }}
              className="fill-primary text-primary"
            />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          style={{ width: size, height: size }}
          className="text-primary"
        />
      ))}
    </div>
  );
}
