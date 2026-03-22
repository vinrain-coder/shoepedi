import React from "react";
import { Star } from "lucide-react";

export default function Rating({
  rating = 0,
  size = 18, // ✅ better default (18px)
}: {
  rating: number;
  size?: number;
}) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = 5 - Math.ceil(rating);

  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {/* FULL STARS */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="fill-primary text-primary"
          style={starStyle}
        />
      ))}

      {/* PARTIAL STAR */}
      {partialStar > 0 && (
        <div className="relative" style={starStyle}>
          <Star className="text-primary/30" style={starStyle} />
          <div
            className="absolute left-0 top-0 overflow-hidden"
            style={{ width: `${partialStar * 100}%`, height: "100%" }}
          >
            <Star className="fill-primary text-primary" style={starStyle} />
          </div>
        </div>
      )}

      {/* EMPTY STARS */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="text-primary/30"
          style={starStyle}
        />
      ))}
    </div>
  );
}
